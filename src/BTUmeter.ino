#include <WiFi.h>
#include <WebServer.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 18          // DS18B20 data pin
#define NUM_SENSORS 2            // expect two sensors
#define GPM 3.0                  // fixed 3 GPM
#define BTU_FACTOR 500.0         // BTU/hr = 500 * GPM * ΔT (water)

// WiFi
const char* ssid     = "15 Honey Hill2";
const char* password = "8603240743";

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
WebServer server(80);

// HTML/JS page with fast chart + zoom + live numeric panel + 0.1s countdown
const char index_html[] = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ESP32 BTU Meter</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.umd.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 10px;
      background: #111;
      color: #f5f5f5;
    }
    h1 {
      text-align: center;
      margin-bottom: 4px;
    }
    p {
      text-align: center;
      margin: 2px 0;
    }
    #countdown {
      text-align: center;
      margin-top: 4px;
      font-size: 0.95rem;
      color: #aaa;
    }
    .layout {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 10px;
    }
    .chart-container {
      flex: 2 1 60%;
      background: #1b1b1b;
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.7);
    }
    .chart-container canvas {
      width: 100% !important;
      height: 420px !important;
    }
    .stats {
      flex: 1 1 30%;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .card {
      background: #1b1b1b;
      padding: 12px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.7);
    }
    .card h2 {
      margin: 0 0 6px 0;
      font-size: 1.1rem;
      color: #cccccc;
    }
    .value {
      font-size: 1.8rem;
      font-weight: bold;
    }
    .label-small {
      font-size: 0.85rem;
      color: #999;
    }
    @media (max-width: 800px) {
      .chart-container canvas {
        height: 300px !important;
      }
    }
  </style>
</head>
<body>
  <h1>ESP32 Hydronic BTU Meter</h1>
  <p>WiFi: 15 Honey Hill2</p>
  <p>2× DS18B20 • 3.0 GPM • Water</p>
  <div id="countdown">Next update in: 0.1 s</div>

  <div class="layout">
    <div class="chart-container">
      <canvas id="tempChart"></canvas>
    </div>

    <div class="stats">
      <div class="card">
        <h2>Supply Temperature</h2>
        <div class="value" id="supplyVal">-- °F</div>
        <div class="label-small">Sensor 0</div>
      </div>
      <div class="card">
        <h2>Return Temperature</h2>
        <div class="value" id="returnVal">-- °F</div>
        <div class="label-small">Sensor 1</div>
      </div>
      <div class="card">
        <h2>ΔT (Supply - Return)</h2>
        <div class="value" id="deltaVal">-- °F</div>
      </div>
      <div class="card">
        <h2>BTU/hr</h2>
        <div class="value" id="btuVal">--</div>
        <div class="label-small">Assuming 3.0 GPM, water</div>
      </div>
    </div>
  </div>

  <script>
    const UPDATE_INTERVAL_MS = 100;       // 0.1 seconds
    const MAX_POINTS = 3600;             // ~6 minutes at 10 Hz

    const ctx = document.getElementById('tempChart').getContext('2d');
    const labels = [];
    const supplyData = [];
    const returnData = [];
    const deltaData = [];

    const tempChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Supply (°F)',
            data: supplyData,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Return (°F)',
            data: returnData,
            borderWidth: 2,
            fill: false
          },
          {
            label: 'ΔT (°F)',
            data: deltaData,
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          legend: {
            labels: {
              color: '#f5f5f5'
            }
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true       // mouse wheel zoom
              },
              pinch: {
                enabled: true       // pinch on touch
              },
              mode: 'x',
            },
            pan: {
              enabled: true,
              mode: 'x',
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#cccccc' },
            title: {
              display: true,
              text: 'Samples',
              color: '#cccccc'
            }
          },
          y: {
            ticks: { color: '#cccccc' },
            title: {
              display: true,
              text: 'Temperature (°F)',
              color: '#cccccc'
            }
          }
        }
      }
    });

    function setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    }

    function fetchData() {
      fetch('/data')
        .then(response => response.json())
        .then(d => {
          // Use incremental index instead of wall clock time for x-axis
          const idx = labels.length === 0 ? 0 : labels[labels.length - 1] + 1;
          labels.push(idx);

          // Keep last MAX_POINTS
          if (labels.length > MAX_POINTS) {
            labels.shift();
            supplyData.shift();
            returnData.shift();
            deltaData.shift();
          }

          supplyData.push(d.supply !== null ? d.supply : null);
          returnData.push(d.return !== null ? d.return : null);
          deltaData.push(d.deltaT !== null ? d.deltaT : null);

          tempChart.update('none');  // no animation

          // Live numeric panel
          if (d.supply !== null) {
            setText('supplyVal', d.supply.toFixed(2) + ' °F');
          } else {
            setText('supplyVal', '-- °F');
          }

          if (d.return !== null) {
            setText('returnVal', d.return.toFixed(2) + ' °F');
          } else {
            setText('returnVal', '-- °F');
          }

          if (d.deltaT !== null) {
            setText('deltaVal', d.deltaT.toFixed(2) + ' °F');
          } else {
            setText('deltaVal', '-- °F');
          }

          if (d.btuPerHour !== null) {
            setText('btuVal', d.btuPerHour.toFixed(0));
          } else {
            setText('btuVal', '--');
          }
        })
        .catch(err => {
          console.error('Fetch error:', err);
        });
    }

    let countdownMs = UPDATE_INTERVAL_MS;

    function tick() {
      countdownMs -= UPDATE_INTERVAL_MS;
      if (countdownMs <= 0) {
        fetchData();
        countdownMs = UPDATE_INTERVAL_MS;
      }
      setText('countdown', 'Next update in: ' + (countdownMs / 1000).toFixed(1) + ' s');
    }

    // First fetch immediately, then tick every 0.1 s
    fetchData();
    setInterval(tick, UPDATE_INTERVAL_MS);

    // Optional: double-click chart to reset zoom
    ctx.canvas.addEventListener('dblclick', () => {
      tempChart.resetZoom();
    });
  </script>
</body>
</html>
)rawliteral";

void handleRoot() {
  Serial.println("HTTP GET /  (root page)");
  server.send(200, "text/html", index_html);
}

void handleData() {
  sensors.requestTemperatures();

  float tempF[NUM_SENSORS];
  bool valid[NUM_SENSORS];

  // Just use index 0 and 1
  for (int i = 0; i < NUM_SENSORS; i++) {
    float tempC = sensors.getTempCByIndex(i);
    if (tempC == DEVICE_DISCONNECTED_C) {
      valid[i] = false;
      tempF[i] = NAN;
    } else {
      valid[i] = true;
      tempF[i] = tempC * 9.0 / 5.0 + 32.0; // C -> F
    }
  }

  bool haveDelta = valid[0] && valid[1];
  float deltaT = 0.0;
  float btuPerHour = 0.0;

  if (haveDelta) {
    // Sensor 0 = supply, sensor 1 = return
    deltaT = tempF[0] - tempF[1];
    btuPerHour = BTU_FACTOR * GPM * deltaT;
  }

  // Light debug (comment out if too chatty at 10 Hz)
  // Serial.print("HTTP GET /data -> ΔT=");
  // Serial.print(deltaT);
  // Serial.print(" BTU/hr=");
  // Serial.println(btuPerHour);

  // Build JSON manually
  String json = "{";
  json += "\"supply\":";
  json += valid[0] ? String(tempF[0], 2) : "null";
  json += ",\"return\":";
  json += valid[1] ? String(tempF[1], 2) : "null";
  json += ",\"deltaT\":";
  json += haveDelta ? String(deltaT, 2) : "null";
  json += ",\"btuPerHour\":";
  json += haveDelta ? String(btuPerHour, 2) : "null";
  json += "}";

  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(500);

  sensors.begin();
  // Optional: lower resolution for faster conversions (uncomment if needed)
  // sensors.setResolution(9);  // ~93.75 ms conversion time

  int count = sensors.getDeviceCount();
  Serial.print("DallasTemperature sees ");
  Serial.print(count);
  Serial.println(" device(s) on the bus.");

  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}

/**
 * 🏠 Honey Hill HVAC - Retro HMI Dashboard
 * Real-time MQTT-based monitoring with 8-bit aesthetic
 */

// ============ CONFIGURATION ============
const CONFIG = {
  // MQTT Broker (change for production)
  MQTT_WS_URL: 'ws://localhost:9001',

  // Topics
  TOPICS: {
    HEAT_PUMP: 'hvac/heatpump/state',
    AHU1: 'hvac/ahu1/state',
    AHU2: 'hvac/ahu2/state',
    AHU3: 'hvac/ahu3/state',
    SNOW_MELT: 'hvac/snowmelt/state',
    BUFFER_TANK: 'hvac/buffer/state',
    SYSTEM: 'hvac/system/state',
    POWER: 'hvac/power/state',  // From Emporia Vue
  },

  // BTU Calculation
  BTU_FACTOR: 500,  // BTU/hr = 500 * GPM * ΔT (water)

  // Refresh rates
  CLOCK_INTERVAL: 1000,
  RECONNECT_DELAY: 5000,
};

// ============ STATE ============
const state = {
  connected: false,
  heatPump: {
    mode: 'standby',  // heating, cooling, standby
    supplyTemp: null,
    returnTemp: null,
    powerKw: null,
  },
  zones: {
    ahu1: { supplyTemp: null, returnTemp: null, deltaT: null, btu: null, pumpOn: false, fanOn: false, gpm: 3.0 },
    ahu2: { supplyTemp: null, returnTemp: null, deltaT: null, btu: null, pumpOn: false, fanOn: false, gpm: 2.5 },
    ahu3: { supplyTemp: null, returnTemp: null, deltaT: null, btu: null, pumpOn: false, fanOn: false, gpm: 2.5 },
    snowMelt: { supplyTemp: null, returnTemp: null, deltaT: null, btu: null, pumpOn: false, gpm: 4.0 },
  },
  buffer: {
    temp: null,
    pressure: null,
  },
  system: {
    totalBtu: 0,
    liveCop: null,
    yearlyCopAvg: 3.2,  // Historical average
    totalGpm: 0,
    powerKw: null,
    outdoorTemp: null,
  },
  alerts: [],
};

// ============ DOM HELPERS ============
function $(id) { return document.getElementById(id); }
function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}
function addClass(id, className) {
  const el = $(id);
  if (el) el.classList.add(className);
}
function removeClass(id, className) {
  const el = $(id);
  if (el) el.classList.remove(className);
}
function setClass(id, className, condition) {
  if (condition) addClass(id, className);
  else removeClass(id, className);
}

// ============ CLOCK ============
function updateClock() {
  const now = new Date();
  setText('clock', now.toLocaleTimeString());
}
setInterval(updateClock, CONFIG.CLOCK_INTERVAL);
updateClock();

// ============ MQTT CLIENT ============
let client = null;

function connectMqtt() {
  console.log('Connecting to MQTT:', CONFIG.MQTT_WS_URL);
  setText('conn-status', '⏳ Connecting...');

  try {
    client = mqtt.connect(CONFIG.MQTT_WS_URL);

    client.on('connect', () => {
      console.log('MQTT Connected!');
      state.connected = true;
      setText('conn-status', '🟢 Connected');
      $('conn-status').className = 'connected';

      // Subscribe to all topics
      Object.values(CONFIG.TOPICS).forEach(topic => {
        client.subscribe(topic, (err) => {
          if (!err) console.log('Subscribed:', topic);
        });
      });

      // Also subscribe to wildcard for flexibility
      client.subscribe('hvac/#');
      client.subscribe('hydronics/#');
    });

    client.on('message', (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        handleMessage(topic, data);
      } catch (e) {
        console.warn('Invalid JSON on', topic, e);
      }
    });

    client.on('error', (err) => {
      console.error('MQTT Error:', err);
      setText('conn-status', '🔴 Error');
      $('conn-status').className = 'disconnected';
    });

    client.on('offline', () => {
      state.connected = false;
      setText('conn-status', '🔴 Offline');
      $('conn-status').className = 'disconnected';
    });

    client.on('reconnect', () => {
      setText('conn-status', '⏳ Reconnecting...');
    });

  } catch (e) {
    console.error('Failed to connect:', e);
    setText('conn-status', '🔴 Failed');
    $('conn-status').className = 'disconnected';

    // Start simulation mode
    setTimeout(startSimulation, 2000);
  }
}

// ============ MESSAGE HANDLER ============
function handleMessage(topic, data) {
  console.log('MQTT:', topic, data);

  // Handle different topic patterns
  if (topic.includes('ahu1') || topic.includes('main')) {
    updateZone('ahu1', data);
  } else if (topic.includes('ahu2') || topic.includes('garage')) {
    updateZone('ahu2', data);
  } else if (topic.includes('ahu3') || topic.includes('studio')) {
    updateZone('ahu3', data);
  } else if (topic.includes('snow')) {
    updateZone('snowMelt', data);
  } else if (topic.includes('heatpump') || topic.includes('hp')) {
    updateHeatPump(data);
  } else if (topic.includes('buffer')) {
    updateBuffer(data);
  } else if (topic.includes('power')) {
    updatePower(data);
  } else if (topic.includes('hydronics/main/state')) {
    // Legacy format from simulator
    updateFromLegacy(data);
  }

  // Recalculate totals
  calculateTotals();
  updateUI();
}

function updateZone(zone, data) {
  const z = state.zones[zone];
  if (!z) return;

  if (data.supplyF !== undefined) z.supplyTemp = data.supplyF;
  if (data.supplyTemp !== undefined) z.supplyTemp = data.supplyTemp;
  if (data.returnF !== undefined) z.returnTemp = data.returnF;
  if (data.returnTemp !== undefined) z.returnTemp = data.returnTemp;
  if (data.deltaT !== undefined) z.deltaT = data.deltaT;
  if (data.gpm !== undefined) z.gpm = data.gpm;
  if (data.pumpOn !== undefined) z.pumpOn = data.pumpOn;
  if (data.fanOn !== undefined) z.fanOn = data.fanOn;

  // Calculate ΔT and BTU if we have temps
  if (z.supplyTemp !== null && z.returnTemp !== null) {
    z.deltaT = z.supplyTemp - z.returnTemp;
    z.btu = CONFIG.BTU_FACTOR * z.gpm * Math.abs(z.deltaT);
  }

  if (data.btuPerHour !== undefined) z.btu = data.btuPerHour;
}

function updateHeatPump(data) {
  if (data.mode !== undefined) state.heatPump.mode = data.mode;
  if (data.supplyF !== undefined) state.heatPump.supplyTemp = data.supplyF;
  if (data.supplyTemp !== undefined) state.heatPump.supplyTemp = data.supplyTemp;
  if (data.returnF !== undefined) state.heatPump.returnTemp = data.returnF;
  if (data.returnTemp !== undefined) state.heatPump.returnTemp = data.returnTemp;
  if (data.powerKw !== undefined) state.heatPump.powerKw = data.powerKw;
}

function updateBuffer(data) {
  if (data.temp !== undefined) state.buffer.temp = data.temp;
  if (data.pressure !== undefined) state.buffer.pressure = data.pressure;
}

function updatePower(data) {
  if (data.kw !== undefined) state.system.powerKw = data.kw;
  if (data.powerKw !== undefined) state.system.powerKw = data.powerKw;
}

function updateFromLegacy(data) {
  // Support for the old simulator format
  updateZone('ahu1', data);
  if (data.supplyF) state.heatPump.supplyTemp = data.supplyF;
  if (data.returnF) state.heatPump.returnTemp = data.returnF;
}

// ============ CALCULATIONS ============
function calculateTotals() {
  // Total BTU from all zones
  let totalBtu = 0;
  let totalGpm = 0;
  let activeZones = 0;

  Object.values(state.zones).forEach(z => {
    if (z.btu && z.btu > 0) {
      totalBtu += z.btu;
      totalGpm += z.gpm;
      activeZones++;
    }
  });

  state.system.totalBtu = totalBtu;
  state.system.totalGpm = totalGpm;

  // Calculate COP if we have power data
  if (state.system.powerKw && state.system.powerKw > 0) {
    // COP = BTU output / (kW * 3412 BTU/kW)
    const btuInput = state.system.powerKw * 3412;
    state.system.liveCop = (totalBtu / btuInput).toFixed(2);
  }

  // Determine heat pump mode
  const avgSupply = state.heatPump.supplyTemp || 0;
  if (totalBtu > 1000) {
    state.heatPump.mode = avgSupply > 100 ? 'heating' : 'cooling';
  } else {
    state.heatPump.mode = 'standby';
  }
}

// ============ UI UPDATE ============
function updateUI() {
  // Heat Pump
  const hpStatus = $('hp-status');
  if (hpStatus) {
    hpStatus.textContent = state.heatPump.mode.toUpperCase();
    hpStatus.className = 'status ' + state.heatPump.mode;
  }
  setText('hp-supply', state.heatPump.supplyTemp?.toFixed(1) || '--');
  setText('hp-return', state.heatPump.returnTemp?.toFixed(1) || '--');

  // Buffer Tank
  setText('tank-temp', (state.buffer.temp?.toFixed(0) || '--') + '°F');

  // AHU 1
  updateZoneUI('ahu1', state.zones.ahu1, 'pump1');

  // AHU 2
  updateZoneUI('ahu2', state.zones.ahu2, 'pump2');

  // AHU 3
  updateZoneUI('ahu3', state.zones.ahu3, 'pump3');

  // Snow Melt
  setText('snow-temp', state.zones.snowMelt.supplyTemp?.toFixed(1) || '--');
  setText('snow-btu', state.zones.snowMelt.btu?.toFixed(0) || '--');
  setClass('pump-snow-status', 'on', state.zones.snowMelt.pumpOn);
  setText('pump-snow-status', 'PUMP: ' + (state.zones.snowMelt.pumpOn ? 'ON' : 'OFF'));

  // Stats Panel
  setText('live-cop', state.system.liveCop || '--');
  setText('yearly-cop', state.system.yearlyCopAvg.toFixed(1));
  setText('total-btu', state.system.totalBtu.toFixed(0));
  setText('total-gpm', state.system.totalGpm.toFixed(1));
  setText('power-kw', state.system.powerKw?.toFixed(2) || '--');

  // Pressure
  const psi = state.buffer.pressure || 15;
  setText('loop-psi', psi.toFixed(1));
  const psiGauge = $('psi-gauge');
  if (psiGauge) {
    const psiPercent = Math.min(100, Math.max(0, (psi / 30) * 100));
    psiGauge.style.width = psiPercent + '%';
    psiGauge.className = 'gauge-fill';
    if (psi < 10) psiGauge.classList.add('low');
    if (psi > 25) psiGauge.classList.add('high');
  }

  // Outdoor temp
  setText('outdoor-temp', '🌡️ Outdoor: ' + (state.system.outdoorTemp?.toFixed(0) || '--') + '°F');

  // Update pipe animations based on active zones
  updatePipeAnimations();

  // Update pump bank
  updatePumpBank();
}

function updateZoneUI(zoneId, zone, pumpId) {
  setText(zoneId + '-dt', zone.deltaT?.toFixed(1) || '--');
  setText(zoneId + '-btu', zone.btu?.toFixed(0) || '--');

  const statusEl = $(pumpId + '-status');
  if (statusEl) {
    setClass(pumpId + '-status', 'on', zone.pumpOn);
    setText(pumpId + '-status', 'PUMP: ' + (zone.pumpOn ? 'ON' : 'OFF'));
  }

  // Fan animation
  const ahuEl = $(zoneId);
  if (ahuEl) {
    setClass(zoneId, 'running', zone.fanOn || zone.pumpOn);
  }
}

function updatePipeAnimations() {
  // Activate/deactivate pipe segments based on zone activity
  const ahu1Active = state.zones.ahu1.pumpOn || (state.zones.ahu1.btu && state.zones.ahu1.btu > 100);
  const ahu2Active = state.zones.ahu2.pumpOn || (state.zones.ahu2.btu && state.zones.ahu2.btu > 100);
  const ahu3Active = state.zones.ahu3.pumpOn || (state.zones.ahu3.btu && state.zones.ahu3.btu > 100);
  const snowActive = state.zones.snowMelt.pumpOn || (state.zones.snowMelt.btu && state.zones.snowMelt.btu > 100);

  setClass('supply-ahu1', 'inactive', !ahu1Active);
  setClass('return-ahu1', 'inactive', !ahu1Active);
  setClass('supply-ahu2', 'inactive', !ahu2Active);
  setClass('return-ahu2', 'inactive', !ahu2Active);
  setClass('supply-ahu3', 'inactive', !ahu3Active);
  setClass('return-ahu3', 'inactive', !ahu3Active);
  setClass('supply-snow', 'inactive', !snowActive);
  setClass('return-snow', 'inactive', !snowActive);
}

function updatePumpBank() {
  setClass('pump-main', 'running', state.heatPump.mode !== 'standby');
  setClass('pump-ahu1', 'running', state.zones.ahu1.pumpOn);
  setClass('pump-ahu23', 'running', state.zones.ahu2.pumpOn || state.zones.ahu3.pumpOn);
  setClass('pump-snow', 'running', state.zones.snowMelt.pumpOn);
}

// ============ SIMULATION MODE ============
function startSimulation() {
  console.log('Starting simulation mode...');
  setText('conn-status', '🟡 Simulation');

  setInterval(() => {
    // Simulate varying data
    const t = Date.now() / 1000;
    const wave = Math.sin(t / 15) * 2;

    // Heat pump
    state.heatPump.supplyTemp = 115 + wave + Math.random() * 0.5;
    state.heatPump.returnTemp = 105 + wave + Math.random() * 0.5;
    state.heatPump.mode = 'heating';

    // Buffer
    state.buffer.temp = 112 + wave;
    state.buffer.pressure = 15 + Math.sin(t / 30) * 2;

    // AHU 1 - always on
    state.zones.ahu1.supplyTemp = 114 + wave;
    state.zones.ahu1.returnTemp = 104 + wave;
    state.zones.ahu1.deltaT = 10 + Math.random();
    state.zones.ahu1.btu = 15000 + Math.random() * 1000;
    state.zones.ahu1.pumpOn = true;
    state.zones.ahu1.fanOn = true;

    // AHU 2 - sometimes on
    const ahu2On = Math.sin(t / 60) > 0;
    state.zones.ahu2.pumpOn = ahu2On;
    state.zones.ahu2.fanOn = ahu2On;
    if (ahu2On) {
      state.zones.ahu2.supplyTemp = 113 + wave;
      state.zones.ahu2.returnTemp = 106 + wave;
      state.zones.ahu2.deltaT = 7 + Math.random();
      state.zones.ahu2.btu = 8000 + Math.random() * 500;
    } else {
      state.zones.ahu2.btu = 0;
    }

    // AHU 3 - sometimes on
    const ahu3On = Math.sin(t / 45) > 0.3;
    state.zones.ahu3.pumpOn = ahu3On;
    state.zones.ahu3.fanOn = ahu3On;
    if (ahu3On) {
      state.zones.ahu3.supplyTemp = 112 + wave;
      state.zones.ahu3.returnTemp = 105 + wave;
      state.zones.ahu3.deltaT = 7 + Math.random();
      state.zones.ahu3.btu = 7000 + Math.random() * 400;
    } else {
      state.zones.ahu3.btu = 0;
    }

    // Snow melt - rarely on
    const snowOn = Math.sin(t / 120) > 0.8;
    state.zones.snowMelt.pumpOn = snowOn;
    if (snowOn) {
      state.zones.snowMelt.supplyTemp = 95;
      state.zones.snowMelt.btu = 20000;
    } else {
      state.zones.snowMelt.btu = 0;
    }

    // Power (simulate Emporia data)
    state.system.powerKw = 2.5 + Math.random() * 1.5;
    state.system.outdoorTemp = 35 + Math.sin(t / 300) * 10;

    calculateTotals();
    updateUI();
  }, 1000);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏠 Honey Hill HVAC HMI Starting...');

  // Try MQTT first
  if (typeof mqtt !== 'undefined') {
    connectMqtt();

    // Fallback to simulation if no data after 5 seconds
    setTimeout(() => {
      if (!state.connected) {
        console.log('No MQTT connection, starting simulation...');
        startSimulation();
      }
    }, 5000);
  } else {
    console.log('MQTT library not loaded, starting simulation...');
    startSimulation();
  }
});

/**
 * ESP32 Pin Map Component
 * Visual representation of GPIO pin assignments
 */

interface PinAssignment {
  pin: number;
  label: string;
  function: string;
  type: 'input' | 'output' | 'bus' | 'power' | 'gnd' | 'unused';
  color: string;
}

// ESP32 DevKit V1 pin assignments for BTU Meter
const LEFT_PINS: PinAssignment[] = [
  { pin: -1, label: '3V3', function: 'Power 3.3V', type: 'power', color: '#ff4444' },
  { pin: -1, label: 'GND', function: 'Ground', type: 'gnd', color: '#333333' },
  { pin: 15, label: 'GPIO15', function: 'Flow Meter 1 (AHU1)', type: 'input', color: '#44ff88' },
  { pin: 2, label: 'GPIO2', function: 'Built-in LED / Debug', type: 'output', color: '#ffcc00' },
  { pin: 4, label: 'GPIO4', function: 'OneWire Bus (DS18B20)', type: 'bus', color: '#4488ff' },
  { pin: 16, label: 'GPIO16', function: 'Flow Meter 2 (AHU2)', type: 'input', color: '#44ff88' },
  { pin: 17, label: 'GPIO17', function: 'Flow Meter 3 (AHU3)', type: 'input', color: '#44ff88' },
  { pin: 5, label: 'GPIO5', function: 'Flow Meter 4 (Snow)', type: 'input', color: '#44ff88' },
  { pin: 18, label: 'GPIO18', function: 'Flow Meter 5 (HP)', type: 'input', color: '#44ff88' },
  { pin: 19, label: 'GPIO19', function: 'Pump Relay 1', type: 'output', color: '#ff8844' },
  { pin: -1, label: 'GND', function: 'Ground', type: 'gnd', color: '#333333' },
  { pin: 21, label: 'GPIO21', function: 'I2C SDA (Display)', type: 'bus', color: '#4488ff' },
  { pin: 3, label: 'RX0', function: 'UART RX (Debug)', type: 'bus', color: '#aa44ff' },
  { pin: 1, label: 'TX0', function: 'UART TX (Debug)', type: 'bus', color: '#aa44ff' },
  { pin: 22, label: 'GPIO22', function: 'I2C SCL (Display)', type: 'bus', color: '#4488ff' },
  { pin: 23, label: 'GPIO23', function: 'Pump Relay 2', type: 'output', color: '#ff8844' },
];

const RIGHT_PINS: PinAssignment[] = [
  { pin: -1, label: 'VIN', function: 'Power 5V Input', type: 'power', color: '#ff4444' },
  { pin: -1, label: 'GND', function: 'Ground', type: 'gnd', color: '#333333' },
  { pin: 13, label: 'GPIO13', function: 'Pressure Transducer', type: 'input', color: '#44ffff' },
  { pin: 12, label: 'GPIO12', function: 'Reserved (Boot)', type: 'unused', color: '#666666' },
  { pin: 14, label: 'GPIO14', function: 'Status LED', type: 'output', color: '#ffcc00' },
  { pin: 27, label: 'GPIO27', function: 'Pump Relay 3', type: 'output', color: '#ff8844' },
  { pin: 26, label: 'GPIO26', function: 'Pump Relay 4', type: 'output', color: '#ff8844' },
  { pin: 25, label: 'GPIO25', function: 'Valve Control', type: 'output', color: '#ff8844' },
  { pin: 33, label: 'GPIO33', function: 'Analog In (Spare)', type: 'input', color: '#44ffff' },
  { pin: 32, label: 'GPIO32', function: 'Analog In (Spare)', type: 'input', color: '#44ffff' },
  { pin: 35, label: 'GPIO35', function: 'Input Only (Spare)', type: 'input', color: '#666666' },
  { pin: 34, label: 'GPIO34', function: 'Input Only (Spare)', type: 'input', color: '#666666' },
  { pin: -1, label: 'VN', function: 'ADC VP Negative', type: 'input', color: '#666666' },
  { pin: -1, label: 'VP', function: 'ADC VP Positive', type: 'input', color: '#666666' },
  { pin: -1, label: 'EN', function: 'Enable / Reset', type: 'power', color: '#ff4444' },
  { pin: -1, label: 'GND', function: 'Ground', type: 'gnd', color: '#333333' },
];

function PinRow({ pin, side }: { pin: PinAssignment; side: 'left' | 'right' }) {
  const isLeft = side === 'left';

  return (
    <div className={`pin-row ${side}`}>
      {isLeft ? (
        <>
          <span className="pin-function">{pin.function}</span>
          <span className="pin-label" style={{ background: pin.color }}>{pin.label}</span>
          <span className="pin-dot" style={{ background: pin.color }} />
        </>
      ) : (
        <>
          <span className="pin-dot" style={{ background: pin.color }} />
          <span className="pin-label" style={{ background: pin.color }}>{pin.label}</span>
          <span className="pin-function">{pin.function}</span>
        </>
      )}
    </div>
  );
}

export function ESP32PinMap() {
  return (
    <div className="esp32-pinmap-container">
      <div className="esp32-board">
        <div className="esp32-header">
          <div className="esp32-chip">ESP32</div>
          <div className="esp32-model">DevKit V1 - BTU Meter</div>
        </div>

        <div className="esp32-pins">
          <div className="pin-column left">
            {LEFT_PINS.map((pin, idx) => (
              <PinRow key={`left-${idx}`} pin={pin} side="left" />
            ))}
          </div>

          <div className="esp32-body">
            <div className="esp32-chip-visual">
              <div className="chip-label">ESP32</div>
              <div className="chip-label-sub">WROOM-32</div>
            </div>
            <div className="usb-port">USB</div>
          </div>

          <div className="pin-column right">
            {RIGHT_PINS.map((pin, idx) => (
              <PinRow key={`right-${idx}`} pin={pin} side="right" />
            ))}
          </div>
        </div>
      </div>

      <div className="pin-legend">
        <div className="legend-title">PIN LEGEND</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#44ff88' }} />
            <span>Flow Meter Input (Hall Effect)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#4488ff' }} />
            <span>Communication Bus (I2C/OneWire)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ff8844' }} />
            <span>Relay Output (Pumps/Valves)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#44ffff' }} />
            <span>Analog Input (Pressure/Spare)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ffcc00' }} />
            <span>LED / Debug</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#aa44ff' }} />
            <span>UART Serial</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ff4444' }} />
            <span>Power</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#333333' }} />
            <span>Ground</span>
          </div>
        </div>
      </div>
    </div>
  );
}

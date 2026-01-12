/**
 * HVAC System Type Definitions
 * Honey Hill HVAC - Air-to-Water Heat Pump System
 *
 * Data Sources:
 * - ESP32 + DS18B20 + Flow Meters → MQTT → Temps, Flow, BTU
 * - Emporia Vue API → kW consumption per circuit (CTs)
 */

// === ENUMS & BASIC TYPES ===

export type HvacMode = 'heating' | 'cooling' | 'standby' | 'defrost';
export type AlertLevel = 'info' | 'warning' | 'error';
export type ViewMode = 'by-area' | 'by-meter' | 'schematic';
export type AreaId = 'main-house' | 'garage' | 'studio' | 'snow-melt';
export type MeterId = 'ahu1-meter' | 'ahu2-meter' | 'ahu3-meter' | 'snow-meter' | 'hp-meter';
export type SensorStatus = 'online' | 'offline' | 'error' | 'stale';

// === ELECTRICAL MONITORING (Emporia Vue CTs) ===

export interface ElectricalReading {
  watts: number;
  kw: number;
  kwh: number; // Cumulative
  voltage: number;
  lastUpdate: Date | null;
}

export interface EmporiaCircuit {
  id: string;
  name: string;
  channelNum: number;
  reading: ElectricalReading;
}

// CT clamp assignments
export interface CtAssignments {
  heatPump: EmporiaCircuit | null;      // Apollo 5-ton outdoor unit
  pumpingStation: EmporiaCircuit | null; // Indoor pump station
  ahu1: EmporiaCircuit | null;           // Main House AHU
  ahu2: EmporiaCircuit | null;           // Garage AHU
  ahu3: EmporiaCircuit | null;           // Studio AHU
}

// === THERMAL SENSORS (ESP32 DS18B20) ===

export interface TempSensor {
  id: string;
  address: string; // DS18B20 ROM address
  tempF: number | null;
  tempC: number | null;
  status: SensorStatus;
  lastUpdate: Date | null;
}

// === FLOW METERS (Hall Effect) ===

export interface FlowMeter {
  id: string;
  gpm: number;
  totalGallons: number;
  pulseCount: number;
  status: SensorStatus;
  lastUpdate: Date | null;
}

// === BTU METER (Combined Sensor Package) ===

export interface BtuMeterState {
  id: MeterId;
  name: string;
  area: AreaId;

  // Thermal readings
  supplyTemp: number | null;
  returnTemp: number | null;
  deltaT: number | null;

  // Flow
  gpm: number;

  // Calculated BTU (500 × GPM × ΔT)
  btu: number | null;

  // Electrical (from Emporia CT)
  powerKw: number | null;
  powerKwh: number | null;

  // Local COP for this circuit
  cop: number | null;

  // Status
  status: SensorStatus;
  lastUpdate: Date | null;
}

// === EQUIPMENT STATES ===

export interface HeatPumpState {
  mode: HvacMode;
  supplyTemp: number | null;
  returnTemp: number | null;
  deltaT: number | null;

  // Electrical (Emporia CT on heat pump)
  powerKw: number | null;
  powerKwh: number | null;

  running: boolean;
  defrostActive: boolean;
}

export interface BufferTankState {
  temp: number | null;
  pressure: number | null; // PSI from pressure transducer
  level: number;           // 0-100% (visual only)
}

export interface PumpState {
  id: string;
  name: string;
  running: boolean;
  speed: number | null; // Grundfos ALPHA variable speed 0-100%
  powerW: number | null;
}

export interface AhuState {
  id: string;
  name: string;
  area: AreaId;

  // Thermal
  supplyTemp: number | null;
  returnTemp: number | null;
  deltaT: number | null;
  btu: number | null;
  gpm: number;

  // Electrical (Emporia CT)
  fanPowerKw: number | null;

  // Status
  pumpOn: boolean;
  fanOn: boolean;
  calling: boolean; // Thermostat calling
}

export interface SnowMeltState {
  loopTemp: number | null;
  slabTemp: number | null;
  outdoorTemp: number | null;
  btu: number | null;
  gpm: number;
  pumpOn: boolean;
  mixingValvePos: number | null; // 0-100%
  hbxMode: 'off' | 'idle' | 'melt' | 'anti-ice';
}

// === SYSTEM AGGREGATES ===

export interface SystemState {
  // BTU totals
  totalBtu: number;
  totalBtuToday: number;

  // COP calculations
  liveCop: number | null;        // Current: Total BTU / Total kW input
  dailyCop: number | null;       // Today's average
  yearlyCopAvg: number;          // Historical average

  // Flow
  totalGpm: number;

  // Electrical totals (from Emporia)
  totalPowerKw: number | null;   // Current draw
  totalKwhToday: number | null;  // Today's consumption

  // Environment
  outdoorTemp: number | null;
  outdoorHumidity: number | null;

  // Location
  location: string;
  timezone: string;
}

// === WEATHER ===

export interface WeatherState {
  temp: number | null;
  humidity: number | null;
  condition: string;
  icon: string;
  windSpeed: number | null;
  windDir: string | null;
  lastUpdate: Date | null;
}

// === ALERTS & ANOMALIES ===

export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  source: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface AnomalyThresholds {
  // Pressure
  minPressure: number; // 10 PSI
  maxPressure: number; // 25 PSI

  // Supply temp
  minSupplyTemp: number; // 90°F (cooling)
  maxSupplyTemp: number; // 130°F (heating)

  // Delta T
  minDeltaT: number;     // 5°F minimum useful
  maxDeltaT: number;     // 20°F max reasonable

  // COP
  minCop: number;        // 2.0 minimum acceptable

  // Sensor staleness
  staleThresholdMs: number; // 30000 (30 seconds)
}

// === AREA CONFIGURATION ===

export interface Area {
  id: AreaId;
  name: string;
  description: string;
  icon: string;
  sqft: number;
  equipment: string[];
  btuMeters: MeterId[];
  emporiaChannels: number[]; // CT channel numbers
}

// === COMPLETE SYSTEM STATE ===

export interface HvacSystemState {
  // Connection status
  mqttConnected: boolean;
  emporiaConnected: boolean;
  lastMqttUpdate: Date | null;
  lastEmporiaUpdate: Date | null;

  // Equipment
  heatPump: HeatPumpState;
  buffer: BufferTankState;
  ahus: Record<string, AhuState>;
  snowMelt: SnowMeltState;
  pumps: Record<string, PumpState>;

  // Meters
  meters: Record<MeterId, BtuMeterState>;

  // Electrical
  emporia: CtAssignments;

  // Aggregates
  system: SystemState;
  weather: WeatherState;

  // Alerts
  alerts: Alert[];

  // Thresholds
  thresholds: AnomalyThresholds;
}

// === DATA EXPORT ===

export interface ExportOptions {
  startDate: Date;
  endDate: Date;
  meters: MeterId[];
  includeElectrical: boolean;
  format: 'csv' | 'json';
  interval: '1min' | '5min' | '15min' | '1hour';
}

export interface ExportDataRow {
  timestamp: string;
  meterId: MeterId;
  meterName: string;
  area: AreaId;
  supplyTemp: number | null;
  returnTemp: number | null;
  deltaT: number | null;
  gpm: number;
  btu: number | null;
  powerKw: number | null;
  cop: number | null;
}

export interface ExportSummary {
  totalBtu: number;
  totalKwh: number;
  avgCop: number;
  runtimeHours: number;
  peakBtu: number;
  peakKw: number;
}

// === HISTORICAL DATA ===

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface HistoricalQuery {
  meterId?: MeterId;
  areaId?: AreaId;
  field: 'btu' | 'supplyTemp' | 'returnTemp' | 'deltaT' | 'cop' | 'powerKw';
  start: Date;
  end: Date;
  aggregation: 'mean' | 'max' | 'min' | 'sum';
  interval: string; // '1m', '5m', '1h', '1d'
}

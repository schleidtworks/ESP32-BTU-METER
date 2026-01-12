/**
 * Honey Hill HVAC System Configuration
 * Hardware mapping and constants
 */

import type { Area, AreaId, MeterId, AnomalyThresholds } from '../types/hvac.types';

// === SYSTEM CONSTANTS ===

export const BTU_FACTOR = 500; // BTU/hr = 500 x GPM x Delta T (water)
export const BTU_PER_KW = 3412; // For COP calculation

export const LOCATION = {
  name: 'Honey Hill',
  city: 'Lyme',
  state: 'CT',
  timezone: 'America/New_York',
  lat: 41.3234,
  lon: -72.3424,
};

// === MQTT CONFIGURATION ===

export const MQTT_CONFIG = {
  wsUrl: 'ws://localhost:9001',
  topics: {
    heatPump: 'hvac/heatpump/state',
    ahu1: 'hvac/ahu1/state',
    ahu2: 'hvac/ahu2/state',
    ahu3: 'hvac/ahu3/state',
    snowMelt: 'hvac/snowmelt/state',
    buffer: 'hvac/buffer/state',
    system: 'hvac/system/state',
    legacy: 'hydronics/main/state',
    all: 'hvac/#',
  },
  reconnectDelay: 5000,
};

// === EMPORIA VUE CONFIGURATION ===

export const EMPORIA_CONFIG = {
  apiUrl: 'https://api.emporiaenergy.com',
  channels: {
    heatPump: 1,
    pumpingStation: 2,
    ahu1: 3,
    ahu2: 4,
    ahu3: 5,
  },
  pollInterval: 5000,
};

// === INFLUXDB CONFIGURATION ===

export const INFLUX_CONFIG = {
  url: 'http://localhost:8086',
  org: 'honey-hill',
  bucket: 'hvac',
  token: import.meta.env.VITE_INFLUX_TOKEN || '',
};

// === EQUIPMENT DEFINITIONS ===

export const HEAT_PUMP = {
  name: 'Apollo 5-ton',
  manufacturer: 'MBTEK',
  capacity: 60000,
  type: 'Air-to-Water Heat Pump',
  technology: 'EVI Inverter DC',
  minOperatingTemp: -31,
};

export const BUFFER_TANK = {
  name: 'Buffer Tank',
  capacity: 30,
  normalPressure: { min: 12, max: 18 },
};

export const PUMPS = {
  pump1: {
    id: 'pump1',
    name: 'AHU 1 Pump',
    type: 'Grundfos ALPHA',
    zones: ['ahu1'],
  },
  pump2: {
    id: 'pump2',
    name: 'AHU 2/3 Pump',
    type: 'Grundfos ALPHA',
    zones: ['ahu2', 'ahu3'],
  },
  pump3: {
    id: 'pump3',
    name: 'Snow Melt Pump',
    type: 'Grundfos ALPHA',
    zones: ['snow-melt'],
  },
  pumpMain: {
    id: 'pump-main',
    name: 'Main Loop Pump',
    type: 'Built-in (Pump Station)',
    zones: ['all'],
  },
};

// === AREA DEFINITIONS ===

export const AREAS: Record<AreaId, Area> = {
  'main-house': {
    id: 'main-house',
    name: 'Main House',
    description: 'Primary living space',
    icon: 'MH',
    sqft: 1800,
    equipment: ['ahu1', 'pump1'],
    btuMeters: ['ahu1-meter'],
    emporiaChannels: [3],
  },
  'garage': {
    id: 'garage',
    name: 'Garage',
    description: 'Cinder block construction, one wall below grade',
    icon: 'GAR',
    sqft: 600,
    equipment: ['ahu2', 'pump2'],
    btuMeters: ['ahu2-meter'],
    emporiaChannels: [4],
  },
  'studio': {
    id: 'studio',
    name: '700 sq ft Studio',
    description: 'Above garage, built 1994, better thermal shell',
    icon: 'STD',
    sqft: 700,
    equipment: ['ahu3', 'pump2'],
    btuMeters: ['ahu3-meter'],
    emporiaChannels: [5],
  },
  'snow-melt': {
    id: 'snow-melt',
    name: 'Snow Melt',
    description: 'HBX SNO-0600 controlled driveway/walkway',
    icon: 'SNW',
    sqft: 400,
    equipment: ['hbx-controller', 'pump3', 'mixing-valve'],
    btuMeters: ['snow-meter'],
    emporiaChannels: [],
  },
};

// === BTU METER DEFINITIONS ===

export const BTU_METERS: Record<MeterId, { name: string; area: AreaId; defaultGpm: number }> = {
  'hp-meter': {
    name: 'Heat Pump Meter',
    area: 'main-house',
    defaultGpm: 8.0,
  },
  'ahu1-meter': {
    name: 'AHU 1 Meter',
    area: 'main-house',
    defaultGpm: 3.0,
  },
  'ahu2-meter': {
    name: 'AHU 2 Meter',
    area: 'garage',
    defaultGpm: 2.5,
  },
  'ahu3-meter': {
    name: 'AHU 3 Meter',
    area: 'studio',
    defaultGpm: 2.5,
  },
  'snow-meter': {
    name: 'Snow Melt Meter',
    area: 'snow-melt',
    defaultGpm: 4.0,
  },
};

// === ANOMALY THRESHOLDS ===

export const DEFAULT_THRESHOLDS: AnomalyThresholds = {
  minPressure: 10,
  maxPressure: 25,
  minSupplyTemp: 85,
  maxSupplyTemp: 130,
  minDeltaT: 3,
  maxDeltaT: 25,
  minCop: 2.0,
  staleThresholdMs: 30000,
};

// === REFRESH RATES ===

export const REFRESH_RATES = {
  realtime: 500,
  charts: 2000,
  historical: 60000,
  weather: 300000,
  emporia: 5000,
};

// === UI CONFIGURATION ===

export const UI_CONFIG = {
  colors: {
    bgDark: '#0a0a12',
    bgPanel: '#12141c',
    borderColor: '#2a3a4a',
    supplyHot: '#ff4444',
    returnCold: '#4488ff',
    accentGreen: '#44ff88',
    accentYellow: '#ffcc00',
    accentRed: '#ff4444',
    textPrimary: '#e0e8f0',
    textDim: '#6a7a8a',
  },
  fonts: {
    pixel: "'Press Start 2P', monospace",
    terminal: "'VT323', monospace",
  },
};

/**
 * Demo Data Service
 * Generates realistic simulated HVAC data for UI development
 * Based on the simulation patterns from backend_simulator.py and app.js
 */

import type {
  HvacSystemState,
  HeatPumpState,
  BufferTankState,
  AhuState,
  SnowMeltState,
  PumpState,
  BtuMeterState,
  SystemState,
  WeatherState,
  Alert,
  MeterId,
  CtAssignments,
} from '../types/hvac.types';
import { BTU_FACTOR, BTU_PER_KW, DEFAULT_THRESHOLDS, LOCATION } from '../config/system.config';

export type HistoryRange = 'week' | 'month' | 'year';

export interface HistoryPoint {
  label: string;
  value: number;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  icon: string;
}

// Simulation start time
const t0 = Date.now();
let currentNowMs = Date.now();

// Allow playback by shifting "now"
const setNow = (nowMs?: number) => {
  currentNowMs = nowMs ?? Date.now();
};

// Get elapsed seconds
const getT = () => (currentNowMs - t0) / 1000;

// Wave functions for realistic variation
const wave = (period: number, amplitude: number = 1) =>
  Math.sin(getT() / period) * amplitude;

const noise = (max: number = 0.5) =>
  (Math.random() - 0.5) * 2 * max;

// Calculate BTU from flow and temps
const calcBtu = (gpm: number, deltaT: number) =>
  BTU_FACTOR * gpm * Math.abs(deltaT);

// Calculate COP
const calcCop = (btu: number, kw: number) =>
  kw > 0 ? btu / (kw * BTU_PER_KW) : null;

/**
 * Generate demo heat pump state
 */
function generateHeatPump(): HeatPumpState {
  const baseSupply = 115;
  const supplyTemp = baseSupply + wave(15, 2) + noise(0.3);
  const returnTemp = supplyTemp - 10 - wave(10, 1) + noise(0.2);
  const deltaT = supplyTemp - returnTemp;
  const powerKw = 2.5 + wave(30, 0.8) + noise(0.1);

  return {
    mode: 'heating',
    supplyTemp,
    returnTemp,
    deltaT,
    powerKw,
    powerKwh: powerKw * (getT() / 3600), // Cumulative
    running: true,
    defrostActive: false,
  };
}

/**
 * Generate demo buffer tank state
 */
function generateBuffer(): BufferTankState {
  return {
    temp: 112 + wave(20, 3) + noise(0.5),
    pressure: 15 + wave(60, 2) + noise(0.3),
    level: 70 + wave(120, 10),
  };
}

/**
 * Generate demo AHU state
 */
function generateAhu(
  id: string,
  name: string,
  area: 'main-house' | 'garage' | 'studio',
  gpm: number,
  cycleOffset: number
): AhuState {
  // Each AHU has its own cycle pattern
  const isOn = Math.sin((getT() + cycleOffset) / 45) > -0.3;

  if (!isOn) {
    return {
      id,
      name,
      area,
      supplyTemp: null,
      returnTemp: null,
      deltaT: null,
      btu: 0,
      gpm: 0,
      fanPowerKw: 0,
      pumpOn: false,
      fanOn: false,
      calling: false,
    };
  }

  const baseSupply = 114 + noise(1);
  const supplyTemp = baseSupply + wave(15, 1.5);
  const returnTemp = supplyTemp - (8 + wave(20, 2) + noise(0.5));
  const deltaT = supplyTemp - returnTemp;
  const btu = calcBtu(gpm, deltaT);
  const fanPowerKw = 0.3 + noise(0.05);

  return {
    id,
    name,
    area,
    supplyTemp,
    returnTemp,
    deltaT,
    btu,
    gpm,
    fanPowerKw,
    pumpOn: true,
    fanOn: true,
    calling: true,
  };
}

/**
 * Generate demo snow melt state
 */
function generateSnowMelt(): SnowMeltState {
  // Snow melt only runs occasionally
  const isOn = wave(120, 1) > 0.8;

  if (!isOn) {
    return {
      loopTemp: 75 + noise(2),
      slabTemp: 35 + noise(1),
      outdoorTemp: 32 + wave(300, 5) + noise(1),
      btu: 0,
      gpm: 0,
      pumpOn: false,
      mixingValvePos: 0,
      hbxMode: 'idle',
    };
  }

  const loopTemp = 95 + wave(30, 3) + noise(1);
  const gpm = 4.0;
  const deltaT = 12 + wave(20, 2);
  const btu = calcBtu(gpm, deltaT);

  return {
    loopTemp,
    slabTemp: 38 + wave(60, 2),
    outdoorTemp: 32 + wave(300, 5) + noise(1),
    btu,
    gpm,
    pumpOn: true,
    mixingValvePos: 65 + wave(30, 10),
    hbxMode: 'melt',
  };
}

/**
 * Generate demo pump states
 */
function generatePumps(ahus: Record<string, AhuState>, snowMelt: SnowMeltState): Record<string, PumpState> {
  return {
    'pump-main': {
      id: 'pump-main',
      name: 'Main Loop',
      running: true,
      speed: 75 + wave(60, 10),
      powerW: 45 + wave(30, 10),
    },
    pump1: {
      id: 'pump1',
      name: 'AHU 1',
      running: ahus.ahu1?.pumpOn ?? false,
      speed: ahus.ahu1?.pumpOn ? 60 + wave(45, 15) : 0,
      powerW: ahus.ahu1?.pumpOn ? 35 + noise(5) : 0,
    },
    pump2: {
      id: 'pump2',
      name: 'AHU 2/3',
      running: (ahus.ahu2?.pumpOn ?? false) || (ahus.ahu3?.pumpOn ?? false),
      speed: ((ahus.ahu2?.pumpOn ?? false) || (ahus.ahu3?.pumpOn ?? false)) ? 55 + wave(40, 12) : 0,
      powerW: ((ahus.ahu2?.pumpOn ?? false) || (ahus.ahu3?.pumpOn ?? false)) ? 32 + noise(5) : 0,
    },
    pump3: {
      id: 'pump3',
      name: 'Snow Melt',
      running: snowMelt.pumpOn,
      speed: snowMelt.pumpOn ? 80 + wave(20, 8) : 0,
      powerW: snowMelt.pumpOn ? 55 + noise(8) : 0,
    },
  };
}

/**
 * Generate BTU meter from AHU state
 */
function generateMeter(ahu: AhuState, meterId: MeterId, powerKw: number | null): BtuMeterState {
  return {
    id: meterId,
    name: ahu.name + ' Meter',
    area: ahu.area,
    supplyTemp: ahu.supplyTemp,
    returnTemp: ahu.returnTemp,
    deltaT: ahu.deltaT,
    gpm: ahu.gpm,
    btu: ahu.btu,
    powerKw,
    powerKwh: powerKw ? powerKw * (getT() / 3600) : null,
    cop: ahu.btu && powerKw ? calcCop(ahu.btu, powerKw) : null,
    status: ahu.pumpOn ? 'online' : 'offline',
    lastUpdate: new Date(),
  };
}

/**
 * Generate demo Emporia CT readings
 */
function generateEmporia(): CtAssignments {
  const makeCircuit = (id: string, name: string, channelNum: number, baseWatts: number) => ({
    id,
    name,
    channelNum,
    reading: {
      watts: baseWatts + wave(30, baseWatts * 0.1) + noise(baseWatts * 0.02),
      kw: (baseWatts + wave(30, baseWatts * 0.1)) / 1000,
      kwh: (baseWatts / 1000) * (getT() / 3600),
      voltage: 240 + noise(2),
      lastUpdate: new Date(),
    },
  });

  return {
    heatPump: makeCircuit('hp', 'Heat Pump', 1, 2800),
    pumpingStation: makeCircuit('ps', 'Pump Station', 2, 150),
    ahu1: makeCircuit('ahu1', 'AHU 1', 3, 350),
    ahu2: makeCircuit('ahu2', 'AHU 2', 4, 300),
    ahu3: makeCircuit('ahu3', 'AHU 3', 5, 280),
  };
}

/**
 * Generate demo weather
 */
function generateWeather(): WeatherState {
  return {
    temp: 35 + wave(300, 8) + noise(1),
    humidity: 65 + wave(200, 15),
    condition: 'Partly Cloudy',
    icon: 'PTC',
    windSpeed: 8 + wave(120, 5),
    windDir: 'NW',
    lastUpdate: new Date(),
  };
}

/**
 * Generate demo alerts based on current state
 */
function generateAlerts(state: Partial<HvacSystemState>): Alert[] {
  const alerts: Alert[] = [];

  // Check pressure
  const pressure = state.buffer?.pressure ?? 15;
  if (pressure < DEFAULT_THRESHOLDS.minPressure) {
    alerts.push({
      id: 'low-pressure',
      level: 'warning',
      message: `Low loop pressure: ${pressure.toFixed(1)} PSI`,
      source: 'Buffer Tank',
      value: pressure,
      threshold: DEFAULT_THRESHOLDS.minPressure,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  // Normal status if no alerts
  if (alerts.length === 0) {
    alerts.push({
      id: 'system-normal',
      level: 'info',
      message: 'System Normal',
      source: 'System',
      timestamp: new Date(),
      acknowledged: true,
    });
  }

  return alerts;
}

/**
 * Generate complete demo system state
 * Call this every render cycle for live simulation
 */
export function generateDemoState(nowMs?: number): HvacSystemState {
  setNow(nowMs);
  const heatPump = generateHeatPump();
  const buffer = generateBuffer();
  const weather = generateWeather();
  const snowMelt = generateSnowMelt();

  const ahus: Record<string, AhuState> = {
    ahu1: generateAhu('ahu1', 'AHU 1 - Main House', 'main-house', 3.0, 0),
    ahu2: generateAhu('ahu2', 'AHU 2 - Garage', 'garage', 2.5, 20),
    ahu3: generateAhu('ahu3', 'AHU 3 - Studio', 'studio', 2.5, 40),
  };

  const pumps = generatePumps(ahus, snowMelt);
  const emporia = generateEmporia();

  // Calculate totals
  const totalBtu =
    (ahus.ahu1?.btu ?? 0) +
    (ahus.ahu2?.btu ?? 0) +
    (ahus.ahu3?.btu ?? 0) +
    (snowMelt?.btu ?? 0);

  const totalGpm =
    (ahus.ahu1?.gpm ?? 0) +
    (ahus.ahu2?.gpm ?? 0) +
    (ahus.ahu3?.gpm ?? 0) +
    (snowMelt?.gpm ?? 0);

  const totalPowerKw =
    (heatPump.powerKw ?? 0) +
    (emporia.pumpingStation?.reading.kw ?? 0) +
    (emporia.ahu1?.reading.kw ?? 0) +
    (emporia.ahu2?.reading.kw ?? 0) +
    (emporia.ahu3?.reading.kw ?? 0);

  const liveCop = totalPowerKw > 0 ? calcCop(totalBtu, totalPowerKw) : null;

  const meters: Record<MeterId, BtuMeterState> = {
    'hp-meter': {
      id: 'hp-meter',
      name: 'Heat Pump Meter',
      area: 'main-house',
      supplyTemp: heatPump.supplyTemp,
      returnTemp: heatPump.returnTemp,
      deltaT: heatPump.deltaT,
      gpm: 8.0,
      btu: heatPump.deltaT ? calcBtu(8.0, heatPump.deltaT) : null,
      powerKw: heatPump.powerKw,
      powerKwh: heatPump.powerKwh,
      cop: heatPump.deltaT && heatPump.powerKw
        ? calcCop(calcBtu(8.0, heatPump.deltaT), heatPump.powerKw)
        : null,
      status: 'online',
      lastUpdate: new Date(),
    },
    'ahu1-meter': generateMeter(ahus.ahu1, 'ahu1-meter', emporia.ahu1?.reading.kw ?? null),
    'ahu2-meter': generateMeter(ahus.ahu2, 'ahu2-meter', emporia.ahu2?.reading.kw ?? null),
    'ahu3-meter': generateMeter(ahus.ahu3, 'ahu3-meter', emporia.ahu3?.reading.kw ?? null),
    'snow-meter': {
      id: 'snow-meter',
      name: 'Snow Melt Meter',
      area: 'snow-melt',
      supplyTemp: snowMelt.loopTemp,
      returnTemp: snowMelt.loopTemp ? snowMelt.loopTemp - 12 : null,
      deltaT: 12,
      gpm: snowMelt.gpm,
      btu: snowMelt.btu,
      powerKw: null,
      powerKwh: null,
      cop: null,
      status: snowMelt.pumpOn ? 'online' : 'offline',
      lastUpdate: new Date(),
    },
  };

  const system: SystemState = {
    totalBtu,
    totalBtuToday: totalBtu * (getT() / 3600) * 0.7, // Rough estimate
    liveCop,
    dailyCop: liveCop ? liveCop * 0.95 : null, // Slightly lower daily average
    yearlyCopAvg: 3.2,
    totalGpm,
    totalPowerKw,
    totalKwhToday: totalPowerKw * (getT() / 3600),
    outdoorTemp: weather.temp,
    outdoorHumidity: weather.humidity,
    location: `${LOCATION.name}, ${LOCATION.city}, ${LOCATION.state}`,
    timezone: LOCATION.timezone,
  };

  const partialState = { buffer, heatPump };
  const alerts = generateAlerts(partialState);

  return {
    mqttConnected: true,
    emporiaConnected: true,
    lastMqttUpdate: new Date(),
    lastEmporiaUpdate: new Date(),
    heatPump,
    buffer,
    ahus,
    snowMelt,
    pumps,
    meters,
    emporia,
    system,
    weather,
    alerts,
    thresholds: DEFAULT_THRESHOLDS,
  };
}

/**
 * Demo mode hook - updates state at specified interval
 */
export function useDemoMode(_intervalMs: number = 500) {
  // This will be implemented as a React hook
  // For now, just export the generator function
  return generateDemoState;
}

/**
 * Generate simple demo history series for charts.
 */
export function generateHistorySeries(range: HistoryRange, base: number, variance: number): HistoryPoint[] {
  const count = range === 'week' ? 7 : range === 'month' ? 30 : 12;
  const points: HistoryPoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const waveVal = Math.sin(angle) * variance;
    const jitter = (Math.random() - 0.5) * variance * 0.4;
    const value = Math.max(0, base + waveVal + jitter);

    let label = String(i + 1);
    if (range === 'week') {
      label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7];
    } else if (range === 'year') {
      label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12];
    }

    points.push({ label, value });
  }

  return points;
}

export function generateForecast(baseTemp: number): ForecastDay[] {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const icons = ['SUN', 'PTC', 'CLD', 'RAIN', 'SNW'];

  return labels.map((label, index) => {
    const swing = Math.sin((index + 1) * 0.9) * 6;
    const high = Math.round(baseTemp + 8 + swing);
    const low = Math.round(baseTemp - 6 + swing * 0.6);
    const icon = icons[index % icons.length];

    return {
      day: label,
      high,
      low,
      icon,
    };
  });
}


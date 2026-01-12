/**
 * Price Tracking Service
 * Tracks daily energy costs and calculates $/MMBTU
 * Compares heat pump efficiency to EIA natural gas prices for CT
 */

export interface DailyPriceRecord {
  date: string;  // YYYY-MM-DD
  totalBTU: number;
  totalKWh: number;
  electricityCost: number;
  mmbtu: number;
  pricePerMMBTU: number;
  avgCOP: number;
  eiaGasPrice: number;
  savings: number;  // Positive = saving money vs gas
}

export interface PriceSettings {
  electricityRate: number;  // $/kWh
  eiaGasRate: number;       // $/MMBTU for natural gas
  lastUpdated: string;
}

const STORAGE_KEY = 'hvac-price-tracking';
const SETTINGS_KEY = 'hvac-price-settings';
const MAX_RECORDS = 365; // Keep 1 year

// Default CT electricity rate (~$0.25/kWh including delivery)
const DEFAULT_ELECTRICITY_RATE = 0.25;

// EIA CT residential natural gas price (approximate $/MMBTU)
// Source: https://www.eia.gov/dnav/ng/ng_pri_sum_dcu_SCT_m.htm
const DEFAULT_EIA_GAS_RATE = 18.50;

// Get price settings
export function getPriceSettings(): PriceSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load price settings:', e);
  }

  return {
    electricityRate: DEFAULT_ELECTRICITY_RATE,
    eiaGasRate: DEFAULT_EIA_GAS_RATE,
    lastUpdated: new Date().toISOString(),
  };
}

// Save price settings
export function savePriceSettings(settings: Partial<PriceSettings>): PriceSettings {
  const current = getPriceSettings();
  const updated = {
    ...current,
    ...settings,
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save price settings:', e);
  }

  return updated;
}

// Get all price records
export function getPriceRecords(): DailyPriceRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load price records:', e);
  }
  return [];
}

// Save a daily price record
export function saveDailyPrice(data: {
  totalBTU: number;
  totalKWh: number;
  avgCOP: number;
}): DailyPriceRecord {
  const records = getPriceRecords();
  const settings = getPriceSettings();
  const today = new Date().toISOString().split('T')[0];

  // Calculate metrics
  const electricityCost = data.totalKWh * settings.electricityRate;
  const mmbtu = data.totalBTU / 1000000;
  const pricePerMMBTU = mmbtu > 0 ? electricityCost / mmbtu : 0;

  // Calculate savings vs natural gas
  // If we used gas instead: mmbtu * gasRate
  const gasCost = mmbtu * settings.eiaGasRate;
  const savings = gasCost - electricityCost;

  const newRecord: DailyPriceRecord = {
    date: today,
    totalBTU: data.totalBTU,
    totalKWh: data.totalKWh,
    electricityCost: Math.round(electricityCost * 100) / 100,
    mmbtu: Math.round(mmbtu * 1000) / 1000,
    pricePerMMBTU: Math.round(pricePerMMBTU * 100) / 100,
    avgCOP: Math.round(data.avgCOP * 100) / 100,
    eiaGasPrice: settings.eiaGasRate,
    savings: Math.round(savings * 100) / 100,
  };

  // Replace today's record if exists, otherwise add new
  const filtered = records.filter(r => r.date !== today);
  filtered.unshift(newRecord);

  // Trim to max records
  const trimmed = filtered.slice(0, MAX_RECORDS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save price record:', e);
  }

  return newRecord;
}

// Get records for a date range
export function getPricesByDateRange(startDate: string, endDate: string): DailyPriceRecord[] {
  return getPriceRecords().filter(r => r.date >= startDate && r.date <= endDate);
}

// Get the last N days of records
export function getRecentPrices(days: number = 30): DailyPriceRecord[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return getPriceRecords().filter(r => r.date >= cutoffStr);
}

// Calculate summary statistics
export function getPriceSummary(days: number = 30): {
  totalCost: number;
  totalSavings: number;
  avgPricePerMMBTU: number;
  avgCOP: number;
  totalBTU: number;
  totalKWh: number;
  daysTracked: number;
  savingsPercent: number;
} {
  const records = getRecentPrices(days);

  if (records.length === 0) {
    return {
      totalCost: 0,
      totalSavings: 0,
      avgPricePerMMBTU: 0,
      avgCOP: 0,
      totalBTU: 0,
      totalKWh: 0,
      daysTracked: 0,
      savingsPercent: 0,
    };
  }

  const totalCost = records.reduce((sum, r) => sum + r.electricityCost, 0);
  const totalSavings = records.reduce((sum, r) => sum + r.savings, 0);
  const totalBTU = records.reduce((sum, r) => sum + r.totalBTU, 0);
  const totalKWh = records.reduce((sum, r) => sum + r.totalKWh, 0);
  const avgCOP = records.reduce((sum, r) => sum + r.avgCOP, 0) / records.length;

  const totalMMBTU = totalBTU / 1000000;
  const avgPricePerMMBTU = totalMMBTU > 0 ? totalCost / totalMMBTU : 0;

  // Calculate what gas would have cost
  const settings = getPriceSettings();
  const gasCost = totalMMBTU * settings.eiaGasRate;
  const savingsPercent = gasCost > 0 ? ((gasCost - totalCost) / gasCost) * 100 : 0;

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    avgPricePerMMBTU: Math.round(avgPricePerMMBTU * 100) / 100,
    avgCOP: Math.round(avgCOP * 100) / 100,
    totalBTU,
    totalKWh: Math.round(totalKWh * 10) / 10,
    daysTracked: records.length,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  };
}

// Calculate breakeven COP (where heat pump = gas cost)
export function calculateBreakevenCOP(): number {
  const settings = getPriceSettings();
  // BTU per kWh = 3412.14
  // Cost per BTU from electricity = electricityRate / 3412.14
  // Cost per BTU from gas = gasRate / 1,000,000
  // At breakeven: electricityRate / (COP * 3412.14) = gasRate / 1,000,000
  // COP = (electricityRate * 1,000,000) / (gasRate * 3412.14)

  const breakevenCOP = (settings.electricityRate * 1000000) / (settings.eiaGasRate * 3412.14);
  return Math.round(breakevenCOP * 100) / 100;
}

// Clear all price records
export function clearPriceRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Export records as CSV
export function exportPricesCSV(): string {
  const records = getPriceRecords();
  const headers = ['Date', 'BTU', 'kWh', 'Cost ($)', 'MMBTU', '$/MMBTU', 'COP', 'Gas Price', 'Savings'];

  const rows = records.map(r => [
    r.date,
    r.totalBTU,
    r.totalKWh,
    r.electricityCost,
    r.mmbtu,
    r.pricePerMMBTU,
    r.avgCOP,
    r.eiaGasPrice,
    r.savings,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

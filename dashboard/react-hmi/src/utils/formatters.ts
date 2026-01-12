/**
 * Formatting Utilities
 * Common value formatters for the dashboard
 */

export const formatTemp = (temp: number | null) =>
  temp !== null ? `${temp.toFixed(1)} F` : '--';

export const formatBtu = (btu: number | null) =>
  btu !== null ? btu.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '--';

export const formatCop = (cop: number | null) =>
  cop !== null ? cop.toFixed(2) : '--';

export const formatTime = (date: Date) =>
  date.toLocaleTimeString();

export const formatKwh = (kwh: number | null) =>
  kwh !== null ? kwh.toFixed(1) : '--';

export const formatCurrency = (value: number | null) =>
  value !== null ? `$${value.toFixed(0)}` : '--';

export const formatGpm = (gpm: number | null) =>
  gpm !== null ? `${gpm.toFixed(1)} GPM` : '--';

export const formatPressure = (psi: number | null) =>
  psi !== null ? `${psi.toFixed(1)} PSI` : '--';

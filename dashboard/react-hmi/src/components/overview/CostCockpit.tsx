/**
 * Cost Cockpit Component
 * Energy cost calculations display
 */

import { useSystem } from '../../context/HvacContext';
import { StatCard } from '../common';
import { formatCurrency, formatKwh } from '../../utils/formatters';

const ENERGY_RATE_PER_KWH = 0.25;

export function CostCockpit() {
  const system = useSystem();
  const dailyKwh = system.totalKwhToday ?? 0;
  const costDay = dailyKwh * ENERGY_RATE_PER_KWH;
  const costMonth = costDay * 30;
  const costYear = costDay * 365;

  return (
    <div className="stats-grid">
      <StatCard title="COST TODAY" value={formatCurrency(costDay)} subtitle="Estimated" />
      <StatCard title="COST MONTH" value={formatCurrency(costMonth)} subtitle="Projected" />
      <StatCard title="COST YEAR" value={formatCurrency(costYear)} subtitle="Projected" />
      <StatCard title="kWh TODAY" value={formatKwh(dailyKwh)} subtitle="Total use" />
    </div>
  );
}

export { ENERGY_RATE_PER_KWH };

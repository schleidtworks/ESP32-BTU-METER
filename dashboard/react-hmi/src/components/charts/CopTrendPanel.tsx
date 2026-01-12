/**
 * COP Trend Panel Component
 * 12-month COP and temperature trend chart
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSystem, useWeather } from '../../context/HvacContext';
import { generateHistorySeries } from '../../services/demo.service';
import { formatCop } from '../../utils/formatters';

export function CopTrendPanel() {
  const system = useSystem();
  const weather = useWeather();
  const baseCop = system.dailyCop ?? system.liveCop ?? 3.2;
  const baseTemp = system.outdoorTemp ?? weather.temp ?? 40;

  const trendSeries = useMemo(() => {
    const copSeries = generateHistorySeries('year', baseCop, 0.8);
    const tempSeries = generateHistorySeries('year', baseTemp, 12);
    return copSeries.map((point, idx) => ({
      label: point.label,
      cop: Number(point.value.toFixed(2)),
      temp: Number((tempSeries[idx]?.value ?? baseTemp).toFixed(1)),
    }));
  }, [baseCop, baseTemp]);

  const avgCop = trendSeries.reduce((sum, point) => sum + point.cop, 0) / trendSeries.length;
  const avgTemp = trendSeries.reduce((sum, point) => sum + point.temp, 0) / trendSeries.length;

  return (
    <div className="card trend-card">
      <div className="card-title">COP TREND (12 MONTHS)</div>
      <div className="chart-summary">
        <span>Avg COP: {formatCop(avgCop)}</span>
        <span>Avg Temp: {avgTemp.toFixed(1)} F</span>
      </div>
      <div className="chart-legend">
        <span className="legend-item cop">COP</span>
        <span className="legend-item temp">AVG TEMP</span>
        <span className="legend-item band">OPERATING BANDS</span>
      </div>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendSeries}>
            <CartesianGrid stroke="#1d2632" strokeDasharray="4 4" />
            <XAxis dataKey="label" stroke="#6a7a8a" />
            <YAxis yAxisId="cop" stroke="#6a7a8a" domain={[0, 6]} />
            <YAxis yAxisId="temp" orientation="right" stroke="#6a7a8a" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#12141c', border: '1px solid #2a3a4a', color: '#e0e8f0' }}
              labelStyle={{ color: '#ffcc00' }}
            />
            <ReferenceArea yAxisId="cop" y1={0} y2={2} fill="rgba(255, 68, 68, 0.12)" />
            <ReferenceArea yAxisId="cop" y1={2} y2={4} fill="rgba(68, 255, 136, 0.12)" />
            <ReferenceArea yAxisId="cop" y1={4} y2={6} fill="rgba(255, 204, 0, 0.12)" />
            <ReferenceLine yAxisId="cop" y={avgCop} stroke="#44ff88" strokeDasharray="6 6" />
            <Line yAxisId="cop" type="monotone" dataKey="cop" stroke="#44ff88" strokeWidth={2} dot={false} />
            <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#4488ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

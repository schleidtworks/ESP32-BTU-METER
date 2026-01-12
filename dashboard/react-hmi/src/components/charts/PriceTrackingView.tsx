/**
 * Price Tracking View Component
 * Displays daily cost tracking and comparison to EIA natural gas prices
 */

import { useState, useEffect } from 'react';
import { useHvac } from '../../context/HvacContext';
import {
  getRecentPrices,
  getPriceSummary,
  getPriceSettings,
  savePriceSettings,
  saveDailyPrice,
  calculateBreakevenCOP,
  exportPricesCSV,
  type DailyPriceRecord,
  type PriceSettings,
} from '../../services/priceTracking.service';

type ViewPeriod = '7' | '30' | '90' | '365';

export function PriceTrackingView() {
  const { state } = useHvac();
  const [period, setPeriod] = useState<ViewPeriod>('30');
  const [records, setRecords] = useState<DailyPriceRecord[]>([]);
  const [settings, setSettings] = useState<PriceSettings>(getPriceSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [tempRate, setTempRate] = useState(settings.electricityRate.toString());
  const [tempGasRate, setTempGasRate] = useState(settings.eiaGasRate.toString());

  // Load records on mount and when period changes
  useEffect(() => {
    setRecords(getRecentPrices(parseInt(period)));
  }, [period]);

  // Auto-save today's data when component mounts
  useEffect(() => {
    if (state.system.totalBtuToday && state.system.totalKwhToday) {
      saveDailyPrice({
        totalBTU: state.system.totalBtuToday,
        totalKWh: state.system.totalKwhToday,
        avgCOP: state.system.liveCop || 0,
      });
      setRecords(getRecentPrices(parseInt(period)));
    }
  }, [state.system.totalBtuToday, state.system.totalKwhToday, state.system.liveCop, period]);

  const summary = getPriceSummary(parseInt(period));
  const breakevenCOP = calculateBreakevenCOP();

  const handleSaveSettings = () => {
    const rate = parseFloat(tempRate);
    const gasRate = parseFloat(tempGasRate);

    if (!isNaN(rate) && rate > 0 && !isNaN(gasRate) && gasRate > 0) {
      const updated = savePriceSettings({
        electricityRate: rate,
        eiaGasRate: gasRate,
      });
      setSettings(updated);
      setShowSettings(false);
      // Refresh records with new rates
      setRecords(getRecentPrices(parseInt(period)));
    }
  };

  const handleExport = () => {
    const csv = exportPricesCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hvac-prices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const savingsColor = summary.savingsPercent >= 0 ? 'var(--green)' : 'var(--red)';
  const copColor = (state.system.liveCop || 0) >= breakevenCOP ? 'var(--green)' : 'var(--red)';

  return (
    <div className="price-tracking-view">
      <div className="price-tracking-header">
        <h3 className="font-pixel text-cyan">ENERGY COST TRACKING</h3>
        <div className="price-tracking-controls">
          <div className="range-toggle">
            {(['7', '30', '90', '365'] as ViewPeriod[]).map(p => (
              <button
                key={p}
                type="button"
                className={`range-button ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === '7' ? '7D' : p === '30' ? '30D' : p === '90' ? '90D' : '1Y'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="range-button"
            onClick={() => setShowSettings(!showSettings)}
          >
            RATES
          </button>
          <button
            type="button"
            className="range-button"
            onClick={handleExport}
          >
            EXPORT
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="price-settings-panel">
          <div className="price-settings-row">
            <label>Electricity Rate ($/kWh):</label>
            <input
              type="number"
              step="0.01"
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              className="settings-input"
              style={{ width: '100px' }}
            />
          </div>
          <div className="price-settings-row">
            <label>CT Natural Gas ($/MMBTU):</label>
            <input
              type="number"
              step="0.50"
              value={tempGasRate}
              onChange={(e) => setTempGasRate(e.target.value)}
              className="settings-input"
              style={{ width: '100px' }}
            />
          </div>
          <div className="price-settings-actions">
            <button type="button" className="range-button" onClick={handleSaveSettings}>
              SAVE
            </button>
            <button type="button" className="range-button" onClick={() => setShowSettings(false)}>
              CANCEL
            </button>
          </div>
          <div className="settings-note">
            EIA CT natural gas data: eia.gov/dnav/ng
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="price-summary-grid">
        <div className="price-summary-card">
          <div className="price-card-value" style={{ color: savingsColor }}>
            ${summary.totalCost.toFixed(2)}
          </div>
          <div className="price-card-label">Total Cost ({period}d)</div>
        </div>
        <div className="price-summary-card">
          <div className="price-card-value" style={{ color: savingsColor }}>
            {summary.savingsPercent >= 0 ? '+' : ''}{summary.savingsPercent.toFixed(1)}%
          </div>
          <div className="price-card-label">vs Natural Gas</div>
        </div>
        <div className="price-summary-card">
          <div className="price-card-value">${summary.avgPricePerMMBTU.toFixed(2)}</div>
          <div className="price-card-label">Avg $/MMBTU</div>
        </div>
        <div className="price-summary-card">
          <div className="price-card-value">${settings.eiaGasRate.toFixed(2)}</div>
          <div className="price-card-label">EIA Gas $/MMBTU</div>
        </div>
      </div>

      {/* Breakeven Analysis */}
      <div className="price-breakeven-panel">
        <div className="breakeven-row">
          <span>Breakeven COP:</span>
          <span className="breakeven-value">{breakevenCOP.toFixed(2)}</span>
        </div>
        <div className="breakeven-row">
          <span>Current COP:</span>
          <span className="breakeven-value" style={{ color: copColor }}>
            {(state.system.liveCop || 0).toFixed(2)}
          </span>
        </div>
        <div className="breakeven-status" style={{ color: copColor }}>
          {(state.system.liveCop || 0) >= breakevenCOP
            ? '✓ Heat pump is cheaper than gas'
            : '⚠ Gas would be cheaper at current COP'}
        </div>
      </div>

      {/* Savings Summary */}
      <div className="price-savings-panel" style={{ borderColor: savingsColor }}>
        <div className="savings-title">
          {summary.savingsPercent >= 0 ? '💰 Estimated Savings' : '⚠️ Additional Cost'}
        </div>
        <div className="savings-amount" style={{ color: savingsColor }}>
          ${Math.abs(summary.totalSavings).toFixed(2)}
        </div>
        <div className="savings-subtitle">
          vs CT natural gas ({summary.daysTracked} days tracked)
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="price-table-container">
        <div className="price-table-title">DAILY COST LOG</div>
        {records.length === 0 ? (
          <div className="price-empty">No price data recorded yet. Data will be logged daily.</div>
        ) : (
          <table className="price-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>BTU</th>
                <th>kWh</th>
                <th>COST</th>
                <th>$/MMBTU</th>
                <th>COP</th>
                <th>SAVINGS</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 10).map(record => (
                <tr key={record.date}>
                  <td>{record.date}</td>
                  <td>{formatNumber(record.totalBTU)}</td>
                  <td>{record.totalKWh.toFixed(1)}</td>
                  <td>${record.electricityCost.toFixed(2)}</td>
                  <td>${record.pricePerMMBTU.toFixed(2)}</td>
                  <td>{record.avgCOP.toFixed(2)}</td>
                  <td style={{ color: record.savings >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {record.savings >= 0 ? '+' : ''}${record.savings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Helper to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

/**
 * Historical Summary View Component
 * Displays stored AI summaries and performance history
 */

import { useState, useEffect } from 'react';
import {
  getRecentSummaries,
  getAverageHealthScore,
  getPerformanceTrends,
  exportSummaries,
  clearSummaries,
} from '../../services/summaryLog.service';
import type { AISummaryLog } from '../../types/hvac.types';

type ViewPeriod = '7' | '30' | '90' | '365';

export function HistoricalSummaryView() {
  const [period, setPeriod] = useState<ViewPeriod>('30');
  const [summaries, setSummaries] = useState<AISummaryLog[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<AISummaryLog | null>(null);

  // Load summaries on mount and when period changes
  useEffect(() => {
    setSummaries(getRecentSummaries(parseInt(period)));
  }, [period]);

  const avgHealth = getAverageHealthScore(parseInt(period));
  const trends = getPerformanceTrends(parseInt(period));

  const handleExport = () => {
    const json = exportSummaries();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hvac-summaries-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all historical summaries? This cannot be undone.')) {
      clearSummaries();
      setSummaries([]);
    }
  };

  const trendIcon = trends.healthTrend === 'improving' ? '📈' :
                    trends.healthTrend === 'declining' ? '📉' : '➡️';

  const trendColor = trends.healthTrend === 'improving' ? 'var(--green)' :
                     trends.healthTrend === 'declining' ? 'var(--red)' : 'var(--yellow)';

  return (
    <div className="historical-view">
      <div className="historical-header">
        <h3 className="font-pixel text-cyan">AI SUMMARY HISTORY</h3>
        <div className="historical-controls">
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
          <button type="button" className="range-button" onClick={handleExport}>
            EXPORT
          </button>
          <button type="button" className="range-button" onClick={handleClear}>
            CLEAR
          </button>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="historical-trend-panel">
        <div className="trend-grid">
          <div className="trend-card">
            <div className="trend-value" style={{ color: getHealthColor(avgHealth) }}>
              {avgHealth}
            </div>
            <div className="trend-label">Avg Health Score</div>
          </div>
          <div className="trend-card">
            <div className="trend-value" style={{ color: trendColor }}>
              {trendIcon} {trends.healthTrend.toUpperCase()}
            </div>
            <div className="trend-label">Health Trend</div>
          </div>
          <div className="trend-card">
            <div className="trend-value">{trends.avgCOP.toFixed(2)}</div>
            <div className="trend-label">Avg COP</div>
          </div>
          <div className="trend-card">
            <div className="trend-value">{summaries.length}</div>
            <div className="trend-label">Days Logged</div>
          </div>
        </div>
      </div>

      {/* Summary List */}
      <div className="historical-list-container">
        <div className="historical-list-title">DAILY SUMMARIES</div>
        {summaries.length === 0 ? (
          <div className="historical-empty">
            No AI summaries recorded yet. Summaries are logged once per day.
          </div>
        ) : (
          <div className="historical-list">
            {summaries.map(summary => (
              <div
                key={summary.id}
                className={`historical-item ${selectedSummary?.id === summary.id ? 'selected' : ''}`}
                onClick={() => setSelectedSummary(selectedSummary?.id === summary.id ? null : summary)}
              >
                <div className="historical-item-header">
                  <span className="historical-date">{formatDate(summary.date)}</span>
                  <span
                    className="historical-score"
                    style={{ color: getHealthColor(summary.healthScore) }}
                  >
                    {summary.healthScore} ({summary.healthGrade})
                  </span>
                  <span className="historical-provider">{summary.provider.toUpperCase()}</span>
                </div>
                {selectedSummary?.id === summary.id && (
                  <div className="historical-item-details">
                    <div className="detail-section">
                      <div className="detail-title">METRICS</div>
                      <div className="detail-metrics">
                        <span>COP: {summary.metrics.avgCOP.toFixed(2)}</span>
                        <span>BTU: {formatNumber(summary.metrics.totalBTU)}</span>
                        <span>kWh: {summary.metrics.totalKWh.toFixed(1)}</span>
                      </div>
                    </div>
                    {summary.insights.length > 0 && (
                      <div className="detail-section">
                        <div className="detail-title">INSIGHTS</div>
                        <ul className="detail-list">
                          {summary.insights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {summary.recommendations.length > 0 && (
                      <div className="detail-section">
                        <div className="detail-title">RECOMMENDATIONS</div>
                        <ul className="detail-list">
                          {summary.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getHealthColor(score: number): string {
  if (score >= 90) return 'var(--green)';
  if (score >= 80) return 'var(--cyan)';
  if (score >= 70) return 'var(--yellow)';
  if (score >= 60) return 'var(--orange, var(--yellow))';
  return 'var(--red)';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

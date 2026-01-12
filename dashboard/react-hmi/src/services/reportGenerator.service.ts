/**
 * Report Generator Service
 * Generates HTML reports for email delivery
 * Includes daily and monthly summaries with efficiency metrics
 */

import { getRecentSummaries, getPerformanceTrends, getAverageHealthScore } from './summaryLog.service';
import { getEmailSettings, markDailyReportSent, markMonthlyReportSent } from './emailSettings.service';
import type { HvacSystemState } from '../types/hvac.types';

export interface ReportData {
  title: string;
  period: 'daily' | 'monthly';
  dateRange: string;
  healthScore: number;
  healthGrade: string;
  metrics: {
    avgCOP: number;
    totalBTU: number;
    totalKWh: number;
    avgRunHours: number;
    healthTrend: 'improving' | 'declining' | 'stable';
  };
  insights: string[];
  recommendations: string[];
  pricePerMMBTU?: number;
  eiaComparisonPrice?: number;
  dailyCosts?: DailyCostEntry[];
}

export interface DailyCostEntry {
  date: string;
  btu: number;
  kwh: number;
  cost: number;
  pricePerMMBTU: number;
}

// CT electricity rate ($/kWh) - could be made configurable
const CT_ELECTRICITY_RATE = 0.25; // Average CT rate ~$0.25/kWh

// EIA data for CT natural gas $/MMBTU (approximate - should be fetched from API)
const EIA_CT_NATURAL_GAS_MMBTU = 18.50; // ~$18.50/MMBTU for CT residential

// Generate a daily report
export function generateDailyReport(state: HvacSystemState): ReportData {
  const summaries = getRecentSummaries(1);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const latestSummary = summaries[0];
  const healthScore = latestSummary?.healthScore || 100;
  const healthGrade = getHealthGrade(healthScore);

  // Calculate price per MMBTU from heat pump
  const totalBTU = state.system.totalBtuToday || 0;
  const totalKWh = state.system.totalKwhToday || 0;
  const electricityCost = totalKWh * CT_ELECTRICITY_RATE;
  const mmbtu = totalBTU / 1000000;
  const pricePerMMBTU = mmbtu > 0 ? electricityCost / mmbtu : 0;

  return {
    title: 'Daily HVAC Performance Report',
    period: 'daily',
    dateRange: today,
    healthScore,
    healthGrade,
    metrics: {
      avgCOP: state.system.liveCop || 0,
      totalBTU,
      totalKWh,
      avgRunHours: 0, // Would need tracking
      healthTrend: 'stable',
    },
    insights: latestSummary?.insights || [],
    recommendations: latestSummary?.recommendations || [],
    pricePerMMBTU: Math.round(pricePerMMBTU * 100) / 100,
    eiaComparisonPrice: EIA_CT_NATURAL_GAS_MMBTU,
  };
}

// Generate a monthly report
export function generateMonthlyReport(): ReportData {
  const summaries = getRecentSummaries(30);
  const trends = getPerformanceTrends(30);
  const avgHealth = getAverageHealthScore(30);
  const healthGrade = getHealthGrade(avgHealth);

  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate daily costs for the month
  const dailyCosts: DailyCostEntry[] = summaries.map(summary => {
    const cost = summary.metrics.totalKWh * CT_ELECTRICITY_RATE;
    const mmbtu = summary.metrics.totalBTU / 1000000;
    const pricePerMMBTU = mmbtu > 0 ? cost / mmbtu : 0;

    return {
      date: summary.date,
      btu: summary.metrics.totalBTU,
      kwh: summary.metrics.totalKWh,
      cost: Math.round(cost * 100) / 100,
      pricePerMMBTU: Math.round(pricePerMMBTU * 100) / 100,
    };
  });

  // Calculate monthly totals
  const totalBTU = dailyCosts.reduce((sum, d) => sum + d.btu, 0);
  const totalKWh = dailyCosts.reduce((sum, d) => sum + d.kwh, 0);
  const totalCost = dailyCosts.reduce((sum, d) => sum + d.cost, 0);
  const mmbtu = totalBTU / 1000000;
  const avgPricePerMMBTU = mmbtu > 0 ? totalCost / mmbtu : 0;

  // Collect all unique insights and recommendations
  const allInsights = [...new Set(summaries.flatMap(s => s.insights))];
  const allRecommendations = [...new Set(summaries.flatMap(s => s.recommendations))];

  return {
    title: 'Monthly HVAC Performance Report',
    period: 'monthly',
    dateRange: monthName,
    healthScore: avgHealth,
    healthGrade,
    metrics: {
      avgCOP: trends.avgCOP,
      totalBTU,
      totalKWh,
      avgRunHours: trends.avgRunHours,
      healthTrend: trends.healthTrend,
    },
    insights: allInsights.slice(0, 10), // Top 10
    recommendations: allRecommendations.slice(0, 5), // Top 5
    pricePerMMBTU: Math.round(avgPricePerMMBTU * 100) / 100,
    eiaComparisonPrice: EIA_CT_NATURAL_GAS_MMBTU,
    dailyCosts,
  };
}

// Generate HTML email content
export function generateReportHTML(report: ReportData): string {
  const savingsPercent = report.eiaComparisonPrice && report.pricePerMMBTU
    ? Math.round(((report.eiaComparisonPrice - report.pricePerMMBTU) / report.eiaComparisonPrice) * 100)
    : 0;

  const savingsMessage = savingsPercent > 0
    ? `You're saving approximately ${savingsPercent}% compared to natural gas!`
    : savingsPercent < 0
    ? `Heat pump is ${Math.abs(savingsPercent)}% more expensive than natural gas at current COP.`
    : '';

  const trendEmoji = report.metrics.healthTrend === 'improving' ? '📈' :
                     report.metrics.healthTrend === 'declining' ? '📉' : '➡️';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; color: #ffffff; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #2a2a2a; border-radius: 12px; padding: 24px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { color: #00ff88; margin: 0 0 8px 0; font-size: 24px; }
    .header .date { color: #888; font-size: 14px; }
    .health-score { text-align: center; margin: 24px 0; }
    .health-circle { display: inline-block; width: 100px; height: 100px; border-radius: 50%; border: 4px solid ${getHealthColor(report.healthScore)}; line-height: 100px; font-size: 36px; font-weight: bold; color: ${getHealthColor(report.healthScore)}; }
    .health-grade { font-size: 18px; color: ${getHealthColor(report.healthScore)}; margin-top: 8px; }
    .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
    .metric { background: #333; padding: 16px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: bold; color: #00d4ff; }
    .metric-label { font-size: 12px; color: #888; margin-top: 4px; }
    .price-comparison { background: #1a3a1a; border: 1px solid #00ff88; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .price-comparison h3 { color: #00ff88; margin: 0 0 12px 0; }
    .price-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .price-label { color: #888; }
    .price-value { font-weight: bold; }
    .savings { color: #00ff88; font-weight: bold; margin-top: 12px; }
    .section { margin: 24px 0; }
    .section h3 { color: #00d4ff; font-size: 16px; margin-bottom: 12px; }
    .section ul { padding-left: 20px; }
    .section li { margin: 8px 0; color: #ccc; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 ${report.title}</h1>
      <div class="date">${report.dateRange}</div>
    </div>

    <div class="health-score">
      <div class="health-circle">${report.healthScore}</div>
      <div class="health-grade">${report.healthGrade} ${trendEmoji}</div>
    </div>

    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${report.metrics.avgCOP.toFixed(2)}</div>
        <div class="metric-label">Average COP</div>
      </div>
      <div class="metric">
        <div class="metric-value">${formatNumber(report.metrics.totalBTU)}</div>
        <div class="metric-label">Total BTU</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.metrics.totalKWh.toFixed(1)}</div>
        <div class="metric-label">Total kWh</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.metrics.avgRunHours.toFixed(1)}h</div>
        <div class="metric-label">Run Hours</div>
      </div>
    </div>

    <div class="price-comparison">
      <h3>💰 Cost Analysis</h3>
      <div class="price-row">
        <span class="price-label">Your Heat Pump ($/MMBTU):</span>
        <span class="price-value">$${report.pricePerMMBTU?.toFixed(2) || 'N/A'}</span>
      </div>
      <div class="price-row">
        <span class="price-label">CT Natural Gas ($/MMBTU):</span>
        <span class="price-value">$${report.eiaComparisonPrice?.toFixed(2) || 'N/A'}</span>
      </div>
      ${savingsMessage ? `<div class="savings">${savingsMessage}</div>` : ''}
    </div>

    ${report.insights.length > 0 ? `
    <div class="section">
      <h3>📊 Insights</h3>
      <ul>
        ${report.insights.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${report.recommendations.length > 0 ? `
    <div class="section">
      <h3>💡 Recommendations</h3>
      <ul>
        ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="footer">
      <p>Generated by Honey Hill HVAC Dashboard</p>
      <p>Powered by Simon Says AI Operations Analyst</p>
    </div>
  </div>
</body>
</html>
`;
}

// Helper to get health grade letter
function getHealthGrade(score: number): string {
  if (score >= 90) return 'A - Excellent';
  if (score >= 80) return 'B - Good';
  if (score >= 70) return 'C - Fair';
  if (score >= 60) return 'D - Poor';
  return 'F - Critical';
}

// Helper to get health color
function getHealthColor(score: number): string {
  if (score >= 90) return '#00ff88';
  if (score >= 80) return '#00d4ff';
  if (score >= 70) return '#ffcc00';
  if (score >= 60) return '#ff9500';
  return '#ff3b30';
}

// Helper to format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

// Check and trigger reports (call this periodically)
export function checkAndSendReports(state: HvacSystemState): void {
  const settings = getEmailSettings();

  if (!settings.enabled || settings.recipients.length === 0) {
    return;
  }

  // Check for daily report
  if (settings.dailyReport) {
    const now = new Date();
    const [hours, minutes] = settings.reportTime.split(':').map(Number);
    const reportTime = new Date();
    reportTime.setHours(hours, minutes, 0, 0);

    // Within 5 minute window of report time
    const diffMs = Math.abs(now.getTime() - reportTime.getTime());
    if (diffMs < 5 * 60 * 1000) {
      const report = generateDailyReport(state);
      const html = generateReportHTML(report);
      // In a real implementation, this would call an email API
      console.log('📧 Daily report ready to send to:', settings.recipients);
      console.log('Report HTML length:', html.length);
      markDailyReportSent();
    }
  }

  // Check for monthly report
  if (settings.monthlyReport) {
    const now = new Date();
    if (now.getDate() === settings.monthlyReportDay) {
      const report = generateMonthlyReport();
      const html = generateReportHTML(report);
      // In a real implementation, this would call an email API
      console.log('📧 Monthly report ready to send to:', settings.recipients);
      console.log('Report HTML length:', html.length);
      markMonthlyReportSent();
    }
  }
}

// Export report as downloadable HTML file
export function downloadReport(report: ReportData): void {
  const html = generateReportHTML(report);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hvac-report-${report.period}-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

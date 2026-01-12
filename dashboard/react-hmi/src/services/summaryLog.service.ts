/**
 * AI Summary Logging Service
 * Stores daily AI analysis summaries to localStorage
 * Runs once per day automatically
 */

import type { AISummaryLog } from '../types/hvac.types';

const STORAGE_KEY = 'hvac-ai-summaries';
const LAST_LOG_KEY = 'hvac-last-summary-date';
const MAX_LOGS = 365; // Keep 1 year of history

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get all stored summaries
export function getSummaries(): AISummaryLog[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse summary logs:', e);
    return [];
  }
}

// Save a new summary log
export function saveSummary(summary: Omit<AISummaryLog, 'id' | 'date' | 'timestamp'>): AISummaryLog {
  const summaries = getSummaries();
  const today = getTodayDate();

  const newSummary: AISummaryLog = {
    id: `summary-${today}-${Date.now()}`,
    date: today,
    timestamp: new Date(),
    ...summary,
  };

  // Remove any existing summary for today (replace it)
  const filtered = summaries.filter(s => s.date !== today);

  // Add new summary at the beginning
  filtered.unshift(newSummary);

  // Trim to max logs
  const trimmed = filtered.slice(0, MAX_LOGS);

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    localStorage.setItem(LAST_LOG_KEY, today);
  } catch (e) {
    console.error('Failed to save summary log:', e);
  }

  return newSummary;
}

// Check if we've already logged today
export function hasLoggedToday(): boolean {
  const lastLog = localStorage.getItem(LAST_LOG_KEY);
  return lastLog === getTodayDate();
}

// Get summaries for a specific period
export function getSummariesByPeriod(period: 'day' | 'week' | 'month' | 'year'): AISummaryLog[] {
  return getSummaries().filter(s => s.period === period);
}

// Get summaries for date range
export function getSummariesByDateRange(startDate: Date, endDate: Date): AISummaryLog[] {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  return getSummaries().filter(s => s.date >= start && s.date <= end);
}

// Get the last N days of summaries
export function getRecentSummaries(days: number = 7): AISummaryLog[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return getSummaries().filter(s => s.date >= cutoffStr);
}

// Calculate average health score over a period
export function getAverageHealthScore(days: number = 30): number {
  const summaries = getRecentSummaries(days);
  if (summaries.length === 0) return 0;

  const total = summaries.reduce((sum, s) => sum + s.healthScore, 0);
  return Math.round(total / summaries.length);
}

// Get performance trends
export function getPerformanceTrends(days: number = 30): {
  avgCOP: number;
  totalBTU: number;
  totalKWh: number;
  avgRunHours: number;
  healthTrend: 'improving' | 'declining' | 'stable';
} {
  const summaries = getRecentSummaries(days);

  if (summaries.length === 0) {
    return {
      avgCOP: 0,
      totalBTU: 0,
      totalKWh: 0,
      avgRunHours: 0,
      healthTrend: 'stable',
    };
  }

  const avgCOP = summaries.reduce((sum, s) => sum + s.metrics.avgCOP, 0) / summaries.length;
  const totalBTU = summaries.reduce((sum, s) => sum + s.metrics.totalBTU, 0);
  const totalKWh = summaries.reduce((sum, s) => sum + s.metrics.totalKWh, 0);
  const avgRunHours = summaries.reduce((sum, s) => sum + s.metrics.runHours, 0) / summaries.length;

  // Calculate health trend
  let healthTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (summaries.length >= 7) {
    const recentAvg = summaries.slice(0, 3).reduce((sum, s) => sum + s.healthScore, 0) / 3;
    const olderAvg = summaries.slice(-3).reduce((sum, s) => sum + s.healthScore, 0) / 3;

    if (recentAvg - olderAvg > 5) {
      healthTrend = 'improving';
    } else if (olderAvg - recentAvg > 5) {
      healthTrend = 'declining';
    }
  }

  return {
    avgCOP: Math.round(avgCOP * 100) / 100,
    totalBTU,
    totalKWh: Math.round(totalKWh * 10) / 10,
    avgRunHours: Math.round(avgRunHours * 10) / 10,
    healthTrend,
  };
}

// Clear all summaries (for testing/reset)
export function clearSummaries(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_LOG_KEY);
}

// Export summaries as JSON for download
export function exportSummaries(): string {
  const summaries = getSummaries();
  return JSON.stringify(summaries, null, 2);
}

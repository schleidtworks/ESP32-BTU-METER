/**
 * AI Operations Analyst Panel
 * AI-powered system analysis and recommendations
 * Supports OpenAI (GPT) and Anthropic (Claude) APIs
 * Logs daily summaries to localStorage
 */

import { useEffect, useState, useCallback } from 'react';
import { useHvac } from '../../context/HvacContext';
import {
  analyzeWithAI,
  generateMockAnalysis,
  type AIAnalysisResult,
  type AnalysisInsight,
  type AIProvider,
} from '../../services/ai.service';
import {
  saveSummary,
  hasLoggedToday,
} from '../../services/summaryLog.service';

type AnalysisPeriod = 'day' | 'week' | 'month' | 'year';

interface AIOperationsAnalystProps {
  apiKey?: string;
  provider?: AIProvider;
}

function InsightCard({ insight }: { insight: AnalysisInsight }) {
  const severityColors: Record<string, string> = {
    info: 'var(--text-dim)',
    warning: 'var(--yellow)',
    success: 'var(--green)',
    error: 'var(--red)',
  };

  const severityLights: Record<string, string> = {
    info: '⚪',
    warning: '🟡',
    success: '🟢',
    error: '🔴',
  };

  const categoryIcons: Record<string, string> = {
    efficiency: 'EFF',
    anomaly: 'ALT',
    recommendation: 'REC',
    trend: 'TRD',
    cost: 'USD',
  };

  return (
    <div className="ai-insight-card" style={{ borderLeftColor: severityColors[insight.severity] }}>
      <div className="ai-insight-header">
        <span className="ai-insight-light">{severityLights[insight.severity] || '⚪'}</span>
        <span className="ai-insight-category" style={{ color: severityColors[insight.severity] }}>
          [{categoryIcons[insight.category] || 'INF'}]
        </span>
        <span className="ai-insight-title">{insight.title}</span>
        {insight.value && (
          <span className="ai-insight-metric">
            {insight.metric}: <strong>{insight.value}</strong>
          </span>
        )}
      </div>
      <div className="ai-insight-message">{insight.message}</div>
    </div>
  );
}

// Calculate system health score based on insights
function calculateHealthScore(insights: AnalysisInsight[]): number {
  if (insights.length === 0) return 100;

  let score = 100;
  for (const insight of insights) {
    if (insight.severity === 'error') score -= 20;
    else if (insight.severity === 'warning') score -= 10;
    else if (insight.severity === 'success') score += 5;
  }
  return Math.max(0, Math.min(100, score));
}

// Get health grade based on score
function getHealthGrade(score: number): { grade: string; color: string; emoji: string } {
  if (score >= 90) return { grade: 'A', color: 'var(--green)', emoji: '💚' };
  if (score >= 80) return { grade: 'B', color: 'var(--green)', emoji: '💙' };
  if (score >= 70) return { grade: 'C', color: 'var(--yellow)', emoji: '💛' };
  if (score >= 60) return { grade: 'D', color: 'var(--orange, var(--yellow))', emoji: '🧡' };
  return { grade: 'F', color: 'var(--red)', emoji: '❤️' };
}

export function AIOperationsAnalyst({ apiKey, provider = 'anthropic' }: AIOperationsAnalystProps) {
  const { state } = useHvac();
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalysisPeriod>('day');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(provider);
  // Calculate health score from insights
  const healthScore = analysis ? calculateHealthScore(analysis.insights) : 100;
  const healthGrade = getHealthGrade(healthScore);

  // Map AI provider to log provider type
  const mapProviderForLog = (aiProvider: AIProvider | 'mock' | undefined): 'claude' | 'gpt' | 'demo' => {
    if (aiProvider === 'anthropic') return 'claude';
    if (aiProvider === 'openai') return 'gpt';
    return 'demo';
  };

  // Log daily summary to localStorage
  const logDailySummary = useCallback((result: AIAnalysisResult, score: number, grade: string) => {
    // Only log once per day for the 'day' period
    if (period !== 'day' || hasLoggedToday()) return;

    saveSummary({
      period: 'day',
      healthScore: score,
      healthGrade: grade,
      insights: result.insights.map(i => i.message),
      recommendations: result.recommendations,
      metrics: {
        avgCOP: state.system.liveCop || 0,
        totalBTU: state.system.totalBtu || 0,
        totalKWh: state.system.totalKwhToday || 0,
        runHours: 0, // Would need to track this
        avgOutdoorTemp: state.weather.temp || 0,
      },
      provider: mapProviderForLog(result.provider),
    });

    console.log('📝 Daily AI summary logged to database');
  }, [period, state]);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result: AIAnalysisResult;

      if (apiKey) {
        // Use real AI API
        result = await analyzeWithAI(state, apiKey, selectedProvider, period);
      } else {
        // Use mock analysis for demo mode
        result = generateMockAnalysis(state, period);
      }

      setAnalysis(result);

      // Log daily summary after analysis
      const score = calculateHealthScore(result.insights);
      const grade = getHealthGrade(score).grade;
      logDailySummary(result, score, grade);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      // Fall back to mock analysis on error
      setAnalysis(generateMockAnalysis(state, period));
    } finally {
      setLoading(false);
    }
  }, [state, apiKey, selectedProvider, period, logDailySummary]);

  // Run analysis on mount and when period changes
  useEffect(() => {
    runAnalysis();
  }, [period, selectedProvider, runAnalysis]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      runAnalysis();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, runAnalysis]);

  const providerLabel = analysis?.provider === 'anthropic' ? 'CLAUDE' :
                        analysis?.provider === 'openai' ? 'GPT' : 'DEMO';

  return (
    <div className="ai-analyst-panel">
      <div className="ai-analyst-header">
        <div className="ai-analyst-title">
          <span className="ai-icon">🤖⚙️🏠</span>
          <span>SIMON SAYS</span>
          <span className={`ai-provider-badge ${analysis?.provider || 'mock'}`}>
            {providerLabel}
          </span>
        </div>
        <div className="ai-analyst-controls">
          {apiKey && (
            <div className="ai-provider-toggle">
              <button
                type="button"
                className={`provider-button ${selectedProvider === 'anthropic' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('anthropic')}
                title="Use Claude (Anthropic)"
              >
                CLAUDE
              </button>
              <button
                type="button"
                className={`provider-button ${selectedProvider === 'openai' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('openai')}
                title="Use GPT (OpenAI)"
              >
                GPT
              </button>
            </div>
          )}
          <div className="range-toggle">
            {(['day', 'week', 'month', 'year'] as AnalysisPeriod[]).map(p => (
              <button
                key={p}
                type="button"
                className={`range-button ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="range-button"
            onClick={runAnalysis}
            disabled={loading}
          >
            {loading ? 'ANALYZING...' : 'REFRESH'}
          </button>
          <button
            type="button"
            className={`range-button ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Auto-refresh every 5 minutes"
          >
            AUTO
          </button>
        </div>
      </div>

      {error && (
        <div className="ai-error">
          Analysis Error: {error} (Using fallback analysis)
        </div>
      )}

      {loading && !analysis && (
        <div className="ai-loading">
          <div className="ai-loading-spinner" />
          <span>Running AI analysis with {selectedProvider === 'anthropic' ? 'Claude' : 'GPT'}...</span>
        </div>
      )}

      {analysis && (
        <div className="ai-analyst-content">
          {/* Health Score Display */}
          <div className="ai-health-score">
            <div className="health-score-circle" style={{ borderColor: healthGrade.color }}>
              <span className="health-score-value" style={{ color: healthGrade.color }}>{healthScore}</span>
              <span className="health-score-grade">{healthGrade.emoji} {healthGrade.grade}</span>
            </div>
            <div className="health-score-label">
              SYSTEM HEALTH
            </div>
          </div>

          <div className="ai-summary">
            <div className="ai-summary-header">SYSTEM SUMMARY</div>
            <div className="ai-summary-text">{analysis.summary}</div>
            <div className="ai-summary-timestamp">
              Last updated: {analysis.timestamp.toLocaleTimeString()} |
              Period: {analysis.period.toUpperCase()} |
              Provider: {providerLabel}
            </div>
          </div>

          <div className="ai-insights">
            <div className="ai-section-title">INSIGHTS</div>
            {analysis.insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>

          {analysis.recommendations.length > 0 && (
            <div className="ai-recommendations">
              <div className="ai-section-title">RECOMMENDATIONS</div>
              <ul className="ai-recommendations-list">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

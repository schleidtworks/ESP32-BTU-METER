/**
 * OpenAI Integration Service
 * Provides AI-powered analysis of HVAC system performance
 */

import type { HvacSystemState } from '../types/hvac.types';

export interface AnalysisInsight {
  category: 'efficiency' | 'anomaly' | 'recommendation' | 'trend' | 'cost';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  metric?: string;
  value?: string;
}

export interface AIAnalysisResult {
  summary: string;
  insights: AnalysisInsight[];
  recommendations: string[];
  timestamp: Date;
  period: 'day' | 'week' | 'month' | 'year';
}

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Prepare system data for AI analysis
 */
function prepareSystemContext(state: HvacSystemState, period: 'day' | 'week' | 'month' | 'year'): string {
  const {
    system,
    heatPump,
    buffer,
    ahus,
    snowMelt,
    alerts,
    weather,
  } = state;

  return `
HVAC System Performance Report - ${period.toUpperCase()} Analysis

SYSTEM OVERVIEW:
- Location: ${system.location}
- Current Mode: ${heatPump.mode}
- Heat Pump Status: ${heatPump.running ? 'Running' : 'Standby'}

PERFORMANCE METRICS:
- Live COP: ${system.liveCop?.toFixed(2) ?? 'N/A'}
- Daily COP Average: ${system.dailyCop?.toFixed(2) ?? 'N/A'}
- Yearly COP Average: ${system.yearlyCopAvg}
- Total BTU Output: ${system.totalBtu.toLocaleString()} BTU/hr
- Total Power Consumption: ${system.totalPowerKw?.toFixed(2) ?? 'N/A'} kW
- Today's Energy Usage: ${system.totalKwhToday?.toFixed(1) ?? 'N/A'} kWh

HEAT PUMP:
- Supply Temperature: ${heatPump.supplyTemp?.toFixed(1) ?? 'N/A'}F
- Return Temperature: ${heatPump.returnTemp?.toFixed(1) ?? 'N/A'}F
- Delta T: ${heatPump.deltaT?.toFixed(1) ?? 'N/A'}F
- Power Draw: ${heatPump.powerKw?.toFixed(2) ?? 'N/A'} kW

BUFFER TANK:
- Temperature: ${buffer.temp?.toFixed(1) ?? 'N/A'}F
- Pressure: ${buffer.pressure?.toFixed(1) ?? 'N/A'} PSI

AIR HANDLERS:
${Object.values(ahus).map(ahu => `- ${ahu.name}: ${ahu.pumpOn ? 'Running' : 'Off'}, BTU: ${ahu.btu?.toLocaleString() ?? 0}, Flow: ${ahu.gpm.toFixed(1)} GPM`).join('\n')}

SNOW MELT:
- Status: ${snowMelt.hbxMode ?? 'Off'}
- Loop Temp: ${snowMelt.loopTemp?.toFixed(1) ?? 'N/A'}F
- BTU Output: ${snowMelt.btu?.toLocaleString() ?? 0} BTU/hr

WEATHER:
- Outdoor Temperature: ${weather.temp?.toFixed(1) ?? 'N/A'}F
- Condition: ${weather.condition}
- Humidity: ${weather.humidity ?? 'N/A'}%

ACTIVE ALERTS (${alerts.length}):
${alerts.map(a => `- [${a.level.toUpperCase()}] ${a.message}`).join('\n') || '- No active alerts'}

TOTAL FLOW: ${system.totalGpm.toFixed(1)} GPM
`;
}

/**
 * Call OpenAI API for analysis
 */
export async function analyzeWithOpenAI(
  state: HvacSystemState,
  apiKey: string,
  period: 'day' | 'week' | 'month' | 'year' = 'day'
): Promise<AIAnalysisResult> {
  const systemContext = prepareSystemContext(state, period);

  const prompt = `You are an HVAC efficiency expert analyzing an air-to-water heat pump system. Based on the following system data, provide:

1. A brief 2-3 sentence summary of overall system health and performance
2. 3-5 specific insights about efficiency, anomalies, or notable patterns
3. 2-3 actionable recommendations for improvement

Format your response as JSON with this structure:
{
  "summary": "Overall system health summary...",
  "insights": [
    {
      "category": "efficiency|anomaly|recommendation|trend|cost",
      "title": "Short title",
      "message": "Detailed insight message",
      "severity": "info|warning|success|error",
      "metric": "optional metric name",
      "value": "optional metric value"
    }
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}

${systemContext}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HVAC analyst specializing in heat pump efficiency and building automation systems. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || 'Analysis complete.',
      insights: parsed.insights || [],
      recommendations: parsed.recommendations || [],
      timestamp: new Date(),
      period,
    };
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    throw error;
  }
}

/**
 * Generate mock analysis for demo mode (no API key required)
 */
export function generateMockAnalysis(
  state: HvacSystemState,
  period: 'day' | 'week' | 'month' | 'year' = 'day'
): AIAnalysisResult {
  const { system, heatPump, buffer, alerts } = state;
  const cop = system.liveCop ?? 3.0;
  const isEfficient = cop >= 3.0;
  const pressureOk = (buffer.pressure ?? 15) >= 10 && (buffer.pressure ?? 15) <= 25;

  const insights: AnalysisInsight[] = [];

  // COP insight
  insights.push({
    category: 'efficiency',
    title: isEfficient ? 'Excellent COP' : 'COP Below Target',
    message: isEfficient
      ? `System COP of ${cop.toFixed(2)} exceeds the 3.0 target, indicating efficient heat pump operation.`
      : `System COP of ${cop.toFixed(2)} is below the 3.0 target. Consider checking refrigerant levels or outdoor coil cleanliness.`,
    severity: isEfficient ? 'success' : 'warning',
    metric: 'COP',
    value: cop.toFixed(2),
  });

  // Pressure insight
  insights.push({
    category: pressureOk ? 'efficiency' : 'anomaly',
    title: pressureOk ? 'Loop Pressure Normal' : 'Pressure Concern',
    message: pressureOk
      ? `Loop pressure at ${buffer.pressure?.toFixed(1)} PSI is within the optimal 10-25 PSI range.`
      : `Loop pressure at ${buffer.pressure?.toFixed(1)} PSI is outside the optimal range. Check for leaks or expansion tank issues.`,
    severity: pressureOk ? 'info' : 'warning',
    metric: 'Pressure',
    value: `${buffer.pressure?.toFixed(1)} PSI`,
  });

  // Heat pump insight
  insights.push({
    category: 'trend',
    title: 'Heat Pump Performance',
    message: heatPump.running
      ? `Heat pump is actively ${heatPump.mode} with a ${heatPump.deltaT?.toFixed(1)}F delta-T across the system.`
      : 'Heat pump is in standby mode. System is maintaining setpoint without active heating.',
    severity: 'info',
    metric: 'Delta-T',
    value: `${heatPump.deltaT?.toFixed(1)}F`,
  });

  // Energy cost insight
  const dailyCost = (system.totalKwhToday ?? 0) * 0.25;
  insights.push({
    category: 'cost',
    title: 'Energy Costs',
    message: `Today's estimated energy cost is $${dailyCost.toFixed(2)} based on ${system.totalKwhToday?.toFixed(1) ?? 0} kWh at $0.25/kWh.`,
    severity: 'info',
    metric: 'Daily Cost',
    value: `$${dailyCost.toFixed(2)}`,
  });

  // Alert insight if any
  if (alerts.length > 1) {
    const warningCount = alerts.filter(a => a.level === 'warning').length;
    const errorCount = alerts.filter(a => a.level === 'error').length;
    insights.push({
      category: 'anomaly',
      title: 'Active Alerts',
      message: `System has ${warningCount} warnings and ${errorCount} errors that may require attention.`,
      severity: errorCount > 0 ? 'error' : 'warning',
    });
  }

  const recommendations: string[] = [];

  if (!isEfficient) {
    recommendations.push('Schedule a heat pump tune-up to improve COP - check refrigerant charge and coil cleanliness');
  }

  if (!pressureOk) {
    recommendations.push('Inspect the expansion tank and check for system leaks to restore optimal pressure');
  }

  recommendations.push('Consider scheduling AHU filter replacements to maintain airflow efficiency');

  if (period === 'month' || period === 'year') {
    recommendations.push('Review time-of-use rates with your utility - shifting heating to off-peak hours could reduce costs');
  }

  const summary = isEfficient && pressureOk
    ? `System is operating efficiently with a COP of ${cop.toFixed(2)}. All critical parameters are within normal ranges. Energy consumption is tracking as expected for current weather conditions.`
    : `System performance requires attention. ${!isEfficient ? 'COP is below target efficiency. ' : ''}${!pressureOk ? 'Loop pressure is outside normal range. ' : ''}Review the recommendations below for optimization steps.`;

  return {
    summary,
    insights,
    recommendations,
    timestamp: new Date(),
    period,
  };
}

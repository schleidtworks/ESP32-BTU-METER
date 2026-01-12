/**
 * AI Integration Service
 * Provides AI-powered analysis of HVAC system performance
 * Supports both OpenAI (GPT) and Anthropic (Claude) APIs
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
  provider: 'openai' | 'anthropic' | 'mock';
}

export type AIProvider = 'openai' | 'anthropic';

// API endpoints
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

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

const SYSTEM_PROMPT = 'You are an expert HVAC analyst specializing in heat pump efficiency and building automation systems. Provide concise, actionable insights in JSON format.';

const USER_PROMPT_TEMPLATE = (context: string) => `You are an HVAC efficiency expert analyzing an air-to-water heat pump system. Based on the following system data, provide:

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

${context}`;

/**
 * Call OpenAI API for analysis
 */
async function analyzeWithOpenAI(
  systemContext: string,
  apiKey: string,
): Promise<{ summary: string; insights: AnalysisInsight[]; recommendations: string[] }> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT_TEMPLATE(systemContext) }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  return JSON.parse(content);
}

/**
 * Call Anthropic Claude API for analysis
 */
async function analyzeWithClaude(
  systemContext: string,
  apiKey: string,
): Promise<{ summary: string; insights: AnalysisInsight[]; recommendations: string[] }> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: USER_PROMPT_TEMPLATE(systemContext) }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('No content in Claude response');
  }

  // Claude might return markdown code blocks, extract JSON
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

  return JSON.parse(jsonStr);
}

/**
 * Main analysis function - supports both OpenAI and Claude
 */
export async function analyzeWithAI(
  state: HvacSystemState,
  apiKey: string,
  provider: AIProvider,
  period: 'day' | 'week' | 'month' | 'year' = 'day'
): Promise<AIAnalysisResult> {
  const systemContext = prepareSystemContext(state, period);

  try {
    let parsed: { summary: string; insights: AnalysisInsight[]; recommendations: string[] };

    if (provider === 'anthropic') {
      parsed = await analyzeWithClaude(systemContext, apiKey);
    } else {
      parsed = await analyzeWithOpenAI(systemContext, apiKey);
    }

    return {
      summary: parsed.summary || 'Analysis complete.',
      insights: parsed.insights || [],
      recommendations: parsed.recommendations || [],
      timestamp: new Date(),
      period,
      provider,
    };
  } catch (error) {
    console.error(`${provider} analysis failed:`, error);
    throw error;
  }
}

/**
 * Generate mock analysis for demo mode (no API key required)
 * Provides different analysis content based on the selected time period
 */
export function generateMockAnalysis(
  state: HvacSystemState,
  period: 'day' | 'week' | 'month' | 'year' = 'day'
): AIAnalysisResult {
  const { system, heatPump, buffer, alerts, weather } = state;
  const cop = system.liveCop ?? 3.0;
  const isEfficient = cop >= 3.0;
  const pressureOk = (buffer.pressure ?? 15) >= 10 && (buffer.pressure ?? 15) <= 25;
  const dailyCost = (system.totalKwhToday ?? 0) * 0.25;

  // Period-specific multipliers for simulated historical data
  const periodMultipliers = {
    day: { energy: 1, cost: 1, label: 'today' },
    week: { energy: 7, cost: 7, label: 'this week' },
    month: { energy: 30, cost: 30, label: 'this month' },
    year: { energy: 365, cost: 365, label: 'this year' },
  };

  const mult = periodMultipliers[period];
  const periodEnergy = (system.totalKwhToday ?? 20) * mult.energy;
  const periodCost = dailyCost * mult.cost;

  // Generate period-specific insights
  const insights: AnalysisInsight[] = [];

  switch (period) {
    case 'day':
      // Daily analysis focuses on real-time performance
      insights.push({
        category: 'efficiency',
        title: isEfficient ? 'Excellent COP Today' : 'COP Below Target',
        message: isEfficient
          ? `Current COP of ${cop.toFixed(2)} exceeds the 3.0 target. Heat pump is performing optimally for today's ${weather.temp?.toFixed(0) ?? '--'}°F outdoor conditions.`
          : `Current COP of ${cop.toFixed(2)} is below target. Cold outdoor temps (${weather.temp?.toFixed(0) ?? '--'}°F) may be impacting efficiency.`,
        severity: isEfficient ? 'success' : 'warning',
        metric: 'Live COP',
        value: cop.toFixed(2),
      });

      insights.push({
        category: 'trend',
        title: 'Heat Pump Status',
        message: heatPump.running
          ? `Heat pump is actively ${heatPump.mode} with ${heatPump.deltaT?.toFixed(1)}°F delta-T. Supply: ${heatPump.supplyTemp?.toFixed(0)}°F, Return: ${heatPump.returnTemp?.toFixed(0)}°F.`
          : 'Heat pump is in standby. Buffer tank temperature is maintaining setpoint without active operation.',
        severity: 'info',
        metric: 'Mode',
        value: heatPump.running ? heatPump.mode.toUpperCase() : 'STANDBY',
      });

      insights.push({
        category: 'cost',
        title: "Today's Energy Usage",
        message: `Consumed ${system.totalKwhToday?.toFixed(1) ?? 0} kWh so far today, estimated cost $${dailyCost.toFixed(2)} at $0.25/kWh average rate.`,
        severity: dailyCost > 15 ? 'warning' : 'info',
        metric: 'Cost Today',
        value: `$${dailyCost.toFixed(2)}`,
      });
      break;

    case 'week':
      // Weekly analysis focuses on patterns and trends
      const avgCopWeek = (cop * 0.95 + Math.random() * 0.2).toFixed(2);
      insights.push({
        category: 'trend',
        title: 'Weekly COP Trend',
        message: `Average COP this week: ${avgCopWeek}. Performance has been ${Number(avgCopWeek) >= 3.0 ? 'consistent with target efficiency' : 'slightly below optimal'}. Peak efficiency occurred during milder afternoon temperatures.`,
        severity: Number(avgCopWeek) >= 3.0 ? 'success' : 'info',
        metric: 'Avg COP',
        value: avgCopWeek,
      });

      insights.push({
        category: 'cost',
        title: 'Weekly Energy Summary',
        message: `Total consumption: ${periodEnergy.toFixed(0)} kWh. Estimated cost: $${periodCost.toFixed(2)}. ${periodCost > 100 ? 'Higher than typical due to cold snap.' : 'Within normal range for this time of year.'}`,
        severity: periodCost > 100 ? 'warning' : 'info',
        metric: 'Weekly Cost',
        value: `$${periodCost.toFixed(2)}`,
      });

      insights.push({
        category: 'efficiency',
        title: 'Run Time Analysis',
        message: `Heat pump operated approximately ${Math.floor(40 + Math.random() * 30)} hours this week. Defrost cycles averaged ${Math.floor(2 + Math.random() * 3)} per day during coldest periods.`,
        severity: 'info',
        metric: 'Run Hours',
        value: `${Math.floor(40 + Math.random() * 30)}h`,
      });

      insights.push({
        category: 'anomaly',
        title: 'Pattern Detection',
        message: alerts.length > 1
          ? `Detected ${alerts.length} alert events this week. Most occurred during early morning hours when outdoor temps were lowest.`
          : 'No unusual patterns detected. System operation has been stable throughout the week.',
        severity: alerts.length > 2 ? 'warning' : 'success',
      });
      break;

    case 'month':
      // Monthly analysis focuses on efficiency trends and comparisons
      const avgCopMonth = (cop * 0.92 + Math.random() * 0.15).toFixed(2);
      const heatDegDays = Math.floor(400 + Math.random() * 200);

      insights.push({
        category: 'efficiency',
        title: 'Monthly Efficiency Report',
        message: `Monthly average COP: ${avgCopMonth}. System delivered approximately ${(periodEnergy * cop).toFixed(0)} kWh equivalent of heating from ${periodEnergy.toFixed(0)} kWh of electricity consumed.`,
        severity: Number(avgCopMonth) >= 2.8 ? 'success' : 'warning',
        metric: 'Monthly COP',
        value: avgCopMonth,
      });

      insights.push({
        category: 'trend',
        title: 'Heating Degree Days',
        message: `This month had ${heatDegDays} heating degree days (base 65°F). Energy usage correlates well with weather data, indicating proper system sizing.`,
        severity: 'info',
        metric: 'HDD',
        value: heatDegDays.toString(),
      });

      insights.push({
        category: 'cost',
        title: 'Monthly Cost Analysis',
        message: `Total energy cost: $${periodCost.toFixed(2)}. Cost per heating degree day: $${(periodCost / heatDegDays).toFixed(3)}. ${periodCost > 300 ? 'Consider time-of-use optimization.' : 'Costs are tracking within budget.'}`,
        severity: periodCost > 300 ? 'warning' : 'success',
        metric: 'Monthly Cost',
        value: `$${periodCost.toFixed(2)}`,
      });

      insights.push({
        category: 'recommendation',
        title: 'Maintenance Due',
        message: 'Monthly filter inspection recommended. Air handler filters should be checked and replaced if dirty to maintain optimal airflow and efficiency.',
        severity: 'info',
      });
      break;

    case 'year':
      // Yearly analysis focuses on seasonal patterns and long-term performance
      const avgCopYear = system.yearlyCopAvg ?? 3.2;
      const totalYearCost = periodCost;
      const monthlyAvg = totalYearCost / 12;

      insights.push({
        category: 'efficiency',
        title: 'Annual COP Performance',
        message: `Yearly average COP: ${avgCopYear.toFixed(2)}. Best performance in spring/fall (COP 3.5+), lower in extreme cold (COP 2.5-2.8). Overall efficiency exceeds air-source industry average.`,
        severity: avgCopYear >= 3.0 ? 'success' : 'info',
        metric: 'Annual COP',
        value: avgCopYear.toFixed(2),
      });

      insights.push({
        category: 'cost',
        title: 'Annual Energy Costs',
        message: `Estimated annual cost: $${totalYearCost.toFixed(2)} ($${monthlyAvg.toFixed(2)}/month average). Peak months: December-February. Lowest costs: September-October.`,
        severity: 'info',
        metric: 'Annual Cost',
        value: `$${totalYearCost.toFixed(2)}`,
      });

      insights.push({
        category: 'trend',
        title: 'Seasonal Efficiency Trends',
        message: `Heating season (Oct-Apr) averaged ${(avgCopYear * 0.9).toFixed(2)} COP. Shoulder seasons achieved ${(avgCopYear * 1.1).toFixed(2)} COP. System adapts well to temperature variations.`,
        severity: 'success',
        metric: 'Seasonal Range',
        value: `${(avgCopYear * 0.9).toFixed(1)}-${(avgCopYear * 1.1).toFixed(1)}`,
      });

      insights.push({
        category: 'recommendation',
        title: 'Annual Maintenance Summary',
        message: 'Completed: 2 filter changes, 1 professional tune-up. Upcoming: Schedule pre-season inspection before next heating season. Consider refrigerant check if COP declines.',
        severity: 'info',
      });

      insights.push({
        category: 'cost',
        title: 'Savings vs. Alternatives',
        message: `Estimated savings vs. electric resistance: $${(totalYearCost * (avgCopYear - 1)).toFixed(2)}/year. Heat pump delivered ${avgCopYear.toFixed(1)}x the heating for same electricity cost.`,
        severity: 'success',
        metric: 'Annual Savings',
        value: `$${(totalYearCost * (avgCopYear - 1)).toFixed(2)}`,
      });
      break;
  }

  // Add pressure insight for all periods
  if (!pressureOk) {
    insights.push({
      category: 'anomaly',
      title: 'Pressure Alert',
      message: `Loop pressure at ${buffer.pressure?.toFixed(1)} PSI is outside the optimal 10-25 PSI range. This may indicate a leak or expansion tank issue requiring attention.`,
      severity: 'error',
      metric: 'Pressure',
      value: `${buffer.pressure?.toFixed(1)} PSI`,
    });
  }

  // Generate period-specific recommendations
  const recommendations: string[] = [];

  switch (period) {
    case 'day':
      if (!isEfficient) {
        recommendations.push('Monitor COP throughout the day - if it stays below 3.0, schedule a system check');
      }
      recommendations.push('Check that all zone thermostats are set appropriately for occupied hours');
      if (weather.temp !== null && weather.temp < 20) {
        recommendations.push('Extreme cold detected - consider raising buffer tank setpoint by 5°F for faster recovery');
      }
      break;

    case 'week':
      recommendations.push('Review the weekly run pattern - consider programmable setbacks during unoccupied hours');
      if (periodCost > 100) {
        recommendations.push('High weekly costs detected - check for zones calling for heat unnecessarily');
      }
      recommendations.push('Verify outdoor unit is clear of snow/ice accumulation from this week');
      break;

    case 'month':
      recommendations.push('Schedule monthly filter inspection for all air handlers');
      recommendations.push('Review utility time-of-use rates - pre-heating during off-peak hours may reduce costs');
      if (!isEfficient) {
        recommendations.push('Monthly COP trending low - schedule professional maintenance before peak heating season');
      }
      recommendations.push('Check glycol concentration in hydronic loops before extreme cold weather');
      break;

    case 'year':
      recommendations.push('Schedule annual professional heat pump maintenance including refrigerant check');
      recommendations.push('Review annual energy data with utility - you may qualify for heat pump rebates or incentives');
      recommendations.push('Consider smart thermostat upgrade for improved scheduling and weather-responsive control');
      recommendations.push('Plan for future: evaluate adding solar PV to offset heat pump electricity consumption');
      break;
  }

  if (!pressureOk) {
    recommendations.unshift('PRIORITY: Investigate loop pressure issue - check expansion tank and inspect for leaks');
  }

  // Generate period-specific summary
  const summaries = {
    day: isEfficient && pressureOk
      ? `Simon says: System is running great today! COP of ${cop.toFixed(2)} means you're getting ${cop.toFixed(1)}x the heating for your electricity. Current conditions are optimal with ${weather.temp?.toFixed(0) ?? '--'}°F outside.`
      : `Simon says: Needs attention today. ${!isEfficient ? `COP at ${cop.toFixed(2)} is below the 3.0 target. ` : ''}${!pressureOk ? 'Loop pressure is abnormal. ' : ''}Check the recommendations below.`,

    week: `Simon says: Weekly review complete. System averaged ${(cop * 0.95).toFixed(2)} COP over 7 days, consuming approximately ${periodEnergy.toFixed(0)} kWh ($${periodCost.toFixed(2)}). ${alerts.length > 2 ? 'Some alerts occurred this week - review patterns.' : 'Operation has been stable with no major issues.'}`,

    month: `Simon says: Monthly performance summary ready. Your heat pump delivered efficient heating with an average COP of ${(cop * 0.92).toFixed(2)}. Total cost: $${periodCost.toFixed(2)} for ${periodEnergy.toFixed(0)} kWh. ${periodCost > 300 ? 'Costs are elevated - review optimization tips.' : 'Costs are tracking within normal range.'}`,

    year: `Simon says: Annual report card is in! Yearly COP averaged ${(system.yearlyCopAvg ?? 3.2).toFixed(2)}, making this heat pump ${((system.yearlyCopAvg ?? 3.2) * 100 / 3.0).toFixed(0)}% as efficient as target. Estimated annual cost: $${periodCost.toFixed(2)}. Great job maintaining the system!`,
  };

  return {
    summary: summaries[period],
    insights,
    recommendations,
    timestamp: new Date(),
    period,
    provider: 'mock',
  };
}

/**
 * System Settings View
 * Configuration and ESP32 GPIO mapping display
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection, StatCard } from '../common';
import { ESP32PinMap } from './ESP32PinMap';
import { REFRESH_RATES, BTU_FACTOR, BTU_PER_KW, DEFAULT_THRESHOLDS, LOCATION } from '../../config/system.config';
import {
  getEmailSettings,
  saveEmailSettings,
  addRecipient,
  removeRecipient,
  isValidEmail,
  type EmailSettings,
} from '../../services/emailSettings.service';

interface SensorConfig {
  id: string;
  name: string;
  type: string;
  address?: string;
  gpio?: number;
  calibration?: string;
}

const TEMPERATURE_SENSORS: SensorConfig[] = [
  { id: 'ds18b20-1', name: 'HP Supply', type: 'DS18B20', address: '28-0000xxxxx01', gpio: 4 },
  { id: 'ds18b20-2', name: 'HP Return', type: 'DS18B20', address: '28-0000xxxxx02', gpio: 4 },
  { id: 'ds18b20-3', name: 'AHU1 Supply', type: 'DS18B20', address: '28-0000xxxxx03', gpio: 4 },
  { id: 'ds18b20-4', name: 'AHU1 Return', type: 'DS18B20', address: '28-0000xxxxx04', gpio: 4 },
  { id: 'ds18b20-5', name: 'AHU2 Supply', type: 'DS18B20', address: '28-0000xxxxx05', gpio: 4 },
  { id: 'ds18b20-6', name: 'AHU2 Return', type: 'DS18B20', address: '28-0000xxxxx06', gpio: 4 },
  { id: 'ds18b20-7', name: 'AHU3 Supply', type: 'DS18B20', address: '28-0000xxxxx07', gpio: 4 },
  { id: 'ds18b20-8', name: 'AHU3 Return', type: 'DS18B20', address: '28-0000xxxxx08', gpio: 4 },
  { id: 'ds18b20-9', name: 'Buffer Tank', type: 'DS18B20', address: '28-0000xxxxx09', gpio: 4 },
  { id: 'ds18b20-10', name: 'Snow Loop', type: 'DS18B20', address: '28-0000xxxxx10', gpio: 4 },
];

const FLOW_METERS: SensorConfig[] = [
  { id: 'flow-ahu1', name: 'AHU1 Flow', type: 'GREDIA Hall Effect', gpio: 15, calibration: '450 pulses/gal' },
  { id: 'flow-ahu2', name: 'AHU2 Flow', type: 'GREDIA Hall Effect', gpio: 16, calibration: '450 pulses/gal' },
  { id: 'flow-ahu3', name: 'AHU3 Flow', type: 'GREDIA Hall Effect', gpio: 17, calibration: '450 pulses/gal' },
  { id: 'flow-snow', name: 'Snow Melt Flow', type: 'GREDIA Hall Effect', gpio: 5, calibration: '450 pulses/gal' },
  { id: 'flow-hp', name: 'Heat Pump Flow', type: 'GREDIA Hall Effect', gpio: 18, calibration: '450 pulses/gal' },
];

const OUTPUTS: SensorConfig[] = [
  { id: 'relay-1', name: 'Pump 1 Relay', type: 'Solid State Relay', gpio: 19 },
  { id: 'relay-2', name: 'Pump 2 Relay', type: 'Solid State Relay', gpio: 23 },
  { id: 'relay-3', name: 'Pump 3 Relay', type: 'Solid State Relay', gpio: 27 },
  { id: 'relay-4', name: 'Pump 4 Relay', type: 'Solid State Relay', gpio: 26 },
  { id: 'valve', name: '3-Way Valve', type: 'Motorized Valve', gpio: 25 },
  { id: 'led-status', name: 'Status LED', type: 'LED', gpio: 14 },
];

function SensorTable({ sensors, title }: { sensors: SensorConfig[]; title: string }) {
  return (
    <div className="settings-table-container">
      <div className="settings-table-title">{title}</div>
      <table className="settings-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>GPIO</th>
            {sensors[0]?.address && <th>Address</th>}
            {sensors[0]?.calibration && <th>Calibration</th>}
          </tr>
        </thead>
        <tbody>
          {sensors.map(sensor => (
            <tr key={sensor.id}>
              <td>{sensor.name}</td>
              <td>{sensor.type}</td>
              <td className="gpio-cell">GPIO{sensor.gpio}</td>
              {sensor.address !== undefined && <td className="address-cell">{sensor.address}</td>}
              {sensor.calibration !== undefined && <td>{sensor.calibration}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SystemSettingsView() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(getEmailSettings());
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Load email settings on mount
  useEffect(() => {
    setEmailSettings(getEmailSettings());
  }, []);

  const handleEmailSettingChange = (key: keyof EmailSettings, value: boolean | string | number) => {
    const updated = saveEmailSettings({ [key]: value });
    setEmailSettings(updated);
  };

  const handleAddEmail = () => {
    setEmailError('');
    if (!newEmail.trim()) return;

    if (!isValidEmail(newEmail)) {
      setEmailError('Invalid email format');
      return;
    }

    try {
      const updated = addRecipient(newEmail);
      setEmailSettings(updated);
      setNewEmail('');
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : 'Failed to add email');
    }
  };

  const handleRemoveEmail = (email: string) => {
    const updated = removeRecipient(email);
    setEmailSettings(updated);
  };

  return (
    <div className="settings-view">
      <h2 className="font-pixel text-green glow-green" style={{ marginBottom: '16px' }}>
        System Settings
      </h2>
      <p className="text-dim" style={{ marginBottom: '24px' }}>
        Hardware configuration, GPIO mapping, and system parameters
      </p>

      <CollapsibleSection title="ESP32 GPIO PIN MAP" defaultOpen>
        <ESP32PinMap />
      </CollapsibleSection>

      <CollapsibleSection title="TEMPERATURE SENSORS (DS18B20)" defaultOpen={false}>
        <SensorTable sensors={TEMPERATURE_SENSORS} title="OneWire Temperature Sensors" />
        <div className="settings-note">
          All temperature sensors share GPIO4 (OneWire bus). Each sensor has unique ROM address.
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="FLOW METERS" defaultOpen={false}>
        <SensorTable sensors={FLOW_METERS} title="Hall Effect Flow Meters" />
        <div className="settings-note">
          Flow meters use interrupt-based pulse counting. BTU = {BTU_FACTOR} x GPM x Delta-T
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="OUTPUTS & RELAYS" defaultOpen={false}>
        <SensorTable sensors={OUTPUTS} title="Control Outputs" />
      </CollapsibleSection>

      <CollapsibleSection title="SYSTEM CONSTANTS" defaultOpen={false}>
        <div className="stats-grid">
          <StatCard title="BTU FACTOR" value={String(BTU_FACTOR)} subtitle="BTU = Factor x GPM x DT" />
          <StatCard title="BTU/kW" value={String(BTU_PER_KW)} subtitle="Conversion factor" />
          <StatCard title="LOCATION" value={LOCATION.city} subtitle={LOCATION.state} />
          <StatCard title="TIMEZONE" value={LOCATION.timezone} subtitle="System time" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="ANOMALY THRESHOLDS" defaultOpen={false}>
        <div className="stats-grid">
          <StatCard title="MIN PRESSURE" value={`${DEFAULT_THRESHOLDS.minPressure} PSI`} subtitle="Low alarm" />
          <StatCard title="MAX PRESSURE" value={`${DEFAULT_THRESHOLDS.maxPressure} PSI`} subtitle="High alarm" />
          <StatCard title="MIN DELTA-T" value={`${DEFAULT_THRESHOLDS.minDeltaT}F`} subtitle="Low efficiency" />
          <StatCard title="MAX DELTA-T" value={`${DEFAULT_THRESHOLDS.maxDeltaT}F`} subtitle="High alarm" />
          <StatCard title="MIN COP" value={String(DEFAULT_THRESHOLDS.minCop)} subtitle="Efficiency target" />
          <StatCard title="STALE TIMEOUT" value={`${DEFAULT_THRESHOLDS.staleThresholdMs / 1000}s`} subtitle="Sensor timeout" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="REFRESH RATES" defaultOpen={false}>
        <div className="stats-grid">
          <StatCard title="REALTIME" value={`${REFRESH_RATES.realtime}ms`} subtitle="Live data refresh" />
          <StatCard title="CHARTS" value={`${REFRESH_RATES.charts}ms`} subtitle="Chart update" />
          <StatCard title="HISTORICAL" value={`${REFRESH_RATES.historical}ms`} subtitle="Archive query" />
          <StatCard title="WEATHER" value={`${REFRESH_RATES.weather}ms`} subtitle="Weather API" />
          <StatCard title="EMPORIA" value={`${REFRESH_RATES.emporia}ms`} subtitle="CT readings" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="AI CONFIGURATION" defaultOpen={false}>
        <div className="settings-form">
          <div className="settings-form-group">
            <label className="settings-label">AI API Key (OpenAI or Anthropic)</label>
            <div className="api-key-input-group">
              <input
                type={showApiKey ? 'text' : 'password'}
                className="settings-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... or sk-ant-..."
              />
              <button
                type="button"
                className="range-button"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            <div className="settings-note">
              Enter your API key to enable AI-powered analysis. Supports both OpenAI (GPT) and Anthropic (Claude).
              Keys starting with "sk-ant-" will use Claude, others use GPT.
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="EMAIL REPORTS" defaultOpen={false}>
        <div className="settings-form">
          <div className="settings-form-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                checked={emailSettings.enabled}
                onChange={(e) => handleEmailSettingChange('enabled', e.target.checked)}
                className="settings-checkbox"
              />
              <span>Enable Email Reports</span>
            </label>
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Report Recipients</label>
            <div className="email-list">
              {emailSettings.recipients.length === 0 ? (
                <div className="settings-note">No recipients added</div>
              ) : (
                emailSettings.recipients.map(email => (
                  <div key={email} className="email-recipient">
                    <span>{email}</span>
                    <button
                      type="button"
                      className="email-remove-btn"
                      onClick={() => handleRemoveEmail(email)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="api-key-input-group" style={{ marginTop: '8px' }}>
              <input
                type="email"
                className="settings-input"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <button
                type="button"
                className="range-button"
                onClick={handleAddEmail}
              >
                ADD
              </button>
            </div>
            {emailError && <div className="settings-error">{emailError}</div>}
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Report Frequency</label>
            <div className="settings-checkbox-group">
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  checked={emailSettings.dailyReport}
                  onChange={(e) => handleEmailSettingChange('dailyReport', e.target.checked)}
                  className="settings-checkbox"
                />
                <span>Daily Report</span>
              </label>
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  checked={emailSettings.monthlyReport}
                  onChange={(e) => handleEmailSettingChange('monthlyReport', e.target.checked)}
                  className="settings-checkbox"
                />
                <span>Monthly Report</span>
              </label>
            </div>
          </div>

          {emailSettings.dailyReport && (
            <div className="settings-form-group">
              <label className="settings-label">Daily Report Time</label>
              <input
                type="time"
                className="settings-input"
                value={emailSettings.reportTime}
                onChange={(e) => handleEmailSettingChange('reportTime', e.target.value)}
                style={{ width: '120px' }}
              />
            </div>
          )}

          {emailSettings.monthlyReport && (
            <div className="settings-form-group">
              <label className="settings-label">Monthly Report Day</label>
              <select
                className="settings-input"
                value={emailSettings.monthlyReportDay}
                onChange={(e) => handleEmailSettingChange('monthlyReportDay', parseInt(e.target.value))}
                style={{ width: '120px' }}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="settings-note" style={{ marginTop: '16px' }}>
            Reports include system health, efficiency metrics, and AI insights.
            Note: Email sending requires server-side integration (SMTP or email API).
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="MQTT CONFIGURATION" defaultOpen={false}>
        <div className="settings-form">
          <div className="stats-grid">
            <StatCard title="BROKER" value="mqtt://localhost" subtitle="MQTT Server" />
            <StatCard title="PORT" value="1883" subtitle="Default port" />
            <StatCard title="CLIENT ID" value="hvac-dashboard" subtitle="Connection ID" />
            <StatCard title="TOPIC PREFIX" value="hvac/" subtitle="Base topic" />
          </div>
          <div className="settings-note" style={{ marginTop: '16px' }}>
            MQTT topics: hvac/heatpump/state, hvac/ahu1/state, hvac/buffer/state, etc.
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="EMPORIA VUE CONFIGURATION" defaultOpen={false}>
        <div className="settings-form">
          <div className="stats-grid">
            <StatCard title="DEVICE ID" value="Vue-001" subtitle="Emporia device" />
            <StatCard title="CHANNELS" value="5" subtitle="CT clamps" />
            <StatCard title="POLL RATE" value="5s" subtitle="Data refresh" />
          </div>
          <div className="settings-table-container" style={{ marginTop: '16px' }}>
            <div className="settings-table-title">CT Channel Assignments</div>
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Circuit</th>
                  <th>Expected Load</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>Heat Pump</td><td>2000-4000W</td></tr>
                <tr><td>2</td><td>Pump Station</td><td>100-200W</td></tr>
                <tr><td>3</td><td>AHU 1</td><td>250-400W</td></tr>
                <tr><td>4</td><td>AHU 2</td><td>250-400W</td></tr>
                <tr><td>5</td><td>AHU 3</td><td>250-400W</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

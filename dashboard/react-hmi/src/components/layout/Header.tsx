/**
 * Header Component
 * Top navigation bar with weather, clock, and controls
 */

import { useMemo } from 'react';
import { useHvac, useWeather, useSystem } from '../../context/HvacContext';
import { generateForecast } from '../../services/demo.service';
import { WeatherIcon, Clock, ThemeToggle } from '../common';
import type { ThemeId } from '../common';
import { formatTemp } from '../../utils/formatters';

interface HeaderProps {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  wallboard: boolean;
  onToggleWallboard: () => void;
}

export function Header({
  theme,
  onThemeChange,
  wallboard,
  onToggleWallboard,
}: HeaderProps) {
  const { isDemo } = useHvac();
  const weather = useWeather();
  const system = useSystem();
  const forecast = useMemo(
    () => generateForecast(weather.temp ?? system.outdoorTemp ?? 40),
    [weather.temp, system.outdoorTemp],
  );

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">HONEY HILL HVAC SYSTEM</h1>
        <div className="header-subtitle">Interactive Control Room</div>
      </div>
      <div className="header-status">
        <div className={`status-badge ${isDemo ? 'demo' : 'connected'}`}>
          {isDemo ? 'DEMO MODE' : 'CONNECTED'}
        </div>
        <div className="status-badge">
          <Clock />
        </div>
        <div className="weather-dropdown">
          <div className="status-badge weather-pill">
            <div className="weather-pill-main">
              <span className="weather-pill-label">Weather</span>
              <span className="weather-pill-temp">{formatTemp(weather.temp)}</span>
              <span className="weather-pill-icon">
                <WeatherIcon type={forecast[0]?.icon ?? 'SUN'} className="weather-icon" />
              </span>
            </div>
            <div className="weather-pill-sub">{weather.condition}</div>
          </div>
          <div className="forecast-panel" aria-hidden="true">
            <div className="forecast-header">5-DAY OUTLOOK</div>
            {forecast.map(day => (
              <div key={day.day} className="forecast-card">
                <div className="forecast-day">{day.day}</div>
                <div className="forecast-icon">
                  <WeatherIcon type={day.icon} className="forecast-icon-svg" />
                </div>
                <div className="forecast-temp">
                  <span className="forecast-high">{day.high}F</span>
                  <span className="forecast-low">{day.low}F</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="status-badge">
          Location: {system.location}
        </div>
        <button type="button" className="range-button wallboard-toggle" onClick={onToggleWallboard}>
          {wallboard ? 'EXIT WALLBOARD' : 'WALLBOARD MODE'}
        </button>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  );
}

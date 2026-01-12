/**
 * HVAC System State Context
 * Provides real-time system state to all components
 * Supports both demo mode and live MQTT/Emporia data
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { HvacSystemState, ViewMode } from '../types/hvac.types';
import { generateDemoState } from '../services/demo.service';
import { REFRESH_RATES } from '../config/system.config';

interface HvacContextValue {
  state: HvacSystemState;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isDemo: boolean;
  toggleDemo: () => void;
  refreshRate: number;
  setRefreshRate: (ms: number) => void;
  playbackRange: '24h' | '7d';
  setPlaybackRange: (range: '24h' | '7d') => void;
  playbackPosition: number;
  setPlaybackPosition: (value: number) => void;
  playbackOffsetMs: number;
}

const HvacContext = createContext<HvacContextValue | null>(null);

interface HvacProviderProps {
  children: ReactNode;
}

export function HvacProvider({ children }: HvacProviderProps) {
  // Start in demo mode
  const [isDemo, setIsDemo] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('schematic');
  const [refreshRate, setRefreshRate] = useState(REFRESH_RATES.realtime);
  const [playbackRange, setPlaybackRange] = useState<'24h' | '7d'>('24h');
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const playbackOffsetMs = (playbackRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000) * playbackPosition;

  // Initialize with demo state
  const [state, setState] = useState<HvacSystemState>(() => generateDemoState());

  // Demo mode update loop
  useEffect(() => {
    if (!isDemo) return;

    const interval = setInterval(() => {
      const nowMs = Date.now() - playbackOffsetMs;
      setState(generateDemoState(nowMs));
    }, refreshRate);

    return () => clearInterval(interval);
  }, [isDemo, refreshRate]);

  const toggleDemo = useCallback(() => {
    setIsDemo(prev => !prev);
  }, []);

  const value: HvacContextValue = {
    state,
    viewMode,
    setViewMode,
    isDemo,
    toggleDemo,
    refreshRate,
    setRefreshRate,
    playbackRange,
    setPlaybackRange,
    playbackPosition,
    setPlaybackPosition,
    playbackOffsetMs,
  };

  return (
    <HvacContext.Provider value={value}>
      {children}
    </HvacContext.Provider>
  );
}

export function useHvac() {
  const context = useContext(HvacContext);
  if (!context) {
    throw new Error('useHvac must be used within HvacProvider');
  }
  return context;
}

// Convenience hooks for specific parts of state
export function useHeatPump() {
  const { state } = useHvac();
  return state.heatPump;
}

export function useBuffer() {
  const { state } = useHvac();
  return state.buffer;
}

export function useAhus() {
  const { state } = useHvac();
  return state.ahus;
}

export function useMeters() {
  const { state } = useHvac();
  return state.meters;
}

export function useSystem() {
  const { state } = useHvac();
  return state.system;
}

export function useWeather() {
  const { state } = useHvac();
  return state.weather;
}

export function useAlerts() {
  const { state } = useHvac();
  return state.alerts;
}

export function usePumps() {
  const { state } = useHvac();
  return state.pumps;
}

export function useSnowMelt() {
  const { state } = useHvac();
  return state.snowMelt;
}

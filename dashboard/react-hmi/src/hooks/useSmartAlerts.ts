/**
 * Smart Alerts Hook
 * Generates alerts based on current system state with start/end times
 */

import { useMemo, useRef } from 'react';
import { useHvac } from '../context/HvacContext';
import type { Alert } from '../types/hvac.types';

// Track alert start times persistently
interface AlertTracker {
  [alertId: string]: {
    startTime: Date;
    endTime?: Date;
  };
}

export function useSmartAlerts(): Alert[] {
  const { state } = useHvac();
  const alertTrackerRef = useRef<AlertTracker>({});

  return useMemo(() => {
    const alerts: Alert[] = [];
    const now = new Date();
    const thresholds = state.thresholds;
    const tracker = alertTrackerRef.current;
    const activeAlertIds = new Set<string>();

    // Helper to create alert with proper timing
    const createAlert = (id: string, level: Alert['level'], message: string, source: string): Alert => {
      // Track start time for new alerts
      if (!tracker[id]) {
        tracker[id] = { startTime: now };
      }
      activeAlertIds.add(id);

      return {
        id,
        level,
        message,
        source,
        timestamp: now,
        startTime: tracker[id].startTime,
        endTime: undefined,  // Still ongoing
        acknowledged: false,
      };
    };

    // Low COP alert
    if (state.system.liveCop !== null && state.system.liveCop < thresholds.minCop) {
      alerts.push(createAlert(
        'smart-cop-low',
        'warning',
        `Low COP (${state.system.liveCop.toFixed(2)})`,
        'System'
      ));
    }

    // AHU alerts
    Object.values(state.ahus).forEach(ahu => {
      if (ahu.pumpOn && ahu.gpm < 0.3) {
        alerts.push(createAlert(
          `smart-flow-${ahu.id}`,
          'warning',
          `${ahu.name}: Low flow (${ahu.gpm.toFixed(1)} GPM)`,
          ahu.name
        ));
      }
      if (ahu.deltaT !== null && ahu.deltaT > thresholds.maxDeltaT) {
        alerts.push(createAlert(
          `smart-dt-high-${ahu.id}`,
          'warning',
          `${ahu.name}: High delta T (${ahu.deltaT.toFixed(1)} F)`,
          ahu.name
        ));
      }
      if (ahu.deltaT !== null && ahu.deltaT < thresholds.minDeltaT && ahu.pumpOn) {
        alerts.push(createAlert(
          `smart-dt-low-${ahu.id}`,
          'warning',
          `${ahu.name}: Low delta T (${ahu.deltaT.toFixed(1)} F)`,
          ahu.name
        ));
      }
    });

    // Meter status alerts
    Object.values(state.meters).forEach(meter => {
      if (meter.status !== 'online') {
        alerts.push(createAlert(
          `smart-meter-${meter.id}`,
          'error',
          `${meter.name}: Sensor ${meter.status}`,
          meter.name
        ));
      }
    });

    // Buffer tank pressure alert
    if (state.buffer.pressure !== null && state.buffer.pressure < thresholds.minPressure) {
      alerts.push(createAlert(
        'smart-pressure-low',
        'warning',
        `Loop pressure low (${state.buffer.pressure.toFixed(1)} PSI)`,
        'Buffer Tank'
      ));
    }

    // Mark end times for alerts that are no longer active
    Object.keys(tracker).forEach(alertId => {
      if (!activeAlertIds.has(alertId) && !tracker[alertId].endTime) {
        tracker[alertId].endTime = now;
      }
    });

    // Clean up old resolved alerts (keep last 10 minutes of history)
    const cutoff = new Date(now.getTime() - 10 * 60 * 1000);
    Object.keys(tracker).forEach(alertId => {
      if (tracker[alertId].endTime && tracker[alertId].endTime < cutoff) {
        delete tracker[alertId];
      }
    });

    return alerts;
  }, [state]);
}

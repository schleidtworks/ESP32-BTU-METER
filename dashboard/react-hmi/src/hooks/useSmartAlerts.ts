/**
 * Smart Alerts Hook
 * Generates alerts based on current system state
 */

import { useMemo } from 'react';
import { useHvac } from '../context/HvacContext';
import type { Alert } from '../types/hvac.types';

export function useSmartAlerts(): Alert[] {
  const { state } = useHvac();

  return useMemo(() => {
    const alerts: Alert[] = [];
    const now = new Date();
    const thresholds = state.thresholds;

    // Low COP alert
    if (state.system.liveCop !== null && state.system.liveCop < thresholds.minCop) {
      alerts.push({
        id: 'smart-cop-low',
        level: 'warning',
        message: `Low COP (${state.system.liveCop.toFixed(2)})`,
        source: 'System',
        timestamp: now,
        acknowledged: false,
      });
    }

    // AHU alerts
    Object.values(state.ahus).forEach(ahu => {
      if (ahu.pumpOn && ahu.gpm < 0.3) {
        alerts.push({
          id: `smart-flow-${ahu.id}`,
          level: 'warning',
          message: `${ahu.name}: Low flow (${ahu.gpm.toFixed(1)} GPM)`,
          source: ahu.name,
          timestamp: now,
          acknowledged: false,
        });
      }
      if (ahu.deltaT !== null && ahu.deltaT > thresholds.maxDeltaT) {
        alerts.push({
          id: `smart-dt-high-${ahu.id}`,
          level: 'warning',
          message: `${ahu.name}: High delta T (${ahu.deltaT.toFixed(1)} F)`,
          source: ahu.name,
          timestamp: now,
          acknowledged: false,
        });
      }
      if (ahu.deltaT !== null && ahu.deltaT < thresholds.minDeltaT && ahu.pumpOn) {
        alerts.push({
          id: `smart-dt-low-${ahu.id}`,
          level: 'warning',
          message: `${ahu.name}: Low delta T (${ahu.deltaT.toFixed(1)} F)`,
          source: ahu.name,
          timestamp: now,
          acknowledged: false,
        });
      }
    });

    // Meter status alerts
    Object.values(state.meters).forEach(meter => {
      if (meter.status !== 'online') {
        alerts.push({
          id: `smart-meter-${meter.id}`,
          level: 'error',
          message: `${meter.name}: Sensor ${meter.status}`,
          source: meter.name,
          timestamp: now,
          acknowledged: false,
        });
      }
    });

    // Buffer tank pressure alert
    if (state.buffer.pressure !== null && state.buffer.pressure < thresholds.minPressure) {
      alerts.push({
        id: 'smart-pressure-low',
        level: 'warning',
        message: `Loop pressure low (${state.buffer.pressure.toFixed(1)} PSI)`,
        source: 'Buffer Tank',
        timestamp: now,
        acknowledged: false,
      });
    }

    return alerts;
  }, [state]);
}

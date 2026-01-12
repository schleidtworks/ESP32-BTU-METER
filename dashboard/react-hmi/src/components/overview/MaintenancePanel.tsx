/**
 * Maintenance Panel Component
 * Equipment runtime and service reminders
 */

import { useAhus, usePumps, useHeatPump } from '../../context/HvacContext';

export function MaintenancePanel() {
  const ahus = useAhus();
  const pumps = usePumps();
  const heatPump = useHeatPump();

  const estimateHours = (seed: string, active: boolean) => {
    const base = seed.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return Math.round(600 + (base % 900) + (active ? 200 : 0));
  };

  const items = [
    { id: 'heat-pump', name: 'Heat Pump', active: heatPump.running },
    ...Object.values(ahus).map(ahu => ({ id: ahu.id, name: ahu.name, active: ahu.pumpOn })),
    ...Object.values(pumps).map(pump => ({ id: pump.id, name: pump.name, active: pump.running })),
  ].map(item => {
    const hours = estimateHours(item.id, item.active);
    const due = 2000;
    const remaining = Math.max(0, due - hours);
    return { ...item, hours, remaining };
  });

  return (
    <div className="card maintenance-card">
      <div className="card-title">MAINTENANCE PANEL</div>
      <div className="maintenance-table">
        {items.map(item => (
          <div key={item.id} className="maintenance-row">
            <span className="maintenance-name">{item.name}</span>
            <span className="maintenance-hours">{item.hours} hrs</span>
            <span className={`maintenance-status ${item.remaining < 200 ? 'due' : ''}`}>
              {item.remaining < 200 ? `SERVICE DUE (${item.remaining} hrs)` : `OK (${item.remaining} hrs)`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

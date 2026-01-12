/**
 * Alerts Bar Component
 * Bottom alert notification bar
 */

import { useAlerts } from '../../context/HvacContext';
import { useSmartAlerts } from '../../hooks/useSmartAlerts';

export function AlertsBar() {
  const alerts = useAlerts();
  const smartAlerts = useSmartAlerts();
  const rows = [...smartAlerts, ...alerts].slice(0, 6);

  return (
    <div className="alerts-bar">
      {rows.map(alert => (
        <div key={alert.id} className={`alert-badge ${alert.level}`}>
          {alert.level === 'info' && 'INFO'}
          {alert.level === 'warning' && 'WARN'}
          {alert.level === 'error' && 'ALERT'}
          {alert.message}
        </div>
      ))}
    </div>
  );
}

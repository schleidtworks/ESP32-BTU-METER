/**
 * Alarm Log Component
 * Display recent alerts in a table format
 */

import { useAlerts } from '../../context/HvacContext';
import { useSmartAlerts } from '../../hooks/useSmartAlerts';
import { formatTime } from '../../utils/formatters';

export function AlarmLog() {
  const alerts = useAlerts();
  const smartAlerts = useSmartAlerts();
  const rows = [...smartAlerts, ...alerts].slice(0, 8);

  return (
    <div className="card alarm-log">
      <div className="card-title">ALARM LOG</div>
      {rows.length === 0 ? (
        <div className="alarm-empty">No alarms in the log.</div>
      ) : (
        <div className="alarm-table">
          {rows.map(alert => {
            const timestamp = alert.timestamp instanceof Date ? alert.timestamp : new Date(alert.timestamp);
            return (
              <div key={alert.id} className={`alarm-row ${alert.level}`}>
                <span className="alarm-time">{formatTime(timestamp)}</span>
                <span className="alarm-level">{alert.level.toUpperCase()}</span>
                <span className="alarm-message">{alert.message}</span>
                <span className="alarm-source">{alert.source}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Alarm Log Component
 * Display recent alerts in a table format with start and end times
 */

import { useAlerts } from '../../context/HvacContext';
import { useSmartAlerts } from '../../hooks/useSmartAlerts';
import { formatTime } from '../../utils/formatters';

// Format duration between two dates
function formatDuration(start: Date, end?: Date): string {
  const endTime = end || new Date();
  const diffMs = endTime.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return '<1m';
  if (diffMins < 60) return `${diffMins}m`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

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
          <div className="alarm-header">
            <span className="alarm-col-start">START</span>
            <span className="alarm-col-end">END</span>
            <span className="alarm-col-duration">DUR</span>
            <span className="alarm-col-level">LVL</span>
            <span className="alarm-col-message">MESSAGE</span>
          </div>
          {rows.map(alert => {
            const startTime = alert.startTime instanceof Date ? alert.startTime : new Date(alert.startTime);
            const endTime = alert.endTime ? (alert.endTime instanceof Date ? alert.endTime : new Date(alert.endTime)) : undefined;
            const isOngoing = !alert.endTime;

            return (
              <div key={alert.id} className={`alarm-row ${alert.level} ${isOngoing ? 'ongoing' : ''}`}>
                <span className="alarm-col-start">{formatTime(startTime)}</span>
                <span className="alarm-col-end">{endTime ? formatTime(endTime) : '---'}</span>
                <span className="alarm-col-duration">
                  {isOngoing ? <span className="ongoing-badge">ACTIVE</span> : formatDuration(startTime, endTime)}
                </span>
                <span className={`alarm-col-level level-${alert.level}`}>{alert.level.toUpperCase()}</span>
                <span className="alarm-col-message" title={`${alert.message} (${alert.source})`}>
                  {alert.message}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

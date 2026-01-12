/**
 * Pump Indicator Component
 * Shows pump running/stopped status
 */

interface PumpIndicatorProps {
  name: string;
  running: boolean;
}

export function PumpIndicator({ name, running }: PumpIndicatorProps) {
  return (
    <div className={`pump-indicator ${running ? 'running' : ''}`}>
      <span className="pump-icon">PUMP</span>
      <span className="pump-label">{name}</span>
    </div>
  );
}

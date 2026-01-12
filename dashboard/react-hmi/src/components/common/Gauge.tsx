/**
 * Gauge Component
 * Horizontal bar gauge with threshold coloring
 */

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  lowThreshold?: number;
  highThreshold?: number;
}

export function Gauge({ value, min, max, lowThreshold, highThreshold }: GaugeProps) {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  let className = 'gauge-fill';
  if (lowThreshold && value < lowThreshold) className += ' low';
  else if (highThreshold && value > highThreshold) className += ' high';

  return (
    <div className="gauge-container">
      <div className={className} style={{ width: `${percent}%` }} />
    </div>
  );
}

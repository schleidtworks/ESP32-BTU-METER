/**
 * Stat Card Component
 * Display KPI metric with title, value, and subtitle
 */

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  colorClass?: string;
}

export function StatCard({ title, value, subtitle, colorClass = '' }: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="card-title">{title}</div>
      <div className={`card-value ${colorClass}`}>{value}</div>
      <div className="card-label">{subtitle}</div>
    </div>
  );
}

/**
 * Tabs Bar Component
 * Main navigation tabs
 */

interface TabsBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const tabs = [
  { id: 'schematic', label: 'Overview' },
  { id: 'areas', label: 'Areas' },
  { id: 'meters', label: 'Meters' },
  { id: 'settings', label: 'Settings' },
  { id: 'about', label: 'About' },
  { id: 'export', label: 'Export' },
];

export function TabsBar({ currentView, onViewChange }: TabsBarProps) {
  return (
    <div className="tabs-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${currentView === tab.id ? 'active' : ''}`}
          onClick={() => onViewChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

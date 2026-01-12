/**
 * Focus Mode Toggle Component
 * Select which system to highlight in schematic
 */

export const FOCUS_OPTIONS = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'heating', label: 'Heating' },
  { id: 'cooling', label: 'Cooling' },
  { id: 'dhw', label: 'DHW' },
] as const;

export type FocusMode = typeof FOCUS_OPTIONS[number]['id'];

interface FocusModeToggleProps {
  mode: FocusMode;
  onChange: (mode: FocusMode) => void;
}

export function FocusModeToggle({ mode, onChange }: FocusModeToggleProps) {
  return (
    <div className="focus-toggle">
      {FOCUS_OPTIONS.map(option => (
        <button
          key={option.id}
          type="button"
          className={`focus-button ${mode === option.id ? 'active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Theme Toggle Component
 * Switch between Retro, Viessmann, and Dark themes
 */

export type ThemeId = 'retro' | 'modern' | 'dark';

export const THEMES: Array<{ id: ThemeId; label: string }> = [
  { id: 'retro', label: 'Retro' },
  { id: 'modern', label: 'Viessmann' },
  { id: 'dark', label: 'Dark' },
];

interface ThemeToggleProps {
  theme: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div className="theme-toggle">
      {THEMES.map(option => (
        <button
          key={option.id}
          type="button"
          className={`theme-button ${theme === option.id ? 'active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

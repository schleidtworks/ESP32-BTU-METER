/**
 * Theme Toggle Component
 * Switch between Retro, Viessmann, Dark, and Apple themes
 */

export type ThemeId = 'retro' | 'modern' | 'dark' | 'apple';

export const THEMES: Array<{ id: ThemeId; label: string; icon?: string }> = [
  { id: 'retro', label: 'Retro', icon: '👾' },
  { id: 'modern', label: 'Viessmann', icon: '🔧' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'apple', label: 'Apple', icon: '🍎' },
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
          title={option.label}
        >
          {option.icon && <span className="theme-icon">{option.icon}</span>}
          <span className="theme-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

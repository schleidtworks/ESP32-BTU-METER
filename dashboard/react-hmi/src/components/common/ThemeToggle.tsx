/**
 * Theme Toggle Component
 * Dropdown selector for Retro, Viessmann, Dark, and Apple themes
 * with option to set default theme (persisted to localStorage)
 */

import { useState, useEffect, useRef } from 'react';

export type ThemeId = 'retro' | 'modern' | 'dark' | 'apple';

const THEME_STORAGE_KEY = 'hvac-default-theme';

export const THEMES: Array<{ id: ThemeId; label: string; icon?: string }> = [
  { id: 'retro', label: 'Retro', icon: '👾' },
  { id: 'modern', label: 'Viessmann', icon: '🔧' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'apple', label: 'Apple', icon: '🍎' },
];

// Get the default theme from localStorage or fallback to 'retro'
export function getDefaultTheme(): ThemeId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && THEMES.some(t => t.id === stored)) {
    return stored as ThemeId;
  }
  return 'retro';
}

// Save the default theme to localStorage
function setDefaultTheme(themeId: ThemeId): void {
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

interface ThemeToggleProps {
  theme: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const [isDefault, setIsDefault] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if current theme is the default
  useEffect(() => {
    const defaultTheme = getDefaultTheme();
    setIsDefault(theme === defaultTheme);
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  const handleThemeSelect = (themeId: ThemeId) => {
    onChange(themeId);
    setIsOpen(false);
  };

  const handleSetDefault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsDefault(checked);
    if (checked) {
      setDefaultTheme(theme);
    } else {
      // If unchecking, reset to 'retro' as default
      setDefaultTheme('retro');
    }
  };

  return (
    <div className="theme-toggle-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="theme-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="theme-current">
          {currentTheme.icon && <span className="theme-icon">{currentTheme.icon}</span>}
          <span className="theme-label">{currentTheme.label}</span>
        </span>
        <span className="theme-dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu" role="listbox">
          {THEMES.map(option => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={theme === option.id}
              className={`theme-dropdown-item ${theme === option.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(option.id)}
            >
              {option.icon && <span className="theme-icon">{option.icon}</span>}
              <span className="theme-label">{option.label}</span>
              {theme === option.id && <span className="theme-check">✓</span>}
            </button>
          ))}

          <div className="theme-default-option">
            <label className="theme-default-label">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={handleSetDefault}
                className="theme-default-checkbox"
              />
              <span>Set as default</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

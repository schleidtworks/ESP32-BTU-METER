/**
 * Sidebar Component
 * Left navigation panel with area and meter links
 */

import { AREAS } from '../../config/system.config';

const LOGO_URL = 'https://schleidtworks.com/wp-content/uploads/2020/08/2_Schleidt-Works-Logo.png';

function PixelLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="sidebar-section" style={{ textAlign: 'center', padding: '16px' }}>
      {collapsed ? (
        <div className="logo-mini">SW</div>
      ) : (
        <>
          <img
            src={LOGO_URL}
            alt="Schleidt Works"
            style={{
              width: '180px',
              height: 'auto',
              imageRendering: 'pixelated',
              filter: 'contrast(1.1) saturate(1.2)',
              borderRadius: '4px',
            }}
          />
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: 'var(--text-dim)',
            marginTop: '8px',
            letterSpacing: '1px',
          }}>
            ENERGY CONSULTING
          </div>
        </>
      )}
    </div>
  );
}

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-toggle-row">
        <button type="button" className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? '>>' : '<<'}
        </button>
      </div>
      <PixelLogo collapsed={collapsed} />
      <div className="sidebar-section">
        <div className="sidebar-title">Dashboard</div>
        <div
          className={`nav-item ${currentView === 'schematic' ? 'active' : ''}`}
          onClick={() => onViewChange('schematic')}
        >
          <span className="nav-item-icon">SYS</span>
          <span className="nav-item-label">System Overview</span>
        </div>
        <div
          className={`nav-item ${currentView === 'areas' ? 'active' : ''}`}
          onClick={() => onViewChange('areas')}
        >
          <span className="nav-item-icon">AREA</span>
          <span className="nav-item-label">Areas Overview</span>
        </div>
        <div
          className={`nav-item ${currentView === 'meters' ? 'active' : ''}`}
          onClick={() => onViewChange('meters')}
        >
          <span className="nav-item-icon">MTR</span>
          <span className="nav-item-label">Meters Overview</span>
        </div>
        <div
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => onViewChange('settings')}
        >
          <span className="nav-item-icon">CFG</span>
          <span className="nav-item-label">System Settings</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">By Area</div>
        {Object.values(AREAS).map(area => (
          <div
            key={area.id}
          className={`nav-item ${currentView === `area-${area.id}` ? 'active' : ''}`}
          onClick={() => onViewChange(`area-${area.id}`)}
        >
          <span className="nav-item-icon">AREA</span>
          <span className="nav-item-label">{area.name}</span>
        </div>
      ))}
    </div>

      <div className="sidebar-section">
        <div className="sidebar-title">By Meter</div>
        <div
          className={`nav-item ${currentView === 'meter-hp' ? 'active' : ''}`}
          onClick={() => onViewChange('meter-hp')}
        >
          <span className="nav-item-icon">HP</span>
          <span className="nav-item-label">Heat Pump</span>
        </div>
        <div
          className={`nav-item ${currentView === 'meter-ahu1' ? 'active' : ''}`}
          onClick={() => onViewChange('meter-ahu1')}
        >
          <span className="nav-item-icon">AHU</span>
          <span className="nav-item-label">AHU 1 Meter</span>
        </div>
        <div
          className={`nav-item ${currentView === 'meter-ahu2' ? 'active' : ''}`}
          onClick={() => onViewChange('meter-ahu2')}
        >
          <span className="nav-item-icon">AHU</span>
          <span className="nav-item-label">AHU 2 Meter</span>
        </div>
        <div
          className={`nav-item ${currentView === 'meter-ahu3' ? 'active' : ''}`}
          onClick={() => onViewChange('meter-ahu3')}
        >
          <span className="nav-item-icon">AHU</span>
          <span className="nav-item-label">AHU 3 Meter</span>
        </div>
        <div
          className={`nav-item ${currentView === 'meter-snow' ? 'active' : ''}`}
          onClick={() => onViewChange('meter-snow')}
        >
          <span className="nav-item-icon">SNW</span>
          <span className="nav-item-label">Snow Melt</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">Tools</div>
        <div
          className={`nav-item ${currentView === 'export' ? 'active' : ''}`}
          onClick={() => onViewChange('export')}
        >
          <span className="nav-item-icon">EXP</span>
          <span className="nav-item-label">Export Data</span>
        </div>
        <div
          className={`nav-item ${currentView === 'about' ? 'active' : ''}`}
          onClick={() => onViewChange('about')}
        >
          <span className="nav-item-icon">INF</span>
          <span className="nav-item-label">About</span>
        </div>
      </div>
    </nav>
  );
}

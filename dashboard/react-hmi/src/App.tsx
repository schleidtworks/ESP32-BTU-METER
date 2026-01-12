/**
 * Honey Hill HVAC Dashboard
 * Main Application Component - Refactored
 */

import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Context
import {
  HvacProvider,
  useAhus,
  useHvac,
  useMeters,
  useSnowMelt,
  useSystem,
  usePumps,
} from './context/HvacContext';

// Config
import { AREAS } from './config/system.config';

// Services
import { generateHistorySeries } from './services/demo.service';
import type { HistoryRange } from './services/demo.service';

// Types
import type { AreaId, MeterId } from './types/hvac.types';

// Utils
import { formatTemp, formatBtu, formatCop, formatKwh, formatCurrency } from './utils/formatters';

// Layout Components
import { Header, TabsBar, Sidebar, AlertsBar } from './components/layout';
import type { ThemeId } from './components/common';
import { THEMES } from './components/common';

// Common Components
import { CollapsibleSection, StatCard, PumpIndicator } from './components/common';

// Equipment Components
import { HeatPumpCard, BufferTankCard, AhuCard, SnowMeltCard } from './components/equipment';

// Chart Components
import { CopTrendPanel, AlarmLog } from './components/charts';

// Overview Components
import {
  PlaybackControls,
  CostCockpit,
  MaintenancePanel,
  FocusModeToggle,
  AreaHeatmap,
  AreaTile,
  SchematicOverlay,
  AIOperationsAnalyst,
  ENERGY_RATE_PER_KWH,
} from './components/overview';
import type { FocusMode } from './components/overview';
import { getAreaStats } from './components/overview';

// Settings Components
import { SystemSettingsView, AboutView } from './components/settings';

const THEME_CLASSES = THEMES.map(theme => `theme-${theme.id}`);

// ===== VIEW COMPONENTS =====

function AreaHistoryModal({ areaId, onClose }: { areaId: AreaId; onClose: () => void }) {
  const ahus = useAhus();
  const snowMelt = useSnowMelt();
  const system = useSystem();
  const area = AREAS[areaId];
  const [range, setRange] = useState<HistoryRange>('week');
  const stats = getAreaStats(areaId, ahus, snowMelt);
  const baseBtu = Math.max(8000, stats.btu || 0);
  const baseCop = Math.max(1.8, system.liveCop ?? 3);

  const btuSeries = useMemo(
    () => generateHistorySeries(range, baseBtu, baseBtu * 0.25),
    [range, baseBtu],
  );
  const copSeries = useMemo(
    () => generateHistorySeries(range, baseCop, 0.7),
    [range, baseCop],
  );

  const btuAvg = btuSeries.reduce((sum, point) => sum + point.value, 0) / btuSeries.length;
  const btuPeak = Math.max(...btuSeries.map(point => point.value));
  const copAvg = copSeries.reduce((sum, point) => sum + point.value, 0) / copSeries.length;
  const copPeak = Math.max(...copSeries.map(point => point.value));

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{area.name} History</div>
            <div className="modal-subtitle">Tap a range to view week, month, or year</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>X</button>
        </div>

        <div className="range-toggle">
          {(['week', 'month', 'year'] as HistoryRange[]).map(value => (
            <button
              key={value}
              type="button"
              className={`range-button ${range === value ? 'active' : ''}`}
              onClick={() => setRange(value)}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="modal-content">
          <div className="chart-card">
            <div className="chart-title">BTU/hr</div>
            <div className="chart-summary">
              <span>Avg: {formatBtu(btuAvg)}</span>
              <span>Peak: {formatBtu(btuPeak)}</span>
            </div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={btuSeries}>
                  <CartesianGrid stroke="#1d2632" strokeDasharray="4 4" />
                  <XAxis dataKey="label" stroke="#6a7a8a" />
                  <YAxis stroke="#6a7a8a" />
                  <Tooltip
                    contentStyle={{ background: '#12141c', border: '1px solid #2a3a4a', color: '#e0e8f0' }}
                    labelStyle={{ color: '#ffcc00' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#44ff88" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">COP</div>
            <div className="chart-summary">
              <span>Avg: {formatCop(copAvg)}</span>
              <span>Peak: {formatCop(copPeak)}</span>
            </div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={copSeries}>
                  <CartesianGrid stroke="#1d2632" strokeDasharray="4 4" />
                  <XAxis dataKey="label" stroke="#6a7a8a" />
                  <YAxis stroke="#6a7a8a" domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#12141c', border: '1px solid #2a3a4a', color: '#e0e8f0' }}
                    labelStyle={{ color: '#ffcc00' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#ffcc00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchematicView({ onOpenAreaHistory }: { onOpenAreaHistory: (areaId: AreaId) => void }) {
  const system = useSystem();
  const ahus = useAhus();
  const pumps = usePumps();
  const [focusMode, setFocusMode] = useState<FocusMode>('balanced');

  return (
    <div>
      <CollapsibleSection title="AI OPERATIONS ANALYST" defaultOpen>
        <AIOperationsAnalyst />
      </CollapsibleSection>

      <CollapsibleSection title="SYSTEM KPIS" defaultOpen>
        <div className="stats-grid">
          <StatCard
            title="LIVE COP"
            value={formatCop(system.liveCop)}
            subtitle="BTU out / kW in"
            colorClass="warning"
          />
          <StatCard
            title="DAILY COP"
            value={formatCop(system.dailyCop)}
            subtitle="Today average"
          />
          <StatCard
            title="TOTAL BTU/hr"
            value={formatBtu(system.totalBtu)}
            subtitle="All zones"
          />
          <StatCard
            title="TOTAL kW"
            value={`${system.totalPowerKw?.toFixed(2) ?? '--'} kW`}
            subtitle="Emporia CT"
          />
          <StatCard
            title="TOTAL FLOW"
            value={`${system.totalGpm.toFixed(1)} GPM`}
            subtitle="All loops"
          />
          <StatCard
            title="TOTAL kWh (TODAY)"
            value={formatKwh(system.totalKwhToday ?? null)}
            subtitle="Estimated"
          />
          <StatCard
            title="AVG COST / YEAR"
            value={formatCurrency(system.totalKwhToday ? system.totalKwhToday * 365 * ENERGY_RATE_PER_KWH : null)}
            subtitle={`Rate $${ENERGY_RATE_PER_KWH.toFixed(2)}/kWh`}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="ENERGY COST COCKPIT" defaultOpen={false}>
        <CostCockpit />
      </CollapsibleSection>

      <CollapsibleSection title="PERFORMANCE TRENDS" defaultOpen>
        <div className="trend-section">
          <CopTrendPanel />
          <AlarmLog />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="SYSTEM FOCUS" defaultOpen={false}>
        <div className="focus-row">
          <div className="focus-text">
            Select a mode to highlight the schematic and data panels.
          </div>
          <FocusModeToggle mode={focusMode} onChange={setFocusMode} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="SYSTEM SCHEMATIC" defaultOpen>
        <SchematicOverlay onOpenAreaHistory={onOpenAreaHistory} focusMode={focusMode} />
      </CollapsibleSection>

      <CollapsibleSection title="AREAS" defaultOpen>
        <div className="area-grid">
          {Object.values(AREAS).map(area => (
            <AreaTile key={area.id} areaId={area.id} onOpen={onOpenAreaHistory} />
          ))}
        </div>
        <div className="heatmap-title-row">AREA HEATMAP</div>
        <AreaHeatmap onOpenAreaHistory={onOpenAreaHistory} />
      </CollapsibleSection>

      <CollapsibleSection title="EQUIPMENT STATUS" defaultOpen>
        <div className="equipment-grid">
          <HeatPumpCard />
          <BufferTankCard />
          {Object.values(ahus).map(ahu => (
            <AhuCard key={ahu.id} ahu={ahu} />
          ))}
          <SnowMeltCard />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="PUMPS" defaultOpen>
        <div className="pump-row">
          {Object.values(pumps).map(pump => (
            <PumpIndicator key={pump.id} name={pump.name} running={pump.running} />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="REPLAY TIMELINE" defaultOpen={false}>
        <PlaybackControls />
      </CollapsibleSection>

      <CollapsibleSection title="MAINTENANCE" defaultOpen={false}>
        <MaintenancePanel />
      </CollapsibleSection>
    </div>
  );
}

function AreasOverviewView({ onOpenAreaHistory }: { onOpenAreaHistory: (areaId: AreaId) => void }) {
  return (
    <div>
      <h2 className="font-pixel text-green glow-green" style={{ marginBottom: '16px' }}>
        Areas Overview
      </h2>
      <p className="text-dim" style={{ marginBottom: '24px' }}>
        Tap an area to open historical charts for week, month, or year.
      </p>
      <div className="area-grid">
        {Object.values(AREAS).map(area => (
          <AreaTile key={area.id} areaId={area.id} onOpen={onOpenAreaHistory} />
        ))}
      </div>
    </div>
  );
}

function MetersOverviewView() {
  const meters = useMeters();

  return (
    <div>
      <h2 className="font-pixel text-green glow-green" style={{ marginBottom: '16px' }}>
        Meters Overview
      </h2>
      <p className="text-dim" style={{ marginBottom: '24px' }}>
        Live meter snapshots. Tap a meter in the sidebar for full detail.
      </p>
      <div className="equipment-grid">
        {Object.values(meters).map(meter => (
          <div key={meter.id} className="card equipment-card">
            <div className="card-title">{meter.name}</div>
            <div className="card-subtitle">{AREAS[meter.area]?.name}</div>
            <div className="sprite-stats">
              <div>Supply: <span className="text-hot">{formatTemp(meter.supplyTemp)}</span></div>
              <div>Return: <span className="text-cold">{formatTemp(meter.returnTemp)}</span></div>
              <div>Delta T: <span>{formatTemp(meter.deltaT)}</span></div>
              <div>BTU/hr: <span>{formatBtu(meter.btu)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaDetailView({ areaId, onOpenAreaHistory }: { areaId: AreaId; onOpenAreaHistory: (areaId: AreaId) => void }) {
  const area = AREAS[areaId];
  const ahus = useAhus();
  const { state } = useHvac();

  const areaAhus = Object.values(ahus).filter(ahu => ahu.area === areaId);
  const areaMeter = state.meters[area.btuMeters[0] as keyof typeof state.meters];

  if (!area) return <div>Area not found</div>;

  return (
    <div>
      <div className="detail-header">
        <div>
          <h2 className="font-pixel text-green glow-green" style={{ marginBottom: '8px' }}>
            {area.name}
          </h2>
          <p className="text-dim">{area.description}</p>
        </div>
        <button type="button" className="range-button" onClick={() => onOpenAreaHistory(areaId)}>
          View History
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="AREA BTU/hr"
          value={formatBtu(areaAhus.reduce((sum, ahu) => sum + (ahu.btu ?? 0), 0))}
          subtitle="Current output"
        />
        <StatCard
          title="AREA SIZE"
          value={`${area.sqft} sq ft`}
          subtitle="Conditioned space"
        />
      </div>

      <div className="card-title" style={{ marginBottom: '12px' }}>EQUIPMENT</div>
      <div className="equipment-grid">
        {areaAhus.map(ahu => (
          <AhuCard key={ahu.id} ahu={ahu} />
        ))}
      </div>

      {areaMeter && (
        <div style={{ marginTop: '24px' }}>
          <div className="card-title" style={{ marginBottom: '12px' }}>BTU METER</div>
          <div className="card">
            <div className="stats-grid" style={{ marginBottom: 0 }}>
              <div>
                <div className="text-dim">Supply Temp</div>
                <div className="card-value hot">{formatTemp(areaMeter.supplyTemp)}</div>
              </div>
              <div>
                <div className="text-dim">Return Temp</div>
                <div className="card-value cold">{formatTemp(areaMeter.returnTemp)}</div>
              </div>
              <div>
                <div className="text-dim">Delta T</div>
                <div className="card-value">{formatTemp(areaMeter.deltaT)}</div>
              </div>
              <div>
                <div className="text-dim">BTU/hr</div>
                <div className="card-value">{formatBtu(areaMeter.btu)}</div>
              </div>
              <div>
                <div className="text-dim">Flow Rate</div>
                <div className="card-value">{areaMeter.gpm.toFixed(1)} GPM</div>
              </div>
              <div>
                <div className="text-dim">Power (CT)</div>
                <div className="card-value">{areaMeter.powerKw?.toFixed(2) ?? '--'} kW</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeterDetailView({ meterId }: { meterId: string }) {
  const { state } = useHvac();
  const meterMap: Record<string, MeterId> = {
    'meter-hp': 'hp-meter',
    'meter-ahu1': 'ahu1-meter',
    'meter-ahu2': 'ahu2-meter',
    'meter-ahu3': 'ahu3-meter',
    'meter-snow': 'snow-meter',
  };

  const actualMeterId = meterMap[meterId];
  const meter = state.meters[actualMeterId];

  if (!meter) return <div>Meter not found</div>;

  return (
    <div>
      <h2 className="font-pixel text-green glow-green" style={{ marginBottom: '16px' }}>
        {meter.name}
      </h2>
      <p className="text-dim" style={{ marginBottom: '24px' }}>
        Area: {AREAS[meter.area]?.name ?? meter.area}
      </p>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">REAL-TIME READINGS (0.5s refresh)</div>
        <div className="stats-grid" style={{ marginTop: '16px', marginBottom: 0 }}>
          <div className="stat-card">
            <div className="text-dim">Supply Temp</div>
            <div className="card-value hot">{formatTemp(meter.supplyTemp)}</div>
            <div className="text-dim">Sensor 0</div>
          </div>
          <div className="stat-card">
            <div className="text-dim">Return Temp</div>
            <div className="card-value cold">{formatTemp(meter.returnTemp)}</div>
            <div className="text-dim">Sensor 1</div>
          </div>
          <div className="stat-card">
            <div className="text-dim">Delta T</div>
            <div className="card-value">{formatTemp(meter.deltaT)}</div>
            <div className="text-dim">Supply minus return</div>
          </div>
          <div className="stat-card">
            <div className="text-dim">BTU/hr</div>
            <div className="card-value">{formatBtu(meter.btu)}</div>
            <div className="text-dim">500 x GPM x Delta T</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="card-title">FLOW RATE</div>
          <div className="card-value">{meter.gpm.toFixed(1)}</div>
          <div className="card-label">GPM</div>
        </div>
        <div className="card stat-card">
          <div className="card-title">POWER (CT)</div>
          <div className="card-value">{meter.powerKw?.toFixed(2) ?? '--'}</div>
          <div className="card-label">kW (Emporia)</div>
        </div>
        <div className="card stat-card">
          <div className="card-title">LOCAL COP</div>
          <div className="card-value warning">{formatCop(meter.cop)}</div>
          <div className="card-label">BTU / kW</div>
        </div>
        <div className="card stat-card">
          <div className="card-title">STATUS</div>
          <div className={`card-value ${meter.status === 'online' ? 'text-green' : 'text-dim'}`}>
            {meter.status.toUpperCase()}
          </div>
          <div className="card-label">Sensor status</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-title">SENSOR INFO</div>
        <div className="sprite-stats" style={{ marginTop: '12px' }}>
          <div>Supply Sensor: <span>DS18B20 (OneWire)</span></div>
          <div>Return Sensor: <span>DS18B20 (OneWire)</span></div>
          <div>Flow Meter: <span>GREDIA Hall Effect</span></div>
          <div>Calculation: <span>BTU/hr = 500 x GPM x Delta T</span></div>
        </div>
      </div>
    </div>
  );
}

function ExportView() {
  const { state } = useHvac();
  const [range, setRange] = useState<HistoryRange>('month');
  const [selectedMeters, setSelectedMeters] = useState<MeterId[]>(Object.keys(state.meters) as MeterId[]);

  const toggleMeter = (meterId: MeterId) => {
    setSelectedMeters(prev => (
      prev.includes(meterId) ? prev.filter(id => id !== meterId) : [...prev, meterId]
    ));
  };

  const handleExportCsv = () => {
    const now = new Date();
    const rows: string[] = ['timestamp,meterId,meterName,btu'];
    const count = range === 'week' ? 7 : range === 'month' ? 30 : 12;

    selectedMeters.forEach(meterId => {
      const meter = state.meters[meterId];
      const base = Math.max(8000, meter.btu ?? 12000);
      const series = generateHistorySeries(range, base, base * 0.2);

      series.forEach((point, index) => {
        const date = new Date(now);
        if (range === 'year') {
          date.setMonth(now.getMonth() - (count - 1 - index));
        } else {
          date.setDate(now.getDate() - (count - 1 - index));
        }
        rows.push(`${date.toISOString()},${meter.id},${meter.name},${point.value.toFixed(0)}`);
      });
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hvac-export-${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="font-pixel text-green glow-green" style={{ marginBottom: '16px' }}>
        Export Data
      </h2>
      <p className="text-dim" style={{ marginBottom: '24px' }}>
        Export CSV (Excel-friendly) for selected meters.
      </p>

      <div className="card">
        <div className="card-title">EXPORT OPTIONS</div>
        <div className="export-controls">
          <div>
            <div className="text-dim" style={{ marginBottom: '8px' }}>Range</div>
            <div className="range-toggle">
              {(['week', 'month', 'year'] as HistoryRange[]).map(value => (
                <button
                  key={value}
                  type="button"
                  className={`range-button ${range === value ? 'active' : ''}`}
                  onClick={() => setRange(value)}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-dim" style={{ marginBottom: '8px' }}>Meters</div>
            <div className="export-meter-grid">
              {Object.values(state.meters).map(meter => (
                <label key={meter.id} className="export-meter">
                  <input
                    type="checkbox"
                    checked={selectedMeters.includes(meter.id)}
                    onChange={() => toggleMeter(meter.id)}
                  />
                  {meter.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <button type="button" className="range-button export-button" onClick={handleExportCsv}>
          Export CSV for Excel
        </button>
      </div>
    </div>
  );
}

// ===== CONTENT ROUTER =====

function ContentArea({
  currentView,
  onOpenAreaHistory,
}: {
  currentView: string;
  onOpenAreaHistory: (areaId: AreaId) => void;
}) {
  if (currentView === 'schematic') {
    return <SchematicView onOpenAreaHistory={onOpenAreaHistory} />;
  }

  if (currentView === 'areas') {
    return <AreasOverviewView onOpenAreaHistory={onOpenAreaHistory} />;
  }

  if (currentView === 'meters') {
    return <MetersOverviewView />;
  }

  if (currentView === 'settings') {
    return <SystemSettingsView />;
  }

  if (currentView === 'about') {
    return <AboutView />;
  }

  if (currentView.startsWith('area-')) {
    const areaId = currentView.replace('area-', '') as AreaId;
    return <AreaDetailView areaId={areaId} onOpenAreaHistory={onOpenAreaHistory} />;
  }

  if (currentView.startsWith('meter-')) {
    return <MeterDetailView meterId={currentView} />;
  }

  if (currentView === 'export') {
    return <ExportView />;
  }

  return <SchematicView onOpenAreaHistory={onOpenAreaHistory} />;
}

// ===== MAIN LAYOUT =====

function AppLayout() {
  const [currentView, setCurrentView] = useState('schematic');
  const [historyArea, setHistoryArea] = useState<AreaId | null>(null);
  const [theme, setTheme] = useState<ThemeId>('retro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wallboard, setWallboard] = useState(false);

  useEffect(() => {
    document.body.classList.remove(...THEME_CLASSES);
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    if (wallboard) {
      document.body.classList.add('wallboard');
    } else {
      document.body.classList.remove('wallboard');
    }
  }, [wallboard]);

  useEffect(() => {
    if (!wallboard) return;

    const views = ['schematic', 'areas', 'meters'];
    let index = Math.max(0, views.indexOf(currentView));
    if (index === -1) {
      index = 0;
      setCurrentView(views[0]);
    }

    const interval = setInterval(() => {
      index = (index + 1) % views.length;
      setCurrentView(views[index]);
    }, 20000);

    return () => clearInterval(interval);
  }, [wallboard, currentView]);

  return (
    <div className="app-layout">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        wallboard={wallboard}
        onToggleWallboard={() => setWallboard(prev => !prev)}
      />
      <TabsBar currentView={currentView} onViewChange={setCurrentView} />
      <div className="main-content">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(prev => !prev)}
        />
        <main className="content-area">
          <ContentArea
            currentView={currentView}
            onOpenAreaHistory={(areaId) => setHistoryArea(areaId)}
          />
        </main>
      </div>
      <AlertsBar />
      {historyArea && (
        <AreaHistoryModal areaId={historyArea} onClose={() => setHistoryArea(null)} />
      )}
    </div>
  );
}

// ===== APP ROOT =====

function App() {
  return (
    <HvacProvider>
      <AppLayout />
    </HvacProvider>
  );
}

export default App;

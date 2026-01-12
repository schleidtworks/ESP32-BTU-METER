/**
 * Schematic Overlay Component
 * Interactive system piping diagram with animated flow
 *
 * System Layout (Honey Hill HVAC):
 * - Apollo 5-Ton Air-to-Water Heat Pump (MBTEK EVI Inverter)
 * - 30 Gallon Buffer Tank (thermal storage)
 * - 50 Gallon DHW Tank (indirect, pending)
 * - 3x Hydronic AHUs: Main House, Garage, Studio
 * - HBX SNO-0600 Snow Melt Controller (2 zones)
 * - 4x Grundfos ALPHA Variable Speed Pumps
 */

import { useAhus, useSnowMelt, useHeatPump, useBuffer, useSystem, useWeather } from '../../context/HvacContext';
import type { AreaId } from '../../types/hvac.types';
import type { FocusMode } from './FocusModeToggle';
import heatPumpSprite from '../../assets/sprites/heat-pump.svg';
import bufferTankColdSprite from '../../assets/sprites/buffer-tank-cold.svg';
import bufferTankWarmSprite from '../../assets/sprites/buffer-tank-warm.svg';
import bufferTankHotSprite from '../../assets/sprites/buffer-tank-hot.svg';
import ahuSprite from '../../assets/sprites/ahu-unit.svg';
import snowMeltSprite from '../../assets/sprites/snow-melt.svg';
import valveSprite from '../../assets/sprites/three-way-valve.svg';
import pumpSprite from '../../assets/sprites/pump.svg';

interface SchematicOverlayProps {
  onOpenAreaHistory: (areaId: AreaId) => void;
  focusMode: FocusMode;
}

// Temperature label component for pipe annotations
function TempLabel({ temp, x, y, type }: { temp: number | null; x: number; y: number; type: 'supply' | 'return' }) {
  if (temp === null) return null;
  const color = type === 'supply' ? 'var(--accent-red, #ff6b6b)' : 'var(--accent-cyan, #00d4ff)';
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontSize="11"
      fontFamily="var(--font-pixel)"
      textAnchor="middle"
      className="temp-label"
    >
      {temp.toFixed(0)}°F
    </text>
  );
}

// Flow indicator with GPM
function FlowLabel({ gpm, x, y }: { gpm: number; x: number; y: number }) {
  if (gpm < 0.1) return null;
  return (
    <text
      x={x}
      y={y}
      fill="var(--accent-green)"
      fontSize="9"
      fontFamily="var(--font-mono)"
      textAnchor="middle"
      className="flow-label"
    >
      {gpm.toFixed(1)} GPM
    </text>
  );
}

export function SchematicOverlay({
  onOpenAreaHistory,
  focusMode,
}: SchematicOverlayProps) {
  const ahus = useAhus();
  const snowMelt = useSnowMelt();
  const heatPump = useHeatPump();
  const buffer = useBuffer();
  const system = useSystem();
  const weather = useWeather();

  // Determine buffer tank sprite based on temperature
  const bufferTemp = buffer.temp ?? 0;
  const bufferSprite = bufferTemp <= 60
    ? bufferTankColdSprite
    : bufferTemp >= 95
      ? bufferTankHotSprite
      : bufferTankWarmSprite;

  // DHW demand: when buffer temp is below setpoint (typically 112°F for DHW)
  const dhwDemand = bufferTemp < 95;

  // Calculate flow rates
  const mainFlow = Math.max(0.5, system.totalGpm);
  const ahu1Flow = ahus.ahu1?.gpm ?? 0;
  const ahu2Flow = ahus.ahu2?.gpm ?? 0;
  const ahu3Flow = ahus.ahu3?.gpm ?? 0;
  const snowFlow = snowMelt.gpm ?? 0;

  // Animation speed based on flow rate
  const flowStyle = (gpm: number) => ({
    animationDuration: `${Math.max(0.3, 2.0 - gpm / 4)}s`,
  });

  // System nodes representing physical equipment
  const nodes = [
    // === TOP ROW: Primary Loop ===
    {
      id: 'outdoor',
      label: 'OUTDOOR',
      sub: `${weather.temp?.toFixed(0) ?? '--'}°F`,
      left: '5%',
      top: '8%',
      active: true,
      focused: false,
      sprite: null,
      isInfo: true,
    },
    {
      id: 'hp',
      label: 'HEAT PUMP',
      sub: `Apollo 5T ${heatPump.mode.toUpperCase()}`,
      left: '18%',
      top: '15%',
      active: heatPump.running,
      focused: focusMode === 'balanced' || focusMode === 'heating',
      sprite: heatPumpSprite,
      temp: heatPump.supplyTemp,
    },
    {
      id: 'main-pump',
      label: 'PRIMARY',
      sub: 'Grundfos α',
      left: '32%',
      top: '15%',
      active: heatPump.running,
      focused: focusMode === 'heating' || focusMode === 'cooling',
      sprite: pumpSprite,
    },
    {
      id: 'valve',
      label: '3-WAY VALVE',
      sub: dhwDemand ? '→ DHW' : '→ SPACE',
      left: '46%',
      top: '15%',
      active: true,
      focused: focusMode === 'dhw',
      sprite: valveSprite,
    },
    {
      id: 'buffer',
      label: 'BUFFER',
      sub: `30 gal ${bufferTemp.toFixed(0)}°F`,
      left: '60%',
      top: '15%',
      active: true,
      focused: focusMode === 'dhw',
      sprite: bufferSprite,
    },
    {
      id: 'dhw',
      label: 'DHW TANK',
      sub: '50 gal (planned)',
      left: '76%',
      top: '15%',
      active: false,
      focused: focusMode === 'dhw',
      sprite: bufferTankWarmSprite,
      isPlanned: true,
    },

    // === MIDDLE ROW: Header & Zone Pumps ===
    {
      id: 'header',
      label: 'SUPPLY HEADER',
      sub: 'Distribution',
      left: '46%',
      top: '38%',
      active: heatPump.running,
      focused: focusMode !== 'balanced',
      sprite: valveSprite,
    },
    {
      id: 'pump1',
      label: 'PUMP 1',
      sub: `${ahu1Flow.toFixed(1)} GPM`,
      left: '18%',
      top: '38%',
      active: ahus.ahu1?.pumpOn ?? false,
      focused: focusMode === 'heating' || focusMode === 'cooling',
      sprite: pumpSprite,
    },
    {
      id: 'pump2',
      label: 'PUMP 2',
      sub: `${(ahu2Flow + ahu3Flow).toFixed(1)} GPM`,
      left: '32%',
      top: '38%',
      active: (ahus.ahu2?.pumpOn ?? false) || (ahus.ahu3?.pumpOn ?? false),
      focused: focusMode === 'heating' || focusMode === 'cooling',
      sprite: pumpSprite,
    },
    {
      id: 'pump3',
      label: 'PUMP 3',
      sub: `${snowFlow.toFixed(1)} GPM`,
      left: '76%',
      top: '38%',
      active: snowMelt.pumpOn,
      focused: focusMode === 'heating',
      sprite: pumpSprite,
    },
    {
      id: 'hbx',
      label: 'HBX CTRL',
      sub: snowMelt.hbxMode ?? 'OFF',
      left: '90%',
      top: '38%',
      active: snowMelt.pumpOn,
      focused: focusMode === 'heating',
      sprite: valveSprite,
    },

    // === BOTTOM ROW: Load Equipment ===
    {
      id: 'ahu1',
      label: 'AHU 1',
      sub: 'Main House',
      left: '18%',
      top: '62%',
      active: ahus.ahu1?.pumpOn ?? false,
      areaId: 'main-house' as AreaId,
      focused: focusMode === 'heating' || focusMode === 'cooling',
      sprite: ahuSprite,
      btu: ahus.ahu1?.btu ?? 0,
    },
    {
      id: 'ahu2',
      label: 'AHU 2',
      sub: 'Garage',
      left: '32%',
      top: '62%',
      active: ahus.ahu2?.pumpOn ?? false,
      areaId: 'garage' as AreaId,
      focused: focusMode === 'heating' || focusMode === 'cooling',
      sprite: ahuSprite,
      btu: ahus.ahu2?.btu ?? 0,
    },
    {
      id: 'ahu3',
      label: 'AHU 3',
      sub: 'Studio',
      left: '46%',
      top: '62%',
      active: ahus.ahu3?.pumpOn ?? false,
      areaId: 'studio' as AreaId,
      focused: focusMode === 'heating' || focusMode === 'cooling',
      sprite: ahuSprite,
      btu: ahus.ahu3?.btu ?? 0,
    },
    {
      id: 'snow',
      label: 'SNOW MELT',
      sub: 'HBX Loop',
      left: '76%',
      top: '62%',
      active: snowMelt.pumpOn,
      areaId: 'snow-melt' as AreaId,
      focused: focusMode === 'heating',
      sprite: snowMeltSprite,
      btu: snowMelt.btu ?? 0,
    },

    // === SNOW MELT ZONES ===
    {
      id: 'tenant-walk',
      label: 'ZONE A',
      sub: 'Tenant Walk',
      left: '68%',
      top: '85%',
      active: snowMelt.pumpOn,
      focused: focusMode === 'heating',
      sprite: snowMeltSprite,
      areaId: 'snow-melt' as AreaId,
    },
    {
      id: 'main-walk',
      label: 'ZONE B',
      sub: 'Main Walk',
      left: '84%',
      top: '85%',
      active: snowMelt.pumpOn,
      focused: focusMode === 'heating',
      sprite: snowMeltSprite,
      areaId: 'snow-melt' as AreaId,
    },

    // === RETURN HEADER ===
    {
      id: 'return-header',
      label: 'RETURN',
      sub: `${heatPump.returnTemp?.toFixed(0) ?? '--'}°F`,
      left: '46%',
      top: '82%',
      active: heatPump.running,
      focused: false,
      sprite: null,
      isInfo: true,
    },
  ];

  return (
    <div className="schematic-board">
      {/* System Title */}
      <div className="schematic-title">
        <span className="schematic-title-main">HONEY HILL HVAC SYSTEM</span>
        <span className="schematic-title-sub">
          {heatPump.running ? '● ACTIVE' : '○ STANDBY'} |
          COP: {system.liveCop?.toFixed(2) ?? '--'} |
          Total: {system.totalBtu.toLocaleString()} BTU/hr
        </span>
      </div>

      {/* SVG Piping Diagram */}
      <svg className="pipes-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        {/* Definitions for markers and gradients */}
        <defs>
          {/* Flow direction arrows */}
          <marker id="arrow-supply" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-red, #ff6b6b)" />
          </marker>
          <marker id="arrow-return" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-cyan, #00d4ff)" />
          </marker>

          {/* Pipe gradients */}
          <linearGradient id="supply-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-red, #ff6b6b)" />
            <stop offset="100%" stopColor="var(--accent-orange, #ffa94d)" />
          </linearGradient>
          <linearGradient id="return-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-cyan, #00d4ff)" />
            <stop offset="100%" stopColor="var(--accent-blue, #4da6ff)" />
          </linearGradient>
        </defs>

        {/* ======= PRIMARY LOOP (Heat Pump → Buffer) ======= */}
        {/* HP Supply to Primary Pump */}
        <path
          className={`pipe supply ${heatPump.running ? 'flow' : 'inactive'}`}
          style={flowStyle(mainFlow)}
          d="M200 90 H320"
          strokeWidth="4"
        />
        {/* Primary Pump to 3-Way Valve */}
        <path
          className={`pipe supply ${heatPump.running ? 'flow' : 'inactive'}`}
          style={flowStyle(mainFlow)}
          d="M360 90 H440"
          strokeWidth="4"
        />
        {/* 3-Way to Buffer */}
        <path
          className={`pipe supply ${heatPump.running ? 'flow' : 'inactive'}`}
          style={flowStyle(mainFlow)}
          d="M490 90 H570"
          strokeWidth="4"
        />
        {/* Buffer to DHW (future) */}
        <path
          className="pipe supply inactive"
          d="M630 90 H720"
          strokeWidth="3"
          strokeDasharray="8,4"
          opacity="0.4"
        />

        {/* ======= SUPPLY HEADER DISTRIBUTION ======= */}
        {/* Buffer down to Header */}
        <path
          className={`pipe supply ${heatPump.running ? 'flow' : 'inactive'}`}
          style={flowStyle(mainFlow)}
          d="M600 120 V200 H460"
          strokeWidth="4"
        />

        {/* Header horizontal main line */}
        <path
          className={`pipe supply ${heatPump.running ? 'flow' : 'inactive'}`}
          style={flowStyle(mainFlow)}
          d="M180 230 H760"
          strokeWidth="5"
        />

        {/* ======= ZONE BRANCHES ======= */}
        {/* AHU 1 Branch */}
        <path
          className={`pipe supply ${ahus.ahu1?.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(ahu1Flow)}
          d="M180 230 V280"
          strokeWidth="3"
        />
        <path
          className={`pipe supply ${ahus.ahu1?.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(ahu1Flow)}
          d="M180 320 V370"
          strokeWidth="3"
        />

        {/* AHU 2 Branch */}
        <path
          className={`pipe supply ${ahus.ahu2?.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(ahu2Flow)}
          d="M320 230 V280"
          strokeWidth="3"
        />
        <path
          className={`pipe supply ${ahus.ahu2?.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(ahu2Flow)}
          d="M320 320 V370"
          strokeWidth="3"
        />

        {/* AHU 3 Branch */}
        <path
          className={`pipe supply ${ahus.ahu3?.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(ahu3Flow)}
          d="M460 230 V370"
          strokeWidth="3"
        />

        {/* Snow Melt Branch */}
        <path
          className={`pipe supply ${snowMelt.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(snowFlow)}
          d="M760 230 V280"
          strokeWidth="3"
        />
        <path
          className={`pipe supply ${snowMelt.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(snowFlow)}
          d="M760 320 V370"
          strokeWidth="3"
        />

        {/* Snow Melt to Zones */}
        <path
          className={`pipe supply ${snowMelt.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(snowFlow)}
          d="M760 410 V480"
          strokeWidth="3"
        />
        <path
          className={`pipe supply ${snowMelt.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(snowFlow)}
          d="M760 480 H680"
          strokeWidth="2"
        />
        <path
          className={`pipe supply ${snowMelt.pumpOn ? 'flow' : 'inactive'}`}
          style={flowStyle(snowFlow)}
          d="M760 480 H840"
          strokeWidth="2"
        />

        {/* ======= RETURN PIPING ======= */}
        {/* Return Header */}
        <path
          className={`pipe return ${heatPump.running ? 'flow-reverse' : 'inactive'}`}
          style={flowStyle(mainFlow)}
          d="M180 530 H760"
          strokeWidth="5"
        />

        {/* AHU Returns */}
        <path
          className={`pipe return ${ahus.ahu1?.pumpOn ? 'flow-reverse' : 'inactive'}`}
          style={flowStyle(ahu1Flow)}
          d="M180 410 V530"
          strokeWidth="3"
        />
        <path
          className={`pipe return ${ahus.ahu2?.pumpOn ? 'flow-reverse' : 'inactive'}`}
          style={flowStyle(ahu2Flow)}
          d="M320 410 V530"
          strokeWidth="3"
        />
        <path
          className={`pipe return ${ahus.ahu3?.pumpOn ? 'flow-reverse' : 'inactive'}`}
          style={flowStyle(ahu3Flow)}
          d="M460 410 V530"
          strokeWidth="3"
        />

        {/* Snow Melt Return */}
        <path
          className={`pipe return ${snowMelt.pumpOn ? 'flow-reverse' : 'inactive'}`}
          style={flowStyle(snowFlow)}
          d="M800 480 V530 H760"
          strokeWidth="2"
        />

        {/* Return to Heat Pump */}
        <path
          className={`pipe return ${heatPump.running ? 'flow-reverse' : 'inactive'}`}
          style={flowStyle(mainFlow)}
          d="M460 530 V560 H100 V130 H180"
          strokeWidth="4"
        />

        {/* ======= TEMPERATURE LABELS ======= */}
        <TempLabel temp={heatPump.supplyTemp} x={260} y={80} type="supply" />
        <TempLabel temp={bufferTemp} x={600} y={80} type="supply" />
        <TempLabel temp={heatPump.returnTemp} x={100} y={340} type="return" />

        {/* ======= FLOW LABELS ======= */}
        <FlowLabel gpm={mainFlow} x={400} y={75} />
        <FlowLabel gpm={ahu1Flow} x={200} y={350} />
        <FlowLabel gpm={ahu2Flow + ahu3Flow} x={390} y={350} />
        <FlowLabel gpm={snowFlow} x={780} y={350} />

        {/* System Stats Box */}
        <rect x="850" y="20" width="140" height="80" rx="4" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth="1" />
        <text x="920" y="40" fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-pixel)" textAnchor="middle">SYSTEM STATS</text>
        <text x="920" y="58" fill="var(--accent-green)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
          {system.totalGpm.toFixed(1)} GPM
        </text>
        <text x="920" y="75" fill="var(--accent-yellow)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
          {system.totalPowerKw?.toFixed(2) ?? '--'} kW
        </text>
        <text x="920" y="92" fill="var(--accent-cyan)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
          {system.totalBtu.toLocaleString()} BTU
        </text>
      </svg>

      {/* Equipment Nodes */}
      {nodes.map(node => {
        const isClickable = Boolean(node.areaId);
        const nodeClasses = [
          'schematic-node',
          node.active ? 'active' : '',
          node.focused ? 'focused' : '',
          isClickable ? 'clickable' : '',
          node.isInfo ? 'info-node' : '',
          node.isPlanned ? 'planned' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={node.id}
            className={nodeClasses}
            style={{ left: node.left, top: node.top }}
            onClick={() => node.areaId && onOpenAreaHistory(node.areaId)}
            onKeyDown={(event) => {
              if (node.areaId && (event.key === 'Enter' || event.key === ' ')) {
                onOpenAreaHistory(node.areaId);
              }
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
          >
            {node.sprite && <img className="schematic-sprite" src={node.sprite} alt="" />}
            <div className="schematic-node-title">{node.label}</div>
            <div className="schematic-node-sub">{node.sub}</div>
            {node.btu !== undefined && node.btu > 0 && (
              <div className="schematic-node-btu">{(node.btu / 1000).toFixed(1)}k BTU</div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="schematic-legend">
        <div className="legend-item">
          <span className="legend-pipe supply-sample" />
          <span>Supply (Hot)</span>
        </div>
        <div className="legend-item">
          <span className="legend-pipe return-sample" />
          <span>Return (Cool)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot active" />
          <span>Active</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot inactive" />
          <span>Standby</span>
        </div>
      </div>
    </div>
  );
}

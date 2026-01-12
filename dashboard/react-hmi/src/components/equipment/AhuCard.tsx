/**
 * AHU Card Component
 * Air Handler Unit status display
 */

import { AREAS } from '../../config/system.config';
import { formatTemp, formatBtu } from '../../utils/formatters';
import type { AhuState, AreaId } from '../../types/hvac.types';
import ahuSprite from '../../assets/sprites/ahu-unit.svg';

interface AhuCardProps {
  ahu: AhuState;
}

export function AhuCard({ ahu }: AhuCardProps) {
  const isRunning = ahu.pumpOn || ahu.fanOn;

  return (
    <div className={`card equipment-card ${isRunning ? 'running' : ''}`}>
      <div className="card-title">{ahu.name}</div>
      <div className="card-subtitle">{AREAS[ahu.area as AreaId]?.name}</div>
      <div className="equipment-icon">
        <img className={`sprite-img ${ahu.fanOn ? 'fan-spinning' : ''}`} src={ahuSprite} alt="AHU" />
      </div>
      <div className={`equipment-status ${isRunning ? 'on' : 'off'}`}>
        {isRunning ? 'RUNNING' : 'STANDBY'}
      </div>
      <div className="sprite-stats">
        <div>Delta T: <span>{formatTemp(ahu.deltaT)}</span></div>
        <div>BTU/hr: <span>{formatBtu(ahu.btu)}</span></div>
        <div>Flow: <span>{ahu.gpm.toFixed(1)} GPM</span></div>
      </div>
    </div>
  );
}

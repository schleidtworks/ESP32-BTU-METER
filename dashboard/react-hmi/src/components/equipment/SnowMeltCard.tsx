/**
 * Snow Melt Card Component
 * Snow melt circuit status display
 */

import { useSnowMelt } from '../../context/HvacContext';
import { formatTemp, formatBtu } from '../../utils/formatters';
import snowMeltSprite from '../../assets/sprites/snow-melt.svg';

export function SnowMeltCard() {
  const snowMelt = useSnowMelt();
  const isActive = snowMelt.pumpOn || (snowMelt.btu && snowMelt.btu > 0);

  return (
    <div className={`card equipment-card ${isActive ? 'running' : ''}`}>
      <div className="card-title">SNOW MELT</div>
      <div className="card-subtitle">HBX SNO-0600 Controller</div>
      <div className="equipment-icon">
        <img className={`sprite-img ${isActive ? 'snowflake-blink' : ''}`} src={snowMeltSprite} alt="Snow melt" />
      </div>
      <div className={`equipment-status ${snowMelt.hbxMode === 'melt' ? 'on' : snowMelt.hbxMode === 'idle' ? 'standby' : 'off'}`}>
        {snowMelt.hbxMode?.toUpperCase() || 'OFF'}
      </div>
      <div className="sprite-stats">
        <div>Loop Temp: <span>{formatTemp(snowMelt.loopTemp)}</span></div>
        <div>Slab Temp: <span>{formatTemp(snowMelt.slabTemp)}</span></div>
        <div>BTU/hr: <span>{formatBtu(snowMelt.btu)}</span></div>
        <div>Flow: <span>{snowMelt.gpm.toFixed(1)} GPM</span></div>
        {snowMelt.mixingValvePos !== null && (
          <div>Mix Valve: <span>{snowMelt.mixingValvePos?.toFixed(0)}%</span></div>
        )}
      </div>
    </div>
  );
}

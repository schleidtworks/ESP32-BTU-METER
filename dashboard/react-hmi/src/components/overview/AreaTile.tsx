/**
 * Area Tile Component
 * Individual area card for overview grid
 */

import { useAhus, useSnowMelt } from '../../context/HvacContext';
import { AREAS } from '../../config/system.config';
import { formatBtu } from '../../utils/formatters';
import type { AreaId } from '../../types/hvac.types';
import { getAreaStats } from './AreaHeatmap';

interface AreaTileProps {
  areaId: AreaId;
  onOpen: (areaId: AreaId) => void;
}

export function AreaTile({ areaId, onOpen }: AreaTileProps) {
  const ahus = useAhus();
  const snowMelt = useSnowMelt();
  const area = AREAS[areaId];
  const stats = getAreaStats(areaId, ahus, snowMelt);

  return (
    <div
      className="area-tile"
      onClick={() => onOpen(areaId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onOpen(areaId);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="area-tile-header">
        <span className="area-icon">{area.icon}</span>
        <div>
          <div className="area-title">{area.name}</div>
          <div className="area-subtitle">{area.description}</div>
        </div>
      </div>
      <div className="area-tile-metrics">
        <div>
          <div className="text-dim">BTU/hr</div>
          <div className="card-value">{formatBtu(stats.btu)}</div>
        </div>
        <div>
          <div className="text-dim">Flow</div>
          <div className="card-value">{stats.gpm.toFixed(1)} GPM</div>
        </div>
      </div>
      <div className="area-tile-footer">Tap to view history</div>
    </div>
  );
}

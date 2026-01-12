/**
 * Area Heatmap Component
 * Visual heatmap of area BTU output
 */

import { useAhus, useSnowMelt } from '../../context/HvacContext';
import { AREAS } from '../../config/system.config';
import { formatBtu } from '../../utils/formatters';
import type { AreaId } from '../../types/hvac.types';

interface AreaHeatmapProps {
  onOpenAreaHistory: (areaId: AreaId) => void;
}

function getAreaStats(areaId: AreaId, ahus: Record<string, any>, snowMelt: any) {
  if (areaId === 'snow-melt') {
    return {
      btu: snowMelt.btu ?? 0,
      gpm: snowMelt.gpm ?? 0,
    };
  }

  let btu = 0;
  let gpm = 0;
  Object.values(ahus).forEach(ahu => {
    if (ahu.area === areaId) {
      btu += ahu.btu ?? 0;
      gpm += ahu.gpm ?? 0;
    }
  });

  return { btu, gpm };
}

export function AreaHeatmap({ onOpenAreaHistory }: AreaHeatmapProps) {
  const ahus = useAhus();
  const snowMelt = useSnowMelt();
  const areas = Object.values(AREAS);
  const stats = areas.map(area => ({
    area,
    ...getAreaStats(area.id, ahus, snowMelt),
  }));
  const maxBtu = Math.max(1, ...stats.map(item => item.btu));

  return (
    <div className="heatmap-grid">
      {stats.map(item => {
        const intensity = item.btu / maxBtu;
        const heat = 0.08 + intensity * 0.35;
        return (
          <button
            key={item.area.id}
            type="button"
            className="heatmap-card"
            style={{ background: `linear-gradient(135deg, rgba(68,255,136,${heat}), rgba(10,10,18,0.9))` }}
            onClick={() => onOpenAreaHistory(item.area.id)}
          >
            <div className="heatmap-title">{item.area.name}</div>
            <div className="heatmap-value">{formatBtu(item.btu)} BTU/hr</div>
            <div className="heatmap-sub">{item.gpm.toFixed(1)} GPM</div>
          </button>
        );
      })}
    </div>
  );
}

export { getAreaStats };

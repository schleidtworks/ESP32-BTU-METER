/**
 * Buffer Tank Card Component
 * Buffer tank status display with temperature gauge
 */

import { useBuffer } from '../../context/HvacContext';
import { formatTemp } from '../../utils/formatters';
import { Gauge } from '../common';
import bufferTankColdSprite from '../../assets/sprites/buffer-tank-cold.svg';
import bufferTankWarmSprite from '../../assets/sprites/buffer-tank-warm.svg';
import bufferTankHotSprite from '../../assets/sprites/buffer-tank-hot.svg';

export function BufferTankCard() {
  const buffer = useBuffer();
  const temp = buffer.temp ?? 0;
  const tankSprite = temp <= 60
    ? bufferTankColdSprite
    : temp >= 95
      ? bufferTankHotSprite
      : bufferTankWarmSprite;
  const recoveryMin = temp ? Math.max(8, Math.min(60, Math.round((110 - temp) * 0.9))) : null;

  return (
    <div className="card equipment-card">
      <div className="card-title">BUFFER TANK</div>
      <div className="card-subtitle">30 Gallon</div>
      <div className="equipment-icon">
        <img className="sprite-img" src={tankSprite} alt="Buffer tank" />
      </div>
      <div className="sprite-stats">
        <div>Temp: <span>{formatTemp(buffer.temp)}</span></div>
        <div>Pressure: <span>{buffer.pressure?.toFixed(1) ?? '--'} PSI</span></div>
        <div>Avg Recovery: <span>{recoveryMin ? `${recoveryMin} min` : '--'}</span></div>
      </div>
      <Gauge
        value={buffer.pressure ?? 15}
        min={0}
        max={30}
        lowThreshold={10}
        highThreshold={25}
      />
    </div>
  );
}

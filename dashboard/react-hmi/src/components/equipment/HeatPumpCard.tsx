/**
 * Heat Pump Card Component
 * Main heat pump status display
 */

import { useHeatPump } from '../../context/HvacContext';
import { formatTemp } from '../../utils/formatters';
import heatPumpSprite from '../../assets/sprites/heat-pump.svg';

export function HeatPumpCard() {
  const hp = useHeatPump();

  return (
    <div className={`card equipment-card ${hp.mode}`}>
      <div className="card-title">APOLLO 5-TON</div>
      <div className="card-subtitle">Air-to-Water Heat Pump</div>
      <div className="equipment-icon">
        <img className="sprite-img" src={heatPumpSprite} alt="Heat pump" />
      </div>
      <div className={`equipment-status ${hp.mode}`}>
        {hp.mode.toUpperCase()}
      </div>
      <div className="sprite-stats">
        <div>Supply: <span className="text-hot">{formatTemp(hp.supplyTemp)}</span></div>
        <div>Return: <span className="text-cold">{formatTemp(hp.returnTemp)}</span></div>
        <div>Delta T: <span>{formatTemp(hp.deltaT)}</span></div>
        <div>Power: <span>{hp.powerKw?.toFixed(2) ?? '--'} kW</span></div>
      </div>
    </div>
  );
}

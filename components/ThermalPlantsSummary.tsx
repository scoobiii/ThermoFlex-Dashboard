import React from 'react';
import DashboardCard from './DashboardCard';
import { POWER_PLANTS } from '../data/plants';
// FIX: Import FlameIcon to use as the icon for the DashboardCard.
import { FlameIcon } from './icons';

const MetricItem: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center p-2">
    <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
    <p className="text-xs md:text-sm text-gray-400 truncate">{label}</p>
  </div>
);

const ThermalPlantsSummary: React.FC = () => {
  const thermalPlants = POWER_PLANTS.filter(p => p.type !== 'standard');

  const totalPlants = thermalPlants.length;
  const totalPower = thermalPlants.reduce((acc, plant) => acc + plant.power, 0);
  const totalEthanolDemand = thermalPlants.reduce((acc, plant) => acc + (plant.ethanolDemand || 0), 0);
  const newConstructions = thermalPlants.filter(p => p.status === 'Proposta').length;

  return (
    <DashboardCard title="Resumo das Térmicas" icon={<FlameIcon className="w-6 h-6" />}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full items-center">
        <MetricItem value={totalPlants} label="Total de Usinas" />
        <MetricItem value={totalPlants} label="Compatíveis Etanol" />
        <MetricItem value={`${totalPower.toLocaleString('pt-BR')} MW`} label="Potência Total" />
        <MetricItem value={`${totalEthanolDemand.toFixed(1).replace('.',',')} m³/h`} label="Demanda Etanol" />
        <MetricItem value={newConstructions} label="Novas Construções" />
      </div>
    </DashboardCard>
  );
};

export default ThermalPlantsSummary;
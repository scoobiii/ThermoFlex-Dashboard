import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { POWER_PLANTS } from '../data/plants';
import ThermalPlantsSummary from '../components/ThermalPlantsSummary';
import PlantsMap from '../components/PlantsMap';
import { WrenchScrewdriverIcon } from '../components/icons';

interface ConfigurationProps {
  selectedPlantName: string;
  setSelectedPlantName: (name: string) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({
  selectedPlantName,
  setSelectedPlantName,
}) => {

  const selectedPlant = POWER_PLANTS.find(p => p.name === selectedPlantName);

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard title="Seleção de Usina" icon={<WrenchScrewdriverIcon className="w-6 h-6" />}>
        <div className="flex flex-col h-full">
          <div className="space-y-2 mb-4">
            <label htmlFor="plant-select" className="block text-sm font-medium text-gray-300">
              Selecione a usina:
            </label>
            <select
              id="plant-select"
              value={selectedPlantName}
              onChange={(e) => setSelectedPlantName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
            >
              {POWER_PLANTS.map(plant => (
                <option key={plant.name} value={plant.name}>
                  {plant.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow">
            {selectedPlant && (
              <div className="bg-gray-800 p-4 rounded-lg text-sm space-y-2 h-full flex flex-col justify-center">
                <h4 className="font-semibold text-lg text-white mb-2">{selectedPlant.name.replace(' (standard)','')}</h4>
                {selectedPlant.type !== 'standard' ? (
                  <>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <p><span className="font-semibold text-gray-400">Local:</span> {selectedPlant.location}</p>
                      <p><span className="font-semibold text-gray-400">Potência:</span> {selectedPlant.power} MW</p>
                      <p><span className="font-semibold text-gray-400">Combustível:</span> {selectedPlant.fuel}</p>
                      <p><span className="font-semibold text-gray-400">Status:</span> {selectedPlant.status}</p>
                    </div>
                    <p className="text-gray-300 pt-2 border-t border-gray-700 mt-2">{selectedPlant.description}</p>
                  </>
                ) : (
                   <p className="text-gray-400">Configuração padrão da Usina Bio-Termoelétrica.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardCard>
      
      <PlantsMap coordinates={selectedPlant?.coordinates} />

      <div className="lg:col-span-2">
        <ThermalPlantsSummary />
      </div>

    </div>
  );
};

export default Configuration;
import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { POWER_PLANTS } from '../data/plants';
import ThermalPlantsSummary from '../components/ThermalPlantsSummary';
import PlantsMap from '../components/PlantsMap';
import { WrenchScrewdriverIcon } from '../components/icons';
import { FuelMode } from '../types';

interface ConfigurationProps {
  selectedPlantName: string;
  setSelectedPlantName: (name: string) => void;
  fuelMode: FuelMode;
  setFuelMode: (mode: FuelMode) => void;
  flexMix: { h2: number; biodiesel: number };
  setFlexMix: (updater: React.SetStateAction<{ h2: number; biodiesel: number }>) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({
  selectedPlantName,
  setSelectedPlantName,
  fuelMode,
  setFuelMode,
  flexMix,
  setFlexMix,
}) => {
  const selectedPlant = POWER_PLANTS.find(p => p.name === selectedPlantName);
  const showH2Slider = fuelMode === FuelMode.FlexNGH2;
  const showBiodieselSlider = fuelMode === FuelMode.FlexEthanolBiodiesel;

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard title="Configuração da Usina" icon={<WrenchScrewdriverIcon className="w-6 h-6" />}>
        <div className="flex flex-col h-full">
          <div className="space-y-4 mb-4">
            <div>
              <label htmlFor="plant-select" className="block text-sm font-medium text-gray-300 mb-1">
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
            
            <div>
              <label htmlFor="fuel-select" className="block text-sm font-medium text-gray-300 mb-1">
                Modo de combustível:
              </label>
              <select
                id="fuel-select"
                value={fuelMode}
                onChange={(e) => setFuelMode(e.target.value as FuelMode)}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
              >
                {Object.values(FuelMode).map(mode => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(showH2Slider || showBiodieselSlider) && (
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-1">
                Ajuste de Mix Flexível
              </h4>
              {showH2Slider && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="h2MixConfig" className="text-sm font-medium text-gray-300">Hidrogênio (H₂)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            id="h2MixConfigInput"
                            min="0"
                            max="100"
                            value={flexMix.h2}
                            onChange={(e) => {
                                const value = Math.max(0, Math.min(100, Number(e.target.value)));
                                setFlexMix(prev => ({ ...prev, h2: value }));
                            }}
                            className="w-20 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5 text-center font-mono"
                            aria-label="Valor do mix de Hidrogênio"
                        />
                        <span className="text-lg font-mono font-semibold text-emerald-400">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    id="h2MixConfig"
                    min="0"
                    max="100"
                    value={flexMix.h2}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, h2: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    aria-label="Ajustar mix de Hidrogênio"
                  />
                </div>
              )}
              {showBiodieselSlider && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="biodieselMixConfig" className="text-sm font-medium text-gray-300">Biodiesel</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            id="biodieselMixConfigInput"
                            min="0"
                            max="100"
                            value={flexMix.biodiesel}
                            onChange={(e) => {
                                const value = Math.max(0, Math.min(100, Number(e.target.value)));
                                setFlexMix(prev => ({ ...prev, biodiesel: value }));
                            }}
                            className="w-20 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5 text-center font-mono"
                            aria-label="Valor do mix de Biodiesel"
                        />
                        <span className="text-lg font-mono font-semibold text-green-500">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    id="biodieselMixConfig"
                    min="0"
                    max="100"
                    value={flexMix.biodiesel}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, biodiesel: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                    aria-label="Ajustar mix de Biodiesel"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex-grow mt-4">
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

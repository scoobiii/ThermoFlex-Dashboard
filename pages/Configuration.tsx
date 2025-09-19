
import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { FuelMode, TurbineStatus } from '../types';
import { TurbineStatusConfig } from '../App';

interface ConfigurationProps {
  fuelMode: FuelMode;
  setFuelMode: (mode: FuelMode) => void;
  flexMix: { h2: number; biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
  turbineStatusConfig: TurbineStatusConfig;
  // FIX: Updated the type of setTurbineStatusConfig to correctly handle state updates with a function.
  setTurbineStatusConfig: React.Dispatch<React.SetStateAction<TurbineStatusConfig>>;
}

const Configuration: React.FC<ConfigurationProps> = ({
  fuelMode,
  setFuelMode,
  flexMix,
  setFlexMix,
  turbineStatusConfig,
  setTurbineStatusConfig,
}) => {
  const handleTurbineStatusChange = (id: number, status: TurbineStatus) => {
    setTurbineStatusConfig(prev => ({...prev, [id]: status}));
  };

  const turbineStatusLabels: {[key in TurbineStatus]: string} = {
    active: 'Ativa',
    inactive: 'Inativa',
    error: 'Erro'
  }

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard title="Configuração de Combustível">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-300">Modo de Operação</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(FuelMode).map(mode => (
              <button
                key={mode}
                onClick={() => setFuelMode(mode)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                  fuelMode === mode
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {(fuelMode === FuelMode.FlexNGH2 || fuelMode === FuelMode.FlexEthanolBiodiesel) && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h4 className="text-lg font-semibold text-gray-300 mb-2">Ajuste de Mix Flexível</h4>
              {fuelMode === FuelMode.FlexNGH2 && (
                <div>
                  <label htmlFor="h2Mix" className="block text-sm font-medium text-gray-300 mb-1">Hidrogênio (H₂) Mix: {flexMix.h2}%</label>
                  <input
                    type="range"
                    id="h2Mix"
                    min="0"
                    max="100"
                    value={flexMix.h2}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, h2: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              )}
              {fuelMode === FuelMode.FlexEthanolBiodiesel && (
                <div>
                  <label htmlFor="biodieselMix" className="block text-sm font-medium text-gray-300 mb-1">Biodiesel Mix: {flexMix.biodiesel}%</label>
                  <input
                    type="range"
                    id="biodieselMix"
                    min="0"
                    max="100"
                    value={flexMix.biodiesel}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, biodiesel: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardCard>

      <DashboardCard title="Configuração das Turbinas">
        <div className="space-y-3">
          {Object.keys(turbineStatusConfig).map(idStr => {
            const id = Number(idStr);
            return (
              <div key={id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                <span className="font-semibold text-white">Turbina #{id}</span>
                <div className="flex items-center gap-2">
                  {(['active', 'inactive', 'error'] as TurbineStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => handleTurbineStatusChange(id, status)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-cyan-500 ${
                        turbineStatusConfig[id] === status
                          ? (status === 'active' ? 'bg-green-500 text-white' : status === 'inactive' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white')
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {turbineStatusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </div>
  );
};

export default Configuration;

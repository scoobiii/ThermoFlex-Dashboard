import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { CogIcon, SnowflakeIcon, WrenchScrewdriverIcon, CircleStackIcon, GasIcon } from '../components/icons';
import { FuelMode } from '../types';
import { TurbineStatusConfig, TurbineStatus } from '../App';

interface ConfigurationProps {
  fuelMode: FuelMode;
  setFuelMode: (mode: FuelMode) => void;
  flexMix: { h2: number; biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
  turbineStatusConfig: TurbineStatusConfig;
  setTurbineStatusConfig: React.Dispatch<React.SetStateAction<TurbineStatusConfig>>;
}

const TurbineStatusControl: React.FC<{
  turbineId: number;
  status: TurbineStatus;
  onStatusChange: (id: number, status: TurbineStatus) => void;
}> = ({ turbineId, status, onStatusChange }) => {
  const statuses: TurbineStatus[] = ['active', 'inactive', 'error'];
  const statusLabels = { active: 'Ativa', inactive: 'Inativa', error: 'Falha' };
  const statusColors = {
      active: 'bg-green-500/80 hover:bg-green-500 text-white',
      inactive: 'bg-gray-600 hover:bg-gray-500 text-gray-200',
      error: 'bg-red-500/80 hover:bg-red-500 text-white'
  };
  const activeStatusColor = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      error: 'bg-red-500'
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
      <span className="font-semibold text-gray-200">Turbina #{turbineId}</span>
      <div className="flex items-center bg-gray-700 rounded-lg p-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => onStatusChange(turbineId, s)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
              status === s ? activeStatusColor[s] + ' text-white shadow-md' : statusColors[s]
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>
    </div>
  );
};


const Configuration: React.FC<ConfigurationProps> = ({
  fuelMode, setFuelMode,
  flexMix, setFlexMix,
  turbineStatusConfig, setTurbineStatusConfig
}) => {

  const handleTurbineStatusChange = (id: number, newStatus: TurbineStatus) => {
    setTurbineStatusConfig(prev => ({ ...prev, [id]: newStatus }));
  };

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configuração do Sistema</h2>
        <p className="text-gray-400 mt-1">Ajuste os parâmetros dos equipamentos e da infraestrutura da planta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fuel Mode Configuration */}
        <DashboardCard title="Modo de Combustível" icon={<GasIcon className="w-6 h-6" />}>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-400">Selecione o modo de operação de combustível para a usina.</p>
              <div className="flex items-center flex-wrap gap-2" role="group" aria-label="Modo de Combustível">
                {Object.values(FuelMode).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFuelMode(mode)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                      fuelMode === mode
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                    }`}
                    aria-pressed={fuelMode === mode}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {(fuelMode === FuelMode.FlexNGH2 || fuelMode === FuelMode.FlexEthanolBiodiesel) && (
                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Ajuste de Mix Flexível</h4>
                  {fuelMode === FuelMode.FlexNGH2 && (
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label htmlFor="h2Mix" className="text-sm font-medium text-gray-300">Hidrogênio (H₂)</label>
                        <span className="text-lg font-mono font-semibold text-emerald-400">{flexMix.h2}%</span>
                      </div>
                      <input
                        type="range" id="h2Mix" min="0" max="100" value={flexMix.h2}
                        onChange={(e) => setFlexMix(prev => ({ ...prev, h2: Number(e.target.value) }))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        aria-label="Ajustar mix de Hidrogênio"
                      />
                    </div>
                  )}
                  {fuelMode === FuelMode.FlexEthanolBiodiesel && (
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <label htmlFor="biodieselMix" className="text-sm font-medium text-gray-300">Biodiesel</label>
                        <span className="text-lg font-mono font-semibold text-green-500">{flexMix.biodiesel}%</span>
                      </div>
                      <input
                        type="range" id="biodieselMix" min="0" max="100" value={flexMix.biodiesel}
                        onChange={(e) => setFlexMix(prev => ({ ...prev, biodiesel: Number(e.target.value) }))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                        aria-label="Ajustar mix de Biodiesel"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
        </DashboardCard>

        {/* Turbine Status Configuration */}
        <DashboardCard title="Status das Turbinas" icon={<CogIcon className="w-6 h-6" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Defina o status operacional de cada turbina individualmente.</p>
            {Object.entries(turbineStatusConfig).map(([id, status]) => (
                <TurbineStatusControl 
                  key={id} 
                  turbineId={Number(id)} 
                  status={status} 
                  onStatusChange={handleTurbineStatusChange}
                />
            ))}
          </div>
        </DashboardCard>
        
        {/* Chiller Configuration */}
        <DashboardCard title="Configuração do Chiller" icon={<SnowflakeIcon className="w-6 h-6" />}>
          <div className="space-y-4">
            <div>
              <label htmlFor="chiller-manufacturer" className="block text-sm font-medium text-gray-300">Fabricante</label>
              <select id="chiller-manufacturer" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white">
                <option>ChillerCorp A</option>
                <option>ChillerCorp B</option>
              </select>
            </div>
            <div>
              <label htmlFor="chiller-cop" className="block text-sm font-medium text-gray-300">Coeficiente de Performance (COP)</label>
              <input type="number" step="0.01" id="chiller-cop" defaultValue="0.7" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
          </div>
        </DashboardCard>
        
        {/* Infrastructure Configuration */}
        <DashboardCard title="Infraestrutura de Etanol" icon={<CircleStackIcon className="w-6 h-6" />}>
           <div className="space-y-4">
            <div>
              <label htmlFor="reservoir-capacity" className="block text-sm font-medium text-gray-300">Capacidade do Reservatório (Litros)</label>
              <input type="number" id="reservoir-capacity" defaultValue="5000000" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
            <div>
              <label htmlFor="alert-level" className="block text-sm font-medium text-gray-300">Nível de Alerta de Autonomia (%)</label>
              <input type="number" id="alert-level" defaultValue="20" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
           </div>
        </DashboardCard>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500">
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default Configuration;
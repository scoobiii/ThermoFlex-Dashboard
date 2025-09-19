import React from 'react';
import { PlantStatus } from '../types';
import { BoltIcon, ChartBarIcon } from './icons';

interface HeaderProps {
  plantStatus: PlantStatus;
  powerOutput: number;
  selectedPlantName: string;
  maxCapacity: number;
}

const Header: React.FC<HeaderProps> = ({ plantStatus, powerOutput, selectedPlantName, maxCapacity }) => {
  const statusInfo = {
    [PlantStatus.Online]: { text: 'Online', color: 'bg-green-500' },
    [PlantStatus.Offline]: { text: 'Offline', color: 'bg-red-500' },
    [PlantStatus.Maintenance]: { text: 'Manutenção', color: 'bg-yellow-500' },
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="bg-cyan-500 p-2 rounded-lg">
          <ChartBarIcon className="h-8 w-8 text-white" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white">{selectedPlantName.replace(' (standard)', '')}</h1>
            <p className="text-gray-400">Plataforma de Monitoramento Integrado</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6">
        <div className="flex items-center space-x-2">
            <BoltIcon className="h-6 w-6 text-cyan-400" />
            <div>
                <p className="text-sm font-semibold leading-tight text-cyan-400">{powerOutput.toFixed(1)} MW</p>
                <p className="text-xs text-gray-400 leading-tight">Produção Atual</p>
            </div>
        </div>
        <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
        <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
            <div>
                <p className="text-sm font-semibold leading-tight">{maxCapacity} MW</p>
                <p className="text-xs text-gray-400 leading-tight">Capacidade Máxima</p>
            </div>
        </div>
        <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
        <div className="flex items-center space-x-3">
            <span className={`h-3 w-3 rounded-full ${statusInfo[plantStatus].color} self-center`}></span>
             <div>
                <p className="text-sm font-semibold leading-tight">{statusInfo[plantStatus].text}</p>
                <p className="text-xs text-gray-400 leading-tight">Status</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

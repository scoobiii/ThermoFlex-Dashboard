import React from 'react';
import { Turbine } from '../types';
import DashboardCard from './DashboardCard';
import { CogIcon, WrenchScrewdriverIcon } from './icons';

interface TurbineStatusProps {
  turbines: Turbine[];
  onSelectTurbine: (id: number) => void;
  selectedTurbineId: number | null;
  // FIX: Add props for maximizing functionality
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const statusClasses = {
    active: 'text-green-400 border-green-400',
    inactive: 'text-gray-500 border-gray-500',
    error: 'text-red-500 border-red-500 animate-pulse'
}

const TurbineCard: React.FC<{ turbine: Turbine; isSelected: boolean; onSelect: () => void }> = ({ turbine, isSelected, onSelect }) => (
    <button 
      onClick={onSelect} 
      className={`bg-gray-700 p-3 rounded-lg flex flex-col justify-between text-left transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 w-full ${isSelected ? 'ring-2 ring-cyan-400' : 'hover:bg-gray-600'}`}
      aria-pressed={isSelected}
      aria-label={`Selecionar Turbina ${turbine.id}`}
    >
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-white">Turbina #{turbine.id}</h4>
            <span className={`text-xs font-semibold px-2 py-0.5 border rounded-full ${statusClasses[turbine.status]}`}>{turbine.status}</span>
        </div>
        <div className="grid grid-cols-3 text-center">
            <div>
                <p className="text-xs text-gray-400">RPM</p>
                <p className="font-mono font-semibold">{turbine.rpm}</p>
            </div>
             <div>
                <p className="text-xs text-gray-400">Temp (°C)</p>
                <p className="font-mono font-semibold">{turbine.temp}</p>
            </div>
             <div>
                <p className="text-xs text-gray-400">Pressão</p>
                <p className="font-mono font-semibold">{turbine.pressure} bar</p>
            </div>
        </div>
        {turbine.needsMaintenance && (
            <div className="mt-2 pt-2 border-t border-gray-600 flex items-center justify-center gap-2 text-yellow-400">
                <WrenchScrewdriverIcon className="w-4 h-4" />
                <span className="text-xs font-semibold">Manutenção Prevista</span>
            </div>
        )}
    </button>
)

const TurbineStatus: React.FC<TurbineStatusProps> = ({ 
  turbines, 
  onSelectTurbine, 
  selectedTurbineId,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
}) => {
  return (
    <DashboardCard 
      title="Status das Turbinas" 
      icon={<CogIcon className="w-6 h-6" />}
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
        <div className="flex flex-col h-full justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {turbines.map(turbine => (
                    <TurbineCard 
                    key={turbine.id} 
                    turbine={turbine}
                    isSelected={selectedTurbineId === turbine.id}
                    onSelect={() => onSelectTurbine(turbine.id)}
                    />
                ))}
            </div>
            <div className="text-xs text-center text-gray-500 mt-4 border-t border-gray-700 pt-2">
                Modelo: <strong>Siemens SGT-A35 (Aeroderivativa)</strong> | Capacidade ISO: <strong>34 MW por turbina</strong> | Total: <strong>170 MW</strong>
            </div>
        </div>
    </DashboardCard>
  );
};

export default TurbineStatus;
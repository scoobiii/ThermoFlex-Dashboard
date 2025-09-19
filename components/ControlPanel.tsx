import React from 'react';
import { FuelMode, PlantStatus } from '../types';

interface ControlPanelProps {
  fuelMode: FuelMode;
  setFuelMode: (mode: FuelMode) => void;
  plantStatus: PlantStatus;
  setPlantStatus: (status: PlantStatus) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  fuelMode,
  setFuelMode,
  plantStatus,
  setPlantStatus,
}) => {
  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
      <div className="flex items-center gap-3" role="group" aria-label="Status da Usina">
        <span className="font-semibold text-gray-300">Status da Usina:</span>
        <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
          {Object.values(PlantStatus).map((status) => (
            <button
              key={status}
              onClick={() => setPlantStatus(status)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                plantStatus === status
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
              aria-pressed={plantStatus === status}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Modo de Combustível">
        <span className="font-semibold text-gray-300 shrink-0">Modo de Combustível:</span>
        <div className="flex items-center flex-wrap gap-2">
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
      </div>
    </div>
  );
};

export default ControlPanel;

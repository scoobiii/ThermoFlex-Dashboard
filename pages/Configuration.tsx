import React, { useState, useMemo } from 'react';
import DashboardCard from '../components/DashboardCard';
import ThermalPlantsSummary from '../components/ThermalPlantsSummary';
import PlantsMap from '../components/PlantsMap';
import { WrenchScrewdriverIcon, PlusIcon, FactoryIcon } from '../components/icons';
import { FuelMode, Plant, PlantStatus, Turbine, TurbineStatus as TurbineStatusEnum } from '../types';
import { TurbineStatusConfig } from '../App';

type TurbineType = 'all' | 'Ciclo Combinado' | 'Ciclo Rankine';

const baseTurbines: Omit<Turbine, 'status'>[] = [
    { id: 1, rpm: 3600, temp: 950, pressure: 18, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500, needsMaintenance: false },
    { id: 2, rpm: 3605, temp: 955, pressure: 18.2, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500, needsMaintenance: false },
    { id: 3, rpm: 3598, temp: 965, pressure: 17.9, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500, needsMaintenance: true },
    { id: 4, rpm: 3600, temp: 940, pressure: 18.1, type: 'Ciclo Rankine', manufacturer: 'GE', model: '7HA.02', isoCapacity: 500, needsMaintenance: false },
    { id: 5, rpm: 0, temp: 80, pressure: 1, type: 'Ciclo Rankine', manufacturer: 'GE', model: '7HA.02', isoCapacity: 500, needsMaintenance: false },
];

interface ConfigurationProps {
  selectedPlantName: string;
  setSelectedPlantName: (name: string) => void;
  fuelMode: FuelMode;
  setFuelMode: (mode: FuelMode) => void;
  flexMix: { h2: number; biodiesel: number };
  setFlexMix: (updater: React.SetStateAction<{ h2: number; biodiesel: number }>) => void;
  plantStatus: PlantStatus;
  setPlantStatus: (status: PlantStatus) => void;
  turbineStatusConfig: TurbineStatusConfig;
  setTurbineStatusConfig: (updater: React.SetStateAction<TurbineStatusConfig>) => void;
  availablePlants: Plant[];
  addPlant: () => void;
  updatePlant: (plantNameToUpdate: string, updatedPlant: Plant) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({
  selectedPlantName,
  setSelectedPlantName,
  fuelMode,
  setFuelMode,
  flexMix,
  setFlexMix,
  plantStatus,
  setPlantStatus,
  turbineStatusConfig,
  setTurbineStatusConfig,
  availablePlants,
  addPlant,
  updatePlant,
}) => {
  const selectedPlantRaw = availablePlants.find(p => p.name === selectedPlantName);

  const selectedPlant = useMemo(() => {
    if (!selectedPlantRaw) return undefined;

    if (!selectedPlantRaw.identifier) {
      return {
        ...selectedPlantRaw,
        identifier: {
          type: 'location',
          value: selectedPlantRaw.location || 'Não definido',
        }
      };
    }
    return selectedPlantRaw;
  }, [selectedPlantRaw]);

  const showH2Slider = fuelMode === FuelMode.FlexNGH2;
  const showBiodieselSlider = fuelMode === FuelMode.FlexEthanolBiodiesel;

  const [turbineTypeFilter, setTurbineTypeFilter] = useState<TurbineType>('all');
  
  const filteredTurbines = useMemo(() => {
    if (turbineTypeFilter === 'all') return baseTurbines;
    return baseTurbines.filter(t => t.type === turbineTypeFilter);
  }, [turbineTypeFilter]);
  
  const handlePlantUpdate = (field: keyof Plant | `identifier.${keyof NonNullable<Plant['identifier']>}`, value: string) => {
    if (!selectedPlant || !selectedPlantRaw) return;

    let updatedPlant = { ...selectedPlant };
    
    // FIX: Explicitly handle 'type' property update to preserve its strict union type.
    // The previous generic update `[subField]: value` widened `identifier.type` to `string`,
    // causing a type mismatch with the `Plant` interface.
    if (field.startsWith('identifier.')) {
        const subField = field.split('.')[1] as keyof NonNullable<Plant['identifier']>;
        if (subField === 'type') {
            updatedPlant.identifier = {
                ...updatedPlant.identifier,
                type: value as 'location' | 'license',
            };
        } else {
            updatedPlant.identifier = {
                ...updatedPlant.identifier,
                value: value,
            };
        }
    } else if (field === 'power') {
        const numValue = parseFloat(value);
        updatedPlant.power = isNaN(numValue) ? 0 : numValue;
    } else {
        (updatedPlant[field as 'name' | 'fuel' | 'description'] as string) = value;
    }
    
    if (field === 'name') {
        updatePlant(selectedPlantRaw.name, updatedPlant);
        setSelectedPlantName(value);
    } else {
        updatePlant(selectedPlantRaw.name, updatedPlant);
    }
  };

  const handleTurbineStatusChange = (turbineId: number, status: TurbineStatusEnum) => {
    setTurbineStatusConfig(prev => ({ ...prev, [turbineId]: status }));
  };
  
  const FormInput: React.FC<{label: string, value: string, name: keyof Plant, type?: string}> = ({ label, value, name, type = 'text' }) => (
      <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
          <input
              type={type}
              value={value}
              onChange={(e) => handlePlantUpdate(name, e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2"
          />
      </div>
  );

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div className="flex flex-col gap-6 lg:col-span-1">
        <DashboardCard title="Seleção e Configuração Geral" icon={<WrenchScrewdriverIcon className="w-6 h-6" />}>
          <div className="space-y-4">
            <div>
              <label htmlFor="plant-select" className="block text-sm font-medium text-gray-300 mb-1">
                Selecione o Projeto:
              </label>
              <select
                id="plant-select"
                value={selectedPlantName}
                onChange={(e) => setSelectedPlantName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
              >
                {availablePlants.map(plant => (
                  <option key={plant.name} value={plant.name}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="fuel-select" className="block text-sm font-medium text-gray-300 mb-1">
                Modo de Combustível:
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
            <div className="space-y-4 pt-4 mt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-1">
                Ajuste de Mix Flexível
              </h4>
              {showH2Slider && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="h2MixConfig" className="text-sm font-medium text-gray-300">Hidrogênio (H₂)</label>
                    <span className="text-lg font-mono font-semibold text-emerald-400">{flexMix.h2}%</span>
                  </div>
                  <input type="range" id="h2MixConfig" min="0" max="100" value={flexMix.h2}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, h2: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-400" />
                </div>
              )}
              {showBiodieselSlider && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="biodieselMixConfig" className="text-sm font-medium text-gray-300">Biodiesel</label>
                    <span className="text-lg font-mono font-semibold text-green-500">{flexMix.biodiesel}%</span>
                  </div>
                  <input type="range" id="biodieselMixConfig" min="0" max="100" value={flexMix.biodiesel}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, biodiesel: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500" />
                </div>
              )}
            </div>
          )}
        </DashboardCard>
        
        {selectedPlant && (
            <DashboardCard title="Detalhes do Projeto" icon={<FactoryIcon className="w-6 h-6" />}>
                <div className="space-y-3">
                    <FormInput label="Nome do Projeto" value={selectedPlant.name} name="name" />
                    <FormInput label="Potência (MW)" value={String(selectedPlant.power)} name="power" type="number" />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de Identificador</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-300">
                                <input type="radio" name="identifierType" value="location" 
                                    checked={selectedPlant.identifier.type === 'location'}
                                    onChange={() => handlePlantUpdate('identifier.type', 'location')}
                                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-500 focus:ring-cyan-500" />
                                Localização
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-300">
                                <input type="radio" name="identifierType" value="license"
                                    checked={selectedPlant.identifier.type === 'license'}
                                    onChange={() => handlePlantUpdate('identifier.type', 'license')}
                                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-500 focus:ring-cyan-500" />
                                Licença ONS/ANEEL
                            </label>
                        </div>
                    </div>
                     <div>
                          <input
                              type="text"
                              placeholder={selectedPlant.identifier.type === 'location' ? 'Ex: São Paulo, SP' : 'Ex: ANEEL 12345-6'}
                              value={selectedPlant.identifier.value}
                              onChange={(e) => handlePlantUpdate('identifier.value', e.target.value)}
                              className="w-full bg-gray-900/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2"
                          />
                      </div>
                    <FormInput label="Tipo de Combustível Principal" value={selectedPlant.fuel} name="fuel" />
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                        <textarea
                            value={selectedPlant.description || ''}
                            onChange={(e) => handlePlantUpdate('description', e.target.value)}
                            className="w-full h-24 bg-gray-900/50 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2"
                        />
                    </div>
                </div>
            </DashboardCard>
        )}

        <DashboardCard title="Gestão de Projetos" icon={<WrenchScrewdriverIcon className="w-6 h-6"/>}>
            <button 
                onClick={addPlant}
                className="w-full h-full flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-cyan-400 font-semibold p-4"
            >
                <PlusIcon className="w-5 h-5"/>
                Criar Novo Projeto Padrão
            </button>
        </DashboardCard>
      </div>
      
      <div className="lg:col-span-1">
        <DashboardCard title="Controles Operacionais" icon={<WrenchScrewdriverIcon className="w-6 h-6"/>}>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Status da Usina</h4>
              <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
                {Object.values(PlantStatus).map((status) => (
                  <button key={status} onClick={() => setPlantStatus(status)}
                    className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${ plantStatus === status ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                  >{status}</button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Status das Turbinas</h4>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-sm text-gray-400">Filtrar:</span>
                  {(['all', 'Ciclo Combinado', 'Ciclo Rankine'] as TurbineType[]).map(type => (
                      <button key={type} onClick={() => setTurbineTypeFilter(type)}
                          className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${ turbineTypeFilter === type ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      >{type === 'all' ? 'Todas' : type}</button>
                  ))}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {filteredTurbines.map(turbine => (
                      <div key={turbine.id} className="bg-gray-700/50 p-2 rounded-lg flex items-center justify-between">
                          <span className="font-medium text-white text-sm">Turbina #{turbine.id} <span className="text-gray-400 text-xs">({turbine.type})</span></span>
                          <div className="flex items-center bg-gray-900/50 rounded-md p-0.5">
                            {(['active', 'inactive', 'error'] as TurbineStatusEnum[]).map(status => (
                                <button key={status} onClick={() => handleTurbineStatusChange(turbine.id, status)}
                                className={`px-2 py-0.5 text-xs font-semibold rounded transition-all ${ turbineStatusConfig[turbine.id] === status ? 'bg-cyan-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-600'}`}
                                >{status === 'active' ? 'Ativa' : status === 'inactive' ? 'Inativa' : 'Falha'}</button>
                            ))}
                          </div>
                      </div>
                  ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="lg:col-span-1">
        <PlantsMap coordinates={selectedPlant?.coordinates} />
      </div>

      <div className="lg:col-span-3">
        <ThermalPlantsSummary />
      </div>

    </div>
  );
};

export default Configuration;
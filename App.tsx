import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Navigation, { Page } from './components/Navigation';
import PowerPlant from './pages/PowerPlant';
import Utilities from './pages/Utilities';
import DataCenter from './pages/DataCenter';
import Infrastructure from './pages/Infrastructure';
import Financials from './pages/Financials';
import Configuration from './pages/Configuration';
import MexEcoBr from './pages/MexEcoBr';
import ChillerDashboard from './pages/chiller';
import PowerPlantSystem from './pages/PowerPlantSystem';
import GasTurbineDiagram from './components/GasTurbineDiagram';
import PowerPlantSankey from './components/PowerPlantSankey'; // Import new component
import { PlantStatus, FuelMode, TurbineStatus, Plant } from './types';
import { POWER_PLANTS as initialPowerPlants } from './data/plants';

export type TurbineStatusConfig = { [key: number]: TurbineStatus };

// --- Configuration Persistence ---
// Interface for a single plant's config
export interface PlantConfig {
  fuelMode: FuelMode;
  flexMix: { h2: number; biodiesel: number };
  turbineStatusConfig: TurbineStatusConfig;
  turbineMaintenanceScores: { [key: number]: number };
}

// Interface for resource visibility config
export interface ResourceConfig {
    water: boolean;
    gas: boolean;
    ethanol: boolean;
    biodiesel: boolean;
    h2: boolean;
}

// Interface for all stored configs
interface AllConfigs {
    [plantName: string]: PlantConfig;
}

const CONFIG_STORAGE_KEY = 'app-all-configs';
const RESOURCE_CONFIG_KEY = 'app-resource-config';
const SELECTED_PLANT_STORAGE_KEY = 'app-selected-plant';
const PLANTS_STORAGE_KEY = 'app-available-plants';

const defaultConfig: PlantConfig = {
  fuelMode: FuelMode.NaturalGas,
  flexMix: { h2: 20, biodiesel: 30 },
  turbineStatusConfig: {
    1: 'active', 2: 'active', 3: 'active', 4: 'active', 5: 'inactive',
  },
  turbineMaintenanceScores: { 1: 10, 2: 15, 3: 85, 4: 20, 5: 5 },
};

const defaultResourceConfig: ResourceConfig = {
    water: true,
    gas: true,
    ethanol: true,
    biodiesel: true,
    h2: true,
};

const loadAllConfigs = (): AllConfigs => {
  try {
    const savedConfigString = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfigString) {
      return JSON.parse(savedConfigString);
    }
  } catch (error) {
    console.error("Failed to load or parse configs from localStorage", error);
  }
  return {};
};

const loadResourceConfig = (): ResourceConfig => {
    try {
        const savedConfigString = localStorage.getItem(RESOURCE_CONFIG_KEY);
        if (savedConfigString) {
            return JSON.parse(savedConfigString);
        }
    } catch (error) {
        console.error("Failed to load resource config from localStorage", error);
    }
    return defaultResourceConfig;
};

const loadAvailablePlants = (): Plant[] => {
    try {
        const savedPlantsString = localStorage.getItem(PLANTS_STORAGE_KEY);
        if (savedPlantsString) {
            return JSON.parse(savedPlantsString);
        }
    } catch (error) {
        console.error("Failed to load plants from localStorage", error);
    }
    return initialPowerPlants;
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Power Plant');
  
  // Shared state
  const [plantStatus, setPlantStatus] = useState<PlantStatus>(PlantStatus.Online);
  const [powerOutput, setPowerOutput] = useState(2250.0);
  const [efficiency, setEfficiency] = useState(58.5);
  const [maxCapacity, setMaxCapacity] = useState(2500);
  const [efficiencyGain, setEfficiencyGain] = useState(0);
  const [activeRackCount, setActiveRackCount] = useState(0); // State for active racks

  // --- Configuration State ---
  const [allConfigs, setAllConfigs] = useState<AllConfigs>(loadAllConfigs);
  const [resourceConfig, setResourceConfigState] = useState<ResourceConfig>(loadResourceConfig);
  const [availablePlants, setAvailablePlants] = useState<Plant[]>(loadAvailablePlants);
  const [selectedPlantName, setSelectedPlantNameState] = useState<string>(() => {
    const savedPlant = localStorage.getItem(SELECTED_PLANT_STORAGE_KEY);
    if (savedPlant && availablePlants.find(p => p.name === savedPlant)) {
        return savedPlant;
    }
    return availablePlants[0]?.name || 'MAUAX Bio PowerPlant (standard)';
  });

  const currentConfig = useMemo(() => {
    return allConfigs[selectedPlantName] || defaultConfig;
  }, [allConfigs, selectedPlantName]);
  
  const selectedPlant = useMemo(() => {
    return availablePlants.find(p => p.name === selectedPlantName) || availablePlants[0];
  }, [availablePlants, selectedPlantName]);

  // Persist any changes to allConfigs, selected plant, or available plants
  useEffect(() => {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(allConfigs));
    } catch(error) {
        console.error("Failed to save configs to localStorage", error);
    }
  }, [allConfigs]);

  useEffect(() => {
    try {
        localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(availablePlants));
    } catch(error) {
        console.error("Failed to save plants to localStorage", error);
    }
  }, [availablePlants]);
  
  const setSelectedPlantName = (name: string) => {
    try {
        localStorage.setItem(SELECTED_PLANT_STORAGE_KEY, name);
    } catch (error) {
        console.error("Failed to save selected plant to localStorage", error);
    }
    setSelectedPlantNameState(name);
  };

  const updateCurrentConfig = (newConfig: Partial<PlantConfig>) => {
      setAllConfigs(prev => ({
          ...prev,
          [selectedPlantName]: {
              ...(prev[selectedPlantName] || defaultConfig),
              ...newConfig,
          }
      }));
  };

  const setResourceConfig = (newConfig: ResourceConfig) => {
    try {
        localStorage.setItem(RESOURCE_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
        console.error("Failed to save resource config to localStorage", error);
    }
    setResourceConfigState(newConfig);
  };

  const setFuelMode = (fuelMode: FuelMode) => updateCurrentConfig({ fuelMode });
  const setFlexMix = (updater: React.SetStateAction<{ h2: number; biodiesel: number }>) => {
      const newFlexMix = typeof updater === 'function' 
          ? updater(currentConfig.flexMix) 
          : updater;
      updateCurrentConfig({ flexMix: newFlexMix });
  };
  const setTurbineStatusConfig = (updater: React.SetStateAction<TurbineStatusConfig>) => {
      const newStatus = typeof updater === 'function'
          ? updater(currentConfig.turbineStatusConfig)
          : updater;
      updateCurrentConfig({ turbineStatusConfig: newStatus });
  };
  
  const setTurbineMaintenanceScores = (updater: React.SetStateAction<{ [key: number]: number }>) => {
      const newScores = typeof updater === 'function' 
          ? updater(currentConfig.turbineMaintenanceScores || {}) 
          : updater;
      updateCurrentConfig({ turbineMaintenanceScores: newScores });
  };

  const addPlant = () => {
    setAvailablePlants(prev => {
      const newProjectName = `Novo Projeto ${prev.filter(p => p.name.startsWith("Novo Projeto")).length + 1}`;
      const newPlant: Plant = {
        name: newProjectName,
        power: 100,
        fuel: 'Gás Natural',
        identifier: { type: 'location', value: 'Não definido' },
        description: 'Edite os detalhes deste novo projeto.',
        status: 'Proposta',
        type: 'new',
        coordinates: { lat: 0, lng: 0 },
      };
      // Automatically select the new plant
      setSelectedPlantName(newPlant.name);
      return [...prev, newPlant];
    });
  };

  const updatePlant = (plantNameToUpdate: string, updatedPlant: Plant) => {
    setAvailablePlants(prev => prev.map(p => p.name === plantNameToUpdate ? updatedPlant : p));
  };


  useEffect(() => {
    const plant = availablePlants.find(p => p.name === selectedPlantName);
    if (plant) {
      setMaxCapacity(plant.power);
      
      if (plantStatus === PlantStatus.Online) {
        setPowerOutput(plant.power * (0.85 + Math.random() * 0.1));
      } else {
        setPowerOutput(0);
        setEfficiencyGain(0); // Reset gain when offline
      }

      if (!allConfigs[selectedPlantName]) {
        let newFuelMode = FuelMode.NaturalGas;
        if (plant.name === 'MAUAX Bio PowerPlant (standard)') {
          newFuelMode = FuelMode.FlexNGH2;
        } else if (plant.fuel.includes('Etanol')) {
          newFuelMode = FuelMode.Ethanol;
        } else if (plant.fuel.includes('Biodiesel')) {
          newFuelMode = FuelMode.Biodiesel;
        }
        updateCurrentConfig({ fuelMode: newFuelMode });
      }
    } else if (availablePlants.length > 0) {
        // If selected plant doesn't exist (e.g., deleted), select the first one
        setSelectedPlantName(availablePlants[0].name);
    }
  }, [selectedPlantName, plantStatus, availablePlants]);

  const renderPage = () => {
    switch (currentPage) {
      case 'Power Plant':
        return <PowerPlant 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
          efficiencyGain={efficiencyGain}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          turbineMaintenanceScores={currentConfig.turbineMaintenanceScores || {}}
          setTurbineMaintenanceScores={setTurbineMaintenanceScores}
          resourceConfig={resourceConfig}
        />;
      case 'Utilities':
      case 'Fluxo de Energia da Usina':
      case 'Chiller Absorção -> Tiac':
      case 'Chiller Absorção -> Fog':
      case 'Chiller Absorção -> Data Cloud':
        return <Utilities 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
          setEfficiencyGain={setEfficiencyGain}
          setCurrentPage={setCurrentPage}
          activeRackCount={activeRackCount}
          selectedPlant={selectedPlant}
        />;
      case 'Data Center':
        return <DataCenter onActiveRackUpdate={setActiveRackCount} />;
      case 'Infrastructure':
        return <Infrastructure />;
      case 'MAUAX consortium':
        return <MexEcoBr />;
      case 'Financials':
        return <Financials 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          activeRackCount={activeRackCount}
        />;
      case 'Configuration':
        return <Configuration
          selectedPlantName={selectedPlantName}
          setSelectedPlantName={setSelectedPlantName}
          fuelMode={currentConfig.fuelMode}
          setFuelMode={setFuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          plantStatus={plantStatus}
          setPlantStatus={setPlantStatus}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          setTurbineStatusConfig={setTurbineStatusConfig}
          turbineMaintenanceScores={currentConfig.turbineMaintenanceScores || {}}
          setTurbineMaintenanceScores={setTurbineMaintenanceScores}
          availablePlants={availablePlants}
          addPlant={addPlant}
          updatePlant={updatePlant}
          resourceConfig={resourceConfig}
          setResourceConfig={setResourceConfig}
        />;
      case 'Chiller':
      case 'Chiller Absorção':
        return <ChillerDashboard />;
      case 'inventario UTE':
      case 'PowerPlantSystem':
        return <PowerPlantSystem />;
      case 'Fog System Details':
        return <GasTurbineDiagram />;
      case 'Power Plant Sankey':
        return <PowerPlantSankey 
            powerOutput={powerOutput}
            efficiency={efficiency}
            setCurrentPage={setCurrentPage}
        />;
      default:
        return <PowerPlant 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
          efficiencyGain={efficiencyGain}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          turbineMaintenanceScores={currentConfig.turbineMaintenanceScores || {}}
          setTurbineMaintenanceScores={setTurbineMaintenanceScores}
          resourceConfig={resourceConfig}
        />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
        <Header plantStatus={plantStatus} powerOutput={powerOutput} selectedPlantName={selectedPlantName} maxCapacity={maxCapacity} />
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
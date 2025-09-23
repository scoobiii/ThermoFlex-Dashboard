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
import { PlantStatus, FuelMode, TurbineStatus } from './types';
import { POWER_PLANTS } from './data/plants';

export type TurbineStatusConfig = { [key: number]: TurbineStatus };

// --- Configuration Persistence ---
// Interface for a single plant's config
export interface PlantConfig {
  fuelMode: FuelMode;
  flexMix: { h2: number; biodiesel: number };
  turbineStatusConfig: TurbineStatusConfig;
}

// Interface for all stored configs
interface AllConfigs {
    [plantName: string]: PlantConfig;
}

const CONFIG_STORAGE_KEY = 'app-all-configs';
const SELECTED_PLANT_STORAGE_KEY = 'app-selected-plant';

const defaultConfig: PlantConfig = {
  fuelMode: FuelMode.NaturalGas,
  flexMix: { h2: 20, biodiesel: 30 },
  turbineStatusConfig: {
    1: 'active', 2: 'active', 3: 'active', 4: 'active', 5: 'active',
  },
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

const loadSelectedPlant = (): string => {
    try {
        const savedPlant = localStorage.getItem(SELECTED_PLANT_STORAGE_KEY);
        // Validate that the saved plant still exists in our list
        if (savedPlant && POWER_PLANTS.find(p => p.name === savedPlant)) {
            return savedPlant;
        }
    } catch (error) {
        console.error("Failed to load selected plant from localStorage", error);
    }
    return 'MAUAX Bio PowerPlant (standard)'; // Default value
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Power Plant');
  
  // Shared state
  const [plantStatus, setPlantStatus] = useState<PlantStatus>(PlantStatus.Online);
  const [powerOutput, setPowerOutput] = useState(2250.0);
  const [efficiency, setEfficiency] = useState(58.5);
  const [maxCapacity, setMaxCapacity] = useState(2500);
  const [efficiencyGain, setEfficiencyGain] = useState(0);

  // --- Configuration State ---
  const [allConfigs, setAllConfigs] = useState<AllConfigs>(loadAllConfigs);
  const [selectedPlantName, setSelectedPlantNameState] = useState<string>(loadSelectedPlant);

  const currentConfig = useMemo(() => {
    return allConfigs[selectedPlantName] || defaultConfig;
  }, [allConfigs, selectedPlantName]);

  // Persist any changes to allConfigs
  useEffect(() => {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(allConfigs));
    } catch(error) {
        console.error("Failed to save configs to localStorage", error);
    }
  }, [allConfigs]);
  
  // Wrapped setter to also save to localStorage
  const setSelectedPlantName = (name: string) => {
    try {
        localStorage.setItem(SELECTED_PLANT_STORAGE_KEY, name);
    } catch (error) {
        console.error("Failed to save selected plant to localStorage", error);
    }
    setSelectedPlantNameState(name);
  };

  // Functions to update the config for the *current* plant
  const updateCurrentConfig = (newConfig: Partial<PlantConfig>) => {
      setAllConfigs(prev => ({
          ...prev,
          [selectedPlantName]: {
              ...(prev[selectedPlantName] || defaultConfig),
              ...newConfig,
          }
      }));
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

  useEffect(() => {
    const plant = POWER_PLANTS.find(p => p.name === selectedPlantName);
    if (plant) {
      setMaxCapacity(plant.power);
      
      if (plantStatus === PlantStatus.Online) {
        setPowerOutput(plant.power * (0.85 + Math.random() * 0.1));
      } else {
        setPowerOutput(0);
        setEfficiencyGain(0); // Reset gain when offline
      }

      // If a plant has no config, set a sensible default
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
    }
  }, [selectedPlantName, plantStatus]);

  const renderPage = () => {
    switch (currentPage) {
      case 'Power Plant':
        return <PowerPlant 
          plantStatus={plantStatus}
          setPlantStatus={setPlantStatus}
          powerOutput={powerOutput}
          setPowerOutput={setPowerOutput}
          efficiency={efficiency}
          setEfficiency={setEfficiency}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          efficiencyGain={efficiencyGain}
        />;
      case 'Utilities':
        return <Utilities 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
          setEfficiencyGain={setEfficiencyGain}
        />;
      case 'Data Center':
        return <DataCenter />;
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
        />;
      case 'Configuration':
        return <Configuration
          fuelMode={currentConfig.fuelMode}
          setFuelMode={setFuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          setTurbineStatusConfig={setTurbineStatusConfig}
          selectedPlantName={selectedPlantName}
          setSelectedPlantName={setSelectedPlantName}
        />;
      default:
        return <PowerPlant 
          plantStatus={plantStatus}
          setPlantStatus={setPlantStatus}
          powerOutput={powerOutput}
          setPowerOutput={setPowerOutput}
          efficiency={efficiency}
          setEfficiency={setEfficiency}
          fuelMode={currentConfig.fuelMode}
          flexMix={currentConfig.flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={currentConfig.turbineStatusConfig}
          efficiencyGain={efficiencyGain}
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
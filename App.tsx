
import React, { useState, useEffect } from 'react';
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
const CONFIG_STORAGE_KEY = 'app-config';

interface AppConfig {
  selectedPlantName: string;
  fuelMode: FuelMode;
  flexMix: { h2: number; biodiesel: number };
  turbineStatusConfig: TurbineStatusConfig;
}

const defaultConfig: AppConfig = {
  selectedPlantName: 'MAUAX Bio PowerPlant (standard)',
  fuelMode: FuelMode.NaturalGas,
  flexMix: { h2: 20, biodiesel: 30 },
  turbineStatusConfig: {
    1: 'active', 2: 'active', 3: 'active', 4: 'active', 5: 'active',
  },
};

const loadConfig = (): AppConfig => {
  try {
    const savedConfigString = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfigString) {
      const savedConfig = JSON.parse(savedConfigString);
      // Merge with defaults to ensure all keys are present
      return { ...defaultConfig, ...savedConfig };
    }
  } catch (error) {
    console.error("Failed to load or parse config from localStorage", error);
  }
  return defaultConfig;
};


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Power Plant');
  
  // Shared state
  const [plantStatus, setPlantStatus] = useState<PlantStatus>(PlantStatus.Online);
  const [powerOutput, setPowerOutput] = useState(2250.0);
  const [efficiency, setEfficiency] = useState(58.5);
  const [maxCapacity, setMaxCapacity] = useState(2500);
  const [efficiencyGain, setEfficiencyGain] = useState(0);

  // --- Configuration Page State (Initialized from localStorage) ---
  const [selectedPlantName, setSelectedPlantName] = useState<string>(() => loadConfig().selectedPlantName);
  const [fuelMode, setFuelMode] = useState<FuelMode>(() => loadConfig().fuelMode);
  const [flexMix, setFlexMix] = useState(() => loadConfig().flexMix);
  const [turbineStatusConfig, setTurbineStatusConfig] = useState<TurbineStatusConfig>(() => loadConfig().turbineStatusConfig);


  // --- Effect to SAVE config changes to localStorage ---
  useEffect(() => {
    const configToSave: AppConfig = {
      selectedPlantName,
      fuelMode,
      flexMix,
      turbineStatusConfig,
    };
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
    } catch (error) {
      console.error("Failed to save config to localStorage", error);
    }
  }, [selectedPlantName, fuelMode, flexMix, turbineStatusConfig]);


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

      // Don't auto-change fuel mode if it was loaded from storage
      // Only set a default if the current selection is illogical for the plant type
      const isCurrentModeIncompatible = 
        (plant.name === 'MAUAX Bio PowerPlant (standard)' && fuelMode !== FuelMode.FlexNGH2 && fuelMode !== FuelMode.FlexEthanolBiodiesel) ||
        (!plant.fuel.includes('Gás') && fuelMode === FuelMode.NaturalGas) ||
        (!plant.fuel.includes('Etanol') && fuelMode === FuelMode.Ethanol);

      if (isCurrentModeIncompatible) {
        if (plant.name === 'MAUAX Bio PowerPlant (standard)') {
          setFuelMode(FuelMode.FlexNGH2);
        } else if (plant.fuel.includes('Gás Natural')) {
          setFuelMode(FuelMode.NaturalGas);
        } else if (plant.fuel.includes('Etanol')) {
          setFuelMode(FuelMode.Ethanol);
        } else if (plant.fuel.includes('Biodiesel')) {
          setFuelMode(FuelMode.Biodiesel);
        }
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
          fuelMode={fuelMode}
          flexMix={flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={turbineStatusConfig}
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
          fuelMode={fuelMode}
          flexMix={flexMix}
        />;
      case 'Configuration':
        return <Configuration
          fuelMode={fuelMode}
          setFuelMode={setFuelMode}
          flexMix={flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={turbineStatusConfig}
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
          fuelMode={fuelMode}
          flexMix={flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={turbineStatusConfig}
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

import React, { useState } from 'react';
import Header from './components/Header';
import Navigation, { Page } from './components/Navigation';
import PowerPlant from './pages/PowerPlant';
import Utilities from './pages/Utilities';
import DataCenter from './pages/DataCenter';
import Infrastructure from './pages/Infrastructure';
import Financials from './pages/Financials';
import Configuration from './pages/Configuration';
import { PlantStatus, FuelMode, TurbineStatus } from './types';

export type TurbineStatusConfig = { [key: number]: TurbineStatus };

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Power Plant');
  
  // Shared state
  const [plantStatus, setPlantStatus] = useState<PlantStatus>(PlantStatus.Online);
  const [powerOutput, setPowerOutput] = useState(2250.0);
  const [efficiency, setEfficiency] = useState(58.5);

  // Configuration Page State
  const [fuelMode, setFuelMode] = useState<FuelMode>(FuelMode.NaturalGas);
  const [flexMix, setFlexMix] = useState({ h2: 20, biodiesel: 30 });
  const [turbineStatusConfig, setTurbineStatusConfig] = useState<TurbineStatusConfig>({
    1: 'active',
    2: 'active',
    3: 'active',
    4: 'active',
    5: 'active',
  });

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
        />;
      case 'Utilities':
        return <Utilities 
          plantStatus={plantStatus}
          powerOutput={powerOutput}
          efficiency={efficiency}
        />;
      case 'MAUAX DAO DataCloud':
        return <DataCenter />;
      case 'Infrastructure':
        return <Infrastructure />;
      case 'Financials':
        return <Financials />;
      case 'Configuration':
        return <Configuration
          fuelMode={fuelMode}
          setFuelMode={setFuelMode}
          flexMix={flexMix}
          setFlexMix={setFlexMix}
          turbineStatusConfig={turbineStatusConfig}
          setTurbineStatusConfig={setTurbineStatusConfig}
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
        />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
        <Header plantStatus={plantStatus} powerOutput={powerOutput} />
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { PlantStatus, FuelMode, Turbine } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import PowerPlant from './pages/PowerPlant';
import Utilities from './pages/Utilities';
import DataCenter from './pages/DataCenter';
import Infrastructure from './pages/Infrastructure';
import Configuration from './pages/Configuration';

export type Page = 'powerplant' | 'utilities' | 'datacenter' | 'infrastructure' | 'configuration';
export type TurbineStatus = 'active' | 'inactive' | 'error';
export type TurbineStatusConfig = Record<number, TurbineStatus>;

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('powerplant');
  
  // Globally shared state
  const [plantStatus, setPlantStatus] = useState<PlantStatus>(PlantStatus.Online);
  const [powerOutput, setPowerOutput] = useState(2250);
  const [efficiency, setEfficiency] = useState(58.5);

  // Configuration State
  const [fuelMode, setFuelMode] = useState<FuelMode>(FuelMode.NaturalGas);
  const [flexMix, setFlexMix] = useState<{ h2: number, biodiesel: number }>({ h2: 20, biodiesel: 50 });
  const [turbineStatusConfig, setTurbineStatusConfig] = useState<TurbineStatusConfig>({
      1: 'active', 2: 'active', 3: 'active', 4: 'active', 5: 'active'
  });


  const renderPage = () => {
    switch (currentPage) {
      case 'powerplant':
        return <PowerPlant 
                  plantStatus={plantStatus}
                  setPlantStatus={setPlantStatus}
                  powerOutput={powerOutput}
                  setPowerOutput={setPowerOutput}
                  efficiency={efficiency}
                  setEfficiency={setEfficiency}
                  fuelMode={fuelMode}
                  flexMix={flexMix}
                  turbineStatusConfig={turbineStatusConfig}
                />;
      case 'utilities':
        return <Utilities powerOutput={powerOutput} efficiency={efficiency} plantStatus={plantStatus} />;
      case 'datacenter':
        return <DataCenter />;
      case 'infrastructure':
        return <Infrastructure />;
      case 'configuration':
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
                  turbineStatusConfig={turbineStatusConfig}
                />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 lg:p-8">
            <Header plantStatus={plantStatus} powerOutput={powerOutput} />
            {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;
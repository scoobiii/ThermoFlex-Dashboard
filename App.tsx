import React, { useState } from 'react';
import { PlantStatus } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import PowerPlant from './pages/PowerPlant';
import Utilities from './pages/Utilities';
import DataCenter from './pages/DataCenter';
import Infrastructure from './pages/Infrastructure';
import Configuration from './pages/Configuration';

export type Page = 'powerplant' | 'utilities' | 'datacenter' | 'infrastructure' | 'configuration';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('utilities');
  
  // State lifted up for the global header and shared dashboards
  const [plantStatus, setPlantStatus] = useState<PlantStatus>(PlantStatus.Online);
  const [powerOutput, setPowerOutput] = useState(2250);
  const [efficiency, setEfficiency] = useState(58.5);

  const renderPage = () => {
    switch (currentPage) {
      case 'powerplant':
        return <PowerPlant 
                  plantStatus={plantStatus}
                  powerOutput={powerOutput}
                  efficiency={efficiency}
                  setPlantStatus={setPlantStatus}
                  setPowerOutput={setPowerOutput}
                  setEfficiency={setEfficiency}
                />;
      case 'utilities':
        return <Utilities powerOutput={powerOutput} efficiency={efficiency} plantStatus={plantStatus} />;
      case 'datacenter':
        return <DataCenter />;
      case 'infrastructure':
        return <Infrastructure />;
      case 'configuration':
        return <Configuration />;
      default:
        return <PowerPlant 
                  plantStatus={plantStatus}
                  powerOutput={powerOutput}
                  efficiency={efficiency}
                  setPlantStatus={setPlantStatus}
                  setPowerOutput={setPowerOutput}
                  setEfficiency={setEfficiency}
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
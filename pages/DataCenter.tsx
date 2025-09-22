
import React, { useState } from 'react';
import ServerRackStatus from '../components/ServerRackStatus';
import PowerConsumption from '../components/PowerConsumption';
import CoolingLoad from '../components/CoolingLoad';
import DataCenterTreeMap from '../components/DataCenterTreeMap';

type DataCenterTab = 'overview' | 'treemap';

const DataCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DataCenterTab>('overview');

  const tabButtonClasses = (tabName: DataCenterTab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
      activeTab === tabName
        ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
    }`;

  return (
    <div className="mt-6">
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={tabButtonClasses('overview')}
            aria-current={activeTab === 'overview' ? 'page' : undefined}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('treemap')}
            className={tabButtonClasses('treemap')}
            aria-current={activeTab === 'treemap' ? 'page' : undefined}
          >
            Treemap de Consumo
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div className="lg:col-span-1">
              <PowerConsumption />
            </div>
            <div className="lg:col-span-1">
              <CoolingLoad />
            </div>
            <div className="lg:col-span-3">
              <ServerRackStatus />
            </div>
          </div>
        )}
        {activeTab === 'treemap' && (
          <div className="animate-fadeIn">
             <DataCenterTreeMap />
          </div>
        )}
      </div>
       <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
    `}</style>
    </div>
  );
};

export default DataCenter;
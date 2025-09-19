import React from 'react';
import CoolingLoad from '../components/CoolingLoad';
import PowerConsumption from '../components/PowerConsumption';
import DataCenterTreeMap from '../components/DataCenterTreeMap';

const DataCenter: React.FC = () => {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <DataCenterTreeMap />
      </div>
      <div className="lg:col-span-1 grid grid-rows-2 gap-6">
          <PowerConsumption />
          <CoolingLoad />
      </div>
    </div>
  );
};

export default DataCenter;
import React from 'react';
import CoolingLoad from '../components/CoolingLoad';
import PowerConsumption from '../components/PowerConsumption';
import DataCenterTreeMap from '../components/DataCenterTreeMap';

const DataCenter: React.FC = () => {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <DataCenterTreeMap />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerConsumption />
        <CoolingLoad />
      </div>
    </div>
  );
};

export default DataCenter;

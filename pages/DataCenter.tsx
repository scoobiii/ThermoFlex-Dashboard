import React from 'react';
import ServerRackStatus from '../components/ServerRackStatus';
import PowerConsumption from '../components/PowerConsumption';
import CoolingLoad from '../components/CoolingLoad';
import DataCenterTreeMap from '../components/DataCenterTreeMap';

const DataCenter: React.FC = () => {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <PowerConsumption />
      </div>
      <div className="lg:col-span-1">
        <CoolingLoad />
      </div>
      <div className="lg:col-span-3">
        <ServerRackStatus />
      </div>
      <div className="lg:col-span-3">
        <DataCenterTreeMap />
      </div>
    </div>
  );
};

export default DataCenter;
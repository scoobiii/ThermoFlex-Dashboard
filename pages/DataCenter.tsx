
import React from 'react';
import DashboardCard from '../components/DashboardCard';

const DataCenter: React.FC = () => {
  return (
    <div className="mt-6">
      <DashboardCard title="Data Center">
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500 text-lg">O dashboard do Data Center está em desenvolvimento.</p>
        </div>
      </DashboardCard>
    </div>
  );
};

export default DataCenter;

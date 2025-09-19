
import React from 'react';
import DashboardCard from '../components/DashboardCard';

const Infrastructure: React.FC = () => {
  return (
    <div className="mt-6">
      <DashboardCard title="Infraestrutura">
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500 text-lg">O dashboard de Infraestrutura está em desenvolvimento.</p>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Infrastructure;

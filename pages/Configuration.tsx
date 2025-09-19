
import React from 'react';
import DashboardCard from '../components/DashboardCard';

const Configuration: React.FC = () => {
  return (
    <div className="mt-6">
      <DashboardCard title="Configuração">
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500 text-lg">A página de Configuração está em desenvolvimento.</p>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Configuration;

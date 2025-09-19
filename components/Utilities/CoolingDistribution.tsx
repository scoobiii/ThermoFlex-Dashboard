import React from 'react';
import DashboardCard from '../DashboardCard';
import { WrenchScrewdriverIcon } from '../icons';

interface CoolingDistributionProps {
    coolingProduction: number;
    isOnline: boolean;
}

const CoolingDistribution: React.FC<CoolingDistributionProps> = ({ coolingProduction, isOnline }) => {
    return (
        <DashboardCard title="Distribuição de Frio" icon={<WrenchScrewdriverIcon className="w-6 h-6" />}>
            <div className="flex flex-col justify-center h-48 space-y-3 px-4">
                 <div className="flex items-baseline justify-between">
                    <span className="text-gray-300">❄️ TIAC</span>
                    <span className="font-mono text-lg font-semibold text-gray-500">-- MW</span>
                </div>
                 <div className="flex items-baseline justify-between">
                    <span className="text-gray-300">💨 Fog System</span>
                    <span className="font-mono text-lg font-semibold text-gray-500">-- MW</span>
                </div>
                 <div className="flex items-baseline justify-between">
                    <span className="text-gray-300">💻 Data Center</span>
                     <span className="font-mono text-lg font-semibold text-gray-500">-- MW</span>
                </div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex items-baseline justify-between text-cyan-400">
                    <span className="font-semibold">Total Disponível</span>
                    <span className={`font-mono text-xl font-bold ${!isOnline && 'text-gray-500'}`}>{coolingProduction.toFixed(0)} MW</span>
                </div>
            </div>
        </DashboardCard>
    );
};

export default CoolingDistribution;

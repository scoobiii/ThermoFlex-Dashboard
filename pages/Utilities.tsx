import React, { useEffect, useState } from 'react';
import { PlantStatus } from '../types';
import { FlameIcon, SnowflakeIcon, WrenchScrewdriverIcon, BoltIcon } from '../components/icons';
import DashboardCard from '../components/DashboardCard';

interface UtilitiesProps {
    powerOutput: number;
    efficiency: number;
    plantStatus: PlantStatus;
    setEfficiencyGain: (gain: number) => void;
}

const SankeyConnector: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="w-16 h-16 text-gray-700 transform lg:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
    </div>
);

const Utilities: React.FC<UtilitiesProps> = ({ powerOutput, efficiency, plantStatus, setEfficiencyGain }) => {
    
    const isOnline = plantStatus === PlantStatus.Online;
    const [ambientTemp] = useState(32.4);

    const powerInput = isOnline && efficiency > 0 ? powerOutput / (efficiency / 100) : 0;
    const wasteHeat = isOnline ? powerInput - powerOutput : 0;
    
    const chillerCOP = 0.694;
    const coolingProduction = isOnline ? wasteHeat * chillerCOP : 0;

    const tiacCooling = coolingProduction * 0.4;
    const fogCooling = coolingProduction * 0.3;
    const dataCenterCooling = coolingProduction * 0.3;

    const conventionalChillerCOP = 5.0;
    const electricalEquivalentSaved = isOnline ? coolingProduction / conventionalChillerCOP : 0;

    useEffect(() => {
        const ISO_TEMP_THRESHOLD = 25;
        if (isOnline && ambientTemp > ISO_TEMP_THRESHOLD) {
            const tiacGain = tiacCooling / 300;
            const fogGain = fogCooling / 400;
            setEfficiencyGain(tiacGain + fogGain);
        } else {
            setEfficiencyGain(0);
        }
    }, [isOnline, ambientTemp, tiacCooling, fogCooling, setEfficiencyGain]);

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch">
                
                <div className="lg:col-span-3">
                    <DashboardCard title="Energia Térmica (Perdas)" icon={<FlameIcon className="w-6 h-6 text-orange-400" />} className="h-full">
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className={`text-5xl font-bold tracking-tight ${isOnline ? 'text-orange-400' : 'text-gray-500'}`}>{wasteHeat.toFixed(0)}</p>
                            <p className="text-lg text-gray-400">MW</p>
                            <p className={`mt-4 text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-500'}`}>{isOnline ? 'Sistema Ativo' : 'Sistema Inativo'}</p>
                        </div>
                    </DashboardCard>
                </div>
                
                <div className="lg:col-span-1 hidden lg:flex">
                    <SankeyConnector />
                </div>

                <div className="lg:col-span-3">
                     <DashboardCard title="Chiller de Absorção" icon={<SnowflakeIcon className="w-6 h-6 text-cyan-400" />} className="h-full">
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className={`text-5xl font-bold tracking-tight ${isOnline ? 'text-cyan-400' : 'text-gray-500'}`}>{coolingProduction.toFixed(0)}</p>
                            <p className="text-lg text-gray-400">MW</p>
                             <p className={`mt-4 text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-500'}`}>{isOnline ? 'Sistema Ativo' : 'Sistema Inativo'}</p>
                        </div>
                    </DashboardCard>
                </div>
                
                <div className="lg:col-span-1 hidden lg:flex">
                    <SankeyConnector />
                </div>
                
                <div className="lg:col-span-3">
                    <DashboardCard title="Distribuição de Frio" icon={<WrenchScrewdriverIcon className="w-6 h-6" />} className="h-full">
                        <div className="flex flex-col justify-between h-full">
                            <div className="space-y-3">
                                <div className="bg-gray-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                                    <span className="text-gray-300">❄️ TIAC System</span>
                                    <span className={`font-mono font-semibold ${isOnline ? 'text-white' : 'text-gray-500'}`}>{tiacCooling.toFixed(1)} MW</span>
                                </div>
                                <div className="bg-gray-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                                    <span className="text-gray-300">💨 Fog System</span>
                                    <span className={`font-mono font-semibold ${isOnline ? 'text-white' : 'text-gray-500'}`}>{fogCooling.toFixed(1)} MW</span>
                                </div>
                                <div className="bg-gray-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                                    <span className="text-gray-300">🖥️ Data Center</span>
                                    <span className={`font-mono font-semibold ${isOnline ? 'text-white' : 'text-gray-500'}`}>{dataCenterCooling.toFixed(1)} MW</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-700 pt-3 mt-3">
                                 <div className="flex items-center justify-between text-sm">
                                     <div className="flex items-center gap-2 text-green-400">
                                         <BoltIcon className="w-5 h-5"/>
                                         <span className="font-semibold">Economia de Energia</span>
                                     </div>
                                     <span className={`font-mono text-lg font-bold ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>{electricalEquivalentSaved.toFixed(1)} MW</span>
                                 </div>
                                 <p className="text-xs text-gray-500 text-right">(Equivalente Elétrico)</p>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

            </div>
        </div>
    );
};

export default Utilities;
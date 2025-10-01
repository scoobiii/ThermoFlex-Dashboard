

import React, { useEffect, useState } from 'react';
import { Plant, PlantStatus } from '../types';
import { SnowflakeIcon, WrenchScrewdriverIcon, BoltIcon, CloudIcon, ComputerDesktopIcon, ActivityIcon, MapPinIcon, GasIcon, ChartBarIcon, WarningIcon } from '../components/icons';
import DashboardCard from '../components/DashboardCard';
import { Page } from '../components/Navigation';

interface UtilitiesProps {
    powerOutput: number;
    efficiency: number;
    plantStatus: PlantStatus;
    setCurrentPage: (page: Page) => void;
    activeRackCount: number;
    selectedPlant: Plant;
}

const SankeyConnector: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="w-16 h-16 text-gray-700 transform lg:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
    </div>
);

const TrigenerationView: React.FC<Omit<UtilitiesProps, 'selectedPlant'>> = ({ powerOutput, efficiency, plantStatus, setCurrentPage, activeRackCount }) => {
    
    const isOnline = plantStatus === PlantStatus.Online;
    const [ambientTemp] = React.useState(32.4);
    const [coolingDistribution, setCoolingDistribution] = useState({ tiac: 40, fog: 25, dataCenter: 35 });

    const powerInput = isOnline && efficiency > 0 ? powerOutput / (efficiency / 100) : 0;
    const wasteHeat = isOnline ? powerInput - powerOutput : 0;
    
    const chillerCOP = 0.694;
    const coolingProduction = isOnline ? wasteHeat * chillerCOP : 0;

    const tiacCooling = coolingProduction * (coolingDistribution.tiac / 100);
    const fogCooling = coolingProduction * (coolingDistribution.fog / 100);
    const dataCenterCooling = coolingProduction * (coolingDistribution.dataCenter / 100);

    const TOTAL_RACKS = 120;
    const COOLING_CAPACITY_PER_RACK_MWT = 3.5; // MWt (thermal megawatt)
    const dataCenterTotalCapacity = TOTAL_RACKS * COOLING_CAPACITY_PER_RACK_MWT;
    const potentialActiveRacks = dataCenterCooling / COOLING_CAPACITY_PER_RACK_MWT;

    const conventionalChillerCOP = 0.4; // Updated to reflect superior value of trigeneration
    const electricalEquivalentSaved = isOnline ? coolingProduction / conventionalChillerCOP : 0;

    const handleDistributionChange = (system: 'tiac' | 'fog', value: number) => {
        const otherSystem = system === 'tiac' ? 'fog' : 'tiac';
        const currentOtherValue = coolingDistribution[otherSystem];
        
        if (value + currentOtherValue > 100) {
            const newOtherValue = 100 - value;
            setCoolingDistribution({
                ...coolingDistribution,
                [system]: value,
                [otherSystem]: newOtherValue,
                dataCenter: 0
            });
        } else {
            setCoolingDistribution({
                ...coolingDistribution,
                [system]: value,
                dataCenter: 100 - value - currentOtherValue
            });
        }
    };
    
    const Slider: React.FC<{label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, value, onChange}) => (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <label className="font-medium text-gray-300">{label}</label>
                <span className="font-mono font-semibold text-white bg-gray-900/50 px-2 py-0.5 rounded">{value.toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="100" value={value} onChange={onChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
    );

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch">
                <div className="lg:col-span-3">
                    <DashboardCard 
                        title="Fluxo de Energia da Usina" 
                        icon={<ActivityIcon className="w-6 h-6 text-yellow-400" />} 
                        className="h-full"
                        action={
                            <button
                                onClick={() => setCurrentPage('Power Plant Sankey')}
                                className="px-3 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                            >
                                Detalhes do Fluxo
                            </button>
                        }
                    >
                        <div className="flex flex-col justify-center h-full space-y-4 text-sm">
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-400">Potência Térmica Total</span>
                                <span className="font-mono text-lg font-semibold text-white">{powerInput.toFixed(0)} MW</span>
                            </div>
                            <div className="flex justify-between items-baseline pl-4">
                                <span className="text-gray-400">- Potência Elétrica</span>
                                <span className="font-mono font-semibold text-cyan-400">{powerOutput.toFixed(0)} MW</span>
                            </div>
                            <div className="border-t border-gray-700 my-2"></div>
                            <div className="flex justify-between items-baseline bg-gray-900/50 p-2 rounded-lg">
                                <span className="font-semibold text-orange-400">Calor Residual (Perdas)</span>
                                <span className="font-mono text-xl font-bold text-orange-400">{wasteHeat.toFixed(0)} MW</span>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
                
                <div className="lg:col-span-1 hidden lg:flex"> <SankeyConnector /> </div>

                <div className="lg:col-span-3">
                     <DashboardCard 
                        title="Chiller de Absorção" 
                        icon={<SnowflakeIcon className="w-6 h-6 text-cyan-400" />} 
                        className="h-full"
                        action={
                            <button
                                onClick={() => setCurrentPage('Chiller')}
                                className="px-3 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                            >
                                Ver Detalhes
                            </button>
                        }
                    >
                        <div className="flex flex-col items-center justify-between h-full text-center">
                             <div>
                                <p className={`text-5xl font-bold tracking-tight ${isOnline ? 'text-cyan-400' : 'text-gray-500'}`}>{coolingProduction.toFixed(0)}</p>
                                <p className="text-lg text-gray-400">MW de Frio</p>
                                <p className={`mt-4 text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-500'}`}>{isOnline ? 'Sistema Ativo' : 'Sistema Inativo'}</p>
                             </div>
                            <div className="text-xs text-gray-500 border-t border-gray-700 w-full pt-2 mt-2">
                                <p><strong>Quantidade:</strong> 2 | <strong>Fabricante:</strong> Broad</p>
                                <p><strong>Modelo:</strong> BCT-1500</p>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
                
                <div className="lg:col-span-1 hidden lg:flex"> <SankeyConnector /> </div>
                
                <div className="lg:col-span-3">
                    <DashboardCard title="Alinhamento Frio-Eletricidade" icon={<WrenchScrewdriverIcon className="w-6 h-6" />} className="h-full">
                        <div className="flex flex-col justify-between h-full space-y-3">
                             <div className="space-y-3">
                                <Slider label="TIAC System" value={coolingDistribution.tiac} onChange={e => handleDistributionChange('tiac', parseInt(e.target.value))} />
                                <Slider label="Fog System" value={coolingDistribution.fog} onChange={e => handleDistributionChange('fog', parseInt(e.target.value))} />
                                <button
                                    onClick={() => setCurrentPage('Fog System Details')}
                                    className="w-full mt-2 text-center px-3 py-2 text-xs font-semibold bg-gray-700 text-cyan-400 rounded-md transition-all duration-200 hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                                >
                                    Ver Detalhes do Sistema Fogging
                                </button>
                            </div>
                            
                            <div className="space-y-3 border-t border-gray-700 pt-3">
                                <div className="bg-gray-700/50 p-2 rounded-lg text-center">
                                    <p className="text-xs text-gray-400">Alocado para Data Cloud</p>
                                    <p className="font-mono text-lg font-semibold text-white">{coolingDistribution.dataCenter.toFixed(0)}% ({dataCenterCooling.toFixed(1)} MW)</p>
                                    <p className="text-xs text-gray-500">Potencial para <strong className="text-white">{Math.floor(potentialActiveRacks)}/{TOTAL_RACKS}</strong> Racks</p>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-700 pt-3 mt-auto">
                                <div className="flex items-center gap-3"><BoltIcon className="w-8 h-8 text-green-400"/>
                                    <div>
                                        <span className="font-semibold text-green-400 text-base">Economia de Energia (Trigeração)</span>
                                        <p className="text-xs text-gray-500">(Equivalente Elétrico)</p>
                                    </div>
                                    <span className={`font-mono text-3xl font-bold ml-auto ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>{electricalEquivalentSaved.toFixed(0)} MW</span>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};

const UteDetailsView: React.FC<{ plant: Plant; setCurrentPage: (page: Page) => void }> = ({ plant, setCurrentPage }) => {
    const Metric: React.FC<{label: string, value: string | number | null | undefined, unit?: string, color?: string}> = ({label, value, unit, color = 'text-white'}) => (
        <div className="flex justify-between items-baseline text-sm">
            <span className="text-gray-400">{label}</span>
            <span className={`font-mono font-semibold ${color}`}>
                {value !== null && value !== undefined ? `${typeof value === 'number' ? value.toLocaleString('pt-BR') : value} ${unit || ''}`.trim() : 'N/A'}
            </span>
        </div>
    );

    const efficiencyDecimal = plant.efficiency ? plant.efficiency / 100 : 0;
    const thermalPower = efficiencyDecimal > 0 ? plant.power / efficiencyDecimal : 0;
    const residualHeat = thermalPower > 0 ? thermalPower - plant.power : 0;


    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard 
                title="Fluxo de Energia da Usina" 
                icon={<ActivityIcon className="w-6 h-6 text-yellow-400" />} 
                className="h-full"
                action={
                    <button
                        onClick={() => setCurrentPage('PowerPlantSystem')}
                        className="px-3 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                    >
                        Ver Inventário
                    </button>
                }
            >
                <div className="flex flex-col justify-center h-full space-y-4 text-sm">
                    <div className="flex justify-between items-baseline">
                        <span className="text-gray-400">Potência Térmica Total</span>
                        <span className="font-mono text-lg font-semibold text-white">
                           {thermalPower > 0 ? `${thermalPower.toFixed(0)} MW` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between items-baseline pl-4">
                        <span className="text-gray-400">- Potência Elétrica</span>
                        <span className="font-mono font-semibold text-cyan-400">
                            {plant.power.toFixed(0)} MW
                        </span>
                    </div>
                    <div className="border-t border-gray-700 my-2"></div>
                    <div className="flex justify-between items-baseline bg-gray-900/50 p-2 rounded-lg">
                        <span className="font-semibold text-orange-400">Calor Residual (Perdas)</span>
                        <span className="font-mono text-xl font-bold text-orange-400">
                             {residualHeat > 0 ? `${residualHeat.toFixed(0)} MW` : 'N/A'}
                        </span>
                    </div>
                </div>
            </DashboardCard>

            <DashboardCard title="Informações Gerais" icon={<MapPinIcon className="w-6 h-6" />}>
                <div className="space-y-3 h-full flex flex-col justify-center">
                    <Metric label="Localização" value={plant.location} />
                    <Metric label="Combustível" value={plant.fuel} />
                    <Metric label="Tecnologia" value={plant.cycle} />
                </div>
            </DashboardCard>
            <DashboardCard title="Performance (2023)" icon={<ChartBarIcon className="w-6 h-6 text-cyan-400"/>}>
                <div className="space-y-3 h-full flex flex-col justify-center">
                    <Metric label="Capacidade" value={plant.power} unit="MW" color="text-cyan-400" />
                    <Metric label="Geração em 2023" value={plant.generation2023} unit="GWh" />
                    <Metric label="Eficiência" value={plant.efficiency} unit="%" />
                </div>
            </DashboardCard>
             <DashboardCard title="Emissões (2023)" icon={<WarningIcon className="w-6 h-6 text-orange-400"/>}>
                <div className="space-y-3 h-full flex flex-col justify-center">
                    <Metric label="Emissões Totais" value={plant.emissions2023} unit="mil tCO₂e" color="text-orange-400" />
                    <Metric label="Taxa de Emissão" value={plant.rate} unit="tCO₂e/GWh" />
                </div>
            </DashboardCard>
        </div>
    );
};

const Utilities: React.FC<UtilitiesProps> = (props) => {
    const { selectedPlant } = props;

    // The special projects that use the trigeneration utility view
    const isTrigenerationProject = 
        selectedPlant.type === 'standard' || 
        selectedPlant.name === 'Parque Térmico Pedreira';

    if (isTrigenerationProject) {
        return <TrigenerationView {...props} />;
    } else {
        return <UteDetailsView plant={selectedPlant} setCurrentPage={props.setCurrentPage}/>;
    }
};

export default Utilities;

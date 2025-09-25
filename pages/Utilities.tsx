import React, { useEffect } from 'react';
import { Plant, PlantStatus } from '../types';
import { SnowflakeIcon, WrenchScrewdriverIcon, BoltIcon, CloudIcon, ComputerDesktopIcon, ActivityIcon, MapPinIcon, GasIcon, ChartBarIcon, WarningIcon } from '../components/icons';
import DashboardCard from '../components/DashboardCard';
import { Page } from '../components/Navigation';

interface UtilitiesProps {
    powerOutput: number;
    efficiency: number;
    plantStatus: PlantStatus;
    setEfficiencyGain: (gain: number) => void;
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

const TrigenerationView: React.FC<Omit<UtilitiesProps, 'selectedPlant'>> = ({ powerOutput, efficiency, plantStatus, setEfficiencyGain, setCurrentPage, activeRackCount }) => {
    
    const isOnline = plantStatus === PlantStatus.Online;
    const [ambientTemp] = React.useState(32.4);

    const powerInput = isOnline && efficiency > 0 ? powerOutput / (efficiency / 100) : 0;
    const wasteHeat = isOnline ? powerInput - powerOutput : 0;
    
    const chillerCOP = 0.694;
    const coolingProduction = isOnline ? wasteHeat * chillerCOP : 0;

    const tiacCooling = coolingProduction * 0.40;
    const fogCooling = coolingProduction * 0.25;
    const dataCenterCooling = coolingProduction * 0.35;

    const TOTAL_RACKS = 120;
    const COOLING_CAPACITY_PER_RACK_MWT = 3.5; // MWt (thermal megawatt)
    const dataCenterTotalCapacity = TOTAL_RACKS * COOLING_CAPACITY_PER_RACK_MWT;

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
                                <p className="text-lg text-gray-400">MW</p>
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
                    <DashboardCard title="Distribuição de Frio" icon={<WrenchScrewdriverIcon className="w-6 h-6" />} className="h-full">
                        <div className="flex flex-col justify-between h-full space-y-3">
                            <div className="space-y-3">
                                <div className="bg-gray-700/50 p-3 rounded-lg"><div className="flex items-center gap-3"><SnowflakeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /><div className="flex-grow"><div className="flex justify-between items-baseline"><span className="text-gray-300 font-semibold">TIAC System</span><span className={`font-mono font-semibold text-lg ${isOnline ? 'text-white' : 'text-gray-500'}`}>{tiacCooling.toFixed(1)} MW</span></div><div className="text-xs text-gray-500 mt-1 grid grid-cols-2 gap-x-4"><span><strong>Quantidade:</strong> 2</span><span><strong>Fabricante:</strong> Stellar</span><span><strong>Modelo:</strong> E-TIAC 2.0</span><span><strong>Capacidade:</strong> 500 MWₜ</span></div></div></div></div>
                                <div className="bg-gray-700/50 p-3 rounded-lg"><div className="flex items-center gap-3"><CloudIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /><div className="flex-grow"><div className="flex justify-between items-baseline"><span className="text-gray-300 font-semibold">Fog System</span><span className={`font-mono font-semibold text-lg ${isOnline ? 'text-white' : 'text-gray-500'}`}>{fogCooling.toFixed(1)} MW</span></div><div className="text-xs text-gray-500 mt-1 grid grid-cols-2 gap-x-4"><span><strong>Quantidade:</strong> 4</span><span><strong>Fabricante:</strong> Mee Industries</span><span><strong>Modelo:</strong> FogCool 500-H</span><span><strong>Capacidade:</strong> 380 MWₜ</span></div></div></div></div>
                                <div className="bg-gray-700/50 p-3 rounded-lg"><div className="flex items-center gap-3"><ComputerDesktopIcon className="w-5 h-5 text-gray-400 flex-shrink-0" /><div className="flex-grow"><div className="flex justify-between items-baseline"><span className="text-gray-300 font-semibold">Data Cloud</span><span className={`font-mono font-semibold text-lg ${isOnline ? 'text-white' : 'text-gray-500'}`}>{dataCenterCooling.toFixed(1)} MW</span></div><div className="text-xs text-gray-500 mt-1 grid grid-cols-2 gap-x-4"><span><strong>Quantidade:</strong> {activeRackCount} / {TOTAL_RACKS} Racks</span><span><strong>Fabricante:</strong> NVIDIA</span><span><strong>Modelo:</strong> DGX H100 LC</span><span><strong>Capacidade:</strong> {dataCenterTotalCapacity.toFixed(0)} MWₜ</span></div></div></div></div>
                            </div>
                            <div className="border-t border-gray-700 pt-3 mt-2"><div className="flex items-center gap-3"><BoltIcon className="w-6 h-6 text-green-400"/><span className="flex-grow font-semibold text-green-400">Economia de Energia</span><span className={`font-mono text-lg font-bold ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>{electricalEquivalentSaved.toFixed(1)} MW</span></div><p className="text-xs text-gray-500 text-right">(Equivalente Elétrico)</p></div>
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
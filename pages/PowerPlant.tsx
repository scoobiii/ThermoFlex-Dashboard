
import React, { useState, useEffect, useMemo } from 'react';
import { 
    PlantStatus, 
    FuelMode, 
    HistoricalDataPoint, 
    Turbine, 
    Alert, 
    EmissionData,
    HistoricalEmissionPoint,
    LongHistoricalDataPoint,
    TurbineStatus as TurbineStatusEnum
} from '../types';
import { TurbineStatusConfig, ResourceConfig } from '../App';

import PowerOutput from '../components/PowerOutput';
import FuelStatus from '../components/FuelStatus';
import EmissionsMonitor from '../components/EmissionsMonitor';
import TurbineStatus from '../components/TurbineStatus';
import MainTurbineMonitor from '../components/MainTurbineMonitor';
import HistoricalData from '../components/HistoricalData';
import ResourceManagement from '../components/ResourceManagement';

// --- PROPS INTERFACE ---
interface PowerPlantProps {
  plantStatus: PlantStatus;
  powerOutput: number;
  efficiency: number;
  efficiencyGain: number;
  fuelMode: FuelMode;
  flexMix: { h2: number, biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
  turbineStatusConfig: TurbineStatusConfig;
  turbineMaintenanceScores: { [key: number]: number };
  setTurbineMaintenanceScores: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
  resourceConfig: ResourceConfig;
}

export interface ResourceDataPoint {
    time: string;
    water: number;
    gas: number;
    ethanol: number;
    biodiesel: number;
    h2: number;
}

// --- MOCK DATA GENERATION ---
const generateTimeLabel = (index: number, range: '24h' | '7d') => {
    if (range === '24h') {
        const hour = (new Date().getHours() - (23 - index) + 24) % 24;
        return `${hour.toString().padStart(2, '0')}:00`;
    } else {
        const day = new Date();
        day.setDate(day.getDate() - (6 - index));
        return `${day.getDate().toString().padStart(2, '0')}/${(day.getMonth() + 1).toString().padStart(2, '0')}`;
    }
};

const generateHistoricalData = (range: '24h' | '7d'): LongHistoricalDataPoint[] => {
    const points = range === '24h' ? 24 : 7;
    return Array.from({ length: points }, (_, i) => ({
        time: generateTimeLabel(i, range),
        power: 2100 + Math.random() * 300,
        consumption: 350 + Math.random() * 50,
    }));
};

const generateHistoricalResourceData = (range: '24h' | '7d'): ResourceDataPoint[] => {
    const points = range === '24h' ? 24 : 7;
    return Array.from({ length: points }, (_, i) => ({
        time: generateTimeLabel(i, range),
        water: 110 + Math.random() * 20, // m³/h
        gas: 8200 + Math.random() * 600, // m³/h
        ethanol: 50 + Math.random() * 10, // m³/h
        biodiesel: 40 + Math.random() * 8, // m³/h
        h2: 10 + Math.random() * 5, // kg/h
    }));
};


const generateHistoricalEmissions = (): HistoricalEmissionPoint[] => {
    return Array.from({ length: 7 }, (_, i) => ({
        time: `D-${6-i}`,
        nox: 14 + Math.random() * 4,
        sox: 4 + Math.random() * 2,
        co: 22 + Math.random() * 8,
        particulates: 7 + Math.random() * 3,
    }));
};

const initialAlerts: Alert[] = [
    { id: 1, level: 'warning', message: 'Turbina #3: Vibração acima do limiar. Monitorar.', timestamp: '2024-08-05 10:15:00' },
    { id: 2, level: 'info', message: 'Manutenção preventiva da Turbina #5 agendada para 2024-08-10.', timestamp: '2024-08-05 09:30:00' },
];

const initialTurbines: Omit<Turbine, 'status' | 'maintenanceScore'>[] = [
    { id: 1, rpm: 3600, temp: 950, pressure: 18, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500 },
    { id: 2, rpm: 3605, temp: 955, pressure: 18.2, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500 },
    { id: 3, rpm: 3598, temp: 965, pressure: 17.9, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500 },
    { id: 4, rpm: 3600, temp: 940, pressure: 18.1, type: 'Ciclo Rankine', manufacturer: 'GE', model: '7HA.02', isoCapacity: 500 },
    { id: 5, rpm: 0, temp: 80, pressure: 1, type: 'Ciclo Rankine', manufacturer: 'GE', model: '7HA.02', isoCapacity: 500 },
];

type MaximizedWidget = 'power' | 'fuel' | 'emissions' | 'turbines' | 'history' | 'resources' | null;
type TurbineTypeFilter = 'all' | 'Ciclo Combinado' | 'Ciclo Rankine';


// --- MAIN DASHBOARD COMPONENT ---
const PowerPlant: React.FC<PowerPlantProps> = ({
    plantStatus,
    powerOutput,
    efficiency,
    efficiencyGain,
    fuelMode,
    flexMix,
    setFlexMix,
    turbineStatusConfig,
    turbineMaintenanceScores,
    setTurbineMaintenanceScores,
    resourceConfig
}) => {
    // --- STATE MANAGEMENT ---
    const [maximizedWidget, setMaximizedWidget] = useState<MaximizedWidget>(null);
    const [selectedTurbineId, setSelectedTurbineId] = useState<number | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    
    // Data states
    const [turbines, setTurbines] = useState<Turbine[]>([]);
    const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
    const [historicalData, setHistoricalData] = useState<LongHistoricalDataPoint[]>([]);
    const [emissions, setEmissions] = useState<EmissionData>({ nox: 15, sox: 5, co: 25, particulates: 8 });
    const [historicalEmissions, setHistoricalEmissions] = useState<HistoricalEmissionPoint[]>([]);
    const [turbineTypeFilter, setTurbineTypeFilter] = useState<TurbineTypeFilter>('all');
    
    // Resource management state
    const [resourceData, setResourceData] = useState({
        waterConsumption: 120,
        gasConsumption: 8500,
        ethanolConsumption: 55,
        biodieselConsumption: 42,
        h2Consumption: 12,
        waterStorage: { level: 8500, capacity: 10000 },
        gasStorage: { level: 45000, capacity: 50000 },
        ethanolStorage: { level: 15000, capacity: 20000 },
        biodieselStorage: { level: 12000, capacity: 15000 },
        h2Storage: { level: 500, capacity: 1000 },
    });
    const [historicalResourceData, setHistoricalResourceData] = useState<ResourceDataPoint[]>([]);

    // Ambient conditions state
    const [ambient, setAmbient] = useState({ dry: 28.5, wet: 22.1, humidity: 65 });

    // --- EFFECTS FOR DYNAMIC DATA ---

    // Update historical data when time range changes
    useEffect(() => {
        setHistoricalData(generateHistoricalData(timeRange));
        setHistoricalResourceData(generateHistoricalResourceData(timeRange));
    }, [timeRange]);

    // Update emissions based on fuel mode changes
    useEffect(() => {
        if (plantStatus !== PlantStatus.Online) {
            setEmissions({ nox: 0, sox: 0, co: 0, particulates: 0 });
            return;
        }

        let baseEmissions: EmissionData;
        switch(fuelMode) {
            case FuelMode.NaturalGas:
                baseEmissions = { nox: 15, sox: 1, co: 20, particulates: 5 };
                break;
            case FuelMode.Ethanol:
                baseEmissions = { nox: 10, sox: 1, co: 35, particulates: 10 };
                break;
            case FuelMode.Biodiesel:
                baseEmissions = { nox: 18, sox: 3, co: 30, particulates: 12 };
                break;
            case FuelMode.FlexNGH2:
                const h2Ratio = flexMix.h2 / 100;
                baseEmissions = {
                    nox: 15 * (1 - h2Ratio * 0.8), // H2 reduces NOx significantly
                    sox: 1 * (1-h2Ratio),
                    co: 20 * (1 - h2Ratio * 0.1),
                    particulates: 5 * (1 - h2Ratio * 0.5)
                };
                break;
            case FuelMode.FlexEthanolBiodiesel:
                const bioRatio = flexMix.biodiesel / 100;
                baseEmissions = {
                    nox: 10 * (1-bioRatio) + 18 * bioRatio,
                    sox: 1 * (1-bioRatio) + 3 * bioRatio,
                    co: 35 * (1-bioRatio) + 30 * bioRatio,
                    particulates: 10 * (1-bioRatio) + 12 * bioRatio,
                };
                break;
            default:
                baseEmissions = { nox: 15, sox: 5, co: 25, particulates: 8 };
        }
        
        setEmissions({
            nox: Math.max(0, baseEmissions.nox + (Math.random() - 0.5) * 2),
            sox: Math.max(0, baseEmissions.sox + (Math.random() - 0.5) * 0.5),
            co: Math.max(0, baseEmissions.co + (Math.random() - 0.5) * 5),
            particulates: Math.max(0, baseEmissions.particulates + (Math.random() - 0.5) * 1)
        });
    }, [fuelMode, flexMix, plantStatus]);

    // Simulate real-time data for resources
    useEffect(() => {
        const resourceInterval = setInterval(() => {
            if (plantStatus === PlantStatus.Online) {
                setResourceData(prev => ({
                    waterConsumption: Math.max(100, Math.min(150, prev.waterConsumption + (Math.random() - 0.5) * 5)),
                    gasConsumption: Math.max(8000, Math.min(9000, prev.gasConsumption + (Math.random() - 0.5) * 200)),
                    ethanolConsumption: Math.max(45, Math.min(65, prev.ethanolConsumption + (Math.random() - 0.5) * 2)),
                    biodieselConsumption: Math.max(35, Math.min(50, prev.biodieselConsumption + (Math.random() - 0.5) * 2)),
                    h2Consumption: Math.max(8, Math.min(15, prev.h2Consumption + (Math.random() - 0.5) * 1)),
                    waterStorage: {
                        ...prev.waterStorage,
                        level: Math.max(0, Math.min(prev.waterStorage.capacity, prev.waterStorage.level + (Math.random() - 0.51) * 10)), // slight negative bias
                    },
                    gasStorage: {
                        ...prev.gasStorage,
                        level: Math.max(0, Math.min(prev.gasStorage.capacity, prev.gasStorage.level + (Math.random() - 0.51) * 50)), // slight negative bias
                    },
                    ethanolStorage: {
                        ...prev.ethanolStorage,
                        level: Math.max(0, Math.min(prev.ethanolStorage.capacity, prev.ethanolStorage.level + (Math.random() - 0.51) * 20)),
                    },
                    biodieselStorage: {
                        ...prev.biodieselStorage,
                        level: Math.max(0, Math.min(prev.biodieselStorage.capacity, prev.biodieselStorage.level + (Math.random() - 0.51) * 15)),
                    },
                    h2Storage: {
                        ...prev.h2Storage,
                        level: Math.max(0, Math.min(prev.h2Storage.capacity, prev.h2Storage.level + (Math.random() - 0.51) * 5)),
                    }
                }));
            } else {
                setResourceData(prev => ({
                    ...prev,
                    waterConsumption: 0,
                    gasConsumption: 0,
                    ethanolConsumption: 0,
                    biodieselConsumption: 0,
                    h2Consumption: 0,
                }));
            }
        }, 3000);
        return () => clearInterval(resourceInterval);
    }, [plantStatus]);
    
    // Simulate real-time data updates for turbines and ambient conditions
    useEffect(() => {
        setHistoricalEmissions(generateHistoricalEmissions());

        const interval = setInterval(() => {
            setTurbines(prev => prev.map(t => {
                if (t.status !== 'active') return { ...t, rpm: 0, temp: 80, pressure: 1 };

                const newRpm = 3590 + Math.random() * 25;
                const newTemp = 935 + Math.random() * 40;
                const newPressure = 17.7 + Math.random() * 0.6;
                
                return {
                    ...t,
                    rpm: newRpm,
                    temp: newTemp,
                    pressure: newPressure,
                };
            }));
            
            setAmbient(prev => ({
                dry: Math.max(10, Math.min(40, prev.dry + (Math.random() - 0.5) * 0.5)),
                wet: Math.max(8, Math.min(35, prev.wet + (Math.random() - 0.5) * 0.4)),
                humidity: Math.max(20, Math.min(95, prev.humidity + (Math.random() - 0.5) * 2)),
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Merge static turbine data with dynamic status from props
    useEffect(() => {
        setTurbines(initialTurbines.map(t => ({
            ...t,
            status: turbineStatusConfig[t.id] || 'inactive',
            maintenanceScore: turbineMaintenanceScores[t.id] || 0,
        })));
    }, [turbineStatusConfig, turbineMaintenanceScores]);

    // --- HANDLERS ---
    const handlePerformMaintenance = (turbineId: number) => {
        setTurbineMaintenanceScores(prev => ({
            ...prev,
            [turbineId]: 0,
        }));
    };


    // --- COMPUTED VALUES ---
    const powerLoss = useMemo(() => {
        const ISO_TEMP = 15;
        const LOSS_FACTOR_PER_DEGREE = 0.005; // 0.5% loss per degree above ISO
        if (plantStatus !== PlantStatus.Online || ambient.dry <= ISO_TEMP) {
            return 0;
        }
        const tempDifference = ambient.dry - ISO_TEMP;
        return powerOutput * tempDifference * LOSS_FACTOR_PER_DEGREE;
    }, [ambient.dry, powerOutput, plantStatus]);

    const filteredTurbines = useMemo(() => {
        const visibleTurbines = turbines.filter(t => t.status !== 'inactive');
        if (turbineTypeFilter === 'all') {
            return visibleTurbines;
        }
        return visibleTurbines.filter(t => t.type === turbineTypeFilter);
    }, [turbines, turbineTypeFilter]);

    const selectedTurbine = useMemo(() => {
        return turbines.find(t => t.id === selectedTurbineId) || null;
    }, [selectedTurbineId, turbines]);
    
    const shortHistoricalData: HistoricalDataPoint[] = historicalData.map(d => ({ time: d.time, power: d.power }));

    // --- RENDER LOGIC ---

    const renderMaximizedWidget = () => {
        const commonProps = { isMaximizable: true, isMaximized: true, onToggleMaximize: () => setMaximizedWidget(null) };
        switch(maximizedWidget) {
            case 'power': return <PowerOutput powerOutput={powerOutput} efficiency={efficiency} historicalData={shortHistoricalData} efficiencyGain={efficiencyGain} plantStatus={plantStatus} dryBulbTemp={ambient.dry} wetBulbTemp={ambient.wet} humidity={ambient.humidity} powerLoss={powerLoss} {...commonProps} />;
            case 'fuel': return <FuelStatus fuelMode={fuelMode} consumption={historicalData.slice(-1)[0]?.consumption || 0} flexMix={flexMix} setFlexMix={setFlexMix} historicalData={historicalData} timeRange={timeRange} setTimeRange={setTimeRange} {...commonProps} />;
            case 'emissions': return <EmissionsMonitor emissions={emissions} historicalEmissions={historicalEmissions} alerts={alerts} onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} onClearAll={() => setAlerts([])} {...commonProps} />;
            case 'resources': return <ResourceManagement {...resourceData} historicalData={historicalResourceData} resourceConfig={resourceConfig} {...commonProps} />;
            case 'turbines': return <TurbineStatus turbines={filteredTurbines} onSelectTurbine={setSelectedTurbineId} selectedTurbineId={selectedTurbineId} turbineTypeFilter={turbineTypeFilter} setTurbineTypeFilter={setTurbineTypeFilter} onPerformMaintenance={handlePerformMaintenance} {...commonProps} />;
            case 'history': return <HistoricalData data={historicalData} timeRange={timeRange} setTimeRange={setTimeRange} {...commonProps} />;
            default: return null;
        }
    };
    
    if (maximizedWidget) {
        return (
            <div className="mt-6 fixed inset-0 bg-gray-900 z-50 p-8 overflow-y-auto">
                {renderMaximizedWidget()}
            </div>
        )
    }

    return (
        <div className="mt-6">
            <div className="mt-6 grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-6 lg:col-span-3 h-full">
                    <PowerOutput 
                        powerOutput={powerOutput} 
                        efficiency={efficiency} 
                        historicalData={shortHistoricalData} 
                        efficiencyGain={efficiencyGain}
                        plantStatus={plantStatus}
                        dryBulbTemp={ambient.dry}
                        wetBulbTemp={ambient.wet}
                        humidity={ambient.humidity}
                        powerLoss={powerLoss}
                        isMaximizable
                        onToggleMaximize={() => setMaximizedWidget('power')}
                    />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3 h-full">
                    <FuelStatus 
                        fuelMode={fuelMode}
                        consumption={historicalData.slice(-1)[0]?.consumption || 380}
                        flexMix={flexMix}
                        setFlexMix={setFlexMix}
                        isMaximizable
                        onToggleMaximize={() => setMaximizedWidget('fuel')}
                        historicalData={historicalData}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3 h-full">
                    <EmissionsMonitor 
                        emissions={emissions} 
                        historicalEmissions={historicalEmissions} 
                        alerts={alerts}
                        onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
                        onClearAll={() => setAlerts([])}
                        isMaximizable
                        onToggleMaximize={() => setMaximizedWidget('emissions')}
                    />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3 h-full">
                    <ResourceManagement
                        {...resourceData}
                        historicalData={historicalResourceData}
                        resourceConfig={resourceConfig}
                        isMaximizable
                        onToggleMaximize={() => setMaximizedWidget('resources')}
                    />
                </div>
                
                <div className="col-span-12">
                    {selectedTurbine ? (
                        <MainTurbineMonitor 
                            turbine={selectedTurbine} 
                            onClose={() => setSelectedTurbineId(null)}
                            allTurbines={turbines}
                            totalPowerOutput={powerOutput}
                        />
                    ) : (
                        <TurbineStatus 
                            turbines={filteredTurbines} 
                            onSelectTurbine={setSelectedTurbineId} 
                            selectedTurbineId={selectedTurbineId}
                            isMaximizable
                            onToggleMaximize={() => setMaximizedWidget('turbines')}
                            turbineTypeFilter={turbineTypeFilter}
                            setTurbineTypeFilter={setTurbineTypeFilter}
                            onPerformMaintenance={handlePerformMaintenance}
                        />
                    )}
                </div>

                <div className="col-span-12">
                    <HistoricalData
                        data={historicalData}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                        isMaximizable
                        onToggleMaximize={() => setMaximizedWidget('history')}
                    />
                </div>
            </div>
        </div>
    );
};

export default PowerPlant;
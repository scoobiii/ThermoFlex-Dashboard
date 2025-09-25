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
import { TurbineStatusConfig } from '../App';

import ControlPanel from '../components/ControlPanel';
import PowerOutput from '../components/PowerOutput';
import FuelStatus from '../components/FuelStatus';
import EmissionsMonitor from '../components/EmissionsMonitor';
import TurbineStatus from '../components/TurbineStatus';
import MainTurbineMonitor from '../components/MainTurbineMonitor';
import Alerts from '../components/Alerts';
import HistoricalData from '../components/HistoricalData';

// --- PROPS INTERFACE ---
interface PowerPlantProps {
  plantStatus: PlantStatus;
  setPlantStatus: (status: PlantStatus) => void;
  powerOutput: number;
  efficiency: number;
  efficiencyGain: number;
  fuelMode: FuelMode;
  flexMix: { h2: number, biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
  turbineStatusConfig: TurbineStatusConfig;
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

const initialTurbines: Omit<Turbine, 'status'>[] = [
    { id: 1, rpm: 3600, temp: 950, pressure: 18, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500, needsMaintenance: false },
    { id: 2, rpm: 3605, temp: 955, pressure: 18.2, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500, needsMaintenance: false },
    { id: 3, rpm: 3598, temp: 965, pressure: 17.9, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-9000HL', isoCapacity: 500, needsMaintenance: true },
    { id: 4, rpm: 3600, temp: 940, pressure: 18.1, type: 'Ciclo Rankine', manufacturer: 'GE', model: '7HA.02', isoCapacity: 500, needsMaintenance: false },
    { id: 5, rpm: 0, temp: 80, pressure: 1, type: 'Ciclo Rankine', manufacturer: 'GE', model: '7HA.02', isoCapacity: 500, needsMaintenance: false },
];

type MaximizedWidget = 'power' | 'fuel' | 'emissions' | 'turbines' | 'alerts' | 'history' | null;
type TurbineTypeFilter = 'all' | 'Ciclo Combinado' | 'Ciclo Rankine';


// --- MAIN DASHBOARD COMPONENT ---
const PowerPlant: React.FC<PowerPlantProps> = ({
    plantStatus,
    setPlantStatus,
    powerOutput,
    efficiency,
    efficiencyGain,
    fuelMode,
    flexMix,
    setFlexMix,
    turbineStatusConfig
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
    
    // Ambient conditions state
    const [ambient, setAmbient] = useState({ dry: 28.5, wet: 22.1, humidity: 65 });

    // --- EFFECTS FOR DYNAMIC DATA ---

    // Update historical data when time range changes
    useEffect(() => {
        setHistoricalData(generateHistoricalData(timeRange));
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
    
    // Simulate real-time data updates for turbines and ambient conditions
    useEffect(() => {
        setHistoricalEmissions(generateHistoricalEmissions());

        const interval = setInterval(() => {
            // Update turbines
            setTurbines(prev => prev.map(t => {
                if (t.status !== 'active') return t;
                return {
                    ...t,
                    rpm: 3595 + Math.random() * 10,
                    temp: 940 + Math.random() * 25,
                    pressure: 17.8 + Math.random() * 0.4
                }
            }));
            
            // Update ambient conditions
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
        })));
    }, [turbineStatusConfig]);


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
        if (turbineTypeFilter === 'all') return turbines;
        return turbines.filter(t => t.type === turbineTypeFilter);
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
            case 'emissions': return <EmissionsMonitor emissions={emissions} historicalEmissions={historicalEmissions} {...commonProps} />;
            case 'turbines': return <TurbineStatus turbines={filteredTurbines} onSelectTurbine={setSelectedTurbineId} selectedTurbineId={selectedTurbineId} turbineTypeFilter={turbineTypeFilter} setTurbineTypeFilter={setTurbineTypeFilter} {...commonProps} />;
            case 'alerts': return <Alerts alerts={alerts} onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} onClearAll={() => setAlerts([])} {...commonProps} />;
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
            <ControlPanel plantStatus={plantStatus} setPlantStatus={setPlantStatus} />
            <div className="mt-6 grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4 h-full">
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
                <div className="col-span-12 lg:col-span-4 h-full">
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
                <div className="col-span-12 lg:col-span-4 h-full">
                    <EmissionsMonitor 
                        emissions={emissions} 
                        historicalEmissions={historicalEmissions} 
                        isMaximizable
                        onToggleMaximize={() => setMaximizedWidget('emissions')}
                    />
                </div>
                
                <div className="col-span-12 lg:col-span-8">
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
                        />
                    )}
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Alerts 
                        alerts={alerts} 
                        onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
                        onClearAll={() => setAlerts([])}
                        isMaximizable
                        onToggleMaximize={() => setMaximizedWidget('alerts')}
                    />
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

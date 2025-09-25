import React, { useState, useEffect, useMemo } from 'react';
import { PlantStatus, FuelMode, Turbine, Alert, EmissionData, HistoricalEmissionPoint, HistoricalDataPoint, LongHistoricalDataPoint, TurbineStatus } from '../types';
import { TurbineStatusConfig } from '../App';
import ControlPanel from '../components/ControlPanel';
import PowerOutput from '../components/PowerOutput';
import FuelStatus from '../components/FuelStatus';
import EmissionsMonitor from '../components/EmissionsMonitor';
import TurbineStatusComponent from '../components/TurbineStatus';
import MainTurbineMonitor from '../components/MainTurbineMonitor';
import Alerts from '../components/Alerts';
import HistoricalData from '../components/HistoricalData';

// Static Turbine Specifications
// FIX: Add 'as const' to ensure TypeScript infers the 'type' property as a literal type ('Ciclo Combinado' | 'Ciclo Rankine') instead of a generic 'string'. This resolves the type mismatch with the 'Turbine' interface.
const TURBINE_SPECS = [
  { id: 1, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-A35', isoCapacity: 500 },
  { id: 2, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-A35', isoCapacity: 500 },
  { id: 3, type: 'Ciclo Combinado', manufacturer: 'Siemens', model: 'SGT-A35', isoCapacity: 500 },
  { id: 4, type: 'Ciclo Rankine', manufacturer: 'GE', model: 'STF-D200', isoCapacity: 500 },
  { id: 5, type: 'Ciclo Rankine', manufacturer: 'GE', model: 'STF-D200', isoCapacity: 500 },
] as const;

// Generate Mock Data
const generateTurbine = (id: number, status: TurbineStatus): Turbine => {
  const spec = TURBINE_SPECS.find(s => s.id === id)!;
  const isActive = status === 'active';
  return {
    ...spec,
    status,
    rpm: isActive ? 3600 + Math.floor(Math.random() * 50 - 25) : 0,
    temp: isActive ? 850 + Math.floor(Math.random() * 100 - 50) : 25,
    pressure: isActive ? 15 + Math.random() * 2 - 1 : 1,
    needsMaintenance: id === 3, // Example
  };
};

const initialAlerts: Alert[] = [
  { id: 1, level: 'warning', message: 'Turbina #3: Vibração acima do normal detectada.', timestamp: '2024-08-05 10:15:00' },
  { id: 2, level: 'info', message: 'Manutenção programada para o sistema de refrigeração amanhã.', timestamp: '2024-08-05 09:30:00' },
];

type MaximizedWidget = 'power' | 'fuel' | 'emissions' | 'turbines' | 'alerts' | 'history' | null;
type TurbineTypeFilter = 'all' | 'Ciclo Combinado' | 'Ciclo Rankine';

interface PowerPlantProps {
  plantStatus: PlantStatus;
  setPlantStatus: (status: PlantStatus) => void;
  powerOutput: number;
  setPowerOutput: React.Dispatch<React.SetStateAction<number>>;
  efficiency: number;
  setEfficiency: React.Dispatch<React.SetStateAction<number>>;
  fuelMode: FuelMode;
  flexMix: { h2: number; biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
  turbineStatusConfig: TurbineStatusConfig;
  efficiencyGain: number;
}

const PowerPlant: React.FC<PowerPlantProps> = ({
  plantStatus,
  setPlantStatus,
  powerOutput,
  setPowerOutput,
  efficiency,
  setEfficiency,
  fuelMode,
  flexMix,
  setFlexMix,
  turbineStatusConfig,
  efficiencyGain,
}) => {
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  const [selectedTurbineId, setSelectedTurbineId] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  
  const [emissions, setEmissions] = useState<EmissionData>({ nox: 15.2, sox: 4.1, co: 30.5, particulates: 8.9 });
  const [historicalEmissions, setHistoricalEmissions] = useState<HistoricalEmissionPoint[]>(
    Array.from({ length: 7 }, (_, i) => ({
      time: `D-${7-i}`,
      nox: 14 + Math.random() * 2,
      sox: 3.5 + Math.random(),
      co: 28 + Math.random() * 5,
      particulates: 8 + Math.random() * 2,
    }))
  );
  
  const [historicalDataShort, setHistoricalDataShort] = useState<HistoricalDataPoint[]>(
    Array.from({ length: 20 }, (_, i) => ({ time: `${19-i}m`, power: 2200 + Math.random() * 100 }))
  );
  const [historicalDataLong, setHistoricalDataLong] = useState<LongHistoricalDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const [maximizedWidget, setMaximizedWidget] = useState<MaximizedWidget>(null);
  const [turbineTypeFilter, setTurbineTypeFilter] = useState<TurbineTypeFilter>('all');


  // New state for ambient conditions and power loss
  const [dryBulbTemp, setDryBulbTemp] = useState(25.0);
  const [wetBulbTemp, setWetBulbTemp] = useState(22.0);
  const [humidity, setHumidity] = useState(70);
  const [powerLoss, setPowerLoss] = useState(0);

  useEffect(() => {
    const isOnline = plantStatus === PlantStatus.Online;
    
    // Update Turbines based on config
    setTurbines(Object.entries(turbineStatusConfig).map(([id, status]) => generateTurbine(Number(id), status as TurbineStatus)));

    const interval = setInterval(() => {
      if (!isOnline) {
        setPowerLoss(0); // Reset loss when offline
        return;
      }

       // Simulate ambient conditions
      const newDryBulbTemp = Number(Math.max(10, Math.min(45, dryBulbTemp + (Math.random() - 0.5) * 0.5)).toFixed(1));
      setDryBulbTemp(newDryBulbTemp);
      setWetBulbTemp(prev => Number(Math.max(8, Math.min(newDryBulbTemp - 1, prev + (Math.random() - 0.5) * 0.4)).toFixed(1)));
      setHumidity(prev => Math.round(Math.max(20, Math.min(99, prev + (Math.random() - 0.5) * 2))));

      // Calculate power loss based on new ambient temp
      const ISO_TEMP = 15;
      const EFFICIENCY_LOSS_PER_DEGREE = 0.007; // 0.7% loss per degree C over ISO
      const tempDifference = Math.max(0, newDryBulbTemp - ISO_TEMP);
      const powerLossPercentage = tempDifference * EFFICIENCY_LOSS_PER_DEGREE;
      
      let calculatedLoss = 0;
      // The current powerOutput prop already reflects the loss.
      // We calculate the ideal power and then the loss from that.
      if (powerLossPercentage > 0 && powerLossPercentage < 1) {
        const idealPower = powerOutput / (1 - powerLossPercentage);
        calculatedLoss = idealPower - powerOutput;
      }
      setPowerLoss(calculatedLoss);

      // Simulate Power Output Fluctuation
      const activeTurbinesCount = Object.values(turbineStatusConfig).filter(s => s === 'active').length;
      const basePower = activeTurbinesCount * (34 * 15); // Simple power calc
      setPowerOutput(prev => Math.max(0, Math.min(basePower * 1.1, prev + (Math.random() - 0.5) * 10)));
      setEfficiency(prev => Math.max(55, Math.min(62, prev + (Math.random() - 0.5) * 0.1)));

      // Simulate Live Data
      setTurbines(prev => prev.map(t => generateTurbine(t.id, turbineStatusConfig[t.id] || 'inactive')));
      setEmissions(prev => ({
          nox: Math.max(10, Math.min(25, prev.nox + (Math.random() - 0.5) * 0.5)),
          sox: Math.max(2, Math.min(10, prev.sox + (Math.random() - 0.5) * 0.2)),
          co: Math.max(20, Math.min(50, prev.co + (Math.random() - 0.5) * 1)),
          particulates: Math.max(5, Math.min(15, prev.particulates + (Math.random() - 0.5) * 0.3)),
      }));

      // Update short-term history
      setHistoricalDataShort(prev => {
        const newData = [...prev.slice(1), { time: 'Agora', power: powerOutput }];
        return newData.map((d, i) => ({...d, time: i === newData.length-1 ? 'Agora' : `${newData.length-1-i}m` }));
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [plantStatus, setPowerOutput, setEfficiency, turbineStatusConfig, dryBulbTemp, wetBulbTemp, humidity, powerOutput]); 

  useEffect(() => {
    // Generate long historical data based on time range
    const generateData = (points: number, unit: 'h' | 'd') => {
        return Array.from({ length: points }, (_, i) => {
            const power = 2100 + Math.random() * 200;
            return {
                time: `${unit==='h' ? 'T-' : ''}${points-i}${unit}`,
                power: power,
                consumption: (power / (58.5 / 100)) / 100 + Math.random() * 5,
            }
        });
    }
    if (timeRange === '24h') setHistoricalDataLong(generateData(24, 'h'));
    else setHistoricalDataLong(generateData(7, 'd'));
  }, [timeRange]);

  const fuelConsumption = useMemo(() => (powerOutput / (efficiency / 100)) / 100, [powerOutput, efficiency]);

  const handleSelectTurbine = (id: number | null) => {
    if (selectedTurbineId === id) {
        setSelectedTurbineId(null); // Deselect if clicking the same one
    } else {
        setSelectedTurbineId(id);
    }
  };
  
  const handleDismissAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id));
  const handleClearAlerts = () => setAlerts([]);
  
  const selectedTurbine = useMemo(() => turbines.find(t => t.id === selectedTurbineId), [turbines, selectedTurbineId]);

  const filteredTurbines = useMemo(() => {
    if (turbineTypeFilter === 'all') {
      return turbines;
    }
    return turbines.filter(t => t.type === turbineTypeFilter);
  }, [turbines, turbineTypeFilter]);
  
  const toggleMaximize = (widget: MaximizedWidget) => {
    setMaximizedWidget(current => current === widget ? null : widget);
  }

  const renderWidget = (widget: MaximizedWidget) => {
    switch(widget) {
      case 'power':
        return <PowerOutput 
            powerOutput={powerOutput} 
            efficiency={efficiency} 
            historicalData={historicalDataShort} 
            efficiencyGain={efficiencyGain} 
            plantStatus={plantStatus}
            dryBulbTemp={dryBulbTemp}
            wetBulbTemp={wetBulbTemp}
            humidity={humidity}
            powerLoss={powerLoss}
            isMaximizable 
            isMaximized={maximizedWidget==='power'} 
            onToggleMaximize={() => toggleMaximize('power')} 
        />;
      case 'fuel':
        return <FuelStatus 
            fuelMode={fuelMode} 
            consumption={fuelConsumption} 
            flexMix={flexMix} 
            setFlexMix={setFlexMix} 
            isMaximizable 
            isMaximized={maximizedWidget==='fuel'} 
            onToggleMaximize={() => toggleMaximize('fuel')}
            historicalData={historicalDataLong}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
        />;
      case 'emissions':
        return <EmissionsMonitor emissions={emissions} historicalEmissions={historicalEmissions} isMaximizable isMaximized={maximizedWidget==='emissions'} onToggleMaximize={() => toggleMaximize('emissions')} />;
      case 'turbines':
        return selectedTurbine ? 
            <MainTurbineMonitor turbine={selectedTurbine} onClose={() => handleSelectTurbine(null)} allTurbines={turbines} totalPowerOutput={powerOutput} /> :
            <TurbineStatusComponent turbines={filteredTurbines} onSelectTurbine={handleSelectTurbine} selectedTurbineId={selectedTurbineId} turbineTypeFilter={turbineTypeFilter} setTurbineTypeFilter={setTurbineTypeFilter} isMaximizable isMaximized={maximizedWidget==='turbines'} onToggleMaximize={() => toggleMaximize('turbines')} />;
      case 'alerts':
        return <Alerts alerts={alerts} onDismiss={handleDismissAlert} onClearAll={handleClearAlerts} isMaximizable isMaximized={maximizedWidget==='alerts'} onToggleMaximize={() => toggleMaximize('alerts')} />;
      case 'history':
        return <HistoricalData data={historicalDataLong} timeRange={timeRange} setTimeRange={setTimeRange} isMaximizable isMaximized={maximizedWidget==='history'} onToggleMaximize={() => toggleMaximize('history')} />;
      default:
        return null;
    }
  }

  if (maximizedWidget) {
    return (
      <div className="mt-6">
        <div className="h-[80vh]">
          {renderWidget(maximizedWidget)}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
        <ControlPanel plantStatus={plantStatus} setPlantStatus={setPlantStatus} />
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Column 1 */}
            <div className="lg:col-span-1 space-y-6">
                {renderWidget('power')}
                {renderWidget('fuel')}
            </div>
            {/* Column 2 & 3 */}
            <div className="lg:col-span-2 space-y-6">
                <div className="h-[420px]">
                  {renderWidget('turbines')}
                </div>
                <div className="h-[320px]">
                  {renderWidget('history')}
                </div>
            </div>
            {/* Column 4 */}
            <div className="lg:col-span-1 space-y-6">
                {renderWidget('emissions')}
                {renderWidget('alerts')}
            </div>
        </div>
    </div>
  );
};

export default PowerPlant;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlantStatus, FuelMode, EmissionData, HistoricalDataPoint, Alert, Turbine, LongHistoricalDataPoint, HistoricalEmissionPoint } from '../types';
import ControlPanel from '../components/ControlPanel';
import PowerOutput from '../components/PowerOutput';
import FuelStatus from '../components/FuelStatus';
import EmissionsMonitor from '../components/EmissionsMonitor';
import TurbineStatus from '../components/TurbineStatus';
import Alerts from '../components/Alerts';
import MainTurbineMonitor from '../components/MainTurbineMonitor';
import HistoricalData from '../components/HistoricalData';

interface PowerPlantProps {
  plantStatus: PlantStatus;
  powerOutput: number;
  efficiency: number;
  setPlantStatus: (status: PlantStatus) => void;
  setPowerOutput: (power: number) => void;
  setEfficiency: (efficiency: number) => void;
}


const PowerPlant: React.FC<PowerPlantProps> = ({ plantStatus, powerOutput, efficiency, setPlantStatus, setPowerOutput, setEfficiency }) => {
  const [fuelMode, setFuelMode] = useState<FuelMode>(FuelMode.NaturalGas);
  const [flexMix, setFlexMix] = useState<{ h2: number, biodiesel: number }>({ h2: 20, biodiesel: 50 });
  
  const [fuelConsumption, setFuelConsumption] = useState(400);
  
  const [emissions, setEmissions] = useState<EmissionData>({ nox: 10.5, sox: 4.2, co: 30.1, particulates: 7.8 });
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const savedAlerts = localStorage.getItem('dashboard_alerts');
      return savedAlerts ? JSON.parse(savedAlerts) : [];
    } catch (error) {
      console.error("Failed to parse alerts from localStorage", error);
      return [];
    }
  });

  const [selectedTurbineId, setSelectedTurbineId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const [longHistoricalData, setLongHistoricalData] = useState<LongHistoricalDataPoint[]>([]);
  const [historicalEmissions, setHistoricalEmissions] = useState<HistoricalEmissionPoint[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('dashboard_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error("Failed to save alerts to localStorage", error);
    }
  }, [alerts]);

  const generateInitialData = useCallback(() => {
    const now = new Date();
    const initialHistory = Array.from({ length: 30 }, (_, i) => {
      const time = new Date(now.getTime() - (29 - i) * 60000);
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        power: 2200 + Math.random() * 150 - 75,
      };
    });
    setHistoricalData(initialHistory);

    const initialTurbines: Turbine[] = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      status: 'active',
      rpm: 3500 + Math.floor(Math.random() * 200) - 100,
      temp: 580 + Math.floor(Math.random() * 40) - 20,
      pressure: 20 + Math.floor(Math.random() * 4) - 2,
    }));
    setTurbines(initialTurbines);
    
    const generateLongTermData = () => {
        const now = new Date();
        const data24h: LongHistoricalDataPoint[] = [];
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60 * 60 * 1000);
            data24h.push({
                time: `${time.getHours().toString().padStart(2, '0')}:00`,
                power: 2200 + Math.random() * 200 - 100,
                consumption: 400 + Math.random() * 50 - 25,
            });
        }

        const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const data7d: LongHistoricalDataPoint[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            data7d.push({
                time: dayLabels[date.getDay()],
                power: 2100 + Math.random() * 400 - 200,
                consumption: 380 + Math.random() * 80 - 40,
            });
        }
        setLongHistoricalData([...data24h, ...data7d]);

        const emissionHistory7d: HistoricalEmissionPoint[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            emissionHistory7d.push({
                time: dayLabels[date.getDay()],
                nox: 10 + Math.random() * 10 - 5,
                sox: 4 + Math.random() * 4 - 2,
                co: 30 + Math.random() * 15 - 7.5,
                particulates: 8 + Math.random() * 5 - 2.5,
            });
        }
        setHistoricalEmissions(emissionHistory7d);
    };
    generateLongTermData();
  }, []);

  const addAlert = useCallback((level: 'critical' | 'warning' | 'info', message: string) => {
    setAlerts(prev => {
        if (prev.some(a => a.message === message)) return prev; // Avoid duplicate alerts
        const newAlert: Alert = {
          id: Date.now(),
          level,
          message,
          timestamp: new Date().toLocaleString(),
        };
        return [newAlert, ...prev].slice(0, 5); // Keep max 5 alerts
    });
  }, []);
  
  const updateData = useCallback(() => {
    if (plantStatus !== PlantStatus.Online) {
      setPowerOutput(0);
      setEfficiency(0);
      setFuelConsumption(0);
      setTurbines(prevTurbines => {
        const newTurbines: Turbine[] = prevTurbines.map(t => ({...t, status: 'inactive', rpm: 0, temp: 25, pressure: 1 }));
        
        newTurbines.forEach((newTurbine, index) => {
            const oldTurbine = prevTurbines[index];
            if (oldTurbine && oldTurbine.status === 'active' && newTurbine.status === 'inactive') {
                addAlert('warning', `Turbina #${newTurbine.id} desativada (usina offline).`);
            }
        });
        return newTurbines;
      });
      return;
    };
    
    let basePower = 2250, baseEfficiency = 58.5, baseNox = 9, baseSox = 0.5, baseCo = 20, baseParts = 1.5, baseConsumption=400;

    switch (fuelMode) {
      case FuelMode.Ethanol:
        basePower = 2100; baseEfficiency = 55.0; baseNox = 8; baseSox = 0.1; baseCo = 15; baseParts = 1.0; baseConsumption = 450;
        break;
      case FuelMode.Biodiesel:
        basePower = 2000; baseEfficiency = 53.5; baseNox = 18; baseSox = 0.8; baseCo = 25; baseParts = 8.0; baseConsumption = 480;
        break;
      case FuelMode.FlexNGH2:
        const h2Factor = flexMix.h2 / 100;
        basePower *= (1 + h2Factor * 0.05);
        baseEfficiency *= (1 + h2Factor * 0.02);
        baseNox *= (1 - h2Factor * 0.4);
        baseSox *= (1 - h2Factor * 0.9);
        baseCo *= (1 - h2Factor * 0.2);
        baseParts *= (1 - h2Factor * 0.6);
        baseConsumption *= (1 - h2Factor * 0.1);
        break;
      case FuelMode.FlexEthanolBiodiesel:
        const bioFactor = flexMix.biodiesel / 100;
        basePower = 2100 * (1 - bioFactor) + 2000 * bioFactor;
        baseEfficiency = 55.0 * (1-bioFactor) + 53.5 * bioFactor;
        baseNox = 8 * (1 - bioFactor) + 18 * bioFactor;
        baseSox = 0.1 * (1 - bioFactor) + 0.8 * bioFactor;
        baseCo = 15 * (1 - bioFactor) + 25 * bioFactor;
        baseParts = 1.0 * (1-bioFactor) + 8.0 * bioFactor;
        baseConsumption = 450 * (1-bioFactor) + 480 * bioFactor;
        break;
    }

    const newPower = basePower + Math.random() * 100 - 50;
    setPowerOutput(newPower);
    setEfficiency(baseEfficiency + Math.random() * 0.5 - 0.25);
    setFuelConsumption(baseConsumption + Math.random() * 10 - 5);
    
    const newEmissions = {
      nox: baseNox + Math.random() * 1 - 0.5,
      sox: baseSox + Math.random() * 0.5 - 0.25,
      co: baseCo + Math.random() * 2 - 1,
      particulates: baseParts + Math.random() * 1 - 0.5,
    };
    setEmissions(newEmissions);
    
    setHistoricalData(prev => {
        const newPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            power: newPower,
        };
        return [...prev.slice(1), newPoint];
    });

    setTurbines(prevTurbines => {
        const newTurbines: Turbine[] = prevTurbines.map(t => {
            const rand = Math.random();

            if ((t.status === 'error' || t.status === 'inactive') && rand < 0.05) {
                return { ...t, status: 'active', rpm: 3500, temp: 580, pressure: 20 };
            }
            if (t.status === 'error' || t.status === 'inactive') return t;

            if (rand < 0.005) {
                return { ...t, status: 'error', rpm: 0, temp: 950 + Math.random() * 100, pressure: 0 };
            }
            if (rand > 0.99) {
                 return { ...t, status: 'inactive', rpm: 0, temp: 50, pressure: 1 };
            }

            const newRpm = t.rpm + Math.floor(Math.random() * 50) - 25;
            return {
                ...t,
                status: 'active',
                rpm: Math.max(3000, Math.min(4000, newRpm)),
                temp: 580 + Math.floor(Math.random() * 40) - 20,
                pressure: 20 + Math.floor(Math.random() * 4) - 2,
            };
        });

        newTurbines.forEach((newTurbine, index) => {
            const oldTurbine = prevTurbines[index];
            if (!oldTurbine) return;

            if (oldTurbine.status !== 'error' && newTurbine.status === 'error') {
                addAlert('critical', `Falha crítica detectada na Turbina #${newTurbine.id}!`);
            }
            if (oldTurbine.status === 'active' && newTurbine.status === 'inactive') {
                addAlert('warning', `Turbina #${newTurbine.id} foi desativada.`);
            }
            if ((oldTurbine.status === 'error' || oldTurbine.status === 'inactive') && newTurbine.status === 'active') {
                addAlert('info', `Turbina #${newTurbine.id} está online novamente.`);
            }
        });

        return newTurbines;
    });


    if (newPower < basePower * 0.9) {
      addAlert('warning', `Power output is lower than expected (${newPower.toFixed(0)} MW).`);
    }
    if (newEmissions.nox > 20) {
      addAlert('critical', `High NOx emissions detected! Value: ${newEmissions.nox.toFixed(1)} kg/h`);
    }

  }, [plantStatus, fuelMode, flexMix, addAlert, setPowerOutput, setEfficiency]);

  useEffect(() => {
    generateInitialData();
  }, [generateInitialData]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      updateData();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [updateData]);

  const selectedTurbine = useMemo(() => {
    if (selectedTurbineId === null) return null;
    return turbines.find(t => t.id === selectedTurbineId) || null;
  }, [selectedTurbineId, turbines]);

  const handleSelectTurbine = useCallback((id: number) => {
    setSelectedTurbineId(prevId => (prevId === id ? null : id));
  }, []);

  const handleCloseTurbineMonitor = useCallback(() => {
    setSelectedTurbineId(null);
  }, []);
  
  const handleDismissAlert = useCallback((id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleClearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const historicalChartData = useMemo(() => {
    return timeRange === '24h'
      ? longHistoricalData.slice(0, 24)
      : longHistoricalData.slice(24);
  }, [longHistoricalData, timeRange]);

  return (
    <>
        <ControlPanel
          fuelMode={fuelMode}
          setFuelMode={setFuelMode}
          plantStatus={plantStatus}
          setPlantStatus={setPlantStatus}
        />

        <main className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div className="lg:col-span-1 xl:col-span-1">
            <PowerOutput powerOutput={powerOutput} efficiency={efficiency} historicalData={historicalData} />
          </div>
          <div className="lg:col-span-1 xl:col-span-1">
            <FuelStatus fuelMode={fuelMode} consumption={fuelConsumption} flexMix={flexMix} setFlexMix={setFlexMix} />
          </div>
          <div className="md:col-span-2 lg:col-span-2 xl:col-span-3">
            <EmissionsMonitor emissions={emissions} historicalEmissions={historicalEmissions} />
          </div>

          <div className="md:col-span-2 lg:col-span-4 xl:col-span-5">
            <TurbineStatus turbines={turbines} onSelectTurbine={handleSelectTurbine} selectedTurbineId={selectedTurbineId} />
          </div>
          
          {selectedTurbine ? (
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-3">
              <MainTurbineMonitor turbine={selectedTurbine} onClose={handleCloseTurbineMonitor} allTurbines={turbines} totalPowerOutput={powerOutput} />
            </div>
          ) : (
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-3">
              <HistoricalData data={historicalChartData} timeRange={timeRange} setTimeRange={setTimeRange} />
            </div>
          )}

          <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
            <Alerts alerts={alerts} onDismiss={handleDismissAlert} onClearAll={handleClearAlerts} />
          </div>

        </main>
    </>
  );
};

export default PowerPlant;

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
import { TurbineStatusConfig } from '../App';

interface PowerPlantProps {
  plantStatus: PlantStatus;
  setPlantStatus: (status: PlantStatus) => void;
  powerOutput: number;
  setPowerOutput: (power: number) => void;
  efficiency: number;
  setEfficiency: (efficiency: number) => void;
  fuelMode: FuelMode;
  flexMix: { h2: number; biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
  turbineStatusConfig: TurbineStatusConfig;
}

const FUEL_PROFILES = {
  [FuelMode.NaturalGas]: { power: 2250, efficiency: 58.5, nox: 9, sox: 0.5, co: 20, particulates: 1.5, consumption: 400 },
  [FuelMode.Ethanol]: { power: 2100, efficiency: 55.0, nox: 8, sox: 0.1, co: 15, particulates: 1.0, consumption: 450 },
  [FuelMode.Biodiesel]: { power: 2000, efficiency: 53.5, nox: 18, sox: 0.8, co: 25, particulates: 8.0, consumption: 480 },
};

const PowerPlant: React.FC<PowerPlantProps> = ({ 
    plantStatus, setPlantStatus, 
    powerOutput, setPowerOutput,
    efficiency, setEfficiency,
    fuelMode, flexMix, setFlexMix, turbineStatusConfig
}) => {
  const [fuelConsumption, setFuelConsumption] = useState(400);
  const [emissions, setEmissions] = useState<EmissionData>({ nox: 10.5, sox: 4.2, co: 30.1, particulates: 7.8 });
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [turbines, setTurbines] = useState<Turbine[]>([]);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTurbineId, setSelectedTurbineId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const [longHistoricalData, setLongHistoricalData] = useState<LongHistoricalDataPoint[]>([]);
  const [historicalEmissions, setHistoricalEmissions] = useState<HistoricalEmissionPoint[]>([]);

  const addAlert = useCallback((level: 'critical' | 'warning' | 'info', message: string) => {
    setAlerts(prev => {
        if (prev.some(a => a.message === message)) return prev;
        const newAlert: Alert = {
          id: Date.now(),
          level,
          message,
          timestamp: new Date().toLocaleString(),
        };
        return [newAlert, ...prev].slice(0, 5);
    });
  }, []);

  const updateData = useCallback(() => {
    if (plantStatus !== PlantStatus.Online) {
      setPowerOutput(0);
      setEfficiency(0);
      setFuelConsumption(0);
      setEmissions({ nox: 0, sox: 0, co: 0, particulates: 0 });
      setTurbines(prev => prev.map(t => ({ ...t, rpm: 0, temp: 25, pressure: 1 })));
      return;
    };

    let baseProfile;
    if (fuelMode === FuelMode.FlexNGH2) {
        const h2Factor = flexMix.h2 / 100;
        const ng = FUEL_PROFILES[FuelMode.NaturalGas];
        baseProfile = {
            power: ng.power * (1 + h2Factor * 0.05),
            efficiency: ng.efficiency * (1 + h2Factor * 0.02),
            nox: ng.nox * (1 - h2Factor * 0.4),
            sox: ng.sox * (1 - h2Factor * 0.9),
            co: ng.co * (1 - h2Factor * 0.2),
            particulates: ng.particulates * (1 - h2Factor * 0.6),
            consumption: ng.consumption * (1 - h2Factor * 0.1),
        };
    } else if (fuelMode === FuelMode.FlexEthanolBiodiesel) {
        const bioFactor = flexMix.biodiesel / 100;
        const eth = FUEL_PROFILES[FuelMode.Ethanol];
        const bio = FUEL_PROFILES[FuelMode.Biodiesel];
        baseProfile = {
            power: eth.power * (1 - bioFactor) + bio.power * bioFactor,
            efficiency: eth.efficiency * (1 - bioFactor) + bio.efficiency * bioFactor,
            nox: eth.nox * (1 - bioFactor) + bio.nox * bioFactor,
            sox: eth.sox * (1 - bioFactor) + bio.sox * bioFactor,
            co: eth.co * (1 - bioFactor) + bio.co * bioFactor,
            particulates: eth.particulates * (1 - bioFactor) + bio.particulates * bioFactor,
            consumption: eth.consumption * (1 - bioFactor) + bio.consumption * bioFactor,
        };
    } else {
        baseProfile = FUEL_PROFILES[fuelMode];
    }
    
    const { power, efficiency, consumption, ...emissionsProfile } = baseProfile;
    const newPower = power + Math.random() * 100 - 50;
    setPowerOutput(newPower);
    setEfficiency(efficiency + Math.random() * 0.5 - 0.25);
    setFuelConsumption(consumption + Math.random() * 10 - 5);
    
    setEmissions({
      nox: emissionsProfile.nox + Math.random() * 1 - 0.5,
      sox: emissionsProfile.sox + Math.random() * 0.5 - 0.25,
      co: emissionsProfile.co + Math.random() * 2 - 1,
      particulates: emissionsProfile.particulates + Math.random() * 1 - 0.5,
    });
    
    setHistoricalData(prev => {
        const newPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            power: newPower,
        };
        return [...prev.slice(1), newPoint];
    });

    setTurbines(prevTurbines => {
        return prevTurbines.map(t => {
            const configuredStatus = turbineStatusConfig[t.id];
            
            if (t.status !== configuredStatus) {
                if(configuredStatus === 'active' && t.status !== 'active') addAlert('info', `Turbina #${t.id} está online.`);
                if(configuredStatus === 'inactive' && t.status !== 'inactive') addAlert('warning', `Turbina #${t.id} foi desativada.`);
                if(configuredStatus === 'error' && t.status !== 'error') addAlert('critical', `Falha crítica configurada para Turbina #${t.id}.`);
            }

            if (configuredStatus === 'active') {
                const newRpm = t.rpm > 0 ? t.rpm + Math.floor(Math.random() * 50) - 25 : 3500;
                return {
                    ...t,
                    status: 'active',
                    rpm: Math.max(3000, Math.min(4000, newRpm)),
                    temp: 580 + Math.floor(Math.random() * 40) - 20,
                    pressure: 20 + Math.floor(Math.random() * 4) - 2,
                };
            }
            
            return {
                ...t,
                status: configuredStatus,
                rpm: 0,
                temp: configuredStatus === 'error' ? 950 + Math.random() * 100 : 50,
                pressure: configuredStatus === 'error' ? 0 : 1
            };
        });
    });

  }, [plantStatus, fuelMode, flexMix, addAlert, setPowerOutput, setEfficiency, turbineStatusConfig]);
  
  const generateInitialData = useCallback(() => {
    setHistoricalData(Array.from({ length: 30 }, (_, i) => ({
      time: new Date(Date.now() - (29 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      power: 2200 + Math.random() * 150 - 75,
    })));
    setTurbines(Array.from({ length: 5 }, (_, i) => ({
      id: i + 1, status: 'active', rpm: 3500, temp: 580, pressure: 20,
    })));
    // Other initial data generation can remain the same
  }, []);

  useEffect(() => {
    generateInitialData();
  }, [generateInitialData]);
  
  useEffect(() => {
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, [updateData]);

  const selectedTurbine = useMemo(() => turbines.find(t => t.id === selectedTurbineId) || null, [selectedTurbineId, turbines]);
  const handleSelectTurbine = useCallback((id: number) => setSelectedTurbineId(prevId => (prevId === id ? null : id)), []);
  const handleCloseTurbineMonitor = useCallback(() => setSelectedTurbineId(null), []);
  const handleDismissAlert = useCallback((id: number) => setAlerts(prev => prev.filter(a => a.id !== id)), []);
  const handleClearAlerts = useCallback(() => setAlerts([]), []);

  const historicalChartData = useMemo(() => timeRange === '24h' ? longHistoricalData.slice(0, 24) : longHistoricalData.slice(24), [longHistoricalData, timeRange]);

  return (
    <>
        <ControlPanel plantStatus={plantStatus} setPlantStatus={setPlantStatus} />

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

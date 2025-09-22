

import React, { useMemo } from 'react';
import { EmissionData, HistoricalEmissionPoint } from '../types';
import DashboardCard from './DashboardCard';
import { WarningIcon } from './icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EmissionsMonitorProps {
  emissions: EmissionData;
  historicalEmissions: HistoricalEmissionPoint[];
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

interface EmissionBarProps {
    label: string;
    value: number;
    max: number;
    unit: string;
}

const EmissionBar: React.FC<EmissionBarProps> = ({ label, value, max, unit}) => {
    const percentage = (value / max) * 100;
    let barColor = 'bg-green-500';
    if (percentage > 85) barColor = 'bg-red-500';
    else if (percentage > 60) barColor = 'bg-yellow-500';

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-sm font-semibold text-white">{value.toFixed(1)} {unit}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-sm text-gray-300">{`Dia: ${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {`${p.name}: ${p.value.toFixed(1)} kg/h`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const EmissionsMonitor: React.FC<EmissionsMonitorProps> = ({ 
  emissions, 
  historicalEmissions,
  isMaximizable,
  isMaximized,
  onToggleMaximize
}) => {
  const forecastData = useMemo(() => {
    if (!historicalEmissions || historicalEmissions.length === 0) {
        return [];
    }
    const lastPoint = historicalEmissions[historicalEmissions.length - 1];
    // FIX: The type for 'forecast' was incorrectly defined due to operator precedence,
    // causing type errors. Simplified to HistoricalEmissionPoint[] which is equivalent
    // to the intended type and more readable.
    const forecast: HistoricalEmissionPoint[] = [];

    let currentNox = lastPoint.nox;
    let currentSox = lastPoint.sox;
    let currentCo = lastPoint.co;
    let currentParticulates = lastPoint.particulates;

    for (let i = 1; i <= 7; i++) {
        currentNox *= 1.05;
        currentSox *= 1.05;
        currentCo *= 1.02;
        currentParticulates *= 1.02;

        forecast.push({
            time: `D+${i}`,
            nox: currentNox,
            sox: currentSox,
            co: currentCo,
            particulates: currentParticulates,
        });
    }
    return forecast;
  }, [historicalEmissions]);

  return (
    <DashboardCard 
      title="Monitor de Emissões" 
      icon={<WarningIcon className="w-6 h-6" />} 
      className="h-full"
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 h-full">
            <div className="space-y-4 my-auto">
                <EmissionBar label="NOx" value={emissions.nox} max={25} unit="kg/h" />
                <EmissionBar label="SOx" value={emissions.sox} max={10} unit="kg/h" />
                <EmissionBar label="CO" value={emissions.co} max={50} unit="kg/h" />
                <EmissionBar label="Particulados" value={emissions.particulates} max={15} unit="kg/h" />
            </div>
            {/* FIX: Complete the component with the emissions chart and export statement */}
            <div className="w-full h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...historicalEmissions, ...forecastData]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                      <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit=" kg/h" domain={[0, 'dataMax + 10']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                      <Line type="monotone" dataKey="nox" name="NOx" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="sox" name="SOx" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="co" name="CO" stroke="#eab308" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="particulates" name="Particulados" stroke="#84cc16" strokeWidth={2} dot={false} />
                  </LineChart>
              </ResponsiveContainer>
            </div>
        </div>
    </DashboardCard>
  );
};

export default EmissionsMonitor;

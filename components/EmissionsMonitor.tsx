
import React, { useMemo, useState } from 'react';
import { Alert, EmissionData, HistoricalEmissionPoint } from '../types';
import DashboardCard from './DashboardCard';
import { WarningIcon, InfoIcon, CloseIcon } from './icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EmissionsMonitorProps {
  emissions: EmissionData;
  historicalEmissions: HistoricalEmissionPoint[];
  alerts: Alert[];
  onDismiss: (id: number) => void;
  onClearAll: () => void;
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

const alertConfig = {
    critical: {
        icon: <WarningIcon className="w-5 h-5 text-red-400" />,
        color: 'border-l-4 border-red-400'
    },
    warning: {
        icon: <WarningIcon className="w-5 h-5 text-yellow-400" />,
        color: 'border-l-4 border-yellow-400'
    },
    info: {
        icon: <InfoIcon className="w-5 h-5 text-blue-400" />,
        color: 'border-l-4 border-blue-400'
    }
}


const EmissionsMonitor: React.FC<EmissionsMonitorProps> = ({ 
  emissions, 
  historicalEmissions,
  alerts,
  onDismiss,
  onClearAll,
  isMaximizable,
  isMaximized,
  onToggleMaximize
}) => {
  const [view, setView] = useState<'emissions' | 'alerts'>('emissions');
  
  const forecastData = useMemo(() => {
    if (!historicalEmissions || historicalEmissions.length === 0) {
        return [];
    }
    const lastPoint = historicalEmissions[historicalEmissions.length - 1];
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

  const renderEmissionsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 h-full">
        <div className="space-y-4 my-auto">
            <EmissionBar label="NOx" value={emissions.nox} max={25} unit="kg/h" />
            <EmissionBar label="SOx" value={emissions.sox} max={10} unit="kg/h" />
            <EmissionBar label="CO" value={emissions.co} max={50} unit="kg/h" />
        </div>
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
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  const renderAlertsView = () => (
    <div className="h-full flex flex-col">
      {alerts.length > 0 && (
        <div className="flex justify-end mb-2 -mt-2">
          <button
            onClick={onClearAll}
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none"
            aria-label="Limpar todos os alertas"
          >
            Limpar Tudo
          </button>
        </div>
      )}
      <div className="space-y-3 flex-grow overflow-y-auto pr-2">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className={`bg-gray-700 p-3 rounded-md flex items-start gap-3 ${alertConfig[alert.level].color}`}>
            <div>{alertConfig[alert.level].icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-200">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
            </div>
             <button 
                onClick={() => onDismiss(alert.id)} 
                className="text-gray-500 hover:text-white transition-colors duration-200 p-1 -m-1 rounded-full" 
                aria-label={`Dispensar alerta: ${alert.message}`}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )) : <p className="text-center text-gray-500 pt-8">Nenhum alerta recente.</p>}
      </div>
    </div>
  );

  return (
    <DashboardCard 
      title="Emissões e Alertas"
      icon={<WarningIcon className="w-6 h-6" />} 
      className="h-full"
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
        <div className="flex flex-col h-full">
            <div className="flex justify-center mb-4 -mt-2">
                <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
                    <button
                        onClick={() => setView('emissions')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                            view === 'emissions'
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        aria-pressed={view === 'emissions'}
                    >
                        Emissões
                    </button>
                    <button
                        onClick={() => setView('alerts')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                            view === 'alerts'
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        aria-pressed={view === 'alerts'}
                    >
                        Alertas ({alerts.length})
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                {view === 'emissions' ? renderEmissionsView() : renderAlertsView()}
            </div>
        </div>
    </DashboardCard>
  );
};

export default EmissionsMonitor;

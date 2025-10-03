

import React, { useMemo, useState } from 'react';
import { Alert, EmissionData, HistoricalEmissionPoint } from '../types';
import DashboardCard from './DashboardCard';
import { WarningIcon, InfoIcon, CloseIcon } from './icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EmissionsMonitorProps {
  emissions: EmissionData;
  historicalEmissions: HistoricalEmissionPoint[];
  alerts: Alert[];
  onDismiss: (id: number) => void;
  onClearAll: () => void;
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  // FIX: Add t prop for translations
  t: (key: string) => string;
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

const CustomTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        {/* FIX: Use translation function */}
        <p className="label text-sm text-gray-300">{`${t('tooltip.day')}: ${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.stroke }} className="text-sm">
            {`${p.dataKey.includes('forecast') ? t('tooltip.forecast') : t('tooltip.historical')}: ${p.value.toFixed(1)} kg/h`}
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

const LegendItem: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <div className="flex items-center space-x-2">
    <div className="flex items-center">
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
      <div className="w-3 h-px" style={{ backgroundColor: color }}></div>
    </div>
    <span style={{ color }}>{text}</span>
  </div>
);


const EmissionsMonitor: React.FC<EmissionsMonitorProps> = ({ 
  emissions, 
  historicalEmissions,
  alerts,
  onDismiss,
  onClearAll,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
  t
}) => {
  const [view, setView] = useState<'emissions' | 'alerts'>('emissions');
  
  const forecastData = useMemo(() => {
    if (!historicalEmissions || historicalEmissions.length === 0) return [];
    
    const lastPoint = historicalEmissions[historicalEmissions.length - 1];
    if (!lastPoint) return [];

    const forecast: HistoricalEmissionPoint[] = [];
    let { nox, sox, co, particulates } = lastPoint;

    for (let i = 1; i <= 7; i++) {
        nox *= (1 + (Math.random() - 0.3) * 0.1); // Fluctuate forecast
        sox *= (1 + (Math.random() - 0.3) * 0.1);
        co *= (1 + (Math.random() - 0.4) * 0.05);
        particulates *= (1 + (Math.random() - 0.4) * 0.05);

        forecast.push({
            time: `D+${i}`,
            nox: Math.max(0, nox),
            sox: Math.max(0, sox),
            co: Math.max(0, co),
            particulates: Math.max(0, particulates),
        });
    }
    return forecast;
  }, [historicalEmissions]);
  
  const chartData = useMemo(() => {
    if (!historicalEmissions || historicalEmissions.length === 0) return [];
    
    const historicalPart = historicalEmissions.map(h => ({ ...h }));
    const lastHistoricalPoint = historicalPart[historicalPart.length - 1];

    const forecastPart = [
        { 
            time: lastHistoricalPoint.time,
            forecastNox: lastHistoricalPoint.nox,
            forecastSox: lastHistoricalPoint.sox,
            forecastCo: lastHistoricalPoint.co,
        },
        ...forecastData.map(f => ({
            time: f.time,
            forecastNox: f.nox,
            forecastSox: f.sox,
            forecastCo: f.co,
        }))
    ];

    const allTimes = [...new Set([...historicalPart.map(p => p.time), ...forecastPart.map(p => p.time)])];
    
    return allTimes.map(time => {
        const historicalPoint = historicalPart.find(p => p.time === time);
        const forecastPoint = forecastPart.find(p => p.time === time);
        return {
            time,
            ...(historicalPoint && { nox: historicalPoint.nox, sox: historicalPoint.sox, co: historicalPoint.co }),
            ...(forecastPoint && { forecastNox: forecastPoint.forecastNox, forecastSox: forecastPoint.forecastSox, forecastCo: forecastPoint.forecastCo })
        };
    });
  }, [historicalEmissions, forecastData]);

  const renderEmissionsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 h-full">
        <div className="space-y-4 my-auto">
            <EmissionBar label="NOx" value={emissions.nox} max={30} unit="kg/h" />
            <EmissionBar label="SOx" value={emissions.sox} max={10} unit="kg/h" />
            <EmissionBar label="CO" value={emissions.co} max={50} unit="kg/h" />
        </div>
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow min-h-[180px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} interval={chartData.length - 2} tickFormatter={(value, index) => index === 0 ? 'D-1' : 'D+7'} />
                        <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit=" kg/h" domain={[0, 40]} ticks={[0, 10, 20, 30]} />
                        {/* FIX: Pass translation function to custom tooltip */}
                        <Tooltip content={<CustomTooltip t={t} />} />
                        <Line type="monotone" dataKey="co" stroke="#facc15" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="forecastCo" stroke="#facc15" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="nox" stroke="#f87171" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="forecastNox" stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="sox" stroke="#fbbf24" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="forecastSox" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="space-y-1 text-xs font-semibold pl-4 mt-2">
                <LegendItem color="#facc15" text="CO Histórico" />
                <LegendItem color="#facc15" text="CO Previsto" />
                <LegendItem color="#f87171" text="NOx Histórico" />
                <LegendItem color="#f87171" text="NOx Previsto" />
                <LegendItem color="#fbbf24" text="SOx Histórico" />
                <LegendItem color="#fbbf24" text="SOx Previsto" />
            </div>
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
            aria-label={t('emissions.clearAll')}
          >
            {/* FIX: Use translation function */}
            {t('emissions.clearAll')}
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
        )) : <p className="text-center text-gray-500 pt-8">{t('emissions.noAlerts')}</p>}
      </div>
    </div>
  );

  return (
    <DashboardCard 
      // FIX: Use translation function
      title={t('emissions.title')}
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
                        {/* FIX: Use translation function */}
                        {t('emissions.tabEmissions')}
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
                        {/* FIX: Use translation function */}
                        {t('emissions.tabAlerts')} ({alerts.length})
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

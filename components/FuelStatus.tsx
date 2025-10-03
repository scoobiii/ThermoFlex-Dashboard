import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { FuelMode, LongHistoricalDataPoint } from '../types';
import DashboardCard from './DashboardCard';
import { GasIcon } from './icons';

interface FuelStatusProps {
  fuelMode: FuelMode;
  consumption: number;
  flexMix: { h2: number, biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  historicalData: LongHistoricalDataPoint[];
  timeRange: '24h' | '7d';
  setTimeRange: (range: '24h' | '7d') => void;
  t: (key: string) => string;
}

const COLORS: { [key: string]: string } = {
  'Gás Natural': '#0891b2',
  'H2': '#34d399',
  'Etanol': '#6ee7b7',
  'Biodiesel': '#22c55e',
  'Nuclear': '#a855f7',
};

// --- Reusable Components ---

const TimeRangeSelector: React.FC<{
  timeRange: '24h' | '7d';
  setTimeRange: (range: '24h' | '7d') => void;
  t: (key: string) => string;
}> = ({ timeRange, setTimeRange, t }) => (
  <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
    <button
      onClick={() => setTimeRange('24h')}
      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
        timeRange === '24h'
          ? 'bg-cyan-500 text-white shadow-md'
          : 'text-gray-400 hover:bg-gray-700'
      }`}
      aria-pressed={timeRange === '24h'}
    >
      {t('fuelStatus.24h')}
    </button>
    <button
      onClick={() => setTimeRange('7d')}
      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
        timeRange === '7d'
          ? 'bg-cyan-500 text-white shadow-md'
          : 'text-gray-400 hover:bg-gray-700'
      }`}
      aria-pressed={timeRange === '7d'}
    >
      {t('fuelStatus.7d')}
    </button>
  </div>
);

const HistoryTooltip = ({ active, payload, label, t }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-sm text-gray-300">{`${t('tooltip.period')}: ${label}`}</p>
        <p className="text-sm" style={{ color: '#a3e635' }}>
          {`${t('tooltip.consumption')}: ${payload[0].value.toFixed(1)} kg/s`}
        </p>
      </div>
    );
  }
  return null;
};

// --- Main Component ---

const FuelStatus: React.FC<FuelStatusProps> = ({ 
  fuelMode, 
  consumption, 
  flexMix, 
  setFlexMix,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
  historicalData,
  timeRange,
  setTimeRange,
  t,
}) => {
  const [view, setView] = useState<'current' | 'history'>('current');
  
  let chartData = [];
  let fuelTitle: string = t(`fuelMode.${fuelMode}`);

  switch (fuelMode) {
    case FuelMode.NaturalGas:
      chartData = [{ name: t('fuelMode.NATURAL_GAS'), value: 100 }];
      break;
    case FuelMode.Ethanol:
      chartData = [{ name: t('fuelMode.ETHANOL'), value: 100 }];
      break;
    case FuelMode.Biodiesel:
      chartData = [{ name: t('fuelMode.BIODIESEL'), value: 100 }];
      break;
    case FuelMode.Nuclear:
      chartData = [{ name: t('fuelMode.NUCLEAR'), value: 100 }];
      break;
    case FuelMode.FlexNGH2:
      chartData = [
        { name: t('fuelMode.NATURAL_GAS'), value: 100 - flexMix.h2 },
        { name: `H2 (${flexMix.h2}%)`, value: flexMix.h2 },
      ];
      fuelTitle = `NG (${100 - flexMix.h2}%) / H2 (${flexMix.h2}%)`
      break;
    case FuelMode.FlexEthanolBiodiesel:
      chartData = [
        { name: t('fuelMode.ETHANOL'), value: 100 - flexMix.biodiesel },
        { name: t('fuelMode.BIODIESEL'), value: flexMix.biodiesel },
      ];
      fuelTitle = `${t('fuelMode.ETHANOL')} (${100-flexMix.biodiesel}%) / ${t('fuelMode.BIODIESEL')} (${flexMix.biodiesel}%)`
      break;
  }

  const showH2Slider = fuelMode === FuelMode.FlexNGH2;
  const showBiodieselSlider = fuelMode === FuelMode.FlexEthanolBiodiesel;

  const renderCurrentView = () => (
    <>
      <div>
          <div className="text-center">
              <p className="text-gray-400 text-sm">{t('fuelStatus.operatingMode')}</p>
              <p className="font-semibold text-cyan-400 h-10">{fuelTitle}</p>
          </div>
          <div className="h-32 w-full -ml-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={50}
                  innerRadius={35}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.split(' ')[0]]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px"}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
              <p className="text-3xl font-bold text-white">{consumption.toFixed(1)}</p>
              <p className="text-gray-400">{t('fuelStatus.consumption')}</p>
          </div>
      </div>
      
      <div className="mt-auto pt-4">
        {(showH2Slider || showBiodieselSlider) && (
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 text-center">{t('fuelStatus.flexMix')}</h4>
            {showH2Slider && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="h2Mix" className="text-sm font-medium text-gray-300">{t('fuelStatus.hydrogen')}</label>
                   <div className="flex items-center gap-2">
                      <input
                          type="number"
                          id="h2MixInput"
                          min="0"
                          max="100"
                          value={flexMix.h2}
                          onChange={(e) => {
                              const value = Math.max(0, Math.min(100, Number(e.target.value)));
                              setFlexMix(prev => ({ ...prev, h2: value }));
                          }}
                          className="w-20 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5 text-center font-mono"
                          aria-label={t('fuelStatus.hydrogen')}
                      />
                      <span className="text-lg font-mono font-semibold text-emerald-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  id="h2Mix"
                  min="0"
                  max="100"
                  value={flexMix.h2}
                  onChange={(e) => setFlexMix(prev => ({ ...prev, h2: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  aria-label={t('fuelStatus.hydrogen')}
                />
              </div>
            )}
            {showBiodieselSlider && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="biodieselMix" className="text-sm font-medium text-gray-300">{t('fuelStatus.biodiesel')}</label>
                  <div className="flex items-center gap-2">
                      <input
                          type="number"
                          id="biodieselMixInput"
                          min="0"
                          max="100"
                          value={flexMix.biodiesel}
                          onChange={(e) => {
                              const value = Math.max(0, Math.min(100, Number(e.target.value)));
                              setFlexMix(prev => ({ ...prev, biodiesel: value }));
                          }}
                          className="w-20 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5 text-center font-mono"
                          aria-label={t('fuelStatus.biodiesel')}
                      />
                      <span className="text-lg font-mono font-semibold text-green-500">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  id="biodieselMix"
                  min="0"
                  max="100"
                  value={flexMix.biodiesel}
                  onChange={(e) => setFlexMix(prev => ({ ...prev, biodiesel: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                  aria-label={t('fuelStatus.biodiesel')}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  const renderHistoryView = () => (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-2">
            <h4 className="text-sm font-semibold text-gray-300">{t('fuelStatus.historyTitle')}</h4>
            <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} t={t} />
        </div>
        <div className="flex-grow h-64 mt-4 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                     <defs>
                        <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a3e635" stopOpacity={0.7}/>
                          <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit=" kg/s" domain={['dataMin - 2', 'dataMax + 2']}/>
                    <Tooltip content={<HistoryTooltip t={t} />} cursor={{fill: 'transparent'}}/>
                    <Area 
                        type="monotone" 
                        dataKey="consumption" 
                        stroke="#a3e635" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorConsumption)"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  return (
    <DashboardCard 
      title={t('fuelStatus.title')} 
      icon={<GasIcon className="w-6 h-6" />}
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
      <div className="flex flex-col h-full">
         <div className="flex justify-center mb-4 -mt-2">
            <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
                <button
                onClick={() => setView('current')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                    view === 'current'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
                aria-pressed={view === 'current'}
                >
                {t('fuelStatus.current')}
                </button>
                <button
                onClick={() => setView('history')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                    view === 'history'
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
                aria-pressed={view === 'history'}
                >
                {t('fuelStatus.history')}
                </button>
            </div>
        </div>
        {view === 'current' ? renderCurrentView() : renderHistoryView()}
      </div>
    </DashboardCard>
  );
};

export default FuelStatus;

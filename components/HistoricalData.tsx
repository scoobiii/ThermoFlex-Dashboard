import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { LongHistoricalDataPoint } from '../types';
import DashboardCard from './DashboardCard';
import { ChartBarIcon } from './icons';

interface HistoricalDataProps {
  data: LongHistoricalDataPoint[];
  timeRange: '24h' | '7d';
  setTimeRange: (range: '24h' | '7d') => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-sm text-gray-300">{`Período: ${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {`${p.name}: ${p.value.toFixed(1)} ${p.unit}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TimeRangeSelector: React.FC<{
  timeRange: '24h' | '7d';
  setTimeRange: (range: '24h' | '7d') => void;
}> = ({ timeRange, setTimeRange }) => (
  <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
    <button
      onClick={() => setTimeRange('24h')}
      className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
        timeRange === '24h'
          ? 'bg-cyan-500 text-white shadow-md'
          : 'text-gray-400 hover:bg-gray-700'
      }`}
      aria-pressed={timeRange === '24h'}
    >
      24 Horas
    </button>
    <button
      onClick={() => setTimeRange('7d')}
      className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
        timeRange === '7d'
          ? 'bg-cyan-500 text-white shadow-md'
          : 'text-gray-400 hover:bg-gray-700'
      }`}
      aria-pressed={timeRange === '7d'}
    >
      7 Dias
    </button>
  </div>
);

const HistoricalData: React.FC<HistoricalDataProps> = ({ data, timeRange, setTimeRange }) => {
  const action = <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />;

  return (
    <DashboardCard
      title="Dados Históricos"
      icon={<ChartBarIcon className="w-6 h-6" />}
      action={action}
      className="h-full"
    >
      <div className="h-full w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#06b6d4"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit=" MW"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#a3e635"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit=" kg/s"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
            <Bar yAxisId="right" dataKey="consumption" name="Consumo" fill="#a3e635" barSize={20} unit="kg/s" />
            <Line yAxisId="left" type="monotone" dataKey="power" name="Potência" stroke="#06b6d4" strokeWidth={2} dot={false} unit="MW" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default HistoricalData;

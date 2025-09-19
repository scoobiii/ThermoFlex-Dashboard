
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HistoricalDataPoint } from '../types';
import DashboardCard from './DashboardCard';

interface PowerOutputProps {
  powerOutput: number;
  baseEfficiency: number;
  totalEfficiency: number;
  historicalData: HistoricalDataPoint[];
  // FIX: Add props for maximizing functionality
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-sm text-gray-300">{`Hora: ${label}`}</p>
        <p className="intro text-sm text-cyan-400">{`Potência: ${payload[0].value.toFixed(1)} MW`}</p>
      </div>
    );
  }
  return null;
};


const PowerOutput: React.FC<PowerOutputProps> = ({ 
  powerOutput, 
  baseEfficiency, 
  totalEfficiency, 
  historicalData,
  isMaximizable,
  isMaximized,
  onToggleMaximize,
 }) => {
  const efficiencyGain = totalEfficiency - baseEfficiency;
  
  return (
    <DashboardCard 
      title="Geração de Energia"
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
      <div className="flex flex-col h-full">
        <div className="text-center">
            <p className="text-5xl font-bold text-cyan-400 tracking-tight">{powerOutput.toFixed(1)}</p>
            <p className="text-sm text-gray-400">MW Potência Atual</p>
            <p className="mt-4 text-4xl font-bold text-green-400">{totalEfficiency.toFixed(1)}%</p>
            <p className="text-sm text-gray-400">Eficiência Total Geral</p>
            
            {efficiencyGain > 0 && (
                <div className="mt-2 text-xs text-gray-400 border-t border-gray-700 pt-2">
                    <div className="flex justify-center items-baseline gap-4">
                        <span>Eficiência ISO Padrão: <span className="font-semibold text-gray-300">{baseEfficiency.toFixed(1)}%</span></span>
                        <span>Ganho (TIAC+Fog): <span className="font-semibold text-green-400">+{efficiencyGain.toFixed(1)}%</span></span>
                    </div>
                </div>
            )}
        </div>
        <div className="flex-grow h-40 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${Math.round(value)}`}
                unit=" MW"
                tickCount={5}
                domain={['dataMin - 100', 'dataMax + 100']}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="power" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardCard>
  );
};

export default PowerOutput;

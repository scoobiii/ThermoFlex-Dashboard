import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { SnowflakeIcon } from './icons';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface CoolingDataPoint {
  time: number;
  load: number;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="intro text-sm text-cyan-400">{`Carga: ${payload[0].value.toFixed(1)} kW`}</p>
        </div>
      );
    }
    return null;
  };

const CoolingLoad: React.FC = () => {
  const [currentLoad, setCurrentLoad] = useState(25); // kW
  const [historicalLoad, setHistoricalLoad] = useState<CoolingDataPoint[]>([]);

  useEffect(() => {
    // Initialize historical data
    setHistoricalLoad(Array.from({ length: 10 }, (_, i) => ({
        time: Date.now() - (9 - i) * 3000,
        load: 25 + (Math.random() - 0.5) * 4,
    })))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const newLoad = Math.max(20, Math.min(35, currentLoad + (Math.random() - 0.5) * 2));
      setCurrentLoad(newLoad);
      setHistoricalLoad(prev => {
        const newPoint = { time: Date.now(), load: newLoad };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentLoad]);

  return (
    <DashboardCard title="Carga de Refrigeração" icon={<SnowflakeIcon className="w-6 h-6 text-cyan-400" />}>
        <div className="flex flex-col h-full">
            <div className="text-center">
                <p className="text-4xl font-bold text-cyan-400 tracking-tight">{currentLoad.toFixed(1)}</p>
                <p className="text-sm text-gray-400">kW Carga Atual</p>
            </div>
            <div className="flex-grow h-20 mt-2 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalLoad}>
                        <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}}/>
                        <Line 
                            type="monotone" 
                            dataKey="load" 
                            stroke="#06b6d4" 
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </DashboardCard>
  );
};

export default CoolingLoad;
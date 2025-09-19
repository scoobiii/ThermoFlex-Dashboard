import React from 'react';
import { Turbine } from '../types';
import DashboardCard from './DashboardCard';
import { CloseIcon, CogIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface MainTurbineMonitorProps {
  turbine: Turbine;
  onClose: () => void;
  allTurbines: Turbine[];
  totalPowerOutput: number;
}

const statusInfo = {
    active: { text: 'Ativa', color: 'text-green-400' },
    inactive: { text: 'Inativa', color: 'text-gray-500' },
    error: { text: 'Em Falha', color: 'text-red-500 animate-pulse' }
}

const MetricDisplay: React.FC<{ label: string; value: string | number; unit: string; className?: string }> = ({ label, value, unit, className = '' }) => (
    <div className={`text-center p-4 bg-gray-900 rounded-lg ${className}`}>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-gray-400">{unit}</p>
    </div>
);

const RPMCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-sm text-gray-300">{`${label}`}</p>
          <p className="intro text-sm" style={{color: payload[0].fill}}>{`RPM: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

const MainTurbineMonitor: React.FC<MainTurbineMonitorProps> = ({ turbine, onClose, allTurbines, totalPowerOutput }) => {
  const closeButton = (
    <button 
        onClick={onClose} 
        className="text-gray-500 hover:text-white transition-colors duration-200"
        aria-label="Fechar monitoramento da turbina"
    >
        <CloseIcon className="w-6 h-6" />
    </button>
  );
  
  const activeTurbines = allTurbines.filter(t => t.status === 'active');
  const powerPerTurbine = activeTurbines.length > 0 ? totalPowerOutput / activeTurbines.length : 0;
  
  const powerContributionData = [
      activeTurbines.reduce((acc, t) => {
          const key = `Turbina #${t.id}`;
          acc[key] = powerPerTurbine;
          return acc;
      }, { name: 'Power' })
  ];

  const rpmChartData = activeTurbines.map(t => ({
    name: `Turbina #${t.id}`,
    rpm: t.rpm,
    id: t.id,
  }));
  
  return (
    <DashboardCard 
        title={`Monitoramento - Turbina #${turbine.id}`} 
        icon={<CogIcon className="w-6 h-6" />}
        action={closeButton}
        className="h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
            <div className={`text-center text-xl font-bold ${statusInfo[turbine.status].color}`}>
                Status: {statusInfo[turbine.status].text}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <MetricDisplay label="Rotação" value={turbine.rpm} unit="RPM" />
                <MetricDisplay label="Temperatura" value={turbine.temp} unit="°C" />
                <MetricDisplay label="Pressão" value={turbine.pressure} unit="bar" />
            </div>
        </div>

        <div className="flex-grow mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Power Contribution Chart */}
          <div className="flex flex-col h-full min-h-[200px]">
            <h4 className="text-md font-semibold text-gray-300 text-center mb-2">
              Contribuição de Potência
            </h4>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={powerContributionData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 25 }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={10} domain={[0, 'dataMax']} unit=" MW" />
                        <YAxis type="category" dataKey="name" hide={true} />
                        <Tooltip 
                            cursor={{fill: 'rgba(42, 52, 73, 0.5)'}}
                            wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449', borderRadius: '0.5rem', outline: 'none' }}
                            contentStyle={{ backgroundColor: '#1A2233', border: 'none' }}
                            labelStyle={{ color: '#e5e7eb', marginBottom: '0.5rem' }}
                            formatter={(value: number, name: string) => [
                                <span className="text-cyan-400">{`${value.toFixed(1)} MW`}</span>,
                                <span className="text-gray-300">{name}</span>
                            ]}
                            labelFormatter={() => `Total: ${totalPowerOutput.toFixed(0)} MW`}
                        />
                        <Legend wrapperStyle={{fontSize: "12px", position: 'absolute', bottom: 0 }} />
                        {activeTurbines.map((t, index) => {
                             const isFirst = index === 0;
                             const isLast = index === activeTurbines.length - 1;
                             const radius: [number, number, number, number] = activeTurbines.length === 1 ? [8, 8, 8, 8] : isFirst ? [8, 0, 0, 8] : isLast ? [0, 8, 8, 0] : [0, 0, 0, 0];
                             
                            return (
                                <Bar 
                                    key={`bar-${t.id}`}
                                    dataKey={`Turbina #${t.id}`}
                                    stackId="a"
                                    name={`Turbina #${t.id}`}
                                    fill={t.id === turbine.id ? '#06b6d4' : '#0891b2'}
                                    radius={radius}
                                />
                            );
                        })}
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
          {/* RPM Comparison Chart */}
          <div className="flex flex-col h-full min-h-[200px]">
            <h4 className="text-md font-semibold text-gray-300 text-center mb-2">
              Comparativo de RPM (Ativas)
            </h4>
             <div className="text-center text-xs text-gray-400 mb-2 invisible">
                  <p>Dummy text for alignment</p>
            </div>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rpmChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#9ca3af" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => value.replace('Turbina ', '')}
                        />
                        <YAxis 
                          stroke="#9ca3af" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={[3000, 4000]}
                          unit=" RPM"
                          width={45}
                        />
                        <Tooltip content={<RPMCustomTooltip />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}} />
                        <Bar dataKey="rpm">
                            {rpmChartData.map((entry) => (
                                <Cell 
                                    key={`cell-${entry.id}`} 
                                    fill={entry.id === turbine.id ? '#06b6d4' : '#0891b2'} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default MainTurbineMonitor;
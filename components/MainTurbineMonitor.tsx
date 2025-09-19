import React from 'react';
import { Turbine } from '../types';
import DashboardCard from './DashboardCard';
import { CloseIcon, CogIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const PowerCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
        <p className="label text-sm text-gray-300">{`${label}`}</p>
        <p className="intro text-sm text-cyan-400">{`Potência: ${payload[0].value.toFixed(1)} MW`}</p>
      </div>
    );
  }
  return null;
};

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
  
  const powerChartData = allTurbines.map(t => ({
    name: `Turbina #${t.id}`,
    power: t.status === 'active' ? powerPerTurbine : 0,
  }));
  
  const rpmChartData = activeTurbines.map(t => ({
    name: `Turbina #${t.id}`,
    rpm: t.rpm,
    id: t.id,
  }));
  
  const powerOfThisTurbine = turbine.status === 'active' ? powerPerTurbine : 0;

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
            <h4 className="text-md font-semibold text-gray-300 text-center mb-1">
              Contribuição de Potência
            </h4>
            {turbine.status === 'active' && (
              <div className="text-center text-xs text-gray-400 mb-2">
                  <p>
                      <span className="font-bold text-cyan-400">{powerOfThisTurbine.toFixed(1)} MW</span> / {totalPowerOutput.toFixed(1)} MW
                  </p>
              </div>
            )}
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={powerChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit=" MW" />
                      <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} width={60} />
                      <Tooltip content={<PowerCustomTooltip />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}} />
                      <Bar dataKey="power">
                          {powerChartData.map((entry, index) => (
                              <Cell 
                                  key={`cell-${index}`} 
                                  fill={allTurbines[index].id === turbine.id ? '#06b6d4' : '#0891b2'} 
                                  opacity={allTurbines[index].status === 'active' ? 1 : 0.3}
                              />
                          ))}
                      </Bar>
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
                          // Fix: The prop name for formatting tick labels is `tickFormatter`, not `formatter`.
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
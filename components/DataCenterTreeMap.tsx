import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import DashboardCard from './DashboardCard';
import { ServerRackIcon } from './icons';

type RackStatus = 'Online' | 'High Load' | 'Offline';

interface TreeMapNode {
  name: string;
  status: RackStatus;
  power: number; // Nominal capacity in kW
  memory: number; // GB
  networkIO: number; // Gbps
  temp: number; // °C
  energyConsumption: number; // kWh
  cpuCores: number;
  utilization: number; // Percentage
  children?: TreeMapNode[];
  [key: string]: any; // Index signature for recharts compatibility
}

const statusColors: { [key in RackStatus]: string } = {
  Online: 'bg-green-400',
  'High Load': 'bg-yellow-400',
  Offline: 'bg-red-500',
};

const statusBorderColors: { [key in RackStatus]: string } = {
    Online: 'border-green-600',
    'High Load': 'border-yellow-600',
    Offline: 'border-red-700',
  };

const generateInitialRackData = (): TreeMapNode[] => {
  return Array.from({ length: 725 }, (_, i) => {
    const statusRoll = Math.random();
    let status: RackStatus = 'Online';
    if (statusRoll > 0.95) {
      status = 'Offline';
    } else if (statusRoll > 0.85) {
      status = 'High Load';
    }

    const energyConsumption = status === 'Offline' ? 0 : 350 + Math.random() * 100;
    const power = 500; // 500 kW capacity per rack

    return {
      name: `Rack-${i + 1}`,
      status: status,
      power: power,
      memory: status === 'Offline' ? 0 : Math.round(512 + Math.random() * 1536), // 0.5-2TB RAM
      networkIO: status === 'Offline' ? 0 : parseFloat((50 + Math.random() * 350).toFixed(1)), // 50-400 Gbps
      temp: status === 'Offline' ? 18 : Math.round(22 + Math.random() * 10), // 22-32°C
      energyConsumption: parseFloat(energyConsumption.toFixed(1)),
      cpuCores: 128,
      utilization: Math.round((energyConsumption / power) * 100),
    };
  });
};

const CustomTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-white mb-2">{data.name}</p>
        <p>
            <span className={`font-semibold ${
                data.status === 'Online' ? 'text-green-400' : 
                data.status === 'High Load' ? 'text-yellow-400' : 'text-red-500'}`
            }>
                Status: {data.status}
            </span>
        </p>
        <p className="text-gray-300">Consumo: <span className="font-mono">{data.energyConsumption.toFixed(1)} kWh</span></p>
        <p className="text-gray-300">Utilização: <span className="font-mono">{data.utilization}%</span></p>
        <p className="text-gray-300">Memória: <span className="font-mono">{data.memory} GB</span></p>
        <p className="text-gray-300">Rede I/O: <span className="font-mono">{data.networkIO} Gbps</span></p>
        <p className="text-gray-300">Temp: <span className="font-mono">{data.temp} °C</span></p>
        <p className="text-gray-300">Capacidade: <span className="font-mono">{data.power} kW</span></p>
        <p className="text-gray-300">CPU: <span className="font-mono">{data.cpuCores} Cores</span></p>
      </div>
    );
  }
  return null;
};

const CustomizedContent: React.FC<any> = (props) => {
    const { root, depth, x, y, width, height, index, payload, rank, name } = props;
  
    if (width < 20 || height < 20) return null;
  
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          className={`
            ${statusColors[payload.status]} 
            stroke-gray-800 stroke-2 transition-opacity duration-300
          `}
        />
      </g>
    );
};

const DataCenterTreeMap: React.FC = () => {
    const [rackData, setRackData] = useState<TreeMapNode[]>([]);
    
    useEffect(() => {
        setRackData(generateInitialRackData());
    }, []);

  return (
    <DashboardCard title="Distribuição dos Racks no MAUAX DAO DataCloud" icon={<ServerRackIcon className="w-6 h-6"/>}>
      <div className="text-center mb-4">
        <p className="text-gray-400">
            Visualização de <span className="font-bold text-white">725</span> racks NVIDIA 800 VDC (500 kW cada)
        </p>
        <p className="text-gray-400">
          Totalizando <span className="font-bold text-cyan-400">362.5 MW</span> de capacidade de TI
        </p>
      </div>
      
      <div className="w-full h-[65vh]">
        <ResponsiveContainer>
          <Treemap
            data={rackData}
            dataKey="power"
            aspectRatio={4 / 3}
            stroke="#1A2233"
            fill="#8884d8"
            content={<CustomizedContent />}
            isAnimationActive={true}
            animationDuration={500}
          >
            <Tooltip content={<CustomTooltipContent />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default DataCenterTreeMap;
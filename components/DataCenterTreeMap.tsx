import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import DashboardCard from './DashboardCard';
import { ServerRackIcon } from './icons';

interface TreeMapNode {
  name: string;
  size: number;
  status: 'Online' | 'High Load' | 'Offline';
  // FIX: Added index signature to match the expected data type for the Treemap component.
  [key: string]: any;
}

// Generate data for 725 racks
const generateRackData = (): TreeMapNode[] => {
  const data: TreeMapNode[] = [];
  for (let i = 1; i <= 725; i++) {
    let status: 'Online' | 'High Load' | 'Offline' = 'Online';
    const rand = Math.random();
    if (rand > 0.98) { // 2% chance of being offline
      status = 'Offline';
    } else if (rand > 0.90) { // 8% chance of high load
      status = 'High Load';
    }
    data.push({
      name: `Rack-${String(i).padStart(3, '0')}`,
      size: 500, // 500 kW per rack
      status: status,
    });
  }
  return data;
};

const rackData = generateRackData();

const COLORS = {
  'Online': '#22c55e',      // tailwind green-500
  'High Load': '#eab308', // tailwind yellow-500
  'Offline': '#ef4444',     // tailwind red-500
};

const CustomizedContent = (props: any) => {
    const { x, y, width, height, status } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: COLORS[status as keyof typeof COLORS] || '#1A2233',
                    stroke: '#121826',
                    strokeWidth: 1,
                }}
            />
        </g>
    );
};


const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg text-sm">
                <p className="font-bold text-white">{data.name}</p>
                <p style={{color: COLORS[data.status as keyof typeof COLORS]}}>Status: {data.status}</p>
                <p className="text-gray-300">Power: {data.size} kW</p>
            </div>
        );
    }
    return null;
}


const DataCenterTreeMap: React.FC = () => {
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
            <div className="w-full h-[26rem]">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={rackData}
                        dataKey="size"
                        // FIX: The 'ratio' prop does not exist on the Treemap component. It has been replaced with 'aspectRatio'.
                        aspectRatio={16/9}
                        stroke="#121826"
                        fill="#1A2233"
                        content={<CustomizedContent />}
                        isAnimationActive={false}
                    >
                      <Tooltip content={<CustomTooltipContent />} />
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </DashboardCard>
    );
};

export default DataCenterTreeMap;
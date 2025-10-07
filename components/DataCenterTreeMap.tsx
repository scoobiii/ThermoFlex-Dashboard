
/**
 * @file DataCenterTreeMap.tsx
 * @description Renders a treemap visualization of the data center server racks, showing their status and key metrics.
 * @version 1.1.0
 * @date 2024-07-28
 * @author Senior DevOps Team
 * @productowner Edivaldo Beringela (Prefeitura de Mauá)
 * 
 * @responsibility
 * Visualizes hierarchical rack data using area-proportional treemap.
 * Supports dynamic metric switching (energy vs cooling).
 * Integrates with DashboardCard for consistent UI and maximize behavior.
 * 
 * @changelog
 * v1.1.0 - 2024-07-28
 *   - Added detailed, granular consumption metrics per rack: CPU, GPU, Memory, I/O, Cooling.
 *   - Renamed 'energyConsumption' to 'totalEnergyConsumption' for clarity.
 *   - Updated data generation logic to simulate new consumption metrics.
 *   - Completely redesigned the tooltip to display the new, detailed data in a structured format.
 *   - Implemented an interactive view mode switcher (Segmented Control) to allow users to visualize the treemap based on either 'Total Energy' or 'Cooling' consumption.
 *   - The 'dataKey' of the Treemap component is now dynamic based on the selected view mode.
 * 
 * v1.0.1 - 2024-07-26
 *   - Fixed a runtime TypeError "Cannot read properties of undefined (reading 'status')" in the CustomizedContent component.
 *   - Added a defensive check to ensure the 'payload' prop and its 'status' property exist before being accessed.
 *   - This prevents rendering errors when the Treemap component provides incomplete props during its lifecycle.
 *   - Added file header with versioning and ownership details.
 * 
 * @signature
 * GOS7 (Gang of Seven Senior Full Stack DevOps Agile Scrum Team)
 * - Claude, Grok, Gemini, Qwen, DeepSeek, GPT, Manus
 */
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import DashboardCard from './DashboardCard';
import { ServerRackIcon } from './icons';

type RackStatus = 'Online' | 'High Load' | 'Offline';
type TreeMapViewMode = 'totalEnergy' | 'cooling';

interface TreeMapNode {
  name: string;
  status: RackStatus;
  power: number; // Nominal capacity in kW
  memory: number; // GB
  networkIO: number; // Gbps
  temp: number; // °C
  cpuCores: number;
  utilization: number; // Percentage
  
  // New detailed consumption fields
  cpuConsumption: number; // kWh
  gpuConsumption: number; // kWh
  memoryConsumption: number; // kWh
  ioConsumption: number; // kWh
  totalEnergyConsumption: number; // kWh
  coolingConsumption: number; // kW_th

  children?: TreeMapNode[];
}

interface DataCenterTreeMapProps {
    isMaximizable?: boolean;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
    t: (key: string) => string;
}

const generateInitialRackData = (): TreeMapNode[] => {
  return Array.from({ length: 120 }, (_, i) => {
    const statusRoll = Math.random();
    let status: RackStatus = 'Online';
    if (statusRoll > 0.95) {
      status = 'Offline';
    } else if (statusRoll > 0.85) {
      status = 'High Load';
    }

    const power = 500; // 500 kW capacity per rack
    let cpuConsumption = 0, gpuConsumption = 0, memoryConsumption = 0, ioConsumption = 0, totalEnergyConsumption = 0, coolingConsumption = 0;

    if (status !== 'Offline') {
        cpuConsumption = 100 + Math.random() * (status === 'High Load' ? 80 : 50);
        gpuConsumption = 200 + Math.random() * (status === 'High Load' ? 150 : 100);
        memoryConsumption = 20 + Math.random() * 10;
        ioConsumption = 30 + Math.random() * 15;
        totalEnergyConsumption = cpuConsumption + gpuConsumption + memoryConsumption + ioConsumption;
        coolingConsumption = totalEnergyConsumption * 0.25; // Simple correlation for now
    }
    
    return {
      name: `Rack-${i + 1}`,
      status: status,
      power: power,
      memory: status === 'Offline' ? 0 : Math.round(512 + Math.random() * 1536), // 0.5-2TB RAM
      networkIO: status === 'Offline' ? 0 : parseFloat((50 + Math.random() * 350).toFixed(1)), // 50-400 Gbps
      temp: status === 'Offline' ? 18 : Math.round(22 + Math.random() * 10), // 22-32°C
      cpuCores: 128,
      utilization: Math.round((totalEnergyConsumption / power) * 100),
      cpuConsumption: parseFloat(cpuConsumption.toFixed(1)),
      gpuConsumption: parseFloat(gpuConsumption.toFixed(1)),
      memoryConsumption: parseFloat(memoryConsumption.toFixed(1)),
      ioConsumption: parseFloat(ioConsumption.toFixed(1)),
      totalEnergyConsumption: parseFloat(totalEnergyConsumption.toFixed(1)),
      coolingConsumption: parseFloat(coolingConsumption.toFixed(1)),
    };
  });
};

const CustomTooltipContent = ({ active, payload, t }: any) => {
  if (active && payload && payload.length) {
    const data: TreeMapNode = payload[0].payload;
    return (
      <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-xl text-sm w-64">
        <div className="flex justify-between items-baseline mb-2">
            <p className="font-bold text-white">{data.name}</p>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
                data.status === 'Online' ? 'bg-green-500/30 text-green-300' : 
                data.status === 'High Load' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-red-500/30 text-red-300'}`
            }>
                {data.status}
            </span>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
            <h5 className="font-semibold text-cyan-400 text-xs uppercase mb-1">{t('dataCenter.treemap.tooltip.energyConsumption')}</h5>
            <div className="grid grid-cols-2 gap-x-4">
                <p className="text-gray-400">CPU:</p><p className="text-gray-200 font-mono text-right">{data.cpuConsumption} kWh</p>
                <p className="text-gray-400">GPU:</p><p className="text-gray-200 font-mono text-right">{data.gpuConsumption} kWh</p>
                <p className="text-gray-400">{t('dataCenter.treemap.tooltip.memory')}</p><p className="text-gray-200 font-mono text-right">{data.memoryConsumption} kWh</p>
                <p className="text-gray-400">I/O:</p><p className="text-gray-200 font-mono text-right">{data.ioConsumption} kWh</p>
            </div>
             <div className="flex justify-between font-bold mt-1">
                <p className="text-cyan-400">{t('dataCenter.treemap.tooltip.total')}</p><p className="text-cyan-400 font-mono">{data.totalEnergyConsumption} kWh</p>
            </div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
             <div className="flex justify-between">
                <p className="text-gray-400">{t('dataCenter.treemap.tooltip.cooling')}</p><p className="text-gray-200 font-mono">{data.coolingConsumption} kWₜ</p>
            </div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
            <h5 className="font-semibold text-gray-400 text-xs uppercase mb-1">{t('dataCenter.treemap.tooltip.metrics')}</h5>
             <div className="grid grid-cols-2 gap-x-4">
                <p className="text-gray-400">{t('dataCenter.treemap.tooltip.utilization')}</p><p className="text-gray-200 font-mono text-right">{data.utilization}%</p>
                <p className="text-gray-400">{t('dataCenter.treemap.tooltip.temp')}</p><p className="text-gray-200 font-mono text-right">{data.temp} °C</p>
                <p className="text-gray-400">{t('dataCenter.treemap.tooltip.network')}</p><p className="text-gray-200 font-mono text-right">{data.networkIO} Gbps</p>
                <p className="text-gray-400">{t('dataCenter.treemap.tooltip.memory')}</p><p className="text-gray-200 font-mono text-right">{data.memory} GB</p>
             </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, status } = props;
    
    // Defensive check
    if (!status) {
        return null;
    }

    let color = '#3b82f6'; // blue-500 for Online
    if (status === 'High Load') color = '#f59e0b'; // amber-500
    if (status === 'Offline') color = '#ef4444'; // red-500

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: color,
                    stroke: '#1f2937',
                    strokeWidth: 2,
                }}
            />
            {width > 80 && height > 30 && (
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={14} style={{ textShadow: '0 0 2px rgba(0,0,0,0.7)' }}>
                    {name}
                </text>
            )}
        </g>
    );
};


const DataCenterTreeMap: React.FC<DataCenterTreeMapProps> = ({
    isMaximizable,
    isMaximized,
    onToggleMaximize,
    t
}) => {
    const [data, setData] = useState<TreeMapNode[]>([]);
    const [viewMode, setViewMode] = useState<TreeMapViewMode>('totalEnergy');

    useEffect(() => {
        setData(generateInitialRackData());
    }, []);

    const dataKey = viewMode === 'totalEnergy' ? 'totalEnergyConsumption' : 'coolingConsumption';
    const viewTitle = viewMode === 'totalEnergy' ? t('dataCenter.treemap.energyConsumption') : t('dataCenter.treemap.coolingConsumption');

    return (
        <DashboardCard 
            title={t('dataCenter.treemap.title')}
            icon={<ServerRackIcon className="w-6 h-6" />}
            isMaximizable={isMaximizable}
            isMaximized={isMaximized}
            onToggleMaximize={onToggleMaximize}
            action={
                <div className="flex items-center bg-gray-900/50 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('totalEnergy')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${viewMode === 'totalEnergy' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        {t('dataCenter.treemap.energy')}
                    </button>
                    <button
                        onClick={() => setViewMode('cooling')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${viewMode === 'cooling' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        {t('dataCenter.treemap.cooling')}
                    </button>
                </div>
            }
        >
            <div className="w-full h-full min-h-[500px] flex flex-col">
                <p className="text-center text-sm text-gray-400 mb-2">{t('dataCenter.treemap.viewingBy')} <span className="font-semibold text-white">{viewTitle}</span></p>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey={dataKey}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent />}
                            isAnimationActive={false}
                            aspectRatio={16/9}
                        >
                            <Tooltip content={<CustomTooltipContent t={t} />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardCard>
    );
};

export default DataCenterTreeMap;

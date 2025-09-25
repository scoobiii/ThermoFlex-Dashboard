/**
 * @file DataCenterTreeMap.tsx
 * @description Renders a treemap visualization of the data center server racks, showing their status and key metrics.
 * @version 1.7.1
 * @date 2024-08-05
 * @author Senior DevOps Team
 * @productowner Edivaldo Beringela (Prefeitura de Mauá)
 * 
 * @responsibility
 * Visualizes hierarchical rack data using area-proportional treemap.
 * Supports dynamic metric switching (energy vs cooling) with Finviz-style color scaling.
 * Integrates with DashboardCard for consistent UI and maximize behavior.
 * Ensures both action controls and maximize button remain accessible at all times.
 * 
 * @changelog
 * v1.7.1 - 2024-08-05
 *   - Verified and documented compatibility with DashboardCard v1.1.0.
 *   - Confirmed that the action controls (Energy/Cooling switcher) and maximize button now coexist correctly in the card header without mutual exclusion.
 *   - No functional changes to this file; fix was implemented upstream in DashboardCard.
 *
 * v1.7.0 - 2024-08-04
 *   - De-correlated cooling and energy consumption data to ensure treemap sizes visibly change when switching KPIs.
 *   - Introduced a randomized `coolingEfficiencyFactor` for each rack during data generation.
 *   - This makes the treemap layout dynamically re-organize based on the selected metric, fulfilling the user request for KPI-driven sizing.
 *
 * v1.6.0 - 2024-08-03
 *   - Added data labels (rack name and value) directly inside the treemap cells for better readability, visible on larger nodes.
 *   - Labels are conditionally rendered based on block size (`width > 60 && height > 35`) to prevent clutter.
 *   - Text includes a subtle shadow for improved contrast against dynamic background colors.
 *
 * v1.5.0 - 2024-08-02
 *   - Fixed a critical rendering bug in `CustomizedContent` where it was attempting to access a non-existent `payload` prop, causing the entire treemap to render as blank.
 *   - Modified the component to correctly access data values (e.g., `totalEnergyConsumption`) directly from its props, restoring the visualization.
 *   - Added explicit handling for 'Offline' racks to render them with a distinct neutral gray color, improving clarity.
 *
 * v1.4.0 - 2024-08-01
 *   - Refactored and re-implemented the interactive view switcher for clarity and performance.
 *   - Enhanced the Finviz-style dynamic coloring logic to provide a clearer visual representation of consumption hotspots.
 *   - The treemap now dynamically adjusts both the size and color of each rack based on the selected metric ('Consumo de Energia' or 'Consumo de Frio').
 * 
 * v1.3.0 - 2024-07-31
 *   - Implemented dynamic, Finviz-style coloring. Racks are now colored on a green-to-red scale based on the selected metric's value.
 *   - The color scale is calculated dynamically based on the min/max consumption values of the visible dataset.
 *   - Replaced the static, status-based coloring in `CustomizedContent` with the new dynamic, value-based coloring logic.
 * 
 * v1.2.1 - 2024-07-30
 *   - Corrected the logic in `CustomizedContent` to robustly access the `status` property directly from props. This resolves a critical rendering failure where most racks were not being displayed.
 * 
 * v1.2.0 - 2024-07-29
 *   - Fixed a critical rendering bug in `CustomizedContent` where `payload.status` was being accessed instead of `status` from props.
 * 
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
import React, { useState, useEffect, useMemo } from 'react';
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
  [key: string]: any; // Index signature for recharts compatibility
}

interface DataCenterTreeMapProps {
    isMaximizable?: boolean;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

const generateInitialRackData = (): TreeMapNode[] => {
  return Array.from({ length: 725 }, (_, i) => {
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
        
        // De-correlate cooling from energy by giving each rack a variable efficiency factor.
        // This makes the treemap sizes visually change when switching KPIs.
        const coolingEfficiencyFactor = 0.15 + Math.random() * 0.15; // Varying efficiency from 15% to 30%
        coolingConsumption = totalEnergyConsumption * coolingEfficiencyFactor;
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

const CustomTooltipContent = ({ active, payload }: any) => {
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
            <h5 className="font-semibold text-cyan-400 text-xs uppercase mb-1">Consumo de Energia</h5>
            <div className="grid grid-cols-2 gap-x-4">
                <p className="text-gray-400">CPU:</p><p className="text-gray-200 font-mono text-right">{data.cpuConsumption} kWh</p>
                <p className="text-gray-400">GPU:</p><p className="text-gray-200 font-mono text-right">{data.gpuConsumption} kWh</p>
                <p className="text-gray-400">Memória:</p><p className="text-gray-200 font-mono text-right">{data.memoryConsumption} kWh</p>
                <p className="text-gray-400">I/O:</p><p className="text-gray-200 font-mono text-right">{data.ioConsumption} kWh</p>
            </div>
             <div className="flex justify-between font-bold mt-1">
                <p className="text-cyan-400">Total:</p><p className="text-cyan-400 font-mono">{data.totalEnergyConsumption} kWh</p>
            </div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
             <div className="flex justify-between">
                <p className="text-gray-400">Consumo Frio:</p><p className="text-gray-200 font-mono">{data.coolingConsumption} kWₜ</p>
            </div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
            <h5 className="font-semibold text-gray-400 text-xs uppercase mb-1">Métricas</h5>
             <div className="grid grid-cols-2 gap-x-4">
                <p className="text-gray-400">Utilização:</p><p className="text-gray-200 font-mono text-right">{data.utilization}%</p>
                <p className="text-gray-400">Temp:</p><p className="text-gray-200 font-mono text-right">{data.temp} °C</p>
                <p className="text-gray-400">Rede:</p><p className="text-gray-200 font-mono text-right">{data.networkIO} Gbps</p>
                <p className="text-gray-400">Memória:</p><p className="text-gray-200 font-mono text-right">{data.memory} GB</p>
             </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomizedContent: React.FC<any> = (props) => {
    const { x, y, width, height, name, dataKey, getColor, status } = props;
    
    const value = props[dataKey];
    
    if (status === 'Offline') {
        return (
            <g>
                <rect x={x} y={y} width={width} height={height} style={{ fill: '#4b5563', stroke: '#374151', strokeWidth: 1 }} />
            </g>
        );
    }

    const color = getColor(value);
    const valueUnit = dataKey === 'totalEnergyConsumption' ? 'kWh' : 'kWₜ';

    return (
        <g>
            <rect x={x} y={y} width={width} height={height} style={{ fill: color, stroke: '#1f2937', strokeWidth: 1 }} />
            {width > 60 && height > 35 && (
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={12} style={{ textShadow: '0 0 4px rgba(0,0,0,0.7)' }}>
                    {name}
                </text>
            )}
             {width > 60 && height > 55 && (
                 <text x={x + width / 2} y={y + height / 2 + 16} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={10} style={{ textShadow: '0 0 4px rgba(0,0,0,0.7)' }}>
                    {typeof value === 'number' ? `${value.toFixed(1)} ${valueUnit}` : ''}
                </text>
             )}
        </g>
    );
};

const DataCenterTreeMap: React.FC<DataCenterTreeMapProps> = ({
    isMaximizable,
    isMaximized,
    onToggleMaximize,
}) => {
    const [data, setData] = useState<TreeMapNode[]>([]);
    const [viewMode, setViewMode] = useState<TreeMapViewMode>('totalEnergy');

    useEffect(() => {
        setData(generateInitialRackData());
    }, []);

    const dataKey = viewMode === 'totalEnergy' ? 'totalEnergyConsumption' : 'coolingConsumption';
    const viewTitle = viewMode === 'totalEnergy' ? 'Consumo de Energia (kWh)' : 'Consumo de Frio (kWₜ)';

    const { min, max } = useMemo(() => {
        if (!data || data.length === 0) return { min: 0, max: 0 };
        const values = data.filter(d => d.status !== 'Offline').map(d => d[dataKey]);
        if (values.length === 0) return { min: 0, max: 0 };
        return { min: Math.min(...values), max: Math.max(...values) };
    }, [data, dataKey]);

    const getColor = (value: number) => {
        if (typeof value !== 'number') return '#4b5563'; // Return gray for non-numeric values
        const range = max - min;
        if (range === 0) return '#22c55e'; // Green for no variation

        const normalized = (value - min) / range;
        
        // Finviz-style Green -> Yellow -> Red
        const hue = (1 - normalized) * 120; // 120 (green) to 0 (red)
        return `hsl(${hue}, 80%, 50%)`;
    };
    
    return (
        <DashboardCard 
            title="Treemap de Consumo dos Racks"
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
                        Energia
                    </button>
                    <button
                        onClick={() => setViewMode('cooling')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${viewMode === 'cooling' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                    >
                        Frio
                    </button>
                </div>
            }
        >
            <div className="w-full h-full flex flex-col">
                <p className="text-center text-sm text-gray-400 mb-2">Visualizando por: <span className="font-semibold text-white">{viewTitle}</span></p>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey={dataKey}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent dataKey={dataKey} getColor={getColor} />}
                            isAnimationActive={false}
                            aspectRatio={16/9}
                        >
                            <Tooltip content={<CustomTooltipContent />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardCard>
    );
};

export default DataCenterTreeMap;
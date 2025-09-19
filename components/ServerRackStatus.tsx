
import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { ServerRackIcon } from './icons';

type RackStatus = 'Online' | 'High Load' | 'Offline';

interface Rack {
  id: string;
  status: RackStatus;
  cpuLoad: number;
  memUsage: number;
  temp: number;
}

const initialRacks: Rack[] = [
  { id: 'A-01', status: 'Online', cpuLoad: 45, memUsage: 60, temp: 21 },
  { id: 'A-02', status: 'Online', cpuLoad: 55, memUsage: 65, temp: 22 },
  { id: 'A-03', status: 'High Load', cpuLoad: 88, memUsage: 75, temp: 28 },
  { id: 'B-01', status: 'Online', cpuLoad: 30, memUsage: 50, temp: 20 },
  { id: 'B-02', status: 'Offline', cpuLoad: 0, memUsage: 0, temp: 18 },
  { id: 'B-03', status: 'Online', cpuLoad: 62, memUsage: 80, temp: 24 },
];

const statusStyles: { [key in RackStatus]: { text: string; bg: string } } = {
  Online: { text: 'text-green-400', bg: 'bg-green-500/20' },
  'High Load': { text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  Offline: { text: 'text-red-400', bg: 'bg-red-500/20' },
};

const ServerRackStatus: React.FC = () => {
  const [racks, setRacks] = useState<Rack[]>(initialRacks);

  useEffect(() => {
    const interval = setInterval(() => {
      setRacks(prevRacks =>
        prevRacks.map(rack => {
          if (rack.status === 'Offline') return rack;

          const newCpuLoad = Math.max(20, Math.min(99, rack.cpuLoad + (Math.random() - 0.5) * 10));
          const newMemUsage = Math.max(40, Math.min(95, rack.memUsage + (Math.random() - 0.5) * 5));
          const newTemp = Math.max(18, Math.min(35, rack.temp + (Math.random() - 0.5) * 2));
          
          let newStatus: RackStatus = 'Online';
          if (newCpuLoad > 85 || newTemp > 27) {
            newStatus = 'High Load';
          }

          return {
            ...rack,
            cpuLoad: Math.round(newCpuLoad),
            memUsage: Math.round(newMemUsage),
            temp: Math.round(newTemp),
            // FIX: Removed redundant condition. Due to the early return, `rack.status` can never be 'Offline' here.
            status: newStatus,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardCard title="Status dos Racks de Servidores" icon={<ServerRackIcon className="w-6 h-6" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {racks.map(rack => (
          <div key={rack.id} className={`p-3 rounded-lg ${statusStyles[rack.status].bg}`}>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white">{rack.id}</h4>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[rack.status].text}`}>
                {rack.status}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 text-center text-sm">
              <div>
                <p className="text-xs text-gray-400">CPU</p>
                <p className="font-mono font-semibold">{rack.cpuLoad}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Mem</p>
                <p className="font-mono font-semibold">{rack.memUsage}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Temp</p>
                <p className="font-mono font-semibold">{rack.temp}°C</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default ServerRackStatus;

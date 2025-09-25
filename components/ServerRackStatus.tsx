import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import ServerRackDetailsModal from './ServerRackDetailsModal';

export interface Rack {
  id: number;
  cpuLoad: number;
  gpuLoad: number;
  memUsage: number;
  temp: number;
  status: 'online' | 'high-load' | 'offline';
  networkIO: {
    ingress: number;
    egress: number;
  };
  tempHistory: { time: string; temp: number }[];
}

interface ServerRackStatusProps {
  onRackDataUpdate: (count: number) => void;
}

const generateInitialRackData = (): Rack[] => {
  return Array.from({ length: 120 }, (_, i) => {
    const statusRoll = Math.random();
    let status: 'online' | 'high-load' | 'offline' = 'online';
    if (statusRoll > 0.95) {
      status = 'offline';
    } else if (statusRoll > 0.85) {
      status = 'high-load';
    }

    return {
      id: i + 1,
      cpuLoad: status === 'offline' ? 0 : Math.round(10 + Math.random() * (status === 'high-load' ? 80 : 50)),
      gpuLoad: status === 'offline' ? 0 : Math.round(5 + Math.random() * (status === 'high-load' ? 85 : 45)),
      memUsage: status === 'offline' ? 0 : Math.round(20 + Math.random() * 60),
      temp: status === 'offline' ? 18 : Math.round(22 + Math.random() * (status === 'high-load' ? 18 : 8)),
      status,
      networkIO: {
        ingress: status === 'offline' ? 0 : parseFloat((Math.random() * 5).toFixed(2)),
        egress: status === 'offline' ? 0 : parseFloat((Math.random() * 3).toFixed(2)),
      },
      tempHistory: Array.from({ length: 15 }, (_, j) => ({
        time: `${14-j}s`,
        temp: status === 'offline' ? 18 : Math.round(22 + Math.random() * (status === 'high-load' ? 18 : 8) - (Math.random() * 3)),
      })),
    };
  });
};

const statusColors = {
  online: 'bg-green-500/80 hover:bg-green-400',
  'high-load': 'bg-yellow-500/80 hover:bg-yellow-400',
  offline: 'bg-red-500/80 hover:bg-red-400',
};

const ServerRackStatus: React.FC<ServerRackStatusProps> = ({ onRackDataUpdate }) => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);

  useEffect(() => {
    setRacks(generateInitialRackData());

    const interval = setInterval(() => {
      setRacks(prevRacks =>
        prevRacks.map(rack => {
          if (rack.status === 'offline') return rack;

          const newCpuLoad = Math.max(10, Math.min(99, rack.cpuLoad + (Math.random() - 0.5) * 10));
          const newGpuLoad = Math.max(5, Math.min(99, rack.gpuLoad + (Math.random() - 0.5) * 15));
          const newMemUsage = Math.max(20, Math.min(95, rack.memUsage + (Math.random() - 0.5) * 5));
          const newTemp = Math.max(22, Math.min(45, rack.temp + (Math.random() - 0.45) * 2));
          
          let newStatus = rack.status;
          if (newCpuLoad > 85 || newGpuLoad > 90 || newTemp > 40) {
            newStatus = 'high-load';
          } else if (rack.status === 'high-load' && newCpuLoad < 70 && newGpuLoad < 75 && newTemp < 35) {
            newStatus = 'online';
          }

          const newHistoryPoint = {
            time: '0s',
            temp: newTemp,
          };

          const updatedHistory = [newHistoryPoint, ...rack.tempHistory.slice(0, 14)].map((p, i) => ({...p, time: `${i}s`}));

          return {
            ...rack,
            cpuLoad: Math.round(newCpuLoad),
            gpuLoad: Math.round(newGpuLoad),
            memUsage: Math.round(newMemUsage),
            temp: Math.round(newTemp),
            status: newStatus,
            networkIO: {
              ingress: parseFloat(Math.max(0, rack.networkIO.ingress + (Math.random() - 0.5)).toFixed(2)),
              egress: parseFloat(Math.max(0, rack.networkIO.egress + (Math.random() - 0.5) * 0.5).toFixed(2)),
            },
            tempHistory: updatedHistory
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const summary = racks.reduce(
    (acc, rack) => {
      acc[rack.status]++;
      return acc;
    },
    { online: 0, 'high-load': 0, offline: 0 }
  );
  
  useEffect(() => {
    const activeCount = summary.online + summary['high-load'];
    onRackDataUpdate(activeCount);
  }, [summary, onRackDataUpdate]);


  return (
    <>
      <DashboardCard title="Status dos Racks do Servidor">
        <div className="flex justify-center gap-6 mb-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{summary.online}</p>
            <p className="text-sm text-gray-400">Online</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{summary['high-load']}</p>
            <p className="text-sm text-gray-400">Carga Alta</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{summary.offline}</p>
            <p className="text-sm text-gray-400">Offline</p>
          </div>
        </div>
        <div className="grid grid-cols-12 md:grid-cols-20 gap-1.5">
          {racks.map(rack => (
            <button
              key={rack.id}
              onClick={() => setSelectedRack(rack)}
              className={`w-full h-4 rounded-sm transition-colors duration-300 ${statusColors[rack.status]}`}
              aria-label={`Rack ${rack.id}, Status: ${rack.status}`}
            >
              <span className="sr-only">Rack {rack.id}</span>
            </button>
          ))}
        </div>
      </DashboardCard>
      {selectedRack && (
        <ServerRackDetailsModal
          rack={selectedRack}
          onClose={() => setSelectedRack(null)}
        />
      )}
    </>
  );
};

export default ServerRackStatus;

import React from 'react';
import { Alert } from '../types';
import DashboardCard from './DashboardCard';
import { WarningIcon, InfoIcon, CloseIcon } from './icons';

interface AlertsProps {
  alerts: Alert[];
  onDismiss: (id: number) => void;
  onClearAll: () => void;
  // FIX: Add props for maximizing functionality
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const alertConfig = {
    critical: {
        icon: <WarningIcon className="w-5 h-5 text-red-400" />,
        color: 'border-l-4 border-red-400'
    },
    warning: {
        icon: <WarningIcon className="w-5 h-5 text-yellow-400" />,
        color: 'border-l-4 border-yellow-400'
    },
    info: {
        icon: <InfoIcon className="w-5 h-5 text-blue-400" />,
        color: 'border-l-4 border-blue-400'
    }
}

const Alerts: React.FC<AlertsProps> = ({ 
  alerts, 
  onDismiss, 
  onClearAll,
  isMaximizable,
  isMaximized,
  onToggleMaximize
}) => {
  return (
    <DashboardCard 
      title="Alertas Recentes"
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
    >
      {alerts.length > 0 && (
        <div className="flex justify-end mb-2 -mt-2">
          <button
            onClick={onClearAll}
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none"
            aria-label="Limpar todos os alertas"
          >
            Limpar Tudo
          </button>
        </div>
      )}
      <div className="space-y-3">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className={`bg-gray-700 p-3 rounded-md flex items-start gap-3 ${alertConfig[alert.level].color}`}>
            <div>{alertConfig[alert.level].icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-200">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">{alert.timestamp}</p>
            </div>
             <button 
                onClick={() => onDismiss(alert.id)} 
                className="text-gray-500 hover:text-white transition-colors duration-200 p-1 -m-1 rounded-full" 
                aria-label={`Dispensar alerta: ${alert.message}`}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )) : <p className="text-center text-gray-500 pt-8">Nenhum alerta recente.</p>}
      </div>
    </DashboardCard>
  );
};

export default Alerts;

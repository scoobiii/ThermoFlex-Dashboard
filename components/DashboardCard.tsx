import React, { ReactNode } from 'react';
import ViewControls from './ViewControls';

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  icon, 
  action, 
  children, 
  className = '',
  isMaximizable = false,
  isMaximized = false,
  onToggleMaximize,
}) => {
  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-500">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          {action && <div>{action}</div>}
          {isMaximizable && <ViewControls isMaximized={isMaximized} onToggle={onToggleMaximize} />}
        </div>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
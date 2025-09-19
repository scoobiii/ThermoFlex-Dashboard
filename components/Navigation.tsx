
import React from 'react';
import { Page } from '../App';
import { BoltIcon, WrenchScrewdriverIcon, CpuChipIcon, CircleStackIcon, AdjustmentsHorizontalIcon, ChartBarIcon } from './icons';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

interface NavigationProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'powerplant', label: 'Power Plant', icon: <BoltIcon className="w-6 h-6" /> },
    { id: 'utilities', label: 'Utilidades', icon: <WrenchScrewdriverIcon className="w-6 h-6" /> },
    { id: 'datacenter', label: 'Data Center', icon: <CpuChipIcon className="w-6 h-6" /> },
    { id: 'infrastructure', label: 'Infraestrutura', icon: <CircleStackIcon className="w-6 h-6" /> },
    { id: 'configuration', label: 'Configuração', icon: <AdjustmentsHorizontalIcon className="w-6 h-6" /> },
  ];

  return (
    <nav className="w-64 bg-gray-800 p-4 border-r border-gray-700 flex-shrink-0 flex flex-col">
       <div className="flex items-center space-x-3 px-2 pb-6">
        <div className="bg-gray-700 p-2 rounded-lg">
          <ChartBarIcon className="h-8 w-8 text-cyan-400" />
        </div>
        <h1 className="text-xl font-bold text-white">BioDataCloud</h1>
      </div>
      <div className="space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={currentPage === item.id}
            onClick={() => setCurrentPage(item.id as Page)}
          />
        ))}
      </div>
      <div className="mt-auto text-center text-xs text-gray-500">
        <p>&copy; 2024 BioDataCloud</p>
        <p>Versão 1.0.0</p>
      </div>
    </nav>
  );
};

export default Navigation;

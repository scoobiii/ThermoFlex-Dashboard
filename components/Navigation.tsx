import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

// Update Page type to include submenu items
export type Page = 
    'Power Plant' | 
    'Utilities' | 
    'Data Center' | 
    'Financials' | 
    'Configuration' | 
    'Infrastructure' | 
    'MAUAX consortium' | 
    'inventario UTE' | 
    'Chiller' | 
    'PowerPlantSystem' |
    // Submenu items for Utilities
    'Fluxo de Energia da Usina' |
    'Chiller Absorção' |
    'Chiller Absorção -> Tiac' |
    'Chiller Absorção -> Fog' |
    'Chiller Absorção -> Data Cloud' |
    'Fog System Details' |
    'Power Plant Sankey' |
    'External Page'; // New page for viewing external content

interface NavItem {
    label: string;
    page: Page;
    children?: NavItem[];
}

// Restructure nav items to support submenus
const navItems: NavItem[] = [
    { label: 'Power Plant', page: 'Power Plant' },
    { 
        label: 'Utilities', 
        page: 'Utilities',
        children: [
            { label: 'Fluxo de Energia da Usina', page: 'Fluxo de Energia da Usina' },
            { label: 'Chiller Absorção', page: 'Chiller Absorção' },
            { label: 'Chiller Absorção -> Tiac', page: 'Chiller Absorção -> Tiac' },
            { label: 'Chiller Absorção -> Fog', page: 'Chiller Absorção -> Fog' },
            { label: 'Chiller Absorção -> Data Cloud', page: 'Chiller Absorção -> Data Cloud' },
        ]
    },
    { label: 'Data Center', page: 'Data Center' },
    { label: 'Financials', page: 'Financials' },
    { label: 'Configuration', page: 'Configuration' },
    { label: 'Infrastructure', page: 'Infrastructure' },
    { label: 'MAUAX consortium', page: 'MAUAX consortium' },
    { label: 'inventario UTE', page: 'inventario UTE' }
];

interface NavigationProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Check if the current page is a child of a nav item to keep the parent highlighted
    const isChildPageActive = (item: NavItem): boolean => {
        if (!item.children) return false;
        return item.children.some(child => child.page === currentPage);
    };

    return (
        <nav className="bg-gray-900 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-start h-16">
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <div 
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => item.children && setOpenMenu(item.label)}
                                    onMouseLeave={() => item.children && setOpenMenu(null)}
                                >
                                    <button
                                        onClick={() => setCurrentPage(item.page)}
                                        className={`flex items-center gap-1 transition-colors duration-200 ${
                                            currentPage === item.page || isChildPageActive(item) || (item.children && openMenu === item.label)
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
                                        aria-haspopup={!!item.children}
                                        aria-expanded={openMenu === item.label}
                                        aria-current={currentPage === item.page || isChildPageActive(item) ? 'page' : undefined}
                                    >
                                        {item.label}
                                        {item.children && <ChevronDownIcon className="w-4 h-4" />}
                                    </button>
                                    {item.children && openMenu === item.label && (
                                        <div className="absolute z-10 mt-2 w-64 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                {item.children.map(child => (
                                                    <a
                                                        key={child.label}
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(child.page);
                                                            setOpenMenu(null);
                                                        }}
                                                        className="text-gray-300 hover:bg-gray-700 hover:text-white block px-4 py-2 text-sm"
                                                        role="menuitem"
                                                    >
                                                        {child.label}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Animation for dropdown */}
            <style>{`
                @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { 
                animation: fadeIn 0.2s ease-out; 
                }
            `}</style>
        </nav>
    );
};

export default Navigation;
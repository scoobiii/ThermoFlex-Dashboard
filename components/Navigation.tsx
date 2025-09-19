import React from 'react';

const navItems = ['Power Plant', 'Utilities', 'Data Center', 'Infrastructure', 'Financials', 'Configuration', 'MAUAX consortium'];
export type Page = 'Power Plant' | 'Utilities' | 'Data Center' | 'Infrastructure' | 'Financials' | 'Configuration' | 'MAUAX consortium';

interface NavigationProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-16">
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item as Page)}
                    className={`transition-colors duration-200 ${
                      currentPage === item
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
                    aria-current={currentPage === item ? 'page' : undefined}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
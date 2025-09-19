import React from 'react';
import DashboardCard from '../components/DashboardCard';
import { CogIcon, SnowflakeIcon, WrenchScrewdriverIcon, CircleStackIcon } from '../components/icons';

const Configuration: React.FC = () => {
  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Configuração do Sistema</h2>
        <p className="text-gray-400 mt-1">Ajuste os parâmetros dos equipamentos e da infraestrutura da planta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Turbine Configuration */}
        <DashboardCard title="Configuração da Turbina" icon={<CogIcon className="w-6 h-6" />}>
          <div className="space-y-4">
            <div>
              <label htmlFor="turbine-manufacturer" className="block text-sm font-medium text-gray-300">Fabricante</label>
              <select id="turbine-manufacturer" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white">
                <option>Fabricante A</option>
                <option>Fabricante B</option>
                <option>Fabricante C</option>
              </select>
            </div>
            <div>
              <label htmlFor="turbine-model" className="block text-sm font-medium text-gray-300">Modelo</label>
              <select id="turbine-model" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white">
                <option>Modelo X1</option>
                <option>Modelo Y2</option>
                <option>Modelo Z3</option>
              </select>
            </div>
            <div>
              <label htmlFor="turbine-capacity" className="block text-sm font-medium text-gray-300">Capacidade Nominal (MW)</label>
              <input type="number" id="turbine-capacity" defaultValue="2500" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
          </div>
        </DashboardCard>

        {/* Chiller Configuration */}
        <DashboardCard title="Configuração do Chiller" icon={<SnowflakeIcon className="w-6 h-6" />}>
          <div className="space-y-4">
            <div>
              <label htmlFor="chiller-manufacturer" className="block text-sm font-medium text-gray-300">Fabricante</label>
              <select id="chiller-manufacturer" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white">
                <option>ChillerCorp A</option>
                <option>ChillerCorp B</option>
              </select>
            </div>
            <div>
              <label htmlFor="chiller-model" className="block text-sm font-medium text-gray-300">Modelo</label>
              <select id="chiller-model" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white">
                <option>Absorção-1000</option>
                <option>Absorção-2000</option>
              </select>
            </div>
            <div>
              <label htmlFor="chiller-cop" className="block text-sm font-medium text-gray-300">Coeficiente de Performance (COP)</label>
              <input type="number" step="0.01" id="chiller-cop" defaultValue="0.7" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
          </div>
        </DashboardCard>

        {/* TIAC & Fogging Configuration */}
        <DashboardCard title="TIAC & Fogging" icon={<WrenchScrewdriverIcon className="w-6 h-6" />}>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
                <span className="font-medium text-gray-300">Habilitar Cálculo Automático</span>
                <label htmlFor="auto-calc-toggle" className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" value="" id="auto-calc-toggle" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
            </div>
            <div>
              <label htmlFor="tiac-temp" className="block text-sm font-medium text-gray-300">Temperatura Alvo Admissão (°C)</label>
              <input type="number" id="tiac-temp" defaultValue="15" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
            <div>
              <label htmlFor="tiac-humidity" className="block text-sm font-medium text-gray-300">Umidade Alvo Admissão (%)</label>
              <input type="number" id="tiac-humidity" defaultValue="60" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
          </div>
        </DashboardCard>
        
        {/* Infrastructure Configuration */}
        <DashboardCard title="Infraestrutura de Etanol" icon={<CircleStackIcon className="w-6 h-6" />}>
           <div className="space-y-4">
            <div>
              <label htmlFor="reservoir-capacity" className="block text-sm font-medium text-gray-300">Capacidade do Reservatório (Litros)</label>
              <input type="number" id="reservoir-capacity" defaultValue="5000000" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
            <div>
              <label htmlFor="alert-level" className="block text-sm font-medium text-gray-300">Nível de Alerta de Autonomia (%)</label>
              <input type="number" id="alert-level" defaultValue="20" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white" />
            </div>
           </div>
        </DashboardCard>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500">
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default Configuration;

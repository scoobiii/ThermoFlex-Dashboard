import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FuelMode } from '../types';
import DashboardCard from './DashboardCard';
import { GasIcon } from './icons';

interface FuelStatusProps {
  fuelMode: FuelMode;
  consumption: number;
  flexMix: { h2: number, biodiesel: number };
  setFlexMix: React.Dispatch<React.SetStateAction<{ h2: number; biodiesel: number }>>;
}

const COLORS: { [key: string]: string } = {
  'Gás Natural': '#0891b2',
  'H2': '#34d399',
  'Etanol': '#6ee7b7',
  'Biodiesel': '#22c55e',
};

const FuelStatus: React.FC<FuelStatusProps> = ({ fuelMode, consumption, flexMix, setFlexMix }) => {
  let chartData = [];
  let fuelTitle: string = fuelMode;

  switch (fuelMode) {
    case FuelMode.NaturalGas:
      chartData = [{ name: 'Gás Natural', value: 100 }];
      break;
    case FuelMode.Ethanol:
      chartData = [{ name: 'Etanol', value: 100 }];
      break;
    case FuelMode.Biodiesel:
      chartData = [{ name: 'Biodiesel', value: 100 }];
      break;
    case FuelMode.FlexNGH2:
      chartData = [
        { name: 'Gás Natural', value: 100 - flexMix.h2 },
        { name: 'H2', value: flexMix.h2 },
      ];
      fuelTitle = `GN (${100 - flexMix.h2}%) / H2 (${flexMix.h2}%)`
      break;
    case FuelMode.FlexEthanolBiodiesel:
      chartData = [
        { name: 'Etanol', value: 100 - flexMix.biodiesel },
        { name: 'Biodiesel', value: flexMix.biodiesel },
      ];
      fuelTitle = `Etanol (${100-flexMix.biodiesel}%) / Biodiesel (${flexMix.biodiesel}%)`
      break;
  }

  const showH2Slider = fuelMode === FuelMode.FlexNGH2;
  const showBiodieselSlider = fuelMode === FuelMode.FlexEthanolBiodiesel;

  return (
    <DashboardCard title="Status do Combustível" icon={<GasIcon className="w-6 h-6" />}>
      <div className="flex flex-col h-full">
        <div>
            <div className="text-center">
                <p className="text-gray-400 text-sm">Modo de Operação</p>
                <p className="font-semibold text-cyan-400 h-10">{fuelTitle}</p>
            </div>
            <div className="h-32 w-full -ml-4">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={50}
                    innerRadius={35}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
                <p className="text-3xl font-bold text-white">{consumption.toFixed(1)}</p>
                <p className="text-gray-400">Consumo (kg/s)</p>
            </div>
        </div>
        
        <div className="mt-auto pt-4">
          {(showH2Slider || showBiodieselSlider) && (
            <div className="border-t border-gray-700 pt-3">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 text-center">Ajuste de Mix Flexível</h4>
              {showH2Slider && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label htmlFor="h2Mix" className="text-sm font-medium text-gray-300">Hidrogênio (H₂)</label>
                    <span className="text-lg font-mono font-semibold text-emerald-400">{flexMix.h2}%</span>
                  </div>
                  <input
                    type="range"
                    id="h2Mix"
                    min="0"
                    max="100"
                    value={flexMix.h2}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, h2: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    aria-label="Ajustar mix de Hidrogênio"
                  />
                </div>
              )}
              {showBiodieselSlider && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label htmlFor="biodieselMix" className="text-sm font-medium text-gray-300">Biodiesel</label>
                    <span className="text-lg font-mono font-semibold text-green-500">{flexMix.biodiesel}%</span>
                  </div>
                  <input
                    type="range"
                    id="biodieselMix"
                    min="0"
                    max="100"
                    value={flexMix.biodiesel}
                    onChange={(e) => setFlexMix(prev => ({ ...prev, biodiesel: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                    aria-label="Ajustar mix de Biodiesel"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};

export default FuelStatus;

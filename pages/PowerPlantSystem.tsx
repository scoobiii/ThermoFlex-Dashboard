import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { BoltIcon as Power, FactoryIcon as Factory, CogIcon as Settings, InfoIcon as Info, ChevronDownIcon as ChevronDown, ChevronUpIcon as ChevronUp, ChartBarIcon as BarChart3, TrendingUpIcon as TrendingUp, MagnifyingGlassIcon as Search } from '../components/icons';
import { POWER_PLANTS } from '../data/plants';

const PowerPlantSystem = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    plants: true,
    analytics: true,
    emissions: true,
    efficiency: true
  });

  // Use the shared data source, filtering for real plants from the inventory (those with a 'cycle' property)
  const plantsData = POWER_PLANTS.filter(p => p.cycle);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredPlants = plantsData.filter(plant => {
    const matchesFilter = selectedFilter === 'all' || 
                         plant.fuel.toLowerCase().includes(selectedFilter.toLowerCase()) ||
                         (plant.cycle && plant.cycle.toLowerCase().includes(selectedFilter.toLowerCase()));
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plant.location && plant.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Dados para gráficos de análise
  const fuelTypeData = [
    { name: 'Gás Natural', count: plantsData.filter(p => p.fuel === 'Gás Natural').length, generation: plantsData.filter(p => p.fuel === 'Gás Natural').reduce((sum, p) => sum + (p.generation2023 || 0), 0) },
    { name: 'Carvão Mineral', count: plantsData.filter(p => p.fuel === 'Carvão Mineral').length, generation: plantsData.filter(p => p.fuel === 'Carvão Mineral').reduce((sum, p) => sum + (p.generation2023 || 0), 0) },
    { name: 'Óleo Combustível', count: plantsData.filter(p => p.fuel === 'Óleo Combustível').length, generation: plantsData.filter(p => p.fuel === 'Óleo Combustível').reduce((sum, p) => sum + (p.generation2023 || 0), 0) }
  ];

  const topEmitters = plantsData
    .filter(p => p.emissions2023)
    .sort((a, b) => (b.emissions2023 ?? 0) - (a.emissions2023 ?? 0))
    .slice(0, 10);

  const efficiencyData = plantsData
    .filter(p => p.efficiency && p.rate)
    .map(p => ({
      name: p.name,
      efficiency: p.efficiency,
      rate: p.rate,
      fuel: p.fuel
    }));

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];

  const SectionCard: React.FC<{title: string, icon: React.FC<any>, isExpanded: boolean, onToggle: () => void, children: React.ReactNode}> = ({ title, icon: Icon, isExpanded, onToggle, children }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  const getFuelColor = (fuel: string) => {
    switch(fuel) {
      case 'Gás Natural': return 'text-blue-600';
      case 'Carvão Mineral': return 'text-red-600';
      case 'Óleo Combustível': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getFuelBgColor = (fuel: string) => {
    switch(fuel) {
      case 'Gás Natural': return 'bg-blue-50 border-blue-200';
      case 'Carvão Mineral': return 'bg-red-50 border-red-200';
      case 'Óleo Combustível': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Factory className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Sistema Nacional de Termelétricas</h1>
          </div>
          <p className="text-gray-600 text-lg">Inventário de Emissões Atmosféricas - 67 Usinas do SIN (2023)</p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usina ou localização..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              {['all', 'Gás Natural', 'Carvão Mineral', 'Óleo Combustível'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === filter 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'Todas' : filter}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Total de usinas: {filteredPlants.length}</span>
            <span>Geração total 2023: {filteredPlants.reduce((sum, p) => sum + (p.generation2023 || 0), 0).toLocaleString()} GWh</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Análise Geral */}
          <div>
            {/* Distribuição por Combustível */}
            <SectionCard
              title="Distribuição por Combustível"
              icon={BarChart3}
              isExpanded={expandedSections.analytics}
              onToggle={() => toggleSection('analytics')}
            >
              <div className="space-y-6 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Número de Usinas por Combustível</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={fuelTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Geração por Tipo de Combustível (GWh)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value}) => `${name}: ${(Number(value)/1000).toFixed(1)}K GWh`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="generation"
                      >
                        {fuelTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} GWh`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>

            {/* Maiores Emissores */}
            <SectionCard
              title="Top 10 Maiores Emissores (2023)"
              icon={TrendingUp}
              isExpanded={expandedSections.emissions}
              onToggle={() => toggleSection('emissions')}
            >
              <div className="space-y-6 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topEmitters} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} fontSize={10} interval={0}/>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} mil tCO₂e`} />
                      <Legend />
                      <Bar dataKey="emissions2023" name="Emissões (mil tCO₂e)" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Coluna Direita - Eficiência e Lista */}
          <div>
            {/* Análise de Eficiência */}
            <SectionCard
              title="Eficiência vs Taxa de Emissão"
              icon={Settings}
              isExpanded={expandedSections.efficiency}
              onToggle={() => toggleSection('efficiency')}
            >
              <div className="space-y-6 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Relação Eficiência x Taxa de Emissão</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="efficiency" name="Eficiência (%)" unit="%" />
                      <YAxis type="number" dataKey="rate" name="Taxa Emissão (tCO₂e/GWh)" unit="t/GWh" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                                        <p className="font-bold">{data.name}</p>
                                        <p>Eficiência: {data.efficiency}%</p>
                                        <p>Taxa Emissão: {data.rate} tCO₂e/GWh</p>
                                        <p>Combustível: {data.fuel}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                      />
                      <Scatter data={efficiencyData} fill="#3B82F6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>

            {/* Lista de Usinas */}
            <SectionCard
              title={`Usinas Termelétricas (${filteredPlants.length})`}
              icon={Factory}
              isExpanded={expandedSections.plants}
              onToggle={() => toggleSection('plants')}
            >
              <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredPlants.map((plant, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getFuelBgColor(plant.fuel)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{plant.name}</h4>
                      <span className={`text-sm font-medium ${getFuelColor(plant.fuel)}`}>
                        {plant.fuel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Local:</span> {plant.location}</p>
                      <p><span className="font-medium">Tecnologia:</span> {plant.cycle}</p>
                      <p><span className="font-medium">Capacidade:</span> {plant.power} MW</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500">Geração 2023</p>
                        <p className="font-bold text-blue-600">{(plant.generation2023 || 0).toLocaleString()} GWh</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-500">Emissões 2023</p>
                        <p className="font-bold text-red-600">{plant.emissions2023?.toLocaleString() || 'N/A'} mil tCO₂e</p>
                      </div>
                      {plant.efficiency && (
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500">Eficiência</p>
                          <p className="font-bold text-green-600">{plant.efficiency}%</p>
                        </div>
                      )}
                      {plant.rate && (
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500">Taxa Emissão</p>
                          <p className="font-bold text-orange-600">{plant.rate} tCO₂e/GWh</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Estatísticas Resumo */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo do Sistema Termelétrico Nacional (2023)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{plantsData.length}</div>
              <div className="text-gray-600">Usinas Inventariadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">26,9</div>
              <div className="text-gray-600">TWh Gerados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">17,9</div>
              <div className="text-gray-600">Mi tCO₂e Emitidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">671</div>
              <div className="text-gray-600">tCO₂e/GWh Média</div>
            </div>
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Sobre o Inventário</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Este sistema apresenta dados do 4º Inventário de Emissões Atmosféricas em Usinas Termelétricas (ano-base 2023) 
                realizado pelo Instituto de Energia e Meio Ambiente (IEMA). O inventário abrange 67 usinas termelétricas a 
                combustíveis fósseis que forneceram energia ao Sistema Interligado Nacional (SIN). Destaca-se que 69% da 
                geração foi proveniente de usinas a gás natural, enquanto apenas 10 usinas foram responsáveis por 71% das 
                emissões de gases de efeito estufa. A geração termelétrica fóssil voltou aos níveis de antes da crise hídrica 
                de 2014, representando 9% da geração total nacional em 2023.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerPlantSystem;

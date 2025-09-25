

import React, { useState, useEffect, useMemo } from 'react';
import DashboardCard from '../components/DashboardCard';
import { ChartBarIcon, BoltIcon, ArrowDownTrayIcon } from '../components/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid } from 'recharts';
import { PlantStatus, FuelMode } from '../types';

interface FinancialsProps {
  plantStatus: PlantStatus;
  powerOutput: number;
  fuelMode: FuelMode;
  flexMix: { h2: number, biodiesel: number };
  activeRackCount: number;
}

const initialMonthlyRevenueData = [
  { month: 'Jan', revenue: 9.8 }, { month: 'Fev', revenue: 9.5 }, { month: 'Mar', revenue: 10.2 },
  { month: 'Abr', revenue: 10.5 }, { month: 'Mai', revenue: 11.1 }, { month: 'Jun', revenue: 11.0 },
  { month: 'Jul', revenue: 11.5 }, { month: 'Ago', revenue: 11.8 }, { month: 'Set', revenue: 12.0 },
  { month: 'Out', revenue: 12.3 }, { month: 'Nov', revenue: 12.1 }, { month: 'Dez', revenue: 12.5 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
};

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 p-2 border border-gray-600 rounded-md shadow-lg">
          <p className="label text-sm text-gray-300">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || p.fill }} className="text-sm">
              {`${p.name}: ${formatter(p.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

const Financials: React.FC<FinancialsProps> = ({
  plantStatus,
  powerOutput,
  fuelMode,
  flexMix,
  activeRackCount,
}) => {
    const [carbonPrice, setCarbonPrice] = useState(32.50); // USD per ton
    const [monthlyRevenueHistory, setMonthlyRevenueHistory] = useState(initialMonthlyRevenueData);
    const [roi, setRoi] = useState(28.5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCarbonPrice(prev => Math.max(25, Math.min(45, prev + (Math.random() - 0.5) * 1.5)));
            setRoi(prev => Math.max(20, Math.min(40, prev + (Math.random() - 0.5) * 0.2)));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const financialMetrics = useMemo(() => {
        const isOnline = plantStatus === PlantStatus.Online;
        const REVENUE_PER_RACK_PER_MONTH = 6000; // Example value in BRL

        const capexCost = 12500000;
        const opexFuel = isOnline ? 950000 : 0;
        const opexMaintenance = isOnline ? 550000 : 0;
        const opexPersonnel = isOnline ? 300000 : 0;
        const opexTotal = opexFuel + opexMaintenance + opexPersonnel;

        const costData = [
            { name: 'CAPEX (Amortizado)', value: capexCost, color: '#0891b2' },
            { name: 'OPEX: Combustível', value: opexFuel, color: '#34d399' },
            { name: 'OPEX: Manutenção', value: opexMaintenance, color: '#6ee7b7' },
            { name: 'OPEX: Pessoal', value: opexPersonnel, color: '#a7f3d0' },
        ];
        
        const totalCost = capexCost + opexTotal;

        if (!isOnline) {
            return {
                totalRevenue: 0,
                netProfit: 0 - totalCost,
                co2ReducedTons: 0,
                carbonRevenue: 0,
                revenueStreamData: [
                    { name: 'Venda de Energia', value: 0, color: '#f59e0b' },
                    { name: 'Serviços de Cloud', value: 0, color: '#8b5cf6' },
                    { name: 'Créditos de Carbono', value: 0, color: '#10b981' },
                ],
                costData,
                totalCost,
            };
        }

        const BRL_USD_RATE = 5.0;
        const ENERGY_PRICE_BRL_PER_MWH = 550;
        
        const monthlyMWh = powerOutput * 24 * 30;
        const energyRevenue = monthlyMWh * ENERGY_PRICE_BRL_PER_MWH;
        const cloudRevenue = activeRackCount * REVENUE_PER_RACK_PER_MONTH;

        const CO2_FACTORS_KG_PER_KWH = {
            baseline: 0.4,
            [FuelMode.NaturalGas]: 0.2,
            [FuelMode.Ethanol]: 0.1,
            [FuelMode.Biodiesel]: 0.12,
        };
        
        let currentCo2Factor = CO2_FACTORS_KG_PER_KWH[FuelMode.NaturalGas];
        if (fuelMode === FuelMode.FlexNGH2) {
            currentCo2Factor = CO2_FACTORS_KG_PER_KWH[FuelMode.NaturalGas] * (1 - (flexMix.h2 / 100));
        } else if (fuelMode === FuelMode.FlexEthanolBiodiesel) {
            const ethFactor = 1 - (flexMix.biodiesel / 100);
            const bioFactor = flexMix.biodiesel / 100;
            currentCo2Factor = (CO2_FACTORS_KG_PER_KWH[FuelMode.Ethanol] * ethFactor) + (CO2_FACTORS_KG_PER_KWH[FuelMode.Biodiesel] * bioFactor);
        } else if (fuelMode in CO2_FACTORS_KG_PER_KWH) {
            currentCo2Factor = CO2_FACTORS_KG_PER_KWH[fuelMode as keyof typeof CO2_FACTORS_KG_PER_KWH];
        }

        const monthlyKWh = monthlyMWh * 1000;
        const co2ReducedKg = monthlyKWh * (CO2_FACTORS_KG_PER_KWH.baseline - currentCo2Factor);
        
        const co2ReducedTons = fuelMode === FuelMode.NaturalGas ? 0 : (co2ReducedKg > 0 ? co2ReducedKg / 1000 : 0);
        
        const carbonRevenue = co2ReducedTons * carbonPrice * BRL_USD_RATE;

        const totalRevenue = energyRevenue + cloudRevenue + carbonRevenue;
        
        const netProfit = totalRevenue - totalCost;

        const revenueStreamData = [
            { name: 'Venda de Energia', value: energyRevenue, color: '#f59e0b' },
            { name: 'Serviços de Cloud', value: cloudRevenue, color: '#8b5cf6' },
            { name: 'Créditos de Carbono', value: carbonRevenue, color: '#10b981' },
        ];

        return { totalRevenue, netProfit, co2ReducedTons, carbonRevenue, revenueStreamData, costData, totalCost };
    }, [plantStatus, powerOutput, fuelMode, flexMix, carbonPrice, activeRackCount]);

    useEffect(() => {
        if(financialMetrics.totalRevenue > 0) {
            const baseRevenueMillions = financialMetrics.totalRevenue / 1000000;
            setMonthlyRevenueHistory(
                initialMonthlyRevenueData.map(item => ({
                    ...item,
                    revenue: baseRevenueMillions * (0.95 + Math.random() * 0.1)
                }))
            );
        } else {
             setMonthlyRevenueHistory(
                initialMonthlyRevenueData.map(item => ({...item, revenue: 0}))
             );
        }
    }, [financialMetrics.totalRevenue]);

    const handleExportCSV = () => {
        const {
            totalRevenue,
            netProfit,
            totalCost,
            revenueStreamData,
            costData
        } = financialMetrics;

        const dataToExport = [
            { metric: 'Receita Total', value: totalRevenue },
            { metric: 'Lucro Líquido', value: netProfit },
            { metric: 'Custo Total', value: totalCost },
            ...revenueStreamData.map(item => ({ metric: `Receita - ${item.name}`, value: item.value })),
            ...costData.map(item => ({ metric: `Custo - ${item.name}`, value: item.value }))
        ];

        const csvHeader = '"Métrica","Valor (BRL)"\n';
        const csvRows = dataToExport.map(row =>
            `"${row.metric}","${row.value.toFixed(2)}"`
        ).join('\n');

        const csvContent = csvHeader + csvRows;

        // Add BOM for Excel compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_financeiro_mauax_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <DashboardCard
                title="Resumo Financeiro (Mensal)"
                icon={<ChartBarIcon className="w-6 h-6" />}
                action={
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Exportar dados financeiros como CSV"
                    disabled={plantStatus !== PlantStatus.Online}
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Exportar CSV
                </button>
                }
            >
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-gray-400 text-sm">Receita Total</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(financialMetrics.totalRevenue)}</p>
                    </div>
                     <div>
                        <p className="text-gray-400 text-sm">Lucro Líquido</p>
                        <p className={`text-2xl font-bold ${financialMetrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(financialMetrics.netProfit)}</p>
                    </div>
                     <div>
                        <p className="text-gray-400 text-sm">ROI Anualizado</p>
                        <p className="text-2xl font-bold text-cyan-400">{roi.toFixed(1)}%</p>
                    </div>
                </div>
                <div className="h-56 mt-4 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyRevenueHistory} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                             <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value.toFixed(0)}M`} />
                            <Tooltip 
                                content={<CustomTooltip formatter={(value: number) => `R$ ${value.toFixed(1)}M`} />}
                                wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449', borderRadius: '0.5rem' }} 
                            />
                            <Area type="monotone" dataKey="revenue" name="Receita" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </DashboardCard>
            
            <DashboardCard title="Receita de Sustentabilidade" icon={<BoltIcon className="w-6 h-6 text-emerald-400" />}>
                 <div className="grid grid-cols-3 gap-4 text-center h-full items-center">
                    <div>
                        <p className="text-gray-400 text-sm">CO₂ Reduzido (Mensal)</p>
                        <p className="text-2xl font-bold text-white">{financialMetrics.co2ReducedTons.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-gray-500">tCO₂e</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Preço do Crédito</p>
                        <p className="text-2xl font-bold text-white">${carbonPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">USD/tCO₂e (Bolsa)</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Receita Adicional</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(financialMetrics.carbonRevenue)}</p>
                        <p className="text-xs text-gray-500">Mensal</p>
                    </div>
                 </div>
            </DashboardCard>

            <DashboardCard title="Fontes de Receita (Mensal)" icon={<BoltIcon className="w-6 h-6" />}>
                 <div className="h-full flex flex-col">
                    <div className="text-center mb-4">
                        <span className="text-gray-400 text-sm">Receita Total das Fontes</span>
                        <span className="text-3xl font-bold text-white block">{formatCurrency(financialMetrics.totalRevenue)}</span>
                    </div>
                    <div className="flex-grow h-64 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialMetrics.revenueStreamData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${formatCurrency(value / 1000000)}M`} />
                                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={120} />
                                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}} />
                                <Bar dataKey="value" name="Receita" barSize={30} radius={[0, 8, 8, 0]}>
                                    {financialMetrics.revenueStreamData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </DashboardCard>

            <DashboardCard title="Análise de Custos (Mensal)" >
                <div className="h-full flex items-center justify-center">
                    <div className="w-full h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={financialMetrics.costData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                    {financialMetrics.costData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Pie>
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px"}}/>
                                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                            </PieChart>
                        </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-gray-400 text-sm">Custo Total</span>
                            <span className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.totalCost).replace('R$', 'R$ ')}</span>
                        </div>
                    </div>
                </div>
            </DashboardCard>

             <DashboardCard title="Metas e Projeções (Trimestral)" className="lg:col-span-2">
                <div className="space-y-4 h-full flex flex-col justify-around">
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-gray-300">Meta de Receita</span>
                            <span className="text-sm font-semibold text-white">{formatCurrency(35000000)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full text-right pr-2 text-xs font-bold text-white flex items-center justify-end" style={{ width: `92%` }}>
                                {formatCurrency(32200000)} (92%)
                            </div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-gray-300">Meta de Lucro</span>
                             <span className="text-sm font-semibold text-white">{formatCurrency(15000000)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div className="bg-cyan-500 h-4 rounded-full text-right pr-2 text-xs font-bold text-white flex items-center justify-end" style={{ width: `85%` }}>
                                {formatCurrency(12750000)} (85%)
                            </div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-gray-300">Novos Contratos Cloud</span>
                             <span className="text-sm font-semibold text-white">50</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div className="bg-violet-500 h-4 rounded-full text-right pr-2 text-xs font-bold text-white flex items-center justify-end" style={{ width: `110%` }}>
                                55 (110%)
                            </div>
                        </div>
                    </div>
                </div>
             </DashboardCard>

        </div>
    );
};

export default Financials;
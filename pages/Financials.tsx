
import React, { useState, useEffect, useMemo } from 'react';
import DashboardCard from '../components/DashboardCard';
// FIX: Import ChartPieIcon to use as the icon for the DashboardCard.
import { ChartBarIcon, BoltIcon, ArrowDownTrayIcon, ChartPieIcon, TrendingUpIcon, ComputerDesktopIcon } from '../components/icons';
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

// --- Financial Constants ---
const REVENUE_PER_RACK_PER_MONTH = 285000; // BRL, valor para datacenter de alta performance (NVIDIA DGX H100)
const OPEX_PER_RACK_PER_MONTH = 2500;    // Custo operacional por rack (energia, refrigeração parcial, etc.)
const TAX_RATE = 0.25;                    // Imposto de Renda e Contribuição Social (Exemplo: 25%)
const REVENUE_TARGET = 950000000;         // Meta de Receita Mensal
const PROFIT_TARGET = 400000000;          // Meta de Lucro Líquido Mensal

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
        
        // --- Receitas ---
        const BRL_USD_RATE = 5.0;
        const ENERGY_PRICE_BRL_PER_MWH = 550;
        const monthlyMWh = powerOutput * 24 * 30;
        const energyRevenue = isOnline ? monthlyMWh * ENERGY_PRICE_BRL_PER_MWH : 0;
        const cloudRevenue = isOnline ? activeRackCount * REVENUE_PER_RACK_PER_MONTH : 0;

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
        const co2ReducedTons = isOnline && fuelMode !== FuelMode.NaturalGas ? (co2ReducedKg > 0 ? co2ReducedKg / 1000 : 0) : 0;
        const carbonRevenue = co2ReducedTons * carbonPrice * BRL_USD_RATE;

        const totalRevenue = energyRevenue + cloudRevenue + carbonRevenue;

        // --- Custos e Despesas (IFRS Standard) ---
        // Custo do Produto Vendido (CPV/COGS) - Custo direto para gerar energia
        const baseFuelCost = 950000;
        const baselinePower = 2250;
        const cogsFuel = isOnline ? baseFuelCost * (powerOutput / baselinePower) : 0;

        // Lucro Bruto
        const grossProfit = totalRevenue - cogsFuel;

        // Despesas Operacionais (OPEX)
        const opexMaintenance = isOnline ? 550000 : 0;
        const opexPersonnel = isOnline ? 300000 : 0;
        const opexDataCenter = isOnline ? activeRackCount * OPEX_PER_RACK_PER_MONTH : 0;
        const totalOpex = opexMaintenance + opexPersonnel + opexDataCenter;

        // EBITDA (LAJIDA)
        const ebitda = grossProfit - totalOpex;

        // Depreciação e Amortização
        const monthlyAmortization = 12500000;

        // EBIT (LAJIR)
        const ebit = ebitda - monthlyAmortization;

        // Impostos
        const taxes = ebit > 0 ? ebit * TAX_RATE : 0;

        // Lucro Líquido (Resultado Líquido)
        const netProfit = ebit - taxes;

        // --- Data for Charts ---
        const revenueStreamData = [
            { name: 'Venda de Energia', value: energyRevenue, color: '#f59e0b' },
            { name: 'Serviços de Cloud', value: cloudRevenue, color: '#8b5cf6' },
            { name: 'Créditos de Carbono', value: carbonRevenue, color: '#10b981' },
        ];
        
        const costData = [
            { name: 'Combustível (CPV)', value: cogsFuel, color: '#34d399' },
            { name: 'Manutenção', value: opexMaintenance, color: '#6ee7b7' },
            { name: 'Pessoal', value: opexPersonnel, color: '#a7f3d0' },
            { name: 'Data Center', value: opexDataCenter, color: '#fb923c' },
        ];
        const totalOperatingCosts = cogsFuel + totalOpex;

        return { 
            totalRevenue, grossProfit, ebitda, netProfit, 
            co2ReducedTons, carbonRevenue, revenueStreamData, costData,
            totalOperatingCosts, monthlyAmortization, ebit, taxes
        };
    }, [plantStatus, powerOutput, fuelMode, flexMix, carbonPrice, activeRackCount]);

    const monthlySummaryData = useMemo(() => [
        { month: 'Set/23', revenue: 1180, costs: 760 },
        { month: 'Out/23', revenue: 1230, costs: 800 },
        { month: 'Nov/23', revenue: 1210, costs: 790 },
        { month: 'Dez/23', revenue: 1250, costs: 810 },
        { month: 'Jan/24', revenue: 980, costs: 650 },
        { month: 'Fev/24', revenue: 950, costs: 630 },
        { month: 'Mar/24', revenue: 1020, costs: 680 },
        { month: 'Abr/24', revenue: 1050, costs: 700 },
        { month: 'Mai/24', revenue: 1110, costs: 720 },
        { month: 'Jun/24', revenue: 1100, costs: 710 },
        { month: 'Jul/24', revenue: 1150, costs: 750 },
        // Current month's data is dynamic
        { 
          month: 'Ago/24', 
          revenue: financialMetrics.totalRevenue > 0 ? financialMetrics.totalRevenue / 1000000 : 0, 
          costs: financialMetrics.totalOperatingCosts > 0 ? financialMetrics.totalOperatingCosts / 1000000 : 0
        },
      ].map(d => ({ 
          month: d.month,
          revenue: d.revenue * 1000000, 
          costs: d.costs * 1000000, 
          profit: (d.revenue - d.costs) * 1000000 // This represents EBITDA
      })), [financialMetrics.totalRevenue, financialMetrics.totalOperatingCosts]);
      
    const monthlyNetProfitSummaryData = useMemo(() => {
        const amortization = 12500000;
        const taxRate = TAX_RATE;

        return monthlySummaryData.map(d => {
            const ebitda = d.profit;
            const ebit = ebitda - amortization;
            const taxes = ebit > 0 ? ebit * taxRate : 0;
            const netProfit = ebit - taxes;
            
            const totalCosts = d.costs + amortization + taxes;

            return {
                month: d.month,
                revenue: d.revenue,
                totalCosts: totalCosts,
                netProfit: netProfit
            };
        });
    }, [monthlySummaryData]);

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
            totalRevenue, grossProfit, ebitda, ebit, taxes, netProfit,
            monthlyAmortization, revenueStreamData, costData
        } = financialMetrics;

        const dataToExport = [
            { group: 'Resultado', metric: 'Receita Total', value: totalRevenue },
            ...revenueStreamData.map(item => ({ group: 'Receita', metric: item.name, value: item.value })),
            { group: 'Resultado', metric: '(-) Custo do Produto Vendido', value: -costData.find(c => c.name.includes('Combustível'))!.value },
            { group: 'Resultado', metric: '= Lucro Bruto', value: grossProfit },
            ...costData.filter(c => !c.name.includes('Combustível')).map(item => ({ group: 'OPEX', metric: `(-) ${item.name}`, value: -item.value })),
            { group: 'Resultado', metric: '= EBITDA', value: ebitda },
            { group: 'Resultado', metric: '(-) Depreciação & Amortização', value: -monthlyAmortization },
            { group: 'Resultado', metric: '= EBIT (Lucro Operacional)', value: ebit },
            { group: 'Resultado', metric: '(-) Impostos', value: -taxes },
            { group: 'Resultado', metric: '= Resultado Líquido', value: netProfit },
        ];

        const csvHeader = '"Grupo","Métrica","Valor (BRL)"\n';
        const csvRows = dataToExport.map(row =>
            `"${row.group}","${row.metric}","${row.value.toFixed(2)}"`
        ).join('\n');

        const csvContent = csvHeader + csvRows;
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

    const currentRevenue = financialMetrics.totalRevenue;
    const revenuePercentage = REVENUE_TARGET > 0 ? (currentRevenue / REVENUE_TARGET) * 100 : 0;
    
    const currentProfit = financialMetrics.netProfit;
    const profitPercentage = PROFIT_TARGET > 0 ? (currentProfit / PROFIT_TARGET) * 100 : 0;

    return (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <DashboardCard
                title="Demonstrativo de Resultados (Mensal)"
                icon={<ChartBarIcon className="w-6 h-6" />}
                className="lg:col-span-2"
                action={
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md transition-all duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Exportar dados financeiros como CSV"
                    disabled={plantStatus !== PlantStatus.Online}
                >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Exportar DRE
                </button>
                }
            >
                <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-baseline p-2 bg-gray-900/50 rounded-lg">
                        <span className="text-gray-300">Receita Total</span>
                        <span className="text-xl font-bold text-green-400">{formatCurrency(financialMetrics.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-baseline p-2">
                        <span className="text-gray-400 text-sm">Lucro Bruto</span>
                        <span className="font-semibold text-white">{formatCurrency(financialMetrics.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between items-baseline p-2">
                        <span className="text-gray-400 text-sm">EBITDA</span>
                        <span className="font-semibold text-white">{formatCurrency(financialMetrics.ebitda)}</span>
                    </div>
                    <div className="flex justify-between items-baseline p-2 bg-gray-900/50 rounded-lg">
                        <span className="text-gray-300 font-bold">Resultado Líquido</span>
                        <span className={`text-xl font-bold ${financialMetrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(financialMetrics.netProfit)}
                        </span>
                    </div>
                </div>
                <div className="h-40 -ml-4">
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
                 <div className="grid grid-cols-2 gap-4 text-center h-full items-center">
                    <div>
                        <p className="text-gray-400 text-sm">CO₂ Reduzido</p>
                        <p className="text-2xl font-bold text-white">{financialMetrics.co2ReducedTons.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-gray-500">tCO₂e / Mês</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Preço do Crédito</p>
                        <p className="text-2xl font-bold text-white">${carbonPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">USD/tCO₂e</p>
                    </div>
                    <div className="col-span-2 bg-gray-900/50 p-2 rounded-lg">
                        <p className="text-gray-400 text-sm">Receita Adicional</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(financialMetrics.carbonRevenue)}</p>
                         <p className="text-xs text-gray-500">Mensal</p>
                    </div>
                 </div>
            </DashboardCard>

            <DashboardCard title="Faturamento Data Cloud (Mensal)" icon={<ComputerDesktopIcon className="w-6 h-6 text-purple-400" />}>
                <div className="space-y-3 h-full flex flex-col justify-around">
                    <div className="flex justify-between items-baseline">
                        <span className="text-gray-400">Racks Ativos</span>
                        <span className="font-semibold text-white font-mono">{activeRackCount}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-gray-400">Receita / Rack</span>
                        <span className="font-semibold text-white font-mono">{formatCurrency(REVENUE_PER_RACK_PER_MONTH)}</span>
                    </div>
                    <div className="border-t border-gray-700 my-1"></div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-gray-300">Receita Bruta</span>
                        <span className="font-semibold text-purple-400">{formatCurrency(financialMetrics.revenueStreamData.find(r => r.name === 'Serviços de Cloud')?.value || 0)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-gray-400">Custos OPEX</span>
                        <span className="font-semibold text-orange-400">-{formatCurrency(financialMetrics.costData.find(c => c.name === 'Data Center')?.value || 0)}</span>
                    </div>
                    <div className="border-t border-gray-700 my-1"></div>
                    <div className="flex justify-between items-baseline bg-gray-900/50 p-2 rounded-lg">
                        <span className="text-gray-300 font-bold">Lucro Líquido Cloud</span>
                        <span className="font-bold text-green-500">{formatCurrency((financialMetrics.revenueStreamData.find(r => r.name === 'Serviços de Cloud')?.value || 0) - (financialMetrics.costData.find(c => c.name === 'Data Center')?.value || 0))}</span>
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

            <DashboardCard title="Estrutura de Custos Operacionais (Mensal)" icon={<ChartPieIcon className="w-6 h-6" />}>
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
                            <span className="text-gray-400 text-sm">Custos Totais</span>
                            <span className="text-2xl font-bold text-white">{formatCurrency(financialMetrics.totalOperatingCosts).replace('R$', 'R$ ')}</span>
                        </div>
                    </div>
                </div>
            </DashboardCard>

            <DashboardCard title="Resumo Financeiro Mensal (Últimos 12 Meses)" icon={<ChartBarIcon className="w-6 h-6" />} className="lg:col-span-3">
                <div className="h-80 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlySummaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(0)}M`} />
                            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}/>
                            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                            <Bar dataKey="revenue" name="Receita" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="costs" name="Custos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" name="Lucro (EBITDA)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </DashboardCard>

             <DashboardCard title="Metas de Produção (Mensal)" icon={<TrendingUpIcon className="w-6 h-6" />} className="lg:col-span-3">
                <div className="space-y-4 h-full flex flex-col justify-around">
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-gray-300">Meta de Receita</span>
                            <span className="text-sm font-semibold text-white">{formatCurrency(REVENUE_TARGET)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-5">
                            <div 
                                className="bg-green-500 h-5 rounded-full text-right pr-2 text-xs font-bold text-white flex items-center justify-end" 
                                style={{ width: `${Math.min(revenuePercentage, 100)}%` }}
                                title={`${revenuePercentage.toFixed(1)}%`}
                            >
                                <span className="truncate px-2">
                                    {formatCurrency(currentRevenue)} ({revenuePercentage.toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-gray-300">Meta de Lucro Líquido</span>
                             <span className="text-sm font-semibold text-white">{formatCurrency(PROFIT_TARGET)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-5">
                            <div 
                                className="bg-cyan-500 h-5 rounded-full text-right pr-2 text-xs font-bold text-white flex items-center justify-end" 
                                style={{ width: `${Math.min(profitPercentage, 100)}%` }}
                                title={`${profitPercentage.toFixed(1)}%`}
                            >
                                <span className="truncate px-2">
                                    {formatCurrency(currentProfit)} ({profitPercentage.toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-gray-300">ROI Anualizado (Projeção)</span>
                             <span className="text-sm font-semibold text-white">30%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-5">
                            <div 
                                className="bg-violet-500 h-5 rounded-full text-right pr-2 text-xs font-bold text-white flex items-center justify-end" 
                                style={{ width: `${Math.min((roi/30)*100, 100)}%` }}
                                title={`${roi.toFixed(1)}%`}
                            >
                               <span className="px-2">{roi.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
             </DashboardCard>

            <DashboardCard title="Resumo de Lucro Líquido Mensal (Últimos 12 Meses)" icon={<ChartBarIcon className="w-6 h-6" />} className="lg:col-span-3">
                <div className="h-80 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyNetProfitSummaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(0)}M`} />
                            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449' }}/>
                            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                            <Bar dataKey="revenue" name="Receita" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="totalCosts" name="Custos Totais (incl. Impostos)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="netProfit" name="Lucro Líquido" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </DashboardCard>

        </div>
    );
};

export default Financials;
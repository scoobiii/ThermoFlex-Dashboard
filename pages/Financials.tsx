import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { ChartBarIcon, BoltIcon } from '../components/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid } from 'recharts';

// --- Data Simulation ---

const costData = [
  { name: 'CAPEX (Amortizado)', value: 4500000, color: '#0891b2' }, // cyan-600
  { name: 'OPEX', value: 1800000, color: '#34d399' }, // emerald-400
];

const revenueStreamData = [
    { name: 'Venda de Energia', value: 7500000, color: '#f59e0b' }, // amber-500
    { name: 'Serviços de Cloud', value: 4200000, color: '#8b5cf6' }, // violet-500
];

const initialMonthlyRevenue = [
  { month: 'Jan', revenue: 9.8 }, { month: 'Fev', revenue: 9.5 }, { month: 'Mar', revenue: 10.2 },
  { month: 'Abr', revenue: 10.5 }, { month: 'Mai', revenue: 11.1 }, { month: 'Jun', revenue: 11.0 },
  { month: 'Jul', revenue: 11.5 }, { month: 'Ago', revenue: 11.8 }, { month: 'Set', revenue: 12.0 },
  { month: 'Out', revenue: 12.3 }, { month: 'Nov', revenue: 12.1 }, { month: 'Dez', revenue: 12.5 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
};

// --- Custom Components ---

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

const Financials: React.FC = () => {
    const [financials, setFinancials] = useState({
        totalRevenue: 11_700_000,
        netProfit: 5_400_000,
        roi: 28.5,
    });
    
    const [revenueHistory, setRevenueHistory] = useState(initialMonthlyRevenue);

    useEffect(() => {
        const interval = setInterval(() => {
            setFinancials(prev => {
                const revenueFluctuation = (Math.random() - 0.5) * 50000;
                const profitFluctuation = revenueFluctuation * (0.4 + Math.random() * 0.2);
                const newRevenue = prev.totalRevenue + revenueFluctuation;
                const newProfit = prev.netProfit + profitFluctuation;
                const newRoi = prev.roi + (Math.random() - 0.5) * 0.1;
                
                return {
                    totalRevenue: newRevenue,
                    netProfit: newProfit,
                    roi: newRoi,
                };
            });
            
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const totalCost = costData.reduce((acc, curr) => acc + curr.value, 0);
    const totalRevenueStreams = revenueStreamData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Financial Summary */}
            <DashboardCard title="Resumo Financeiro (Mensal)" icon={<ChartBarIcon className="w-6 h-6" />}>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-gray-400 text-sm">Receita Total</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(financials.totalRevenue)}</p>
                    </div>
                     <div>
                        <p className="text-gray-400 text-sm">Lucro Líquido</p>
                        <p className="text-2xl font-bold text-green-500">{formatCurrency(financials.netProfit)}</p>
                    </div>
                     <div>
                        <p className="text-gray-400 text-sm">ROI Anualizado</p>
                        <p className="text-2xl font-bold text-cyan-400">{financials.roi.toFixed(1)}%</p>
                    </div>
                </div>
                <div className="h-56 mt-4 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueHistory} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                             <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}M`} />
                            <Tooltip 
                                content={<CustomTooltip formatter={(value: number) => `R$ ${value.toFixed(1)}M`} />}
                                wrapperStyle={{ backgroundColor: '#1A2233', border: '1px solid #2A3449', borderRadius: '0.5rem' }} 
                            />
                            <Area type="monotone" dataKey="revenue" name="Receita" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </DashboardCard>
            
            {/* Cost Analysis */}
            <DashboardCard title="Análise de Custos (Mensal)" >
                <div className="h-full flex flex-col lg:flex-row items-center gap-4">
                    <div className="w-full lg:w-1/2 h-56 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5}>
                                    {costData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Pie>
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px"}}/>
                                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                            </PieChart>
                        </ResponsiveContainer>
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-gray-400 text-sm">Custo Total</span>
                            <span className="text-2xl font-bold text-white">{formatCurrency(totalCost).replace('R$', 'R$ ')}</span>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-3 text-sm">
                        <div>
                            <p className="font-semibold text-cyan-400">CAPEX (Amortizado)</p>
                            <p className="text-gray-300">{formatCurrency(4500000)} - Infraestrutura, Servidores</p>
                        </div>
                         <div>
                            <p className="font-semibold text-emerald-400">OPEX</p>
                            <p className="text-gray-300">{formatCurrency(950000)} - Combustível</p>
                            <p className="text-gray-300">{formatCurrency(550000)} - Manutenção e Operações</p>
                            <p className="text-gray-300">{formatCurrency(300000)} - Pessoal</p>
                        </div>
                    </div>
                </div>
            </DashboardCard>

            {/* Revenue Streams */}
            <DashboardCard title="Fontes de Receita (Mensal)" icon={<BoltIcon className="w-6 h-6" />}>
                 <div className="h-full flex flex-col">
                    <div className="text-center mb-4">
                        <span className="text-gray-400 text-sm">Receita Total das Fontes</span>
                        <span className="text-3xl font-bold text-white block">{formatCurrency(totalRevenueStreams)}</span>
                    </div>
                    <div className="flex-grow h-64 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueStreamData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3449" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${formatCurrency(value / 1000000)}M`} />
                                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={110} />
                                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{fill: 'rgba(42, 52, 73, 0.5)'}} />
                                <Bar dataKey="value" name="Receita" barSize={30} radius={[0, 8, 8, 0]}>
                                    {revenueStreamData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </DashboardCard>

            {/* Projections & Goals */}
             <DashboardCard title="Metas e Projeções (Trimestral)">
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

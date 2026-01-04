
import React, { useState, useMemo } from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { PieChart as PieChartIcon, Wallet, ShoppingCart, DollarSign, Calendar, Filter, Download, Sparkles, BrainCircuit, RefreshCw, FileText, WifiOff } from 'lucide-react';
import { Transaction, Expense, Purchase } from '../types';
import { getProfitAnalysis } from '../services/geminiService';
import { exportPnLToExcel } from '../services/exportService';

interface PnLViewProps {
  transactions: Transaction[];
  expenses: Expense[];
  purchases: Purchase[];
  isOnline: boolean;
}

interface CategoryStat {
  name: string;
  revenue: number;
  itemsSold: number;
  profit: number;
  percentage: number;
}

export const PnLView: React.FC<PnLViewProps> = ({ transactions, expenses, purchases, isOnline }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const pnlData = useMemo(() => {
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime() + 86400000;

    const filteredTrans = transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
    const filteredExp = expenses.filter(e => e.date >= start && e.date <= end);
    const filteredPurch = purchases.filter(p => p.date >= start && p.date <= end);

    const totalRevenue = filteredTrans.reduce((sum, t) => sum + t.total, 0);
    // Real Gross Profit = Sum of (Selling Price - Cost Price) for all items sold
    const grossProfit = filteredTrans.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => {
        const margin = (item.price - (item.costPrice || 0)) * item.quantity;
        return itemSum + margin;
      }, 0);
    }, 0);

    const totalOperationalExpenses = filteredExp.reduce((sum, e) => sum + e.amount, 0);
    const totalPurchasesAmount = filteredPurch.reduce((sum, p) => sum + p.amount, 0);
    
    // Net Profit = Gross Profit - Operational Expenses
    const netProfit = grossProfit - totalOperationalExpenses;

    const dailyMap: Record<string, { date: string, revenue: number, expense: number, profit: number }> = {};
    let curr = new Date(start);
    while (curr.getTime() < end) {
      const dStr = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dStr] = { date: dStr, revenue: 0, expense: 0, profit: 0 };
      curr.setDate(curr.getDate() + 1);
    }

    const categoryMap: Record<string, { name: string, revenue: number, itemsSold: number, profit: number }> = {};
    filteredTrans.forEach(t => {
      const dStr = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMap[dStr]) dailyMap[dStr].revenue += t.total;
      
      t.items.forEach(item => {
        if (!categoryMap[item.category]) {
          categoryMap[item.category] = { name: item.category, revenue: 0, itemsSold: 0, profit: 0 };
        }
        const revenue = (item.price * item.quantity);
        const margin = (item.price - (item.costPrice || 0)) * item.quantity;
        
        categoryMap[item.category].revenue += revenue;
        categoryMap[item.category].itemsSold += item.quantity;
        categoryMap[item.category].profit += margin;

        if (dailyMap[dStr]) dailyMap[dStr].profit += margin;
      });
    });

    filteredExp.forEach(e => {
      const dStr = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMap[dStr]) dailyMap[dStr].expense += e.amount;
    });

    const categoryStats: CategoryStat[] = Object.values(categoryMap).map(cat => ({
      ...cat,
      percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalExpenses: totalOperationalExpenses + totalPurchasesAmount,
      netProfit,
      chartData: Object.values(dailyMap),
      categoryStats,
      breakdown: {
        sales: totalRevenue,
        operationalExpenses: totalOperationalExpenses,
        inventoryPurchases: totalPurchasesAmount,
        grossProfit
      },
      filteredTrans,
      filteredExp,
      filteredPurch
    };
  }, [transactions, expenses, purchases, dateRange]);

  const runAIAnalysis = async () => {
    if (!isOnline) return;
    setIsAnalyzing(true);
    const analysis = await getProfitAnalysis(
      pnlData.totalRevenue,
      pnlData.breakdown.operationalExpenses,
      pnlData.breakdown.inventoryPurchases,
      pnlData.categoryStats.slice(0, 3)
    );
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportPnLToExcel(pnlData, pnlData.filteredTrans, pnlData.filteredExp, pnlData.filteredPurch);
      setIsExporting(false);
    }, 1000);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Regional Financial Health</h2>
          <p className="text-slate-500 text-sm">Real-time P&L analysis in Ghana Cedis (GH₵).</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100">
              <Calendar size={16} className="text-indigo-600" />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="text-xs font-bold outline-none text-slate-700 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-3">
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="text-xs font-bold outline-none text-slate-700 bg-transparent"
              />
            </div>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
            Export XLS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Revenue" 
          value={`GH₵${pnlData.totalRevenue.toFixed(2)}`} 
          sub="Gross Sales"
          icon={<ShoppingCart className="text-indigo-600" />}
          color="indigo"
        />
        <MetricCard 
          label="Gross Profit" 
          value={`GH₵${pnlData.breakdown.grossProfit.toFixed(2)}`} 
          sub="Margin after COGS"
          icon={<DollarSign className="text-emerald-600" />}
          color="emerald"
        />
        <MetricCard 
          label="Net Profit" 
          value={`GH₵${pnlData.netProfit.toFixed(2)}`} 
          sub="After Operational Costs"
          icon={<DollarSign className="text-indigo-600" />}
          color="indigo"
          highlight={pnlData.netProfit > 0}
        />
        <MetricCard 
          label="Profit Margin" 
          value={`${((pnlData.netProfit / (pnlData.totalRevenue || 1)) * 100).toFixed(1)}%`} 
          sub="Efficiency Ratio"
          icon={<Sparkles className="text-amber-500" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-slate-800">Financial Trend (GH₵)</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Revenue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Profit</span>
                      </div>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={pnlData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `GH₵${val}`} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={0.05} fill="#6366f1" />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <PieChartIcon size={20} />
                        </div>
                        <h3 className="font-black text-slate-800">Category Profitability</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Real Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pnlData.categoryStats.map((cat, idx) => (
                                <tr key={cat.name} className="group">
                                    <td className="py-4 font-bold text-slate-800 text-sm flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                      {cat.name}
                                    </td>
                                    <td className="py-4 text-right font-black text-slate-800 text-sm">GH₵{cat.revenue.toFixed(2)}</td>
                                    <td className="py-4 text-right font-black text-emerald-600 text-sm">GH₵{cat.profit.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 relative">
            {!isOnline && (
              <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center">
                <WifiOff className="text-rose-500 mb-4" size={32} />
                <p className="text-sm font-black text-white uppercase tracking-widest">Briefing Unavailable</p>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Financial analysis requires cloud connectivity.</p>
              </div>
            )}
            <h3 className="font-black text-indigo-400 text-xs uppercase tracking-widest mb-6">Financial Briefing</h3>
            {aiAnalysis ? (
              <div className="prose prose-invert prose-xs max-w-none text-slate-300 text-xs leading-relaxed overflow-y-auto max-h-[300px] no-scrollbar">
                {aiAnalysis}
                <button 
                  onClick={runAIAnalysis}
                  disabled={!isOnline}
                  className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Regenerate Analysis
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BrainCircuit className="text-indigo-400 mb-4 opacity-50" size={40} />
                <p className="text-xs font-bold text-slate-400 mb-6">Need a strategic summary of your profits?</p>
                <button 
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing || !isOnline}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {isAnalyzing ? 'Analyzing Data...' : 'Analyze with Gemini'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6">Cost Breakdown</h3>
            <div className="space-y-6">
              <BreakdownItem label="Net Sales" value={pnlData.breakdown.sales} color="indigo" />
              <BreakdownItem label="Gross Profit" value={pnlData.breakdown.grossProfit} color="emerald" />
              <BreakdownItem label="Operational Exp" value={pnlData.breakdown.operationalExpenses} color="rose" />
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">Margin Result</p>
                <span className={`text-lg font-black ${pnlData.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  GH₵{pnlData.netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode, color: string, highlight?: boolean }> = ({ label, value, sub, icon, color, highlight }) => (
  <div className={`p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md ${highlight ? 'ring-4 ring-emerald-500/10' : ''}`}>
    <div className={`w-12 h-12 bg-${color}-50 rounded-2xl flex items-center justify-center mb-6`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-800 mb-1">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{sub}</p>
  </div>
);

const BreakdownItem: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-1.5 h-1.5 rounded-full ${color === 'emerald' ? 'bg-emerald-500' : color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
    <p className={`text-sm font-black ${color === 'emerald' ? 'text-emerald-600' : color === 'rose' ? 'text-rose-600' : 'text-indigo-600'}`}>
      GH₵{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </p>
  </div>
);

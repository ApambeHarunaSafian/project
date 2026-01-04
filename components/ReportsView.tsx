
import React, { useState, useMemo } from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Cell, PieChart, Pie, ComposedChart, Legend, Line, BarChart } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, UserCheck, ArrowUpRight, ArrowDownRight, Calendar, Filter, Download, FileSpreadsheet, Percent, Layers, PieChart as PieChartIcon, Tag, Wallet, Printer, History } from 'lucide-react';
import { Transaction } from '../types';
import { exportReportsToExcel } from '../services/exportService';

interface ReportsViewProps {
  transactions: Transaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [printTx, setPrintTx] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => {
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime() + 86400000;

    const filteredTrans = transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
    const totalRevenue = filteredTrans.reduce((sum, t) => sum + t.total, 0);
    const avgOrder = filteredTrans.length > 0 ? totalRevenue / filteredTrans.length : 0;
    
    const totalCostPrice = filteredTrans.reduce((sum, t) => {
      return sum + t.items.reduce((itemSum, item) => {
        return itemSum + ((item.costPrice || 0) * item.quantity);
      }, 0);
    }, 0);

    const totalSellingPrice = totalRevenue;
    const totalProfit = totalSellingPrice - totalCostPrice;
    
    const dailyMap: Record<string, { name: string, revenue: number, orders: number, profit: number, cost: number }> = {};
    let curr = new Date(start);
    while (curr.getTime() < end) {
      const dStr = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dStr] = { name: dStr, revenue: 0, orders: 0, profit: 0, cost: 0 };
      curr.setDate(curr.getDate() + 1);
    }

    filteredTrans.forEach(t => {
      const dStr = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMap[dStr]) {
        dailyMap[dStr].revenue += t.total;
        dailyMap[dStr].orders += 1;
        const tCost = t.items.reduce((sum, item) => sum + (item.costPrice || 0) * item.quantity, 0);
        dailyMap[dStr].cost += tCost;
        dailyMap[dStr].profit += (t.total - tCost);
      }
    });

    const categoryStatsMap: Record<string, { name: string, revenue: number, profit: number, cogs: number, itemsSold: number }> = {};
    filteredTrans.forEach(t => {
      t.items.forEach(item => {
        if (!categoryStatsMap[item.category]) {
          categoryStatsMap[item.category] = { name: item.category, revenue: 0, profit: 0, cogs: 0, itemsSold: 0 };
        }
        categoryStatsMap[item.category].revenue += (item.price * item.quantity);
        categoryStatsMap[item.category].cogs += ((item.costPrice || 0) * item.quantity);
        categoryStatsMap[item.category].profit += ((item.price - (item.costPrice || 0)) * item.quantity);
        categoryStatsMap[item.category].itemsSold += item.quantity;
      });
    });

    const categoryStats = Object.values(categoryStatsMap).sort((a, b) => b.revenue - a.revenue);
    const pieData = categoryStats.map(cat => ({ name: cat.name, value: cat.revenue, profit: cat.profit }));

    return { 
      totalRevenue, totalSellingPrice, totalCostPrice, totalProfit, avgOrder, 
      chartData: Object.values(dailyMap), pieData, categoryStats,
      orderCount: filteredTrans.length, filteredTransactionsList: filteredTrans.sort((a, b) => b.timestamp - a.timestamp)
    };
  }, [transactions, dateRange]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportReportsToExcel(stats.filteredTransactionsList, stats, dateRange);
      setIsExporting(false);
    }, 100);
  };

  const handlePrint = (tx: Transaction) => {
    setPrintTx(tx);
    setTimeout(() => {
      window.print();
      setPrintTx(null);
    }, 100);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Ghana Business Analytics</h2>
          <p className="text-slate-500 text-sm">Performance metrics filtered by custom date ranges.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <Calendar size={16} className="text-indigo-600" />
            <input type="date" value={dateRange.start} onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))} className="text-xs font-bold outline-none text-slate-700 bg-transparent cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <input type="date" value={dateRange.end} onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))} className="text-xs font-bold outline-none text-slate-700 bg-transparent cursor-pointer" />
          </div>
          <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-slate-800 transition-all disabled:opacity-50">
            {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileSpreadsheet size={14} />}
            {isExporting ? 'Generating...' : 'Export Excel'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={`GH₵${stats.totalSellingPrice.toLocaleString()}`} trend="+12.5%" icon={<Tag size={24} />} color="bg-indigo-600" />
        <StatCard title="Total Cost" value={`GH₵${stats.totalCostPrice.toLocaleString()}`} trend="+5.2%" icon={<Wallet size={24} />} color="bg-slate-800" />
        <StatCard title="Net Profit" value={`GH₵${stats.totalProfit.toLocaleString()}`} trend="+8.2%" icon={<TrendingUp size={24} />} color="bg-emerald-600" />
        <StatCard title="Avg. Order" value={`GH₵${stats.avgOrder.toFixed(2)}`} trend="-2.1%" icon={<Percent size={24} />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 flex items-center gap-2 mb-8"><TrendingUp size={20} className="text-indigo-600" /> Sales Trend</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `GH₵${val}`} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                <Line yAxisId="left" type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-black text-slate-800 mb-8 flex items-center gap-2"><PieChartIcon size={20} className="text-indigo-600" /> Category Share</h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                  {stats.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `GH₵${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-8">
            {stats.pieData.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{d.name}</span>
                </div>
                <span className="text-xs font-black text-slate-800">GH₵{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2"><History size={20} className="text-indigo-600" /> Transaction History</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats.filteredTransactionsList.length} Orders in range</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.filteredTransactionsList.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{tx.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-600">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    <p className="text-[9px] text-slate-400 uppercase">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-indigo-600">GH₵{tx.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tx.paymentMethod === 'Credit' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handlePrint(tx)}
                      className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                      title="Generate Receipt"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Printable Receipt for Historical Records */}
      {printTx && (
        <div id="receipt-printable-area" className="hidden print:block printable-area">
          <div className="receipt-container">
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold uppercase tracking-tight">GeminiPOS Pro</h1>
              <p className="text-sm">Historical Record Print</p>
              <div className="border-b border-black border-dashed my-2"></div>
            </div>
            <div className="mb-4 text-[11px] leading-tight">
              <p><span className="font-bold">Order ID:</span> {printTx.id}</p>
              <p><span className="font-bold">Date:</span> {new Date(printTx.timestamp).toLocaleString()}</p>
              <p><span className="font-bold">Payment:</span> {printTx.paymentMethod}</p>
            </div>
            <div className="border-b border-black border-dashed mb-2"></div>
            <div className="space-y-1 text-[11px]">
              {printTx.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <span className="flex-1">{item.quantity}x {item.name}</span>
                  <span className="font-mono">{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-b border-black border-dashed my-2"></div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">GH₵{(printTx.total - printTx.tax + printTx.discount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (8%)</span><span className="font-mono">GH₵{printTx.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-[14px] mt-1 pt-1 border-t border-black border-double">
                <span>TOTAL</span>
                <span className="font-mono">GH₵{printTx.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="font-bold text-[12px]">Verified Archive Copy</p>
              <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${printTx.id}&scale=1&rotate=N&includetext=false`} alt="Barcode" className="h-10 w-auto mt-4 mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode; color: string }> = ({ title, value, trend, icon, color }) => {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
      <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

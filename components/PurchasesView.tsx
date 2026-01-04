
import React, { useState } from 'react';
import { Truck, Plus, Package, Clock, CheckCircle, X, DollarSign, Calendar, Building2, Tag } from 'lucide-react';
import { Purchase } from '../types';

interface PurchasesViewProps {
  purchases: Purchase[];
  onAddPurchase: (p: Purchase) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ purchases, onAddPurchase }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Purchase>>({
    supplier: '',
    amount: 0,
    status: 'Pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier || !formData.amount) return;

    const newPurchase: Purchase = {
      id: `PO-${9000 + purchases.length + 1}`,
      supplier: formData.supplier!,
      amount: Number(formData.amount),
      date: Date.now(),
      status: (formData.status as Purchase['status']) || 'Pending'
    };

    onAddPurchase(newPurchase);
    setIsModalOpen(false);
    setFormData({ supplier: '', amount: 0, status: 'Pending' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Ghana Supply Chain</h2>
          <p className="text-slate-500 text-sm">Manage incoming stock and supplier relationships in GHS.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Truck size={18} /> New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest px-2">Active GHS Orders</h3>
          {purchases.length > 0 ? purchases.map(po => (
            <div key={po.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${po.status === 'Received' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>
                  {po.status === 'Received' ? <CheckCircle size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800">{po.id}</h4>
                  <p className="text-xs font-bold text-slate-500">{po.supplier}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-8">
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Order Date</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(po.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Order Total</p>
                  <p className="text-lg font-black text-slate-800">GH₵{po.amount.toFixed(2)}</p>
                </div>
                <div className="h-10 w-[1px] bg-slate-100"></div>
                <div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {po.status}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 opacity-40">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-bold text-slate-500">No purchase orders found</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100/20">
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Package size={20} />
              <h3 className="font-black text-sm uppercase tracking-wider">Inventory Analysis</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Gemini AI suggests that frequent small purchase orders are increasing logistics costs. Consider bulk purchasing for high-turnover categories like 'Dairy'.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Pending Load</span>
                <span className="font-black text-indigo-400">GH₵{purchases.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0).toFixed(2)}</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Record Purchase</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supply Chain Management</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Building2 size={12} /> Supplier Name *
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Organic Farms Co." 
                  value={formData.supplier}
                  onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <DollarSign size={12} /> Amount (GHS) *
                  </label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={formData.amount || ''}
                    onChange={e => setFormData(p => ({ ...p, amount: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <Tag size={12} /> Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Record Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

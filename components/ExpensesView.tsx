
import React, { useState } from 'react';
import { 
  DollarSign, Plus, Filter, Calendar, FileText, ChevronRight, X, 
  CheckCircle, Tag, AlignLeft, Receipt, Settings, Trash2, RefreshCw, Zap
} from 'lucide-react';
import { Expense } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ 
  expenses, 
  onAddExpense, 
  categories, 
  onUpdateCategories 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState<Partial<Expense>>({
    title: '',
    category: categories[0] || 'Operational',
    amount: 0,
    note: '',
    isRecurring: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newExpense: Expense = {
      id: `e-${Date.now()}`,
      title: formData.title!,
      category: formData.category || categories[0] || 'Operational',
      amount: Number(formData.amount),
      date: Date.now(),
      note: formData.note || '',
      isRecurring: !!formData.isRecurring
    };

    onAddExpense(newExpense);
    setIsModalOpen(false);
    setFormData({ title: '', category: categories[0] || 'Operational', amount: 0, note: '', isRecurring: false });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (categories.includes(newCatName.trim())) {
      alert("Category already exists.");
      return;
    }
    onUpdateCategories([...categories, newCatName.trim()]);
    setNewCatName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (categories.length <= 1) {
      alert("At least one category is required.");
      return;
    }
    onUpdateCategories(categories.filter(c => c !== cat));
  };

  const totalMonthlySpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Ghana Expense Tracker</h2>
          <p className="text-slate-500 text-sm">Monitor operational costs in GHS.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Settings size={18} /> Manage Categories
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} /> Record Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Periodic Spend</p>
          <p className="text-3xl font-black text-emerald-900">GH₵{totalMonthlySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 shadow-sm">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Fixed Monthly Burn</p>
          <p className="text-3xl font-black text-rose-900">
            GH₵{expenses.filter(e => e.isRecurring).reduce((s, e) => s + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Budget Efficiency</p>
          <p className="text-3xl font-black text-indigo-900">88%</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-800">Recent Transactions</h3>
          <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Export Ledger</button>
        </div>
        <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
          {expenses.length > 0 ? expenses.map(exp => (
            <div key={exp.id} className="p-5 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 shadow-sm transition-colors">
                  {exp.isRecurring ? <RefreshCw size={20} className="text-indigo-500" /> : <Zap size={20} className="text-amber-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800">{exp.title}</h4>
                    {exp.isRecurring && (
                      <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-100">Recurring</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(exp.date).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full">{exp.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-lg font-black text-slate-800">GH₵{exp.amount.toFixed(2)}</p>
                <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400" />
              </div>
            </div>
          )) : (
            <div className="py-20 text-center opacity-30">
              <FileText size={48} className="mx-auto mb-4" />
              <p className="font-bold">No expenses recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Manage Categories Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Manage Categories</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expense Classification</p>
                </div>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="New Category..." 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-100 transition-all">
                    <span className="font-bold text-slate-700 text-sm">{cat}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Record Expense</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Records</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Tag size={12} /> Expense Title *
                </label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Electricity Bill August" 
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
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
                    <AlignLeft size={12} /> Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recurring Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-indigo-50/30 transition-all" onClick={() => setFormData(p => ({ ...p, isRecurring: !p.isRecurring }))}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.isRecurring ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'}`}>
                    <RefreshCw size={18} className={formData.isRecurring ? 'animate-spin-slow' : ''} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Recurring Expense</p>
                    <p className="text-[10px] font-bold text-slate-400">Fixed costs like rent or software.</p>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner ${formData.isRecurring ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <AlignLeft size={12} /> Notes (Optional)
                </label>
                <textarea 
                  placeholder="Provide additional details..." 
                  value={formData.note}
                  onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
                  className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

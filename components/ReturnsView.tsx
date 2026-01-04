
import React, { useState, useMemo } from 'react';
import { 
  Undo2, History, Search, ArrowUpRight, ArrowDownRight, Tag, 
  Plus, X, CheckCircle2, Package, Search as SearchIcon, AlertCircle, 
  Minus, ShoppingBag, Truck, Info
} from 'lucide-react';
import { AppReturn, Transaction, Purchase } from '../types';

interface ReturnsViewProps {
  returns: AppReturn[];
  transactions: Transaction[];
  purchases: Purchase[];
  onProcessReturn: (newReturn: AppReturn) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({ returns, transactions, purchases, onProcessReturn }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Sales' | 'Purchase'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnType, setReturnType] = useState<'Sales' | 'Purchase'>('Sales');
  const [searchRef, setSearchRef] = useState('');
  const [foundReference, setFoundReference] = useState<Transaction | Purchase | null>(null);
  const [returnItems, setReturnItems] = useState<{ productId: string; name: string; quantity: number; price: number; maxQty: number }[]>([]);
  const [reason, setReason] = useState('');

  const filtered = returns.filter(r => activeTab === 'All' || r.type === activeTab);

  const stats = useMemo(() => {
    const salesReturns = returns.filter(r => r.type === 'Sales').reduce((sum, r) => sum + r.amount, 0);
    const purchaseReturns = returns.filter(r => r.type === 'Purchase').reduce((sum, r) => sum + r.amount, 0);
    return { salesReturns, purchaseReturns };
  }, [returns]);

  const handleLookup = () => {
    if (returnType === 'Sales') {
      const tx = transactions.find(t => t.id === searchRef.toUpperCase());
      if (tx) {
        setFoundReference(tx);
        setReturnItems(tx.items.map(i => ({ 
          productId: i.id, 
          name: i.name, 
          quantity: 0, 
          price: i.price,
          maxQty: i.quantity
        })));
      } else {
        alert("Transaction ID not found.");
      }
    } else {
      const po = purchases.find(p => p.id === searchRef.toUpperCase());
      if (po) {
        setFoundReference(po);
        setReturnItems((po.items || []).map(i => ({ 
          productId: i.id, 
          name: i.name, 
          quantity: 0, 
          price: i.price,
          maxQty: i.quantity
        })));
      } else {
        alert("Purchase Order ID not found.");
      }
    }
  };

  const updateItemQty = (id: string, delta: number) => {
    setReturnItems(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.min(item.maxQty, Math.max(0, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleConfirmReturn = () => {
    const validItems = returnItems.filter(i => i.quantity > 0);
    if (validItems.length === 0) {
      alert("Please select at least one item to return.");
      return;
    }

    const totalAmount = validItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    const newReturn: AppReturn = {
      id: `RET-${Date.now().toString().slice(-5)}`,
      type: returnType,
      referenceId: searchRef.toUpperCase(),
      date: Date.now(),
      amount: totalAmount,
      items: validItems.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
      status: 'Completed',
      reason
    };

    onProcessReturn(newReturn);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSearchRef('');
    setFoundReference(null);
    setReturnItems([]);
    setReason('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Returns Management</h2>
          <p className="text-slate-500 text-sm font-medium">Handle reversals for sales and supply orders in GHS.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            {(['All', 'Sales', 'Purchase'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2"
          >
            <Plus size={18} />
            Record Return
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowDownRight size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales Reversals</p>
              <p className="text-3xl font-black text-slate-800">GH₵{stats.salesReturns.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpRight size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Supplier Returns Value</p>
              <p className="text-3xl font-black text-slate-800">GH₵{stats.purchaseReturns.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
            <History size={16} className="text-indigo-600" /> Recent Return Logs
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input type="text" placeholder="Filter by ID..." className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Return ID / Ref</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Count</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.type === 'Sales' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Undo2 size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{r.id}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{r.referenceId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.type === 'Sales' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-600">{r.items.reduce((s, i) => s + i.quantity, 0)} units</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800">GH₵{r.amount.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-500">{new Date(r.date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`px-3 py-1 inline-flex rounded-full text-[9px] font-black uppercase tracking-widest ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.status}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Undo2 size={48} className="mb-4 text-slate-300" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No returns found in history</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Undo2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Process Regional Return</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Reversal System</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 shadow-sm"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Return Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setReturnType('Sales'); resetForm(); }}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${returnType === 'Sales' ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' : 'bg-slate-50 text-slate-400 border border-transparent'}`}
                    >
                      <ShoppingBag size={14} /> Sales
                    </button>
                    <button 
                      onClick={() => { setReturnType('Purchase'); resetForm(); }}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${returnType === 'Purchase' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'bg-slate-50 text-slate-400 border border-transparent'}`}
                    >
                      <Truck size={14} /> Purchase
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{returnType} Reference ID</label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text" 
                      placeholder={returnType === 'Sales' ? "TX-XXXXX" : "PO-XXXXX"}
                      value={searchRef}
                      onChange={e => setSearchRef(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-24 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                    />
                    <button 
                      onClick={handleLookup}
                      className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      Lookup
                    </button>
                  </div>
                </div>
              </div>

              {foundReference ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500" size={20} />
                      <div>
                        <p className="text-xs font-black text-indigo-900 uppercase">Valid Reference Located</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">{returnType === 'Sales' ? (foundReference as Transaction).id : (foundReference as Purchase).id} found in history.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Items to Return</h4>
                    <div className="divide-y divide-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden">
                      {returnItems.map(item => (
                        <div key={item.productId} className="p-4 bg-white flex items-center justify-between group hover:bg-slate-50/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                              <Package size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Bought: {item.maxQty} units @ GH₵{item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                              <button onClick={() => updateItemQty(item.productId, -1)} className="p-2 hover:bg-slate-50 text-slate-400"><Minus size={14} /></button>
                              <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                              <button onClick={() => updateItemQty(item.productId, 1)} className="p-2 hover:bg-slate-50 text-slate-400"><Plus size={14} /></button>
                            </div>
                            <div className="w-20 text-right">
                              <p className="text-xs font-black text-slate-800">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Return</label>
                    <textarea 
                      placeholder="e.g. Damaged goods, Customer changed mind..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 rounded-[3rem]">
                  <Info size={40} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">Enter a Reference ID to begin<br/>the return process.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900 flex flex-col gap-4 shrink-0">
               {foundReference && (
                 <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Refund Value</p>
                    <p className="text-2xl font-black text-white">GH₵{returnItems.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}</p>
                 </div>
               )}
               <div className="flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Cancel</button>
                  <button 
                    onClick={handleConfirmReturn}
                    disabled={!foundReference || returnItems.every(i => i.quantity === 0)}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100/20 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Confirm Inventory Reversal
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

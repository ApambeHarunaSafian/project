
import React, { useState, useMemo } from 'react';
import { Search, Plus, UserPlus, Mail, Phone, ExternalLink, Edit3, Trash2, X, CheckCircle, Award, TrendingUp, Users, Wallet, CreditCard, History, ChevronRight, Clock } from 'lucide-react';
import { Customer, Transaction } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  transactions?: Transaction[]; // Added transactions to show ledger
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers, setCustomers, transactions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [settlingDebt, setSettlingDebt] = useState<Customer | null>(null);
  const [viewingLedger, setViewingLedger] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    totalSpent: 0,
    creditBalance: 0
  });

  const filtered = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const stats = useMemo(() => {
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalDebt = customers.reduce((sum, c) => sum + c.creditBalance, 0);
    const vipCount = customers.filter(c => c.totalSpent > 2000).length;
    return { totalRevenue, totalDebt, vipCount, count: customers.length };
  }, [customers]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      alert("Name and Phone are required.");
      return;
    }

    const customerToAdd: Customer = {
      id: `c-${Date.now()}`,
      name: newCustomer.name!,
      email: newCustomer.email || '',
      phone: newCustomer.phone!,
      totalSpent: 0,
      creditBalance: 0,
      lastVisit: Date.now()
    };

    setCustomers(prev => [customerToAdd, ...prev]);
    setIsAddModalOpen(false);
    setNewCustomer({ name: '', email: '', phone: '', totalSpent: 0, creditBalance: 0 });
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    setEditingCustomer(null);
  };

  const handleSettleDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingDebt || !settleAmount) return;

    const amount = Number(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setCustomers(prev => prev.map(c => 
      c.id === settlingDebt.id ? { ...c, creditBalance: Math.max(0, c.creditBalance - amount) } : c
    ));
    setSettlingDebt(null);
    setSettleAmount('');
  };

  const deleteCustomer = (id: string) => {
    if (confirm("Are you sure you want to remove this customer record?")) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter(t => t.customerId === customerId).sort((a, b) => b.timestamp - a.timestamp);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Customer Directory</h2>
          <p className="text-slate-500 text-sm font-medium">Manage relationships and track customer lifecycle value in Ghana.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          Register New Customer
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          label="Total Database" 
          value={stats.count.toString()} 
          icon={<Users className="text-indigo-600" />} 
          bg="bg-indigo-50"
        />
        <SummaryCard 
          label="Total Receivables" 
          value={`GH₵${stats.totalDebt.toLocaleString()}`} 
          icon={<Wallet className="text-rose-600" />} 
          bg="bg-rose-50"
          sub="Outstanding Debt"
        />
        <SummaryCard 
          label="VIP Customers" 
          value={stats.vipCount.toString()} 
          icon={<Award className="text-amber-500" />} 
          bg="bg-amber-50"
          sub="Spending > GH₵2,000"
        />
        <SummaryCard 
          label="Portfolio Value" 
          value={`GH₵${stats.totalRevenue.toLocaleString()}`} 
          icon={<TrendingUp className="text-emerald-600" />} 
          bg="bg-emerald-50"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Results:</span>
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{filtered.length} found</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Spend</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Debt</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-100 shadow-sm transition-transform group-hover:scale-105">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{customer.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Last Visit: {new Date(customer.lastVisit).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail size={12} className="text-slate-400" /> {customer.email || 'No email'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone size={12} className="text-slate-400" /> {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800">GH₵{customer.totalSpent.toFixed(2)}</p>
                    {customer.totalSpent > 2000 && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase mt-1">
                        <Award size={8} /> VIP Member
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-black ${customer.creditBalance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      GH₵{customer.creditBalance.toFixed(2)}
                    </p>
                    {customer.creditBalance > 0 && (
                      <button 
                        onClick={() => setSettlingDebt(customer)}
                        className="text-[8px] font-black uppercase text-indigo-600 hover:underline mt-1"
                      >
                        Settle Debt
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingLedger(customer)}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all"
                        title="Transaction History"
                      >
                        <History size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingCustomer(customer)}
                        className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                        title="Edit Customer"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
                        className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                        title="Delete Customer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Users size={48} className="mb-4 text-slate-300" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No customers found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History / Ledger Modal */}
      {viewingLedger && (
        <div className="fixed inset-0 z-[130] flex items-center justify-end bg-slate-900/60 backdrop-blur-md p-4">
           <div className="bg-white h-full w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                       <History size={24} />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-800 text-lg">Order Ledger</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingLedger.name}</p>
                    </div>
                 </div>
                 <button onClick={() => setViewingLedger(null)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Lifetime Value</p>
                       <p className="text-xl font-black text-slate-800">GH₵{viewingLedger.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
                       <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Active Debt</p>
                       <p className="text-xl font-black text-rose-600">GH₵{viewingLedger.creditBalance.toFixed(2)}</p>
                    </div>
                 </div>

                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historical Transactions</h4>
                 <div className="space-y-4">
                    {getCustomerTransactions(viewingLedger.id).length > 0 ? getCustomerTransactions(viewingLedger.id).map(t => (
                      <div key={t.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.paymentMethod === 'Credit' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                               {t.paymentMethod === 'Credit' ? <Clock size={20} /> : <CheckCircle size={20} />}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800 text-sm">{t.id}</p>
                               <p className="text-[10px] font-bold text-slate-400">{new Date(t.timestamp).toLocaleDateString()} • {t.items.length} items</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="font-black text-slate-800">GH₵{t.total.toFixed(2)}</p>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.paymentMethod === 'Credit' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                               {t.paymentMethod}
                            </span>
                         </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center opacity-30 italic text-sm font-medium">
                         No transaction history found for this profile.
                      </div>
                    )}
                 </div>
              </div>

              <div className="p-6 bg-slate-900 flex gap-4">
                 <button 
                   onClick={() => {
                     setSettlingDebt(viewingLedger);
                     setViewingLedger(null);
                   }}
                   disabled={viewingLedger.creditBalance <= 0}
                   className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-30 disabled:hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                 >
                    <Wallet size={18} /> Process Payment
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Settle Debt Modal */}
      {settlingDebt && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">Settle Debt</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{settlingDebt.name}</p>
                  </div>
               </div>
               <button onClick={() => setSettlingDebt(null)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100">
                  <X size={24} />
               </button>
            </div>

            <form onSubmit={handleSettleDebt} className="p-8 space-y-6">
               <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center justify-between">
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Current Outstanding</p>
                  <p className="text-lg font-black text-rose-600">GH₵{settlingDebt.creditBalance.toFixed(2)}</p>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount (GH₵)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="Enter amount to pay..."
                    value={settleAmount}
                    onChange={e => setSettleAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                    autoFocus
                  />
               </div>

               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setSettlingDebt(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <CheckCircle size={18} /> Record Payment
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">{editingCustomer ? 'Update Profile' : 'Register Customer'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CRM Management</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingCustomer(null); }}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Kwame Mensah" 
                    value={editingCustomer ? editingCustomer.name : newCustomer.name}
                    onChange={e => editingCustomer 
                      ? setEditingCustomer({ ...editingCustomer, name: e.target.value })
                      : setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required
                        type="tel" 
                        placeholder="+233..." 
                        value={editingCustomer ? editingCustomer.phone : newCustomer.phone}
                        onChange={e => editingCustomer 
                          ? setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                          : setNewCustomer({ ...newCustomer, phone: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="email" 
                        placeholder="customer@email.com" 
                        value={editingCustomer ? editingCustomer.email : newCustomer.email}
                        onChange={e => editingCustomer 
                          ? setEditingCustomer({ ...editingCustomer, email: e.target.value })
                          : setNewCustomer({ ...newCustomer, email: e.target.value })
                        }
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsAddModalOpen(false); setEditingCustomer(null); }}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  {editingCustomer ? 'Save Changes' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string; icon: React.ReactNode; bg: string; sub?: string }> = ({ label, value, icon, bg, sub }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
    <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      {sub && <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{sub}</p>}
    </div>
  </div>
);

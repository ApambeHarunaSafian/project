
import React, { useState, useMemo } from 'react';
import { Wallet, Search, Phone, History, ArrowRight, UserCheck, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Customer, Transaction } from '../types';

interface CreditLedgerViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  transactions: Transaction[];
}

export const CreditLedgerView: React.FC<CreditLedgerViewProps> = ({ customers, setCustomers, transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const debtors = useMemo(() => {
    return customers
      .filter(c => c.creditBalance > 0 && (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      ))
      .sort((a, b) => b.creditBalance - a.creditBalance);
  }, [customers, searchTerm]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.creditBalance, 0);
  }, [customers]);

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor || !settleAmount) return;

    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) return;

    setCustomers(prev => prev.map(c => 
      c.id === selectedDebtor.id 
        ? { ...c, creditBalance: Math.max(0, c.creditBalance - amount) } 
        : c
    ));

    setSettleAmount('');
    setSelectedDebtor(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getDebtorTransactions = (customerId: string) => {
    return transactions
      .filter(t => t.customerId === customerId && t.paymentMethod === 'Credit')
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">BNPL Management Ledger</h2>
          <p className="text-slate-500 text-sm font-medium">Track and settle Buy Now Pay Later balances in GHS.</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Outstanding BNPL</p>
          <p className="text-2xl font-black text-rose-600">GH₵{totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Debtor List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search debtors by name or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[600px] custom-scrollbar">
              {debtors.length > 0 ? debtors.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedDebtor(c)}
                  className={`p-5 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 ${selectedDebtor?.id === c.id ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 font-black">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{c.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-tight">
                        <Phone size={12} /> {c.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-rose-600">GH₵{c.creditBalance.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Last Order: {new Date(c.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30">
                  <UserCheck size={48} className="mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest text-xs">All BNPL accounts cleared</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Debtor Detail & Settlement */}
        <div className="lg:col-span-5 space-y-6">
          {selectedDebtor ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
              <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-1">{selectedDebtor.name}</h3>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6">Account Ledger</p>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Balance</p>
                    <p className="text-3xl font-black">GH₵{selectedDebtor.creditBalance.toFixed(2)}</p>
                  </div>
                </div>
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History size={14} /> BNPL Purchase History
                  </h4>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {getDebtorTransactions(selectedDebtor.id).map(t => (
                      <div key={t.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-slate-400" />
                          <span className="font-bold text-slate-700">{new Date(t.timestamp).toLocaleDateString()}</span>
                        </div>
                        <span className="font-black text-slate-800">GH₵{t.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSettle} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Repayment Amount (GH₵)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value)}
                      placeholder="Enter amount to pay..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} /> Process Repayment
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-100/50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center opacity-40">
              <AlertCircle size={48} className="text-slate-300 mb-4" />
              <p className="font-black text-sm uppercase tracking-widest text-slate-400 leading-relaxed">Select a BNPL account<br/>from the list to manage</p>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-6">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce-in w-full max-w-xs text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"><CheckCircle2 size={32} /></div>
            <h2 className="text-xl font-black text-slate-800">Payment Recorded</h2>
            <p className="text-slate-500 text-sm mt-1">Balance updated successfully</p>
          </div>
        </div>
      )}
    </div>
  );
};

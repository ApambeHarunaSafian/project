
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Minus, Trash2, CheckCircle2, ShoppingBag, CreditCard, 
  Banknote, QrCode, Scan, X, Camera, Keyboard, Search, Shield, Tag, User as UserIcon, Clock, UserPlus, ChevronUp, Wallet, Phone, User as UserCircle, Printer, WifiOff, AlertCircle
} from 'lucide-react';
import { Product, CartItem, Transaction, Customer } from '../types';
import { CATEGORIES } from '../constants';

interface POSViewProps {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  addToCart: (p: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: (t: Transaction) => void;
  clearCart: () => void;
  onQuickAddCustomer?: (name: string, phone: string) => void;
}

export const POSView: React.FC<POSViewProps> = ({ 
  products, customers, cart, addToCart, updateQuantity, removeFromCart, onCheckout, clearCart, onQuickAddCustomer 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState({ name: '', phone: '' });
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Handle Camera Stream for Barcode Scanner
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScannerOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => {
          console.error("Scanner Camera Error:", err);
          alert("Unable to access camera. Please check permissions.");
          setIsScannerOpen(false);
        });
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isScannerOpen]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = Math.max(0, subtotal + tax - discountAmount);

  const handleCheckout = (method: Transaction['paymentMethod']) => {
    if (cart.length === 0) return;
    if (method === 'Credit' && !selectedCustomerId) {
      alert("Please select a customer for BNPL (Buy Now, Pay Later) transactions.");
      return;
    }

    const transaction: Transaction = {
      id: `TX-${Date.now()}`,
      timestamp: Date.now(),
      items: [...cart],
      total,
      tax,
      discount: discountAmount,
      paymentMethod: method,
      customerId: selectedCustomerId || undefined
    };

    setLastTransaction(transaction);
    onCheckout(transaction);
    setShowSuccess(true);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setDiscountAmount(0);
    setSelectedCustomerId(null);
    setIsCartMobileOpen(false);
    setLastTransaction(null);
    clearCart();
  };

  const handlePrintReceipt = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  useEffect(() => {
    if (showSuccess && lastTransaction) {
      handlePrintReceipt();
    }
  }, [showSuccess, lastTransaction]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustomer.name || !quickCustomer.phone) return;
    if (onQuickAddCustomer) {
      onQuickAddCustomer(quickCustomer.name, quickCustomer.phone);
    }
    setIsQuickAddOpen(false);
    setQuickCustomer({ name: '', phone: '' });
  };

  const CartItemsList = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
          <ShoppingBag size={48} className="text-slate-400 mb-4" />
          <p className="font-bold text-slate-500">Your basket is empty</p>
        </div>
      ) : (
        cart.map(item => (
          <div key={item.id} className="flex gap-3 bg-slate-50 p-2.5 rounded-xl border border-transparent hover:border-indigo-100 transition-all group">
            <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-100 shadow-sm">
              <img src={item.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-indigo-600"><Minus size={10} /></button>
                  <span className="w-6 text-center text-[10px] font-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-indigo-600"><Plus size={10} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-800">GH₵{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const CheckoutFooter = () => (
    <div className="p-5 md:p-6 bg-slate-900 text-white rounded-t-3xl md:rounded-t-[2.5rem] shadow-2xl">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-medium text-slate-400">
          <span>Subtotal</span>
          <span>GH₵{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-400 pb-2 border-b border-white/5">
          <span>Tax (8%)</span>
          <span>GH₵{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-end pt-2">
          <span className="text-indigo-400 font-bold uppercase tracking-widest text-[9px]">Total Due</span>
          <span className="text-2xl font-black">GH₵{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => handleCheckout('Card')} disabled={cart.length === 0} className="flex flex-col items-center gap-1 p-2 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-20"><CreditCard size={18} /><span className="text-[8px] font-black uppercase tracking-widest">Card</span></button>
        <button onClick={() => handleCheckout('Cash')} disabled={cart.length === 0} className="flex flex-col items-center gap-1 p-2 bg-white/10 rounded-xl hover:bg-white/20 disabled:opacity-20"><Banknote size={18} /><span className="text-[8px] font-black uppercase tracking-widest">Cash</span></button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="relative group">
          <button 
            onClick={() => handleCheckout('Credit')} 
            disabled={cart.length === 0 || !selectedCustomerId} 
            className="w-full py-2.5 bg-rose-600/10 border border-rose-600/20 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600/20 disabled:opacity-20 flex items-center justify-center gap-2 transition-all"
          >
            <Clock size={16} />
            Confirm BNPL Order
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-50 overflow-hidden relative pb-16 md:pb-0">
      <div className="flex-1 flex flex-col min-w-0 bg-white md:rounded-r-[3rem] shadow-sm z-10 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search products or scan SKU..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
               />
             </div>
             <button onClick={() => setIsScannerOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">
                <Scan size={20} />
             </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="flex flex-col bg-white border border-slate-100 rounded-3xl p-3 text-left hover:shadow-xl hover:border-indigo-100 transition-all group relative disabled:opacity-50"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3 border border-slate-50">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                </div>
                <h4 className="font-bold text-[11px] text-slate-800 line-clamp-1 mb-1">{product.name}</h4>
                <p className="text-[10px] font-black text-indigo-600 mb-2">GH₵{product.price.toFixed(2)}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${product.stock <= 5 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {product.stock} left
                  </span>
                  <div className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className={`fixed inset-y-0 right-0 z-[60] w-full md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isCartMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} />
             </div>
             <div>
                <h3 className="font-black text-slate-800 text-sm">Basket</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} items</p>
             </div>
          </div>
          <button onClick={() => clearCart()} className="text-slate-300 hover:text-rose-500 transition-colors">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-50">
           <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={selectedCustomerId || ''}
                onChange={(e) => setSelectedCustomerId(e.target.value || null)}
                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none appearance-none"
              >
                <option value="">Guest Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setIsQuickAddOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg transition-all"
              >
                <UserPlus size={16} />
              </button>
           </div>
        </div>

        <CartItemsList />
        <CheckoutFooter />
      </aside>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2">Transaction Success</h3>
             <p className="text-slate-500 text-sm mb-8">Receipt generated and inventory levels updated successfully.</p>
             <button onClick={closeSuccess} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                Close & Next Customer
             </button>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <UserPlus size={20} />
                   </div>
                   <h3 className="font-black text-slate-800">Quick Register</h3>
                </div>
                <button onClick={() => setIsQuickAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
             </div>
             <form onSubmit={handleQuickAddSubmit} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required type="text" value={quickCustomer.name} onChange={e => setQuickCustomer(p => ({...p, name: e.target.value}))} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input required type="tel" value={quickCustomer.phone} onChange={e => setQuickCustomer(p => ({...p, phone: e.target.value}))} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all mt-4">Save Customer</button>
             </form>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
           <div className="relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden border-2 border-indigo-500/50 mb-8">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-[40px] border-slate-900/60 pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse"></div>
           </div>
           <button onClick={() => setIsScannerOpen(false)} className="px-8 py-3 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2">
              <X size={20} /> Close Scanner
           </button>
        </div>
      )}
    </div>
  );
};

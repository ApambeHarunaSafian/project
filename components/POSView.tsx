
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
            className="w-full py-2.5 bg-rose-600/10 border border-rose-600/20 text-rose-5
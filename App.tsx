
import React, { useState, useEffect } from 'react';
import { 
  Product, Customer, CartItem, Transaction, ShopTask, ViewState, SystemSettings, User, Expense, Purchase, AppReturn
} from './types';
import { INITIAL_PRODUCTS } from './constants';
import { DashboardView } from './components/DashboardView';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { AIAssistantView } from './components/AIAssistantView';
import { BoardView } from './components/BoardView';
import { CustomersView } from './components/CustomersView';
import { WarehouseView } from './components/WarehouseView';
import { ExpensesView } from './components/ExpensesView';
import { PurchasesView } from './components/PurchasesView';
import { UsersView } from './components/UsersView';
import { ReturnsView } from './components/ReturnsView';
import { PnLView } from './components/PnLView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { ImageGeneratorView } from './components/ImageGeneratorView';
import { CreditLedgerView } from './components/CreditLedgerView';
import { LoginView } from './components/LoginView';
import { 
  LayoutDashboard, ShoppingCart, Package, BarChart3, BrainCircuit, 
  ClipboardList, Users as UsersIcon, Warehouse as WarehouseIcon, 
  Receipt, Truck, Undo2, Scale, UserCircle, 
  Settings, Wand2, LogOut, Menu, X, MoreHorizontal, Wallet, Wifi, WifiOff, AlertCircle
} from 'lucide-react';

const MOCK_USERS: User[] = [
  { id: 'u-1', name: 'Alex Hoffman', email: 'alex.h@geminipos.com', role: 'Admin', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'u-2', name: 'Sarah Mensah', email: 'sarah.m@geminipos.com', role: 'Cashier', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=sarah' }
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'Kwame Mensah', phone: '+233 24 123 4567', email: 'kwame@ghana.com', totalSpent: 450, creditBalance: 120, lastVisit: Date.now() - 86400000 },
  { id: 'c-2', name: 'Ama Serwaa', phone: '+233 50 987 6543', email: 'ama@ghana.com', totalSpent: 1200, creditBalance: 0, lastVisit: Date.now() - 172800000 }
];

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  CUSTOMERS: 'pos_customers',
  TRANSACTIONS: 'pos_transactions',
  TASKS: 'pos_tasks',
  EXPENSES: 'pos_expenses',
  PURCHASES: 'pos_purchases',
  USERS: 'pos_users',
  RETURNS: 'pos_returns',
  SETTINGS: 'pos_settings',
  EXPENSE_CATS: 'pos_expense_categories'
};

const DEFAULT_EXPENSE_CATS = ['Operational', 'Utilities', 'Marketing', 'Salaries', 'Maintenance', 'Rent', 'Logistics'];

const safeParse = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from storage:`, e);
    return fallback;
  }
};

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  // Initialize state from LocalStorage or Defaults
  const [products, setProducts] = useState<Product[]>(() => safeParse(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [customers, setCustomers] = useState<Customer[]>(() => safeParse(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse(STORAGE_KEYS.TRANSACTIONS, []));
  const [tasks, setTasks] = useState<ShopTask[]>(() => safeParse(STORAGE_KEYS.TASKS, []));
  const [expenses, setExpenses] = useState<Expense[]>(() => safeParse(STORAGE_KEYS.EXPENSES, []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => safeParse(STORAGE_KEYS.PURCHASES, []));
  const [users, setUsers] = useState<User[]>(() => safeParse(STORAGE_KEYS.USERS, MOCK_USERS));
  const [returns, setReturns] = useState<AppReturn[]>(() => safeParse(STORAGE_KEYS.RETURNS, []));
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => safeParse(STORAGE_KEYS.EXPENSE_CATS, DEFAULT_EXPENSE_CATS));

  const [settings, setSettings] = useState<SystemSettings>(() => safeParse(STORAGE_KEYS.SETTINGS, {
    businessName: 'GeminiPOS Pro',
    managerAccessToUsers: true,
    managerAccessToInventory: true,
    managerAccessToReports: true,
    managerAccessToPnL: true,
    managerAccessToExpenses: true,
    managerAccessToPurchases: true,
    managerAccessToCustomers: true,
    managerAccessToWarehouse: true,
    managerAccessToAiAssistant: true,
    managerAccessToCreativeStudio: true,
    managerAccessToOpsBoard: true,
    managerAccessToReturns: true,
    cashierAccessToInventory: true,
    allowTransactionDeletion: false,
    lockSystemCurrency: true,
    baseCurrency: 'GHS (GH₵)',
    primaryLanguage: 'English (Ghana)'
  }));

  // Persistance Effects
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns)); }, [returns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSE_CATS, JSON.stringify(expenseCategories)); }, [expenseCategories]);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineWarning(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineWarning(true);
      setTimeout(() => setShowOfflineWarning(false), 5000);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const clearCart = () => setCart([]);

  const saveTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setProducts(prev => prev.map(p => {
      const itemInCart = transaction.items.find(i => i.id === p.id);
      return itemInCart ? { ...p, stock: p.stock - itemInCart.quantity } : p;
    }));
    if (transaction.customerId) {
      setCustomers(prev => prev.map(c => c.id === transaction.customerId ? {
        ...c,
        totalSpent: c.totalSpent + transaction.total,
        creditBalance: transaction.paymentMethod === 'Credit' ? c.creditBalance + transaction.total : c.creditBalance,
        lastVisit: Date.now()
      } : c));
    }
  };

  const handleProcessReturn = (newReturn: AppReturn) => {
    setReturns(prev => [newReturn, ...prev]);
    setProducts(prev => prev.map(p => {
      const returnedItem = newReturn.items.find(i => i.productId === p.id);
      if (returnedItem) {
        const stockChange = newReturn.type === 'Sales' ? returnedItem.quantity : -returnedItem.quantity;
        return { ...p, stock: p.stock + stockChange };
      }
      return p;
    }));

    if (newReturn.type === 'Sales') {
      const transaction = transactions.find(t => t.id === newReturn.referenceId);
      if (transaction?.customerId && transaction.paymentMethod === 'Credit') {
        setCustomers(prev => prev.map(c => c.id === transaction.customerId ? {
          ...c,
          creditBalance: Math.max(0, c.creditBalance - newReturn.amount),
          totalSpent: Math.max(0, c.totalSpent - newReturn.amount)
        } : c));
      }
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <DashboardView transactions={transactions} products={products} tasks={tasks} setView={setView} customers={customers} />;
      case 'pos': return <POSView products={products} customers={customers} cart={cart} addToCart={addToCart} updateQuantity={(id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))} removeFromCart={id => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={saveTransaction} clearCart={clearCart} onQuickAddCustomer={(name, phone) => setCustomers(prev => [...prev, { id: `c-${Date.now()}`, name, phone, email: '', totalSpent: 0, creditBalance: 0, lastVisit: Date.now() }])} />;
      case 'board': return <BoardView tasks={tasks} setTasks={setTasks} products={products} transactions={transactions} />;
      case 'inventory': return <InventoryView products={products} setProducts={setProducts} />;
      case 'customers': return <CustomersView customers={customers} setCustomers={setCustomers} transactions={transactions} />;
      case 'credit-ledger': return <CreditLedgerView customers={customers} setCustomers={setCustomers} transactions={transactions} />;
      case 'reports': return <ReportsView transactions={transactions} />;
      case 'ai-assistant': return <AIAssistantView products={products} transactions={transactions} isOnline={isOnline} />;
      case 'warehouse': return <WarehouseView />;
      case 'expenses': return <ExpensesView expenses={expenses} onAddExpense={e => setExpenses(prev => [e, ...prev])} categories={expenseCategories} onUpdateCategories={setExpenseCategories} />;
      case 'purchases': return <PurchasesView purchases={purchases} onAddPurchase={p => setPurchases(prev => [p, ...prev])} />;
      case 'users': return <UsersView users={users} setUsers={setUsers} settings={settings} onSaveSettings={setSettings} isAdmin={currentUser?.role === 'Admin'} />;
      case 'returns': return <ReturnsView returns={returns} transactions={transactions} purchases={purchases} onProcessReturn={handleProcessReturn} />;
      case 'pnl': return <PnLView transactions={transactions} expenses={expenses} purchases={purchases} isOnline={isOnline} />;
      case 'profile': return currentUser ? <ProfileView user={currentUser} onUpdate={setCurrentUser} /> : null;
      case 'settings': return <SettingsView initialSettings={settings} onSave={setSettings} />;
      case 'image-generator': return <ImageGeneratorView isOnline={isOnline} />;
      default: return <DashboardView transactions={transactions} products={products} tasks={tasks} setView={setView} customers={customers} />;
    }
  };

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} businessName={settings.businessName} mockUsers={users} />;
  }

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Terminal', icon: ShoppingCart },
    { id: 'credit-ledger', label: 'BNPL Ledger', icon: Wallet },
    { id: 'inventory', label: 'Inventory', icon: Package },
  ];

  const secondaryNavItems = [
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: BrainCircuit },
    { id: 'board', label: 'Ops Board', icon: ClipboardList },
    { id: 'customers', label: 'Customers', icon: UsersIcon },
    { id: 'warehouse', label: 'Warehouse', icon: WarehouseIcon },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'purchases', label: 'Purchases', icon: Truck },
    { id: 'users', label: 'Staff', icon: UserCircle },
    { id: 'returns', label: 'Returns', icon: Undo2 },
    { id: 'pnl', label: 'P&L', icon: Scale },
    { id: 'image-generator', label: 'Creative', icon: Wand2 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {showOfflineWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
           <AlertCircle size={20} />
           <p className="font-bold text-sm">Offline Mode: AI features disabled until internet is restored.</p>
        </div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BrainCircuit size={20} />
            </div>
            <h1 className="font-black text-sm tracking-tight">{settings.businessName}</h1>
          </div>
          <button className="md:hidden p-1 text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {[...mainNavItems, ...secondaryNavItems].map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id as ViewState); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={() => { setView('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${view === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
            <Settings size={18} /> Settings
          </button>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}><Menu size={20} /></button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Cloud Sync Online' : 'Local Offline Mode'}
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 md:gap-4 justify-end">
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-bold text-slate-800">{currentUser?.name}</p>
              <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase">{currentUser?.role}</p>
            </div>
            <button onClick={() => setView('profile')} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
              <img src={currentUser?.avatar} className="w-full h-full object-cover" alt="" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderView()}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-[40] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          {mainNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${view === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <item.icon size={20} strokeWidth={view === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex flex-col items-center gap-1 min-w-[64px] text-slate-400`}
          >
            <MoreHorizontal size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;

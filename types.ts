
export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number; // Selling Price
  costPrice: number; // Cost Price
  stock: number;
  image: string;
  sku: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  tax: number;
  discount: number;
  paymentMethod: 'Cash' | 'Card' | 'Digital' | 'Credit';
  customerId?: string;
}

export interface ShopTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  creditBalance: number;
  lastVisit: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentStock: number;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: number;
  note: string;
  isRecurring?: boolean;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: number;
  amount: number;
  status: 'Pending' | 'Received' | 'Cancelled';
  items?: CartItem[]; // Added items to purchase for return capability
}

export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  twoFactorEnabled?: boolean;
  loginNotificationsEnabled?: boolean;
}

export interface AppReturn {
  id: string;
  type: 'Sales' | 'Purchase';
  referenceId: string; // TX- or PO-
  date: number;
  amount: number;
  items: { productId: string; name: string; quantity: number; price: number }[];
  status: 'Pending' | 'Completed' | 'Rejected';
  reason?: string;
}

export interface SystemSettings {
  businessName: string;
  managerAccessToUsers: boolean;
  managerAccessToInventory: boolean;
  managerAccessToReports: boolean;
  managerAccessToPnL: boolean;
  managerAccessToExpenses: boolean;
  managerAccessToPurchases: boolean;
  managerAccessToCustomers: boolean;
  managerAccessToWarehouse: boolean;
  managerAccessToAiAssistant: boolean;
  managerAccessToCreativeStudio: boolean;
  managerAccessToOpsBoard: boolean;
  managerAccessToReturns: boolean;
  cashierAccessToInventory: boolean;
  allowTransactionDeletion: boolean;
  lockSystemCurrency: boolean;
  baseCurrency: string;
  primaryLanguage: string;
}

export type ViewState = 
  | 'dashboard' 
  | 'pos' 
  | 'inventory' 
  | 'reports' 
  | 'ai-assistant' 
  | 'board' 
  | 'customers' 
  | 'warehouse' 
  | 'expenses' 
  | 'purchases' 
  | 'users' 
  | 'returns' 
  | 'pnl' 
  | 'profile' 
  | 'settings'
  | 'image-generator'
  | 'credit-ledger';

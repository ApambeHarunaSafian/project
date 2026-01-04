
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Artisan Sourdough', category: 'Bakery', brand: 'Local Hearth', price: 45.00, costPrice: 28.00, stock: 15, sku: 'BAK-001', image: 'https://picsum.photos/seed/bread/400/400' },
  { id: '2', name: 'Organic Arabica Coffee', category: 'Beverages', brand: 'Bean Bliss', price: 120.00, costPrice: 75.00, stock: 45, sku: 'BEV-001', image: 'https://picsum.photos/seed/coffee/400/400' },
  { id: '3', name: 'Aged Cheddar', category: 'Dairy', brand: 'Farm Fresh', price: 85.25, costPrice: 55.00, stock: 10, sku: 'DAI-001', image: 'https://picsum.photos/seed/cheese/400/400' },
  { id: '4', name: 'Honey Glazed Ham', category: 'Deli', brand: 'Deli Choice', price: 150.00, costPrice: 110.00, stock: 8, sku: 'DEL-001', image: 'https://picsum.photos/seed/ham/400/400' },
  { id: '5', name: 'Extra Virgin Olive Oil', category: 'Pantry', brand: 'Mediterranean Sun', price: 95.00, costPrice: 62.00, stock: 25, sku: 'PAN-001', image: 'https://picsum.photos/seed/oil/400/400' },
  { id: '6', name: 'Fresh Raspberries', category: 'Produce', brand: 'Berry Wild', price: 35.99, costPrice: 22.50, stock: 30, sku: 'PRO-001', image: 'https://picsum.photos/seed/raspberries/400/400' },
  { id: '7', name: 'Gourmet Dark Chocolate', category: 'Snacks', brand: 'Pure Cocoa', price: 25.50, costPrice: 14.00, stock: 50, sku: 'SNA-001', image: 'https://picsum.photos/seed/choco/400/400' },
  { id: '8', name: 'Green Tea Matcha', category: 'Beverages', brand: 'Zen Leaf', price: 140.00, costPrice: 90.00, stock: 12, sku: 'BEV-002', image: 'https://picsum.photos/seed/matcha/400/400' },
];

export const CATEGORIES = ['All', 'Bakery', 'Beverages', 'Dairy', 'Deli', 'Pantry', 'Produce', 'Snacks'];

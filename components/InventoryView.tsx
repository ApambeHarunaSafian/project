
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Package, Plus, Search, Edit3, Trash2, Filter, AlertCircle, 
  CheckCircle, XCircle, Barcode, Printer, X, Image as ImageIcon, 
  Tag, Hash, Building2, Coins, Layers, Download, Upload, FileSpreadsheet,
  FileText, ShieldAlert, Wand2, Sparkles, RefreshCw, CheckSquare, Square,
  MoreHorizontal, ArrowUpCircle, Layers3, Save, TrendingUp, Wallet, ArrowRightLeft, Banknote
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import { exportInventoryToExcel } from '../services/exportService';
import { generateProductImage } from '../services/geminiService';
import * as XLSX from 'xlsx';

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ products, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Barcode Printing State
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const [bulkUpdateType, setBulkUpdateType] = useState<'stock' | 'category' | null>(null);
  const [bulkUpdateValue, setBulkUpdateValue] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: CATEGORIES[1],
    stock: 0,
    price: 0,
    costPrice: 0,
    brand: '',
    image: '',
    sku: ''
  });

  // Load product data into form when editing
  useEffect(() => {
    if (editingProduct) {
      setProductForm(editingProduct);
    } else {
      setProductForm({
        name: '',
        category: CATEGORIES[1],
        stock: 0,
        price: 0,
        costPrice: 0,
        brand: '',
        image: '',
        sku: ''
      });
    }
  }, [editingProduct]);

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-rose-600 bg-rose-50 border-rose-100', dot: 'bg-rose-500', icon: <XCircle size={12} /> };
    if (stock <= 5) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50 border-orange-100', dot: 'bg-orange-500', icon: <AlertCircle size={12} /> };
    return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-500', icon: <CheckCircle size={12} /> };
  };

  const statusCounts = useMemo(() => {
    return {
      all: products.length,
      inStock: products.filter(p => p.stock > 5).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
      outOfStock: products.filter(p => p.stock <= 0).length,
    };
  }, [products]);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    const status = getStockStatus(p.stock).label;
    return matchesSearch && status === statusFilter;
  });

  // Inventory Valuation Calculations
  const valuation = useMemo(() => {
    return products.reduce((acc, p) => {
      acc.cost += (p.costPrice || 0) * p.stock;
      acc.retail += p.price * p.stock;
      return acc;
    }, { cost: 0, retail: 0 });
  }, [products]);

  // Filtered List Totals
  const filteredTotals = useMemo(() => {
    return filtered.reduce((acc, p) => {
      acc.cost += (p.costPrice || 0) * p.stock;
      acc.retail += p.price * p.stock;
      acc.stockTotal += p.stock;
      return acc;
    }, { cost: 0, retail: 0, stockTotal: 0 });
  }, [filtered]);

  const isFiltering = searchTerm !== '' || statusFilter !== 'All';

  // Bulk Selection Logic
  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected items? This action is permanent.`)) {
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    }
  };

  const applyBulkUpdate = () => {
    if (!bulkUpdateType || !bulkUpdateValue) return;

    setProducts(prev => prev.map(p => {
      if (selectedIds.has(p.id)) {
        if (bulkUpdateType === 'stock') {
          return { ...p, stock: Number(bulkUpdateValue) };
        } else if (bulkUpdateType === 'category') {
          return { ...p, category: bulkUpdateValue };
        }
      }
      return p;
    }));

    setIsBulkUpdateModalOpen(false);
    setBulkUpdateType(null);
    setBulkUpdateValue('');
    setSelectedIds(new Set());
  };

  const handlePrintBarcode = (product: Product) => {
    setBarcodeProduct(product);
  };

  const executePrint = () => {
    window.print();
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportInventoryToExcel(products);
      setIsExporting(false);
    }, 800);
  };

  const handleAIGenerateImage = async () => {
    if (!productForm.name || isGeneratingImage) {
      alert("Please enter a product name first to generate an image.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `Professional high-quality studio product photography of ${productForm.name}, a ${productForm.category} item. Clean minimalist background, commercial lighting, 8k resolution.`;
      const imageUrl = await generateProductImage(prompt, "1:1");
      if (imageUrl) {
        setProductForm(prev => ({ ...prev, image: imageUrl }));
      }
    } catch (error) {
      console.error("AI Image Generation failed:", error);
      alert("AI Image generation failed. Please try again or provide a manual URL.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Name': 'Example Product',
        'Category': 'Bakery',
        'Brand': 'Local Brand',
        'Cost Price': 10.50,
        'Selling Price': 15.00,
        'Stock': 100,
        'SKU': 'TEMP-001',
        'Image URL': 'https://picsum.photos/seed/temp/400/400'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'GeminiPOS_Inventory_Template.xlsx');
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulkFile(file);
      setBulkError(null);
    }
  };

  const processBulkFile = async () => {
    if (!bulkFile) return;
    setIsProcessingBulk(true);
    setBulkError(null);

    try {
      const data = await bulkFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      const validProducts: Product[] = [];
      const timestamp = Date.now();

      jsonData.forEach((row, index) => {
        const name = row['Name'] || row['name'];
        const sku = row['SKU'] || row['sku'];
        const price = Number(row['Selling Price'] || row['price']);

        if (!name || !sku || isNaN(price)) {
          console.warn(`Row ${index + 2} skipped: Missing required fields`);
          return;
        }

        validProducts.push({
          id: `bulk-${timestamp}-${index}`,
          name: String(name),
          sku: String(sku).toUpperCase(),
          price: price,
          costPrice: Number(row['Cost Price'] || row['cost_price'] || 0),
          stock: Number(row['Stock'] || row['stock'] || 0),
          category: String(row['Category'] || row['category'] || 'General'),
          brand: String(row['Brand'] || row['brand'] || 'Generic'),
          image: String(row['Image URL'] || row['image_url'] || row['image'] || `https://picsum.photos/seed/${sku}/400/400`)
        });
      });

      if (validProducts.length === 0) {
        setBulkError("No valid products found in the file. Check headers.");
      } else {
        setProducts(prev => [...validProducts, ...prev]);
        setIsBulkModalOpen(false);
        setBulkFile(null);
        alert(`Successfully imported ${validProducts.length} products!`);
      }
    } catch (err) {
      setBulkError("Failed to parse file. Ensure it is a valid Excel or CSV.");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.sku) {
      alert("Please fill in all required fields (Name, Price, SKU).");
      return;
    }

    if (editingProduct) {
      // Update existing
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? (productForm as Product) : p));
    } else {
      // Create new
      const productToAdd: Product = {
        id: Date.now().toString(),
        name: productForm.name!,
        category: productForm.category || 'General',
        brand: productForm.brand || 'Local Brand',
        price: Number(productForm.price),
        costPrice: Number(productForm.costPrice) || 0,
        stock: Number(productForm.stock) || 0,
        sku: productForm.sku.toUpperCase(),
        image: productForm.image || `https://picsum.photos/seed/${productForm.sku}/400/400`,
      };
      setProducts(prev => [productToAdd, ...prev]);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm("Are you sure you want to remove this product from inventory?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      // Also remove from selected if it was there
      if (selectedIds.has(id)) {
        const newSelected = new Set(selectedIds);
        newSelected.delete(id);
        setSelectedIds(newSelected);
      }
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Inventory & Products</h2>
          <p className="text-slate-500 text-sm font-medium">Monitor stock levels, brands, and manage your regional catalog.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Upload size={18} />
            Bulk Import
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" /> : <Download size={18} />}
            {isExporting ? 'Exporting...' : 'Export XLS'}
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Valuation Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] flex flex-col justify-between shadow-xl shadow-slate-100 relative overflow-hidden group">
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inventory Cost</p>
                <p className="text-2xl font-black">GH₵{valuation.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
           </div>
           {isFiltering && (
             <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10 animate-in fade-in slide-in-from-top-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Filtered Cost</span>
                <span className="text-sm font-bold text-indigo-300">GH₵{filteredTotals.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
           )}
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden group">
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Retail Value</p>
                <p className="text-2xl font-black text-slate-800">GH₵{valuation.retail.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
           </div>
           {isFiltering && (
             <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center relative z-10 animate-in fade-in slide-in-from-top-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filtered Retail</span>
                <span className="text-sm font-bold text-indigo-600">GH₵{filteredTotals.retail.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
           )}
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-40"></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden group">
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Banknote size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Gross Profit</p>
                <p className="text-2xl font-black text-emerald-600">GH₵{(valuation.retail - valuation.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
           </div>
           {isFiltering && (
             <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center relative z-10 animate-in fade-in slide-in-from-top-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filtered Profit</span>
                <span className="text-sm font-bold text-emerald-600">GH₵{(filteredTotals.retail - filteredTotals.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
           )}
           <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mb-16 blur-2xl opacity-40"></div>
        </div>
      </div>

      {/* Stock Health Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button 
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'All' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <Package size={18} className={statusFilter === 'All' ? 'text-indigo-200' : 'text-slate-400'} />
            <span className="text-xs font-black uppercase tracking-widest opacity-70">Total SKUs</span>
          </div>
          <p className="text-2xl font-black">{statusCounts.all}</p>
        </button>
        <button 
          onClick={() => setStatusFilter('In Stock')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'In Stock' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <CheckCircle size={18} className={statusFilter === 'In Stock' ? 'text-emerald-200' : 'text-emerald-500'} />
            <span className="text-xs font-black uppercase tracking-widest opacity-70">Healthy</span>
          </div>
          <p className="text-2xl font-black">{statusCounts.inStock}</p>
        </button>
        <button 
          onClick={() => setStatusFilter('Low Stock')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'Low Stock' ? 'bg-orange-500 border-orange-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <AlertCircle size={18} className={statusFilter === 'Low Stock' ? 'text-orange-200' : 'text-orange-500'} />
            <span className="text-xs font-black uppercase tracking-widest opacity-70">Low</span>
          </div>
          <p className="text-2xl font-black">{statusCounts.lowStock}</p>
        </button>
        <button 
          onClick={() => setStatusFilter('Out of Stock')}
          className={`p-4 rounded-2xl border transition-all text-left ${statusFilter === 'Out of Stock' ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <XCircle size={18} className={statusFilter === 'Out of Stock' ? 'text-rose-200' : 'text-rose-500'} />
            <span className="text-xs font-black uppercase tracking-widest opacity-70">Out</span>
          </div>
          <p className="text-2xl font-black">{statusCounts.outOfStock}</p>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, SKU or Brand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
             {selectedIds.size > 0 ? (
               <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                 <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{selectedIds.size} Selected</span>
                 <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                 <button 
                   onClick={() => { setBulkUpdateType('stock'); setIsBulkUpdateModalOpen(true); }}
                   className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                 >
                   <ArrowUpCircle size={14} /> Update Stock
                 </button>
                 <button 
                   onClick={() => { setBulkUpdateType('category'); setIsBulkUpdateModalOpen(true); }}
                   className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                 >
                   <Layers3 size={14} /> Change Cat
                 </button>
                 <button 
                   onClick={handleBulkDelete}
                   className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                 >
                   <Trash2 size={14} /> Delete
                 </button>
                 <button 
                   onClick={() => setSelectedIds(new Set())}
                   className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                 >
                   <X size={14} />
                 </button>
               </div>
             ) : (
               <>
                 {statusFilter !== 'All' && (
                   <button 
                     onClick={() => setStatusFilter('All')}
                     className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                   >
                     Clear Status Filter <X size={12} />
                   </button>
                 )}
                 <div className="w-[1px] h-4 bg-slate-200"></div>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {filtered.length} Items Displayed
                </span>
               </>
             )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 w-10">
                  <button 
                    onClick={handleSelectAll}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                  </button>
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Selling Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(product => {
                const status = getStockStatus(product.stock);
                const isSelected = selectedIds.has(product.id);
                return (
                  <tr key={product.id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleSelect(product.id)}
                        className={`p-1 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}
                      >
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-100 shrink-0">
                          <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                          <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${status.dot} shadow-sm animate-pulse`} title={status.label}></div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{product.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-slate-500">GH₵{product.costPrice.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-indigo-600">GH₵{product.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black ${product.stock <= 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handlePrintBarcode(product)}
                          className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all"
                          title="Print Barcode"
                        >
                          <Barcode size={18} />
                        </button>
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Package size={48} className="mb-4" />
                      <p className="font-bold text-slate-400">No products found matching your search or filters.</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                        className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer with Totals */}
            {filtered.length > 0 && (
              <tfoot className="bg-slate-50/80 border-t border-slate-200 sticky bottom-0 backdrop-blur-md">
                <tr className="font-black text-slate-800 text-xs">
                  <td className="px-6 py-4"></td>
                  <td className="px-4 py-4 uppercase tracking-widest text-slate-400">Filtered Total</td>
                  <td className="px-6 py-4 text-right text-slate-500">GH₵{filteredTotals.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-right text-indigo-600">GH₵{filteredTotals.retail.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4">{filteredTotals.stockTotal} Units</td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Barcode Print Modal */}
      {barcodeProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 print:shadow-none print:rounded-none print:w-auto print:max-w-none">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Barcode size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Generate Label</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {barcodeProduct.sku}</p>
                </div>
              </div>
              <button 
                onClick={() => setBarcodeProduct(null)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 flex flex-col items-center text-center print:p-4">
              <h4 className="font-black text-slate-800 mb-2 uppercase tracking-tight print:text-lg">{barcodeProduct.name}</h4>
              <p className="text-indigo-600 font-bold text-sm mb-6 print:mb-2">GH₵{barcodeProduct.price.toFixed(2)}</p>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 print:shadow-none print:border-none print:p-0 print:mb-4">
                <img 
                  src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcodeProduct.sku}&scale=3&rotate=N&includetext=true`}
                  alt="Product Barcode"
                  className="max-w-full h-auto"
                />
              </div>

              <div className="flex gap-4 w-full print:hidden">
                <button 
                  onClick={() => setBarcodeProduct(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={executePrint}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print Label
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 text-amber-700 text-[10px] font-bold text-center border-t border-amber-100 print:hidden">
              <p>Tip: Set your printer to 'Landscape' or adjust scale for best results on label stickers.</p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {isBulkUpdateModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  {bulkUpdateType === 'stock' ? <ArrowUpCircle size={20} /> : <Layers3 size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Bulk Update {bulkUpdateType === 'stock' ? 'Stock' : 'Category'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updating {selectedIds.size} items</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBulkUpdateModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {bulkUpdateType === 'stock' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Stock Quantity</label>
                  <input 
                    type="number" 
                    value={bulkUpdateValue}
                    onChange={(e) => setBulkUpdateValue(e.target.value)}
                    placeholder="Enter new quantity..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Category</label>
                  <select 
                    value={bulkUpdateValue}
                    onChange={(e) => setBulkUpdateValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                  >
                    <option value="">Select Category...</option>
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsBulkUpdateModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={applyBulkUpdate}
                  disabled={!bulkUpdateValue}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  Update Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Bulk Product Import</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excel / CSV Support</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="text-indigo-600" size={18} />
                    <span className="text-sm font-bold text-indigo-900">Import Template</span>
                  </div>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                  >
                    Download Template
                  </button>
                </div>
                <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">
                  Use our standardized template to ensure all product fields like SKU, Price, and Brand are correctly mapped to our system.
                </p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all
                  ${bulkFile ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleBulkUpload}
                />
                {bulkFile ? (
                  <>
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <CheckCircle size={24} />
                    </div>
                    <p className="font-bold text-slate-800 text-sm truncate max-w-xs">{bulkFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ready to import</p>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-300 mb-4" size={48} />
                    <p className="font-bold text-slate-500 text-sm">Drag and drop or click to browse</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">XLSX, XLS or CSV</p>
                  </>
                )}
              </div>

              {bulkError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
                  <ShieldAlert size={18} className="shrink-0" />
                  <p className="text-xs font-bold">{bulkError}</p>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsBulkModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={processBulkFile}
                  disabled={!bulkFile || isProcessingBulk}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessingBulk ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  {isProcessingBulk ? 'Processing...' : 'Process Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal (Add/Edit) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  {editingProduct ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Management</p>
                </div>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Tag size={12} /> Product Name *
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Sourdough Loaf" 
                      value={productForm.name || ''}
                      onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        <Layers size={12} /> Category
                      </label>
                      <select 
                        value={productForm.category}
                        onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        <Building2 size={12} /> Brand
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Local Hearth" 
                        value={productForm.brand || ''}
                        onChange={e => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Hash size={12} /> SKU / Barcode *
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. BAK-001" 
                      value={productForm.sku || ''}
                      onChange={e => setProductForm(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        <Coins size={12} /> Cost Price (GHS)
                      </label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={productForm.costPrice || ''}
                        onChange={e => setProductForm(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        <Coins size={12} /> Selling Price *
                      </label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={productForm.price || ''}
                        onChange={e => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      <Package size={12} /> Current Stock
                    </label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={productForm.stock || ''}
                      onChange={e => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Image URL & AI Generator */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <ImageIcon size={12} /> Product Image URL
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://..." 
                    value={productForm.image || ''}
                    onChange={e => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAIGenerateImage}
                    disabled={isGeneratingImage || !productForm.name}
                    className="px-5 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingImage ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                    {isGeneratingImage ? 'Generating...' : 'AI Photo'}
                  </button>
                </div>
                {productForm.image && productForm.image.startsWith('data:') && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 ml-1 flex items-center gap-1">
                    <Sparkles size={10} /> AI-Generated product photo ready!
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingProduct ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Warehouse as WarehouseIcon, MapPin, Package, Box, ArrowUpRight } from 'lucide-react';
import { Warehouse } from '../types';

const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w1', name: 'Central Distribution', location: 'New York, NY', capacity: 50000, currentStock: 32400 },
  { id: 'w2', name: 'East Side Outlet', location: 'Brooklyn, NY', capacity: 12000, currentStock: 8900 },
  { id: 'w3', name: 'Cold Storage Lab', location: 'Jersey City, NJ', capacity: 8000, currentStock: 2100 },
];

export const WarehouseView: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Warehouse Network</h2>
          <p className="text-slate-500 text-sm">Monitor storage capacity and logistics across nodes.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm flex items-center gap-2">
          <WarehouseIcon size={18} />
          Register Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_WAREHOUSES.map(wh => {
          const usage = (wh.currentStock / wh.capacity) * 100;
          return (
            <div key={wh.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <WarehouseIcon size={24} />
                </div>
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><ArrowUpRight size={20} /></button>
              </div>
              
              <h3 className="text-lg font-black text-slate-800 mb-1">{wh.name}</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tight mb-6">
                <MapPin size={12} /> {wh.location}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Load</p>
                    <p className="text-xl font-black text-slate-800">{usage.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500">{wh.currentStock.toLocaleString()} / {wh.capacity.toLocaleString()} Units</p>
                  </div>
                </div>
                
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${usage > 80 ? 'bg-rose-500' : usage > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${usage}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <Package className="text-indigo-600" size={16} />
                    <span className="text-[10px] font-black uppercase text-slate-400">SKU Count: 142</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Box className="text-indigo-600" size={16} />
                    <span className="text-[10px] font-black uppercase text-slate-400">Outbound: 12</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

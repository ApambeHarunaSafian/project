
import React, { useState } from 'react';
import { Save, Globe, Smartphone, Bell, Shield, Database, Lock, UserCog, History, Key, CheckCircle2, Building2 } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  initialSettings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialSettings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleToggle = (key: keyof SystemSettings) => {
    if (typeof localSettings[key] === 'boolean') {
      setLocalSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleChange = (key: keyof SystemSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      onSave(localSettings);
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {showToast && (
        <div className="fixed top-20 right-8 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 size={20} />
          <p className="font-bold text-sm">Settings applied globally!</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">System Configuration</h2>
          <p className="text-slate-500 text-sm">Fine-tune global store policies for your business.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Applying...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SettingsCard icon={<Building2 size={20} />} title="Business Identity">
           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Display Name</label>
                <input 
                  type="text" 
                  value={localSettings.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="e.g. GeminiPOS Retail"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
                <p className="text-[10px] text-slate-400 font-medium ml-1">This name will appear in the sidebar, checkout, and on customer receipts.</p>
              </div>
           </div>
        </SettingsCard>

        <SettingsCard icon={<Lock size={20} />} title="Permission Management" highlight>
          <div className="space-y-6">
            <p className="text-xs text-slate-500 leading-relaxed bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              Configure what each user role can see and do. These settings apply globally and affect all staff members instantly.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PermissionToggle 
                label="Manager Access to Users" 
                description="Allow managers to view and edit staff list." 
                active={localSettings.managerAccessToUsers}
                onToggle={() => handleToggle('managerAccessToUsers')}
              />
              <PermissionToggle 
                label="Cashier Access to Inventory" 
                description="Allow cashiers to view stock and pricing." 
                active={localSettings.cashierAccessToInventory}
                onToggle={() => handleToggle('cashierAccessToInventory')}
              />
              <PermissionToggle 
                label="Delete Transaction Logs" 
                description="Allow removal of history records." 
                active={localSettings.allowTransactionDeletion}
                onToggle={() => handleToggle('allowTransactionDeletion')}
              />
              <PermissionToggle 
                label="Modify System Currency" 
                description="Lock currency to prevent pricing errors." 
                active={localSettings.lockSystemCurrency}
                onToggle={() => handleToggle('lockSystemCurrency')}
              />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon={<Globe size={20} />} title="Localization & Market">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Store Currency</label>
              <select 
                value={localSettings.baseCurrency}
                onChange={(e) => handleChange('baseCurrency', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              >
                <option>GHS (GH₵)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Language</label>
              <select 
                value={localSettings.primaryLanguage}
                onChange={(e) => handleChange('primaryLanguage', e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              >
                <option>English (Ghana)</option>
                <option>English (US)</option>
                <option>Twi</option>
              </select>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon={<Shield size={20} />} title="Security & API">
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-slate-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                    <Key size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Gemini AI Engine</p>
                    <p className="text-xs text-slate-400">Manage your neural connection status.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Connected</span>
                  <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Settings</button>
                </div>
             </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

const PermissionToggle: React.FC<{ label: string; description: string; active: boolean; onToggle: () => void }> = ({ label, description, active, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`flex items-center justify-between p-4 bg-white border rounded-2xl transition-all cursor-pointer group ${active ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-100 hover:border-slate-200'}`}
  >
    <div className="flex-1 pr-4">
      <div className="flex items-center gap-2">
        <p className={`font-bold text-sm ${active ? 'text-indigo-900' : 'text-slate-800'}`}>{label}</p>
        {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
      </div>
      <p className="text-[10px] text-slate-400 font-medium leading-tight">{description}</p>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </div>
);

const SettingsCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; highlight?: boolean }> = ({ icon, title, children, highlight }) => (
  <div className={`bg-white p-6 rounded-3xl border shadow-sm transition-all ${highlight ? 'border-indigo-100 ring-4 ring-indigo-50/50' : 'border-slate-100 hover:shadow-md'}`}>
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 ${highlight ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100/20`}>
        {icon}
      </div>
      <h3 className="font-black text-slate-800 tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);


import React, { useState } from 'react';
import { 
  UserPlus, Shield, Mail, Search, CheckCircle, XCircle, 
  ShieldCheck, UserCog, Edit3, Trash2, X, ShieldAlert, Save,
  Lock, Settings as SettingsIcon, Package, BarChart3, Receipt, 
  Truck, LayoutDashboard, BrainCircuit, Undo2, Warehouse as WarehouseIcon,
  Users as CustomersIcon, Wand2, ClipboardList, UserSquare, Scale
} from 'lucide-react';
import { User, UserRole, SystemSettings } from '../types';

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  isAdmin: boolean;
}

const ROLE_CONFIG: Record<UserRole, { icon: any, color: string, bg: string }> = {
  Admin: { icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  Manager: { icon: UserCog, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  Cashier: { icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50' },
};

export const UsersView: React.FC<UsersViewProps> = ({ users, setUsers, settings, onSaveSettings, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Cashier',
    status: 'Active'
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      alert("Please fill in name and email.");
      return;
    }

    const staffMember: User = {
      id: `u-${Date.now()}`,
      name: newUser.name!,
      email: newUser.email!,
      role: (newUser.role as UserRole) || 'Cashier',
      status: (newUser.status as 'Active' | 'Inactive') || 'Active',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name!)}&background=random&size=100`
    };

    setUsers(prev => [...prev, staffMember]);
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Cashier', status: 'Active' });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member? Access will be revoked immediately.")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const toggleManagerPermission = (key: keyof SystemSettings) => {
    onSaveSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff & Permissions</h2>
          <p className="text-slate-500 text-sm font-medium">Assign roles, monitor activity, and control system access.</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => setIsPermissionsModalOpen(true)}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Lock size={18} className="text-indigo-600" />
              Manager Permissions
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            Add Team Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
          <div key={role} className={`p-6 rounded-3xl border border-slate-100 bg-white flex items-center gap-4 shadow-sm hover:shadow-md transition-all group`}>
            <div className={`w-12 h-12 ${config.bg} ${config.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              <config.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{users.filter(u => u.role === role).length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role}s Assigned</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Staff:</span>
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{users.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Team Member</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? filteredUsers.map(user => {
                const RoleIcon = ROLE_CONFIG[user.role].icon;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl overflow-hidden ${ROLE_CONFIG[user.role].bg} ${ROLE_CONFIG[user.role].color} flex items-center justify-center font-black text-xs border border-slate-100 shadow-sm`}>
                          <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl ${ROLE_CONFIG[user.role].bg} ${ROLE_CONFIG[user.role].color} border border-transparent hover:border-current transition-all cursor-default`}>
                        <RoleIcon size={14} />
                        <span className="text-xs font-black uppercase tracking-tighter">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {user.status === 'Active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {user.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="Edit Permissions"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" 
                          title="Revoke Access"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-40">
                    <div className="flex flex-col items-center">
                      <Search size={48} className="mb-4 text-slate-300" />
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No staff members found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Modal */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Manager Permissions</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customize Role Access</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPermissionsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100 mb-6">
                 <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                   These settings apply to all users assigned the "Manager" role. Managers always have access to Dashboard, Checkout, and Profile.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PermissionToggle 
                  icon={<UserSquare size={16}/>}
                  label="Staff Management" 
                  description="View and invite team members." 
                  active={settings.managerAccessToUsers}
                  onToggle={() => toggleManagerPermission('managerAccessToUsers')}
                />
                <PermissionToggle 
                  icon={<Package size={16}/>}
                  label="Inventory Control" 
                  description="Add, edit, and bulk import items." 
                  active={settings.managerAccessToInventory}
                  onToggle={() => toggleManagerPermission('managerAccessToInventory')}
                />
                <PermissionToggle 
                  icon={<BarChart3 size={16}/>}
                  label="Sales Analytics" 
                  description="View reports and daily trends." 
                  active={settings.managerAccessToReports}
                  onToggle={() => toggleManagerPermission('managerAccessToReports')}
                />
                <PermissionToggle 
                  icon={<Scale size={16}/>}
                  label="Profit & Loss" 
                  description="Detailed financial breakdown." 
                  active={settings.managerAccessToPnL}
                  onToggle={() => toggleManagerPermission('managerAccessToPnL')}
                />
                <PermissionToggle 
                  icon={<Receipt size={16}/>}
                  label="Expense Tracking" 
                  description="Monitor operational costs." 
                  active={settings.managerAccessToExpenses}
                  onToggle={() => toggleManagerPermission('managerAccessToExpenses')}
                />
                <PermissionToggle 
                  icon={<Truck size={16}/>}
                  label="Purchase Orders" 
                  description="Manage supplier inventory incoming." 
                  active={settings.managerAccessToPurchases}
                  onToggle={() => toggleManagerPermission('managerAccessToPurchases')}
                />
                <PermissionToggle 
                  icon={<CustomersIcon size={16}/>}
                  label="Customer Registry" 
                  description="Manage the GHS customer database." 
                  active={settings.managerAccessToCustomers}
                  onToggle={() => toggleManagerPermission('managerAccessToCustomers')}
                />
                <PermissionToggle 
                  icon={<WarehouseIcon size={16}/>}
                  label="Warehouse Nodes" 
                  description="Control multiple storage locations." 
                  active={settings.managerAccessToWarehouse}
                  onToggle={() => toggleManagerPermission('managerAccessToWarehouse')}
                />
                <PermissionToggle 
                  icon={<BrainCircuit size={16}/>}
                  label="Gemini AI Assistant" 
                  description="AI store insights and chat." 
                  active={settings.managerAccessToAiAssistant}
                  onToggle={() => toggleManagerPermission('managerAccessToAiAssistant')}
                />
                <PermissionToggle 
                  icon={<Wand2 size={16}/>}
                  label="Creative Studio" 
                  description="AI product photo generation." 
                  active={settings.managerAccessToCreativeStudio}
                  onToggle={() => toggleManagerPermission('managerAccessToCreativeStudio')}
                />
                <PermissionToggle 
                  icon={<ClipboardList size={16}/>}
                  label="Operations Board" 
                  description="Kanban task management." 
                  active={settings.managerAccessToOpsBoard}
                  onToggle={() => toggleManagerPermission('managerAccessToOpsBoard')}
                />
                <PermissionToggle 
                  icon={<Undo2 size={16}/>}
                  label="Returns Management" 
                  description="Process sales & purchase returns." 
                  active={settings.managerAccessToReturns}
                  onToggle={() => toggleManagerPermission('managerAccessToReturns')}
                />
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsPermissionsModalOpen(false)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                Close Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Invite Team Member</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Access Control</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. John Doe" 
                    value={newUser.name}
                    onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      required
                      type="email" 
                      placeholder="john@geminipos.com" 
                      value={newUser.email}
                      onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Role</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser(p => ({ ...p, role: e.target.value as UserRole }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Cashier">Cashier</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                    <select 
                      value={newUser.status}
                      onChange={e => setNewUser(p => ({ ...p, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
                <ShieldAlert className="text-indigo-600 shrink-0" size={20} />
                <p className="text-[10px] font-medium text-indigo-700 leading-relaxed">
                  Invitations will be sent via email. New users will be prompted to set up their password on their first login.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Invite Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <UserCog size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Edit Team Member</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Permissions</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all shadow-sm border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={editingUser.name}
                    onChange={e => setEditingUser(p => p ? ({ ...p, name: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      required
                      type="email" 
                      value={editingUser.email}
                      onChange={e => setEditingUser(p => p ? ({ ...p, email: e.target.value }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Change Role</label>
                    <select 
                      value={editingUser.role}
                      onChange={e => setEditingUser(p => p ? ({ ...p, role: e.target.value as UserRole }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Cashier">Cashier</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                    <select 
                      value={editingUser.status}
                      onChange={e => setEditingUser(p => p ? ({ ...p, status: e.target.value as 'Active' | 'Inactive' }) : null)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PermissionToggle: React.FC<{ icon: React.ReactNode; label: string; description: string; active: boolean; onToggle: () => void }> = ({ icon, label, description, active, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`flex items-center justify-between p-4 bg-white border rounded-2xl transition-all cursor-pointer group ${active ? 'border-indigo-200 bg-indigo-50/20 shadow-sm shadow-indigo-100/50' : 'border-slate-100 hover:border-slate-200'}`}
  >
    <div className="flex-1 pr-4">
      <div className="flex items-center gap-2 mb-0.5">
        <div className={`p-1.5 rounded-lg ${active ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
          {icon}
        </div>
        <p className={`font-bold text-xs ${active ? 'text-indigo-900' : 'text-slate-800'}`}>{label}</p>
        {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
      </div>
      <p className="text-[10px] text-slate-400 font-medium leading-tight ml-8">{description}</p>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-all duration-300 shadow-inner flex-shrink-0 ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${active ? 'translate-x-4' : 'translate-x-1'}`} />
    </div>
  </div>
);

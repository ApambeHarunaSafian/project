
import React, { useState, useRef } from 'react';
import { User, ShieldCheck, Mail, Camera, Save, Key, Bell, Shield, LogOut, CheckCircle2, X, Eye, EyeOff, Lock, Upload } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileViewProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    loginNotificationsEnabled: user.loginNotificationsEnabled ?? true
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [imgError, setImgError] = useState(false);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      onUpdate({
        ...user,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        twoFactorEnabled: formData.twoFactorEnabled,
        loginNotificationsEnabled: formData.loginNotificationsEnabled
      });
      setIsSaving(false);
      setToastMessage('Profile updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        setImgError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      alert("New passwords do not match!");
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordForm({ current: '', next: '', confirm: '' });
      setIsSaving(false);
      setToastMessage('Password updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const toggleSecurity = (key: 'twoFactorEnabled' | 'loginNotificationsEnabled') => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const avatarDisplay = imgError || !formData.avatar 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=6366f1&color=fff&size=256` 
    : formData.avatar;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showToast && (
        <div className="fixed top-20 right-8 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 size={20} />
          <p className="font-bold text-sm">{toastMessage}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Account Settings</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your personal profile and security preferences.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl">
          <ShieldCheck size={18} className="text-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{user.role} Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-xl mx-auto bg-slate-100 flex items-center justify-center">
                <img 
                  key={formData.avatar}
                  src={avatarDisplay} 
                  alt="Avatar" 
                  className="w-full h-full object-cover transition-all duration-300"
                  onLoad={() => setImgError(false)}
                  onError={() => {
                    if (formData.avatar) setImgError(true);
                  }}
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-white hover:bg-indigo-700 transition-all active:scale-90"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            <h3 className="text-xl font-black text-slate-800 truncate px-2">{formData.name}</h3>
            <p className="text-slate-400 text-sm font-medium mb-6 truncate px-2">{formData.email}</p>
            
            <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Active</span>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                <span className="text-xs font-bold text-slate-600">Aug 2024</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100/20">
            <h4 className="font-black text-indigo-400 text-xs uppercase tracking-widest mb-4">Security Level</h4>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-indigo-500 transition-all duration-1000 ${formData.twoFactorEnabled ? 'w-full' : 'w-3/4'}`}
                ></div>
              </div>
              <span className="text-xs font-bold">{formData.twoFactorEnabled ? 'Maximum' : 'Strong'}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              "Your account is protected by enterprise-grade encryption. {formData.twoFactorEnabled ? 'Two-factor authentication is active.' : 'Enable 2FA for maximum security.'}"
            </p>
          </div>
        </div>

        {/* Right: Detailed Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3">
              <User size={20} className="text-indigo-600" />
              Personal Information
            </h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Display Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Avatar Image URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      value={formData.avatar.startsWith('data:') ? 'Local Image Selected' : formData.avatar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ ...prev, avatar: val }));
                        setImgError(false);
                      }}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <Upload size={14} /> Upload
                  </button>
                </div>
                {imgError && formData.avatar && !formData.avatar.startsWith('data:') && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 flex items-center gap-1">
                    <Shield size={10} /> This URL appears to be invalid or inaccessible.
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isSaving ? 'Updating...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3">
              <Shield size={20} className="text-indigo-600" />
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <SecurityAction 
                icon={<Key size={18} />} 
                title="Change Password" 
                desc="Update your login credentials." 
                onClick={() => setShowPasswordModal(true)}
              />
              <SecurityAction 
                icon={<ShieldCheck size={18} />} 
                title="Two-Factor Authentication" 
                desc="Add an extra layer of security." 
                badge="Recommended"
                active={formData.twoFactorEnabled}
                onToggle={() => toggleSecurity('twoFactorEnabled')}
              />
              <SecurityAction 
                icon={<Bell size={18} />} 
                title="Login Notifications" 
                desc="Get notified on new sign-ins." 
                active={formData.loginNotificationsEnabled}
                onToggle={() => toggleSecurity('loginNotificationsEnabled')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Update Password</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Update</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={passwordForm.current}
                    onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={passwordForm.next}
                    onChange={e => setPasswordForm(p => ({ ...p, next: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-12 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'Processing...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityAction: React.FC<{ 
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  badge?: string, 
  active?: boolean,
  onClick?: () => void,
  onToggle?: () => void
}> = ({ icon, title, desc, badge, active, onClick, onToggle }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-slate-800">{title}</p>
          {badge && <span className="text-[8px] font-black uppercase bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
    {onToggle ? (
      <div 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${active ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    ) : (
      <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">
        <Save size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )}
  </div>
);

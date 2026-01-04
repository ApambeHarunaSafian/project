
import React, { useState } from 'react';
import { BrainCircuit, Lock, Mail, ArrowRight, ShieldCheck, UserCircle2, Key } from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
  mockUsers: User[];
  businessName: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, mockUsers, businessName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulated network delay
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email && (password === 'admin123' || password === 'cashier123'));
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Try alex.h@geminipos.com with admin123');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleQuickLogin = (user: User) => {
    setIsLoading(true);
    setTimeout(() => onLogin(user), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30">
              <BrainCircuit size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4">{businessName} <br/>Enterprise</h1>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-xs">
              Next-generation retail intelligence with real-time analytics, inventory management, and AI-driven growth insights.
            </p>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Regional Node</p>
                <p className="text-xs font-medium text-indigo-100">Accra, Ghana Gateway</p>
              </div>
            </div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-700 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome Back</h2>
            <p className="text-slate-400 text-sm font-medium">Please enter your staff credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
              <Lock size={18} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@geminipos.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-12">
            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-1 h-[1px] bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demo Access</span>
              <div className="flex-1 h-[1px] bg-slate-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mockUsers.slice(0, 3).map(user => (
                <button 
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  disabled={isLoading}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white transition-all text-left flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-100 overflow-hidden shrink-0">
                    <img src={user.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 line-clamp-1">{user.name.split(' ')[0]}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{user.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

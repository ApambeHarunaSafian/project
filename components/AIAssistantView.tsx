
import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, Sparkles, AlertTriangle, Lightbulb, TrendingUp, RefreshCw, Package, Tag, Zap, ChevronRight, WifiOff } from 'lucide-react';
import { Product, Transaction } from '../types';
import { getStoreInsights, generateInventoryReport } from '../services/geminiService';

interface AIAssistantViewProps {
  products: Product[];
  transactions: Transaction[];
  isOnline: boolean;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ products, transactions, isOnline }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hello! I'm Gemini, your strategic retail intelligence partner. I've analyzed your current inventory, pricing structure, and recent sales trends. How can I help you optimize your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    if (!isOnline) return;
    const userMsg = customPrompt || input;
    if (!userMsg.trim() || isLoading) return;
    
    if (!customPrompt) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getStoreInsights(products, transactions, userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response || "I had trouble processing that. Could you try rephrasing?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIReport = async () => {
    if (!isOnline) return;
    setIsLoading(true);
    try {
      const data = await generateInventoryReport(products);
      if (data) setReport(data);
    } catch (e) {
      console.error("Failed to load AI report offline");
    } finally {
      setIsLoading(false);
    }
  };

  const strategicCommands = [
    { 
      id: 'restock', 
      label: 'Restock List', 
      desc: 'Suggest order quantities',
      prompt: "Perform a deep-dive restock analysis. Identify items that are critically low and suggest exact order quantities based on their current stock vs potential demand.",
      icon: <Package className="text-orange-500" size={18} />,
      bg: 'bg-orange-50'
    },
    { 
      id: 'clearance', 
      label: 'Clearance Strategy', 
      desc: 'Move slow inventory',
      prompt: "Identify slow-moving inventory items. For items with high stock but low sales, suggest a specific discounting strategy (e.g., GH₵ X discount or % off) to clear them efficiently.",
      icon: <Tag className="text-rose-500" size={18} />,
      bg: 'bg-rose-50'
    },
    { 
      id: 'margins', 
      label: 'Margin Spotlight', 
      desc: 'Promote high-profit',
      prompt: "Analyze the current inventory to find high-margin items (Price minus Cost). Suggest a marketing or bundling strategy to feature these products to maximize net profit.",
      icon: <TrendingUp className="text-emerald-500" size={18} />,
      bg: 'bg-emerald-50'
    }
  ];

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto gap-8 overflow-hidden relative">
      {!isOnline && (
        <div className="absolute inset-0 z-[60] bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-8">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-md animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-rose-100">
                 <WifiOff size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Neural Engine Offline</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                The Gemini AI Assistant requires a live internet connection to perform deep data analysis and generate strategic insights. 
                Your sales and inventory are still being tracked locally!
              </p>
              <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                 <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Awaiting Reconnection...</span>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Sparkles className="text-indigo-600" />
            Gemini AI Insights
          </h2>
          <p className="text-slate-500 text-sm">Automated business intelligence and strategy suggestions.</p>
        </div>
        <button 
          onClick={loadAIReport}
          disabled={isLoading || !isOnline}
          className="flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          Refresh Smart Report
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Chat & Commands Interface */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          
          {/* Strategic Commands Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
            {strategicCommands.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => handleSend(cmd.prompt)}
                disabled={isLoading || !isOnline}
                className="flex flex-col items-start p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group text-left disabled:opacity-50"
              >
                <div className={`w-10 h-10 ${cmd.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  {cmd.icon}
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{cmd.label}</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{cmd.desc}</p>
              </button>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <BrainCircuit size={16} />
                </div>
                <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Business Advisor</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Inventory Context Linked</span>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none font-medium' 
                      : 'bg-indigo-50 text-slate-800 rounded-tl-none border border-indigo-100/50'}
                  `}>
                    {m.content.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Processing Data...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <div className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={!isOnline}
                  placeholder={isOnline ? "Ask for custom analysis or strategy..." : "Neural engine is currently offline."}
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 disabled:opacity-50"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim() || !isOnline}
                  className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Board */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {report ? (
            <>
              {/* Restock Alerts */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-4 text-orange-600 relative z-10">
                  <AlertTriangle size={20} />
                  <h3 className="font-black text-sm uppercase tracking-wider">Restock Critical</h3>
                </div>
                <ul className="space-y-3 relative z-10">
                  {report.restockAlerts.map((alert: string, i: number) => (
                    <li key={i} className="text-xs font-bold text-slate-600 flex gap-2">
                      <span className="text-orange-400 shrink-0">•</span>
                      {alert}
                    </li>
                  ))}
                </ul>
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
              </div>

              {/* Marketing Suggestions */}
              <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <Lightbulb size={20} className="text-indigo-200" />
                  <h3 className="font-black text-sm uppercase tracking-wider">Growth Tactics</h3>
                </div>
                <ul className="space-y-3 relative z-10">
                  {report.marketingTips.map((tip: string, i: number) => (
                    <li key={i} className="text-xs font-medium text-indigo-50 flex gap-2">
                      <span className="text-indigo-300 shrink-0">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl"></div>
              </div>

              {/* Performance Summary */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
                <div className="flex items-center gap-2 mb-4 text-emerald-600">
                  <TrendingUp size={20} />
                  <h3 className="font-black text-sm uppercase tracking-wider">Quick Summary</h3>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic border-l-4 border-emerald-100 pl-4">
                  "{report.summary}"
                </p>
                <div className="absolute top-4 right-4 text-slate-100 group-hover:text-emerald-50 transition-colors">
                  <Zap size={32} />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center group hover:border-indigo-300 transition-all">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6 group-hover:text-indigo-400 group-hover:bg-indigo-50 transition-all">
                <BrainCircuit size={40} />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">Run Smart Report to<br/>activate deep insights</p>
              <button 
                onClick={loadAIReport}
                disabled={!isOnline}
                className="mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:underline disabled:opacity-50"
              >
                Launch Intelligence
              </button>
            </div>
          )}
          
          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Model Version</h4>
            <p className="text-xs font-medium text-slate-300">Gemini 3.0 Flash</p>
            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
              Proprietary retail algorithms optimized for Ghanaian SME growth and supply chain efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

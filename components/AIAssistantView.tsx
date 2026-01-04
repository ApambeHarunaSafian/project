
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, BrainCircuit, Sparkles, AlertTriangle, Lightbulb, 
  TrendingUp, RefreshCw, Package, Tag, Zap, ChevronRight, 
  WifiOff, Mic, MicOff, Volume2, History
} from 'lucide-react';
import { Product, Transaction } from '../types';
import { getStoreInsights, generateInventoryReport } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface AIAssistantViewProps {
  products: Product[];
  transactions: Transaction[];
  isOnline: boolean;
}

// Utility functions for Audio encoding/decoding as required by Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ products, transactions, isOnline }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hello! I'm Gemini, your strategic retail intelligence partner. How can I help you optimize your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API States
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveModelResponse, setLiveModelResponse] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript, liveModelResponse]);

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

  const startLiveSession = async () => {
    if (isLiveActive) {
      stopLiveSession();
      return;
    }

    try {
      setIsLiveActive(true);
      setLiveTranscript('');
      setLiveModelResponse('');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setLiveTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
              setLiveModelResponse(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.turnComplete) {
              setMessages(prev => [
                ...prev, 
                { role: 'user', content: "[Voice] " + liveTranscript },
                { role: 'ai', content: liveModelResponse }
              ]);
              setLiveTranscript('');
              setLiveModelResponse('');
            }
          },
          onclose: () => stopLiveSession(),
          onerror: (e) => {
            console.error("Live API Error:", e);
            stopLiveSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are Gemini, a world-class retail advisor for GeminiPOS Pro. You are currently in a Live Audio session with the store owner in Ghana. Speak naturally and concisely. You have access to the store's inventory and sales context.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start Live API:", err);
      stopLiveSession();
    }
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    if (sessionRef.current) sessionRef.current.close();
    audioContextRef.current = null;
    outputAudioContextRef.current = null;
    sessionRef.current = null;
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
      prompt: "Perform a deep-dive restock analysis. Identify items that are critically low and suggest exact order quantities.",
      icon: <Package className="text-orange-500" size={18} />,
      bg: 'bg-orange-50'
    },
    { 
      id: 'clearance', 
      label: 'Clearance Strategy', 
      desc: 'Move slow inventory',
      prompt: "Identify slow-moving inventory items and suggest a specific discounting strategy to clear them.",
      icon: <Tag className="text-rose-500" size={18} />,
      bg: 'bg-rose-50'
    },
    { 
      id: 'margins', 
      label: 'Margin Spotlight', 
      desc: 'Promote high-profit',
      prompt: "Analyze inventory for high-margin items and suggest marketing tactics.",
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
              <p className="text-slate-500 text-sm leading-relaxed mb-8">AI Assistant requires internet connection.</p>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Sparkles className="text-indigo-600" />
            Gemini AI Insights
          </h2>
          <p className="text-slate-500 text-sm">Automated business intelligence and real-time strategy.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={startLiveSession}
            disabled={!isOnline}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${isLiveActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-white border border-slate-200 text-indigo-600 hover:bg-slate-50'}`}
          >
            {isLiveActive ? <MicOff size={18} /> : <Mic size={18} />}
            {isLiveActive ? 'End Live Session' : 'Start Voice Chat'}
          </button>
          <button 
            onClick={loadAIReport}
            disabled={isLoading || !isOnline}
            className="flex items-center gap-2 bg-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh Report
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
            {strategicCommands.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => handleSend(cmd.prompt)}
                disabled={isLoading || !isOnline || isLiveActive}
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

          <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${isLiveActive ? 'bg-rose-600' : 'bg-indigo-600'} rounded-lg flex items-center justify-center text-white transition-colors`}>
                  <BrainCircuit size={16} />
                </div>
                <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{isLiveActive ? 'Live Voice Connection' : 'Business Advisor'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Inventory Sync Active</span>
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
              
              {isLiveActive && (
                <div className="space-y-4">
                  {liveTranscript && (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed bg-rose-50 text-rose-900 border border-rose-100 italic rounded-tr-none">
                        Talking: "{liveTranscript}"
                      </div>
                    </div>
                  )}
                  {liveModelResponse && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed bg-indigo-600 text-white rounded-tl-none flex items-center gap-3">
                        <Volume2 size={16} className="shrink-0 animate-pulse" />
                        "{liveModelResponse}"
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  disabled={!isOnline || isLiveActive}
                  placeholder={isLiveActive ? "Voice session active..." : (isOnline ? "Ask for custom analysis..." : "Offline.")}
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 disabled:opacity-50"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim() || !isOnline || isLiveActive}
                  className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {report ? (
            <>
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
              </div>

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
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-[3rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center group hover:border-indigo-300 transition-all">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6 group-hover:text-indigo-400 group-hover:bg-indigo-50 transition-all">
                <BrainCircuit size={40} />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">Run Smart Report to<br/>activate deep insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Sparkles, ImageIcon, Download, Copy, RefreshCw, Layers, Wand2, CheckCircle2, AlertCircle, Share2, WifiOff } from 'lucide-react';
import { generateProductImage } from '../services/geminiService';

interface ImageGeneratorViewProps {
  isOnline: boolean;
}

export const ImageGeneratorView: React.FC<ImageGeneratorViewProps> = ({ isOnline }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "16:9">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !isOnline) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateProductImage(prompt, aspectRatio);
      if (imageUrl) {
        setGeneratedImage(imageUrl);
        setHistory(prev => [imageUrl, ...prev.slice(0, 5)]);
      } else {
        setError("Generation failed. Please try a different prompt.");
      }
    } catch (err) {
      setError("An error occurred during image generation. Check your connection.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedImage) return;
    navigator.clipboard.writeText(generatedImage);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `gemini-pos-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quickPrompts = [
    "Professional studio photo of organic sourdough bread on a rustic wooden table",
    "Gourmet coffee beans spilling out of a hessian sack, cinematic lighting",
    "Fresh green tea leaves in a ceramic bowl with soft morning sunlight",
    "Artisan cheese platter with grapes and walnuts, high-end catalog style"
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      {!isOnline && (
        <div className="absolute inset-0 z-[60] bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-8">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-md animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-rose-100">
                 <WifiOff size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Creative Node Offline</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                AI Image generation requires an active connection to Gemini's vision models. Please reconnect to use the Creative Studio.
              </p>
              <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                 <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Awaiting Reconnection...</span>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Wand2 className="text-indigo-600" />
            Creative Studio
          </h2>
          <p className="text-slate-500 text-sm">Generate AI-powered product photography and marketing assets.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl">
          <Sparkles size={16} className="text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Powered by Gemini 2.5 Image</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Describe your vision</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!isOnline}
                placeholder={isOnline ? "A high-end close-up shot of fresh roasted coffee beans..." : "Creative tools are offline."}
                className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(["1:1", "4:3", "16:9"] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    disabled={!isOnline}
                    className={`py-2 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'} disabled:opacity-50`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !isOnline}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {isGenerating ? 'Synthesizing...' : 'Generate Magic'}
            </button>
          </div>

          <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">Quick Inspiration</h4>
            <div className="space-y-2">
              {quickPrompts.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => setPrompt(q)}
                  disabled={!isOnline}
                  className="w-full text-left text-[10px] font-bold bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all line-clamp-1 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="flex-1 flex items-center justify-center relative z-10">
              {generatedImage ? (
                <div className={`relative max-w-full max-h-full animate-in zoom-in duration-500 shadow-2xl shadow-black/50 overflow-hidden rounded-2xl border-4 border-white/10 ${aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-video"} w-full`}>
                  <img src={generatedImage} alt="AI Generated" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex flex-col items-center text-center opacity-30 text-white">
                  <ImageIcon size={64} className="mb-4" />
                  <p className="font-black text-xl uppercase tracking-widest">Canvas Ready</p>
                  <p className="text-xs font-medium mt-2">Enter a prompt to begin generation</p>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                  <p className="text-white font-black text-xs uppercase tracking-[0.2em] animate-pulse">Processing Pixels</p>
                </div>
              )}
            </div>

            {error && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-rose-500/90 text-white px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {generatedImage && !isGenerating && (
              <div className="mt-8 flex items-center justify-center gap-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Copy size={16} /> Copy URL
                </button>
                <button 
                  onClick={downloadImage}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/40"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            )}

            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-800/20 rounded-full blur-[80px]" />
          </div>

          {/* History Strip */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Session History</h4>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {history.length > 0 ? history.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setGeneratedImage(img)}
                  className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-transparent hover:border-indigo-600 transition-all shadow-sm"
                >
                  <img src={img} className="w-full h-full object-cover" alt={`History ${i}`} />
                </button>
              )) : (
                <div className="w-full py-4 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                  No images generated yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCopyToast && (
        <div className="fixed bottom-12 right-12 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 z-[100]">
          <CheckCircle2 size={20} />
          <p className="font-bold text-sm">Image Data URL copied!</p>
        </div>
      )}
    </div>
  );
};

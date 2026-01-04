
import React, { useState } from 'react';
import { Plus, MoreVertical, BrainCircuit, Sparkles, CheckCircle, Clock, ListTodo, X, Tag, AlignLeft, ShieldAlert } from 'lucide-react';
import { ShopTask, Product, Transaction } from '../types';
import { suggestDailyTasks } from '../services/geminiService';

interface BoardViewProps {
  tasks: ShopTask[];
  setTasks: React.Dispatch<React.SetStateAction<ShopTask[]>>;
  products: Product[];
  transactions: Transaction[];
}

export const BoardView: React.FC<BoardViewProps> = ({ tasks, setTasks, products, transactions }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<ShopTask>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo'
  });

  const moveTask = (taskId: string, newStatus: ShopTask['status']) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      localStorage.setItem('shop_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const generateAITasks = async () => {
    setIsGenerating(true);
    try {
      const suggested = await suggestDailyTasks(products, transactions);
      const newTasks: ShopTask[] = suggested.map((s: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        title: s.title,
        description: s.description,
        status: 'todo',
        priority: (['low', 'medium', 'high'].includes(s.priority) ? s.priority : 'medium') as ShopTask['priority']
      }));
      setTasks(prev => {
        const updated = [...newTasks, ...prev];
        localStorage.setItem('shop_tasks', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const taskToAdd: ShopTask = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority as ShopTask['priority'] || 'medium',
      status: 'todo'
    };

    setTasks(prev => {
      const updated = [taskToAdd, ...prev];
      localStorage.setItem('shop_tasks', JSON.stringify(updated));
      return updated;
    });
    
    setIsAddModalOpen(false);
    setNewTask({ title: '', description: '', priority: 'medium', status: 'todo' });
  };

  const deleteTask = (id: string) => {
    if (confirm("Remove this task from the board?")) {
      setTasks(prev => {
        const updated = prev.filter(t => t.id !== id);
        localStorage.setItem('shop_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const columns: { id: ShopTask['status']; label: string; icon: any; color: string }[] = [
    { id: 'todo', label: 'To Do', icon: <ListTodo size={18} />, color: 'text-slate-500' },
    { id: 'in-progress', label: 'In Progress', icon: <Clock size={18} />, color: 'text-indigo-600' },
    { id: 'done', label: 'Completed', icon: <CheckCircle size={18} />, color: 'text-emerald-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Operations Board</h2>
          <p className="text-slate-500 text-sm">Manage daily shop tasks and shop floor activities.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateAITasks}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-sm"
          >
            <Sparkles size={18} className={isGenerating ? 'animate-pulse' : ''} />
            {isGenerating ? 'Gemini is planning...' : 'Generate AI Tasks'}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col gap-4 bg-slate-100/50 p-4 rounded-3xl min-h-0 border border-slate-200/50">
            <div className={`flex items-center justify-between px-2 mb-2 ${col.color}`}>
              <div className="flex items-center gap-2">
                {col.icon}
                <span className="text-sm font-black uppercase tracking-wider">{col.label}</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-400">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id} 
                  className={`bg-white p-4 rounded-2xl border-y border-r border-l-4 shadow-sm hover:shadow-md transition-all group relative
                    ${task.priority === 'high' ? 'border-l-rose-500 border-slate-100' : 
                      task.priority === 'medium' ? 'border-l-amber-500 border-slate-100' : 
                      'border-l-slate-300 border-slate-100'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border
                      ${task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-slate-50 text-slate-500 border-slate-100'}
                    `}>
                      {task.priority} Priority
                    </span>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      task.priority === 'high' ? 'bg-rose-500' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 
                      'bg-slate-400'
                    }`} />
                    <h4 className="font-bold text-slate-800 text-sm truncate">{task.title}</h4>
                  </div>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 pl-4">{task.description}</p>
                  
                  <div className="flex gap-2">
                    {col.id !== 'todo' && (
                      <button 
                        onClick={() => moveTask(task.id, col.id === 'done' ? 'in-progress' : 'todo')}
                        className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600"
                      >
                        Move back
                      </button>
                    )}
                    {col.id !== 'done' && (
                      <button 
                        onClick={() => moveTask(task.id, col.id === 'todo' ? 'in-progress' : 'done')}
                        className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 ml-auto"
                      >
                        {col.id === 'todo' ? 'Start Task' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-center opacity-30 border-2 border-dashed border-slate-300 rounded-2xl">
                  <span className="text-xs font-bold">No tasks</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">New Operational Task</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shop Floor Management</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-all border border-transparent hover:border-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Tag size={12} /> Task Title *
                </label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  placeholder="e.g. Restock Bakery section" 
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <ShieldAlert size={12} /> Priority Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map(prio => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setNewTask(prev => ({ ...prev, priority: prio }))}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newTask.priority === prio ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <AlignLeft size={12} /> Task Description
                </label>
                <textarea 
                  placeholder="What needs to be done?" 
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

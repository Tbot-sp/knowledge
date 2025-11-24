import React, { useState, useEffect } from 'react';
import { ViewMode, KnowledgeItem } from './types';
import Visualizer from './components/Visualizer';
import AddItem from './components/AddItem';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [view, setView] = useState<ViewMode>('orbit');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('mindorbit_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved items");
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('mindorbit_items', JSON.stringify(items));
  }, [items]);

  const handleAddItem = (item: KnowledgeItem) => {
    setItems(prev => [...prev, item]);
    setView('orbit');
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  // Reminder/Insight Logic (Run once on mount)
  useEffect(() => {
    if (items.length > 0 && Math.random() > 0.7) {
        // 30% chance to show a random item notification as a "reminder"
        const randomItem = items[Math.floor(Math.random() * items.length)];
        // In a real app, use a Toast component. For now, we just log or could set a state for a modal.
        console.log("Rediscover this:", randomItem.title);
    }
  }, [items]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
            MO
          </div>
          <span className="font-bold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            MindOrbit
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavButton 
            active={view === 'orbit'} 
            onClick={() => setView('orbit')} 
            icon={<GlobeIcon />} 
            label="Galaxy View" 
          />
          <NavButton 
            active={view === 'list'} 
            onClick={() => setView('list')} 
            icon={<ListIcon />} 
            label="All Knowledge" 
          />
          <NavButton 
            active={view === 'chat'} 
            onClick={() => setView('chat')} 
            icon={<ChatIcon />} 
            label="AI Assistant" 
          />
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setView('add')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <PlusIcon />
            <span className="hidden lg:block">Add Knowledge</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {view === 'orbit' && (
          <>
            <Visualizer items={items} onNodeClick={setSelectedItem} />
            {/* Quick Stats Overlay */}
            <div className="absolute top-6 left-6 glass-panel px-4 py-2 rounded-lg text-xs font-mono text-slate-400 pointer-events-none">
              NODES: {items.length} <br/>
              CATEGORIES: {new Set(items.map(i => i.category)).size}
            </div>
          </>
        )}

        {view === 'add' && <AddItem onAdd={handleAddItem} onCancel={() => setView('orbit')} />}

        {view === 'chat' && <ChatInterface items={items} />}

        {view === 'list' && (
          <div className="h-full overflow-y-auto p-8">
            <h2 className="text-3xl font-bold mb-6 text-white">Knowledge Repository</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <div key={item.id} onClick={() => setSelectedItem(item)} className="glass-panel p-5 rounded-xl hover:border-blue-500/50 cursor-pointer transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-400 px-2 py-1 bg-blue-500/10 rounded uppercase tracking-wider">{item.category}</span>
                    <span className="text-slate-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-100 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">{item.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(t => (
                      <span key={t} className="text-xs text-slate-500">#{t}</span>
                    ))}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-500">
                  No knowledge stored yet. Switch to "Add Knowledge".
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detail Modal / Slide-over */}
        {selectedItem && (
          <div className="absolute inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-slate-900 border-l border-slate-700 shadow-2xl transform transition-transform animate-slide-in z-50 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold uppercase">{selectedItem.category}</span>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">
                  <CloseIcon />
                </button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
              <h2 className="text-3xl font-bold mb-4 text-white leading-tight">{selectedItem.title}</h2>
              <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">AI Summary</h4>
                <p className="text-slate-300 italic">{selectedItem.summary}</p>
              </div>
              
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Original Content</h4>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                  {selectedItem.content}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedItem.tags.map(tag => (
                   <span key={tag} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">#{tag}</span> 
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
               <button 
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 hover:bg-red-900/20 rounded transition-colors"
               >
                 Delete Node
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Icons components
const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
);
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
      active ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    {icon}
    <span className="hidden lg:block font-medium">{label}</span>
  </button>
);

export default App;

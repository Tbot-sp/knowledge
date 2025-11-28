import React, { useState, useEffect } from 'react';
import { ViewMode, KnowledgeItem } from './types';
import Visualizer from './components/Visualizer';
import AddItem from './components/AddItem';
import ChatInterface from './components/ChatInterface';
import NavButton from './components/NavButton';
import { initializeDatabase, insertNewNote } from './src/services/supabaseService';

const GlobeIcon = () => <svg />; // Placeholder
const ListIcon = () => <svg />; // Placeholder
const ChatIcon = () => <svg />; // Placeholder
const PlusIcon = () => <svg />; // Placeholder

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

<div className="p-4 space-y-2">
  <button 
    onClick={() => setView('add')}
    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 font-medium text-sm"
  >
    <PlusIcon />
    <span className="hidden lg:block">Add Knowledge</span>
  </button>
  <button 
    onClick={initializeDatabase}
    className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg shadow-md shadow-green-900/20 transition-all flex items-center justify-center gap-2 font-medium text-sm"
  >
    Initialize Supabase Table
  </button>
  <button 
    onClick={insertNewNote}
    className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg shadow-md shadow-purple-900/20 transition-all flex items-center justify-center gap-2 font-medium text-sm"
  >
    <PlusIcon />
    <span className="hidden lg:block">Add Note to Supabase</span>
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

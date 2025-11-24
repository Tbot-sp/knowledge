import React, { useState } from 'react';
import { ItemType, KnowledgeItem } from '../types';
import { analyzeContent } from '../services/doubao';
import { v4 as uuidv4 } from 'uuid'; // Use simple random string if uuid not avail, but custom logic below

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface AddItemProps {
  onAdd: (item: KnowledgeItem) => void;
  onCancel: () => void;
}

const AddItem: React.FC<AddItemProps> = ({ onAdd, onCancel }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<ItemType>(ItemType.TEXT);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsProcessing(true);
    try {
      // 1. Analyze with Gemini
      const analysis = await analyzeContent(content, type);

      // 2. Construct Item
      const newItem: KnowledgeItem = {
        id: generateId(),
        type,
        content,
        title: analysis.title,
        summary: analysis.summary,
        tags: analysis.tags,
        category: analysis.category,
        createdAt: Date.now(),
      };

      // 3. Save
      onAdd(newItem);
    } catch (error) {
      alert("Failed to analyze content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto mt-10 shadow-2xl animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Add to Orbit
      </h2>
      
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setType(ItemType.TEXT)}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${
            type === ItemType.TEXT 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📝 Text Note
        </button>
        <button
          type="button"
          onClick={() => setType(ItemType.URL)}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${
            type === ItemType.URL 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🔗 URL / Link
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {type === ItemType.URL ? "Paste content from URL (Analysis works best with raw text)" : "Your Thought / Note"}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none placeholder-slate-500"
            placeholder={type === ItemType.URL ? "Paste the article text here..." : "Start typing your knowledge..."}
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Launch into Orbit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;

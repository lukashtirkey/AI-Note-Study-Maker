import React from 'react';
import { 
  FileText, 
  Layers, 
  BrainCircuit, 
  GitFork, 
  Mic, 
  Timer, 
  Library,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeDeckTitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeDeckTitle
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; desc: string }[] = [
    { id: 'notes', label: 'AI Note Generator', icon: FileText, desc: 'Paste text or topics to summarize' },
    { id: 'flashcards', label: '3D Flashcard Studio', icon: Layers, badge: 'Interactive', desc: 'Flip 3D cards & spaced review' },
    { id: 'quiz', label: 'Smart Quiz Arena', icon: BrainCircuit, badge: 'AI Quiz', desc: 'Multiple choice score challenge' },
    { id: 'concept-map', label: 'Concept Visualizer', icon: GitFork, desc: 'Hierarchical mind map trees' },
    { id: 'voice-notes', label: 'Voice & Audio Notes', icon: Mic, badge: 'Live Mic', desc: 'Record & transcribe lecture notes' },
    { id: 'timer', label: 'Focus & Soundscapes', icon: Timer, desc: 'Pomodoro timer & ambient sounds' },
    { id: 'library', label: 'Study Library', icon: Library, desc: 'All study decks & progress' },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 glass-panel border-b lg:border-b-0 lg:border-r border-slate-700/50 p-3 lg:p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Study Navigation</span>
          <Sparkles className="size-3.5 text-indigo-400" />
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'
                  }`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          isActive ? 'bg-white/25 text-white' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] font-normal leading-tight hidden lg:block ${
                      isActive ? 'text-indigo-100' : 'text-slate-400'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`size-4 transition-transform ${
                  isActive ? 'text-white translate-x-0.5' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                }`} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Deck Footer Widget */}
      {activeDeckTitle && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30">
          <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Active Study Deck</p>
          <p className="text-xs font-semibold text-white truncate mt-0.5">{activeDeckTitle}</p>
        </div>
      )}
    </aside>
  );
};

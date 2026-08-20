import React, { useState } from 'react';
import { 
  GitFork, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Search,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { MindMapNode, StudyDeck } from '../types';

interface ConceptVisualizerProps {
  activeDeck: StudyDeck;
}

const TreeNode: React.FC<{ 
  node: MindMapNode; 
  depth?: number; 
  filterText?: string;
  forceExpand?: boolean | null;
}> = ({ node, depth = 0, filterText = '', forceExpand = null }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const [prevForceExpand, setPrevForceExpand] = useState<boolean | null>(forceExpand);
  if (forceExpand !== null && forceExpand !== prevForceExpand) {
    setPrevForceExpand(forceExpand);
    setIsExpanded(forceExpand);
  }

  const matchesFilter = filterText 
    ? node.label.toLowerCase().includes(filterText.toLowerCase()) || 
      (node.description && node.description.toLowerCase().includes(filterText.toLowerCase()))
    : true;

  const depthColors = [
    'border-indigo-500/50 bg-indigo-950/40 text-indigo-200',
    'border-purple-500/50 bg-purple-950/40 text-purple-200',
    'border-pink-500/50 bg-pink-950/40 text-pink-200',
    'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
  ];

  const colorClass = depthColors[depth % depthColors.length];

  if (filterText && !matchesFilter && !hasChildren) {
    return null;
  }

  return (
    <div className="relative pl-4 border-l-2 border-slate-700/60 my-2 space-y-2">
      <div
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`p-3.5 rounded-xl border glass-panel transition-all flex items-start justify-between cursor-pointer hover:border-indigo-400 ${colorClass} ${
          filterText && matchesFilter ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/20' : ''
        }`}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <span className="text-slate-400">
                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </span>
            )}
            <h4 className="text-sm font-bold">{node.label}</h4>
          </div>
          {node.description && (
            <p className="text-xs text-slate-400 pl-6 leading-relaxed">
              {node.description}
            </p>
          )}
        </div>

        {hasChildren && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            {node.children?.length} branches
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-2 space-y-1 animate-fade-in">
          {node.children!.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              filterText={filterText}
              forceExpand={forceExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({ activeDeck }) => {
  const [filterText, setFilterText] = useState('');
  const [forceExpand, setForceExpand] = useState<boolean | null>(null);

  const rootNode = activeDeck.mindMap;

  const handleExpandAll = () => {
    setForceExpand(true);
    setTimeout(() => setForceExpand(null), 300);
  };

  const handleCollapseAll = () => {
    setForceExpand(false);
    setTimeout(() => setForceExpand(null), 300);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <GitFork className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Concept Map & Mind Visualizer</h2>
            <p className="text-xs text-slate-400">
              Deck: <span className="font-semibold text-indigo-300">{activeDeck.title}</span>
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleExpandAll}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1"
            title="Expand All Branches"
          >
            <Maximize2 className="size-3.5" />
          </button>

          <button
            onClick={handleCollapseAll}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1"
            title="Collapse All Branches"
          >
            <Minimize2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Mind Map Tree Area */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="size-4 text-indigo-400" />
            <span>Interactive Node Explorer</span>
          </div>
        </div>

        <div className="pt-2">
          {rootNode ? (
            <TreeNode 
              node={rootNode} 
              depth={0} 
              filterText={filterText}
              forceExpand={forceExpand}
            />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">
              No concept map available. Generate notes to automatically create mind maps!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

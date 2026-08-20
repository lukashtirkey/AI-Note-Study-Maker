import React from 'react';
import { 
  Library, 
  Layers, 
  BrainCircuit, 
  Download, 
  Trash2, 
  ArrowUpRight
} from 'lucide-react';
import type { StudyDeck } from '../types';
import { exportDeckToPDF } from '../services/pdfExport';

interface StudyLibraryProps {
  decks: StudyDeck[];
  activeDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onDeleteDeck?: (deckId: string) => void;
}

export const StudyLibrary: React.FC<StudyLibraryProps> = ({
  decks,
  activeDeckId,
  onSelectDeck,
  onDeleteDeck
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Library className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Study Library & Decks</h2>
            <p className="text-xs text-slate-400">
              Manage your generated study decks, flashcards, and quizzes
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {decks.map((deck) => {
          const isActive = deck.id === activeDeckId;
          const flashcardCount = deck.flashcards.length;
          const quizCount = deck.quiz.length;

          return (
            <div
              key={deck.id}
              className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group ${
                isActive
                  ? 'border-indigo-500 bg-slate-900/90 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                  : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {deck.subject}
                  </span>

                  {isActive && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Layers className="size-4 text-purple-400 shrink-0" />
                    <span><strong>{flashcardCount}</strong> Flashcards</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <BrainCircuit className="size-4 text-emerald-400 shrink-0" />
                    <span><strong>{quizCount}</strong> Questions</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-800">
                <button
                  onClick={() => onSelectDeck(deck.id)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{isActive ? 'Currently Active' : 'Select Deck'}</span>
                  <ArrowUpRight className="size-3.5" />
                </button>

                <button
                  onClick={() => exportDeckToPDF(deck)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                  title="Export Complete Deck to PDF"
                >
                  <Download className="size-4" />
                </button>

                {onDeleteDeck && decks.length > 1 && (
                  <button
                    onClick={() => onDeleteDeck(deck.id)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-900/50 transition-all"
                    title="Delete Deck"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

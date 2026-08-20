import React, { useState, useEffect, useCallback } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Shuffle, 
  Sparkles, 
  Layers,
  Award,
  Keyboard,
  Filter,
  Edit3,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Flashcard, StudyDeck } from '../types';

interface FlashcardStudioProps {
  activeDeck: StudyDeck;
  onUpdateFlashcardMastery?: (cardId: string, isCorrect: boolean) => void;
  onAddFlashcard?: (newCard: Flashcard) => void;
}

export const FlashcardStudio: React.FC<FlashcardStudioProps> = ({
  activeDeck,
  onUpdateFlashcardMastery,
  onAddFlashcard
}) => {
  const [cards, setCards] = useState<Flashcard[]>(activeDeck.flashcards);
  const [filterMode, setFilterMode] = useState<'all' | 'weak' | 'mastered'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  // Form state for add card
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const [prevDeckId, setPrevDeckId] = useState(activeDeck.id);
  if (activeDeck.id !== prevDeckId) {
    setPrevDeckId(activeDeck.id);
    setCards(activeDeck.flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  const filteredCards = cards.filter((c) => {
    if (filterMode === 'weak') return (c.masteryScore || 50) < 70;
    if (filterMode === 'mastered') return (c.masteryScore || 50) >= 70;
    return true;
  });

  const displayCards = filteredCards.length > 0 ? filteredCards : cards;
  const currentCard = displayCards[currentIndex] || {
    id: 'empty',
    front: 'No cards match the selected filter.',
    back: 'Switch filter to "All Cards" or add new flashcards!',
    category: activeDeck.subject,
    difficulty: 'easy'
  };

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setIsEditing(false);
    setCurrentIndex((prev) => (prev + 1) % displayCards.length);
  }, [displayCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setIsEditing(false);
    setCurrentIndex((prev) => (prev - 1 + displayCards.length) % displayCards.length);
  }, [displayCards.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleShuffle = () => {
    setIsFlipped(false);
    setIsEditing(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleReviewScore = (isCorrect: boolean) => {
    if (isCorrect) {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    }

    if (onUpdateFlashcardMastery && currentCard.id !== 'empty') {
      onUpdateFlashcardMastery(currentCard.id, isCorrect);
    }

    setCards((prev) =>
      prev.map((c) =>
        c.id === currentCard.id
          ? {
              ...c,
              masteryScore: Math.min(100, Math.max(0, (c.masteryScore || 50) + (isCorrect ? 15 : -10))),
              timesReviewed: (c.timesReviewed || 0) + 1
            }
          : c
      )
    );

    setTimeout(() => {
      handleNext();
    }, 400);
  };

  const handleStartEdit = () => {
    setEditFront(currentCard.front);
    setEditBack(currentCard.back);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setCards(prev =>
      prev.map(c => c.id === currentCard.id ? { ...c, front: editFront, back: editBack } : c)
    );
    setIsEditing(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const createdCard: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      front: newFront,
      back: newBack,
      category: activeDeck.subject,
      difficulty: 'medium',
      masteryScore: 50,
      timesReviewed: 0
    };

    setCards(prev => [...prev, createdCard]);
    if (onAddFlashcard) {
      onAddFlashcard(createdCard);
    }

    setNewFront('');
    setNewBack('');
    setShowAddModal(false);
  };

  const avgMastery = Math.round(
    cards.reduce((acc, c) => acc + (c.masteryScore || 50), 0) / (cards.length || 1)
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">3D Flashcard Studio</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Deck: <span className="font-bold text-indigo-300">{activeDeck.title}</span> ({cards.length} cards | <span className="text-emerald-400 font-bold">{avgMastery}% Mastery</span>)
          </p>
        </div>

        {/* Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs mr-2">
            <Award className="size-3.5 text-emerald-400" />
            <span className="text-slate-300">{avgMastery}%</span>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="size-3.5 text-slate-400 ml-2 mr-1" />
            <button
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({cards.length})
            </button>
            <button
              onClick={() => { setFilterMode('weak'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filterMode === 'weak' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Weak ({cards.filter(c => (c.masteryScore || 50) < 70).length})
            </button>
            <button
              onClick={() => { setFilterMode('mastered'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${filterMode === 'mastered' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Mastered ({cards.filter(c => (c.masteryScore || 50) >= 70).length})
            </button>
          </div>

          <button
            onClick={handleShuffle}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Shuffle Deck"
          >
            <Shuffle className="size-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="size-4" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-semibold px-1">
          <span>Card {currentIndex + 1} of {displayCards.length}</span>
          <span className="flex items-center gap-1">
            <Keyboard className="size-3 text-slate-500" /> Space to Flip, ← → to Navigate
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / displayCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div className="w-full perspective-1000 my-4">
        <div
          onClick={() => !isEditing && setIsFlipped(!isFlipped)}
          className={`relative w-full min-h-[320px] rounded-3xl cursor-pointer transition-transform duration-700 transform-style-3d shadow-2xl glass-panel ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-indigo-950/80 border border-slate-700/80">
            <div className="flex items-center justify-between text-xs">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase tracking-wider">
                {currentCard.category}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (isEditing) { handleSaveEdit(); } else { handleStartEdit(); } }}
                  className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700"
                >
                  {isEditing ? <Check className="size-3 text-emerald-400" /> : <Edit3 className="size-3" />}
                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                </button>
                <span className="text-slate-400 flex items-center gap-1">
                  <RotateCw className="size-3 text-indigo-400 animate-spin" /> Flip
                </span>
              </div>
            </div>

            <div className="my-auto py-4 text-center">
              {isEditing ? (
                <textarea
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base focus:outline-none"
                />
              ) : (
                <h3 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed">
                  {currentCard.front}
                </h3>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
              <span>Difficulty: <strong className="capitalize text-slate-200">{currentCard.difficulty}</strong></span>
              <span>Mastery: <strong className="text-emerald-400">{currentCard.masteryScore || 50}%</strong></span>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-950/90 via-slate-900/90 to-purple-950/90 border border-purple-500/50">
            <div className="flex items-center justify-between text-xs">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider">
                ANSWER EXPLANATION
              </span>
              <span className="text-purple-300 font-semibold">Self-Evaluation</span>
            </div>

            <div className="my-auto py-4 text-center">
              {isEditing ? (
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-base focus:outline-none"
                />
              ) : (
                <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
                  {currentCard.back}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center text-xs text-purple-300 border-t border-indigo-900/60 pt-3">
              <span>Rate recall accuracy to update spaced repetition schedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
        >
          <ChevronLeft className="size-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleReviewScore(false)}
            className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-xs flex items-center gap-2 border border-rose-800/60 transition-all shadow-md"
          >
            <XCircle className="size-4 text-rose-400" />
            <span>Needs Review</span>
          </button>

          <button
            onClick={() => handleReviewScore(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <CheckCircle2 className="size-4" />
            <span>Got It Right!</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
        >
          <span>Next</span>
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Add Custom Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="size-5 text-purple-400" /> Add Custom Flashcard
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Front Side (Question / Term)
                </label>
                <textarea
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the role of the Softmax activation function?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Back Side (Answer / Definition)
                </label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Softmax converts raw logits into a normalized probability distribution..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

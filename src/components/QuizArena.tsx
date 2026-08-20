import React, { useState } from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { QuizQuestion, StudyDeck } from '../types';

interface QuizArenaProps {
  activeDeck: StudyDeck;
  onCompleteQuiz?: (score: number, total: number) => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  activeDeck,
  onCompleteQuiz
}) => {
  const [questions] = useState<QuizQuestion[]>(activeDeck.quiz);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selected: number; isCorrect: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex] || {
    id: 'empty-q',
    question: 'No quiz questions generated for this deck yet.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    explanation: 'Generate notes to automatically build custom AI quizzes!',
    hint: 'Use the AI Note Generator to generate new quiz sets.'
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return; // Prevent re-selection
    setSelectedOption(index);

    const isCorrect = index === currentQuestion.correctAnswer;
    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selected: index, isCorrect }
    ]);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowHint(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      const totalCorrect = userAnswers.filter((a) => a.isCorrect).length + (selectedOption === currentQuestion.correctAnswer ? 1 : 0);
      
      if (totalCorrect / questions.length >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      if (onCompleteQuiz) {
        onCompleteQuiz(totalCorrect, questions.length);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowHint(false);
    setUserAnswers([]);
    setIsCompleted(false);
  };

  const scoreCount = userAnswers.filter(a => a.isCorrect).length;
  const percentage = Math.round((scoreCount / (questions.length || 1)) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BrainCircuit className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Smart Practice Quiz Arena</h2>
            <p className="text-xs text-slate-400">
              Deck: <span className="font-semibold text-emerald-300">{activeDeck.title}</span>
            </p>
          </div>
        </div>

        {!isCompleted && (
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold">Question</span>
            <p className="text-lg font-bold text-white">
              {currentIndex + 1} <span className="text-slate-500 text-sm">/ {questions.length}</span>
            </p>
          </div>
        )}
      </div>

      {/* Main Quiz Flow */}
      {!isCompleted ? (
        <div className="glass-panel p-6 lg:p-8 rounded-2xl space-y-6">
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                Multiple Choice
              </span>

              {currentQuestion.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Lightbulb className="size-4" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed pt-2">
              {currentQuestion.question}
            </h3>

            {/* Hint Box */}
            {showHint && currentQuestion.hint && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 animate-fade-in flex items-start gap-2">
                <Lightbulb className="size-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Hint:</strong> {currentQuestion.hint}</span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              
              let styleClass = 'bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800';

              if (selectedOption !== null) {
                if (isCorrect) {
                  styleClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20';
                } else if (isSelected) {
                  styleClass = 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-lg shadow-rose-500/20';
                } else {
                  styleClass = 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full p-4 rounded-xl border text-left font-medium text-sm flex items-center justify-between transition-all ${styleClass}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`size-8 rounded-lg font-bold text-xs flex items-center justify-center border ${
                      selectedOption !== null && isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : selectedOption !== null && isSelected
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>

                  {selectedOption !== null && isCorrect && (
                    <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                  )}
                  {selectedOption !== null && isSelected && !isCorrect && (
                    <XCircle className="size-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {selectedOption !== null && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 animate-fade-in">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-4 text-indigo-400" /> Explanation
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Quiz Results'}</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="glass-panel p-8 rounded-2xl text-center space-y-6 animate-fade-in">
          <div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <div className="size-full rounded-full bg-slate-900 flex items-center justify-center">
              <Trophy className="size-10 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold text-white">Quiz Completed!</h3>
            <p className="text-slate-400 text-sm">
              You scored <span className="font-bold text-emerald-400">{scoreCount}</span> out of <span className="font-bold text-white">{questions.length}</span> ({percentage}%)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 inline-block text-xs text-slate-300">
            {percentage >= 80 ? (
              <p className="text-emerald-300 font-bold">🏆 Outstanding Performance! You have mastered this material.</p>
            ) : percentage >= 60 ? (
              <p className="text-amber-300 font-bold">👍 Good effort! Review flashcards to boost weak concepts.</p>
            ) : (
              <p className="text-rose-300 font-bold">📚 Keep going! Re-read the AI study guide and attempt again.</p>
            )}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <RotateCcw className="size-4" />
              <span>Retry Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

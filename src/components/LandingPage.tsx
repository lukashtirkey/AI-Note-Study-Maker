import React from 'react';
import { 
  Sparkles, 
  Mic, 
  Layers, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight,
  Play,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterDemo
}) => {
  return (
    <div className="min-h-screen app-bg-gradient text-slate-100 flex flex-col font-sans">
      {/* Header Navigation */}
      <header className="w-full glass-panel border-b border-slate-800/80 px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              StudyCraft AI
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">AI Notetaker & Study Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition-all hover:bg-slate-800"
          >
            Log In
          </button>

          <button
            onClick={() => onOpenAuth('signup')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
          >
            Sign Up Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 lg:py-20 space-y-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Main Landing Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-widest uppercase animate-pulse-glow">
            <Zap className="size-3.5 text-amber-400" />
            <span>Record · Transcribe · Revise</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Turn Lectures & Meetings into{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              High-Grade Study Materials
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Record live Zoom sessions, Google Meet calls, and lectures, or upload audio/video files. Get timestamped transcripts, structured study guides, 3D flashcards, and practice quizzes instantly.
          </p>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-5" />
            </button>

            <button
              onClick={onEnterDemo}
              className="px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all hover:border-slate-500"
            >
              <Play className="size-4 text-indigo-400 fill-current" />
              <span>Explore Live Studio Demo</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" /> Unlimited Meeting Duration
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" /> Audio & Video Uploads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" /> Spaced Repetition 3D Cards
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 hover:border-indigo-500/50 transition-all">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 w-fit border border-blue-500/30">
              <Mic className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Record & Transcribe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record unlimited Zoom, Google Meet, or live lectures with real-time audio waveform animation and timestamped transcripts.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 hover:border-purple-500/50 transition-all">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 w-fit border border-purple-500/30">
              <Layers className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Auto 3D Flashcards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI generates 3D flip card decks automatically with spaced repetition scoring ("Got It Right!" vs "Needs Review") to maximize long-term retention.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit border border-emerald-500/30">
              <BrainCircuit className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Practice Quiz & Revise</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test your mastery with AI-generated multiple choice practice quizzes featuring hints, answer explanations, and score tracking.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 StudyCraft AI Notetaker. Built for students, researchers, and lifelong learners. All rights reserved.</p>
      </footer>
    </div>
  );
};

import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Moon, 
  Sun, 
  Settings, 
  BookOpen,
  Zap,
  User,
  LogOut
} from 'lucide-react';
import type { UserSettings } from '../types';

interface NavbarProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onOpenSettings: () => void;
  studyStreakDays?: number;
  totalCardsMastered?: number;
  currentUser?: any;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  studyStreakDays = 5,
  totalCardsMastered = 42,
  currentUser,
  onLogout
}) => {
  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: newTheme });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/30 text-white font-bold animate-pulse-glow">
          <Sparkles className="size-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              StudyCraft AI
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.5 PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">AI Note & Study Guide Studio</p>
        </div>
      </div>

      {/* Center Stats Bar */}
      <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold" title="Current Daily Study Streak">
          <Flame className="size-4 fill-amber-400 text-amber-500 animate-bounce" />
          <span>{studyStreakDays} Day Streak</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold" title="Total Flashcards Mastered">
          <Zap className="size-4 text-emerald-400" />
          <span>{totalCardsMastered} Cards Mastered</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-purple-300 font-medium">
          <BookOpen className="size-4 text-purple-400" />
          <span>Engine: {settings.aiProvider === 'built-in' ? 'Smart Local Engine' : settings.aiProvider.toUpperCase()}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200">
            <User className="size-3.5 text-indigo-400" />
            <span className="font-semibold max-w-[120px] truncate">{currentUser.email || 'Student'}</span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50"
          title="Toggle Theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="size-4 text-amber-400" />
          ) : (
            <Moon className="size-4 text-indigo-400" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50"
          title="Settings & API Key"
        >
          <Settings className="size-4 text-slate-300" />
        </button>

        {currentUser && onLogout && (
          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-900/50 transition-all"
            title="Log Out"
          >
            <LogOut className="size-4" />
          </button>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Sparkles, 
  Check, 
  Clock, 
  ShieldCheck, 
  Trash2 
} from 'lucide-react';
import type { UserSettings } from '../types';

interface SettingsModalProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClose: () => void;
  onResetData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onResetData
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [provider, setProvider] = useState<'built-in' | 'openai' | 'gemini'>(settings.aiProvider);
  const [theme] = useState<'dark' | 'light'>(settings.theme);
  const [studyGoal, setStudyGoal] = useState(settings.studyGoalMinutesPerDay);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      apiKey,
      aiProvider: provider,
      theme,
      studyGoalMinutesPerDay: studyGoal
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">StudyCraft Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-4 text-purple-400" /> AI Generation Engine
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('built-in')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  provider === 'built-in'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Built-In Engine
              </button>

              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  provider === 'gemini'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Google Gemini
              </button>

              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  provider === 'openai'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                OpenAI GPT-4
              </button>
            </div>
          </div>

          {/* API Key Input */}
          {provider !== 'built-in' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="size-4 text-amber-400" /> API Key ({provider.toUpperCase()})
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider} API key here...`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" /> Keys are saved locally in your browser storage.
              </p>
            </div>
          )}

          {/* Daily Study Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="size-4 text-emerald-400" /> Daily Study Goal (Minutes)
            </label>
            <input
              type="number"
              min={10}
              max={300}
              step={5}
              value={studyGoal}
              onChange={(e) => setStudyGoal(parseInt(e.target.value) || 30)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {onResetData && (
              <button
                type="button"
                onClick={onResetData}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="size-3.5" /> Reset All Data
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {saved ? <Check className="size-4 text-emerald-400" /> : null}
                <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

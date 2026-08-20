import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Flame, 
  CloudRain, 
  Trees, 
  Moon,
  Coffee,
  Waves
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface FocusTimerProps {
  onSessionComplete?: (minutes: number) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const [workDurationMinutes, setWorkDurationMinutes] = useState(25);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);

  const getModeTime = (targetMode: 'work' | 'shortBreak' | 'longBreak', workMins: number) => {
    if (targetMode === 'work') return workMins * 60;
    if (targetMode === 'shortBreak') return 5 * 60;
    return 15 * 60;
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === 'work' && onSessionComplete) {
              onSessionComplete(workDurationMinutes);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, workDurationMinutes, onSessionComplete]);

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setTimeLeft(getModeTime(newMode, workDurationMinutes));
    setIsRunning(false);
  };

  const handleWorkDurationChange = (mins: number) => {
    setWorkDurationMinutes(mins);
    if (mode === 'work') {
      setTimeLeft(mins * 60);
    }
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getModeTime(mode, workDurationMinutes));
  };

  const handleToggleSound = (soundType: string) => {
    if (activeSound === soundType) {
      soundService.stopAll();
      setActiveSound(null);
    } else {
      soundService.stopAll();
      soundService.playSound(soundType, volume);
      setActiveSound(soundType);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (activeSound) {
      soundService.setVolume(activeSound, newVol);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const maxTime = getModeTime(mode, workDurationMinutes);
  const progressPercent = Math.round(((maxTime - timeLeft) / maxTime) * 100);

  const sounds = [
    { id: 'rain', label: 'Rain Shower', icon: CloudRain, color: 'text-blue-400' },
    { id: 'space', label: 'Deep Space Drone', icon: Moon, color: 'text-purple-400' },
    { id: 'forest', label: 'Forest Wind', icon: Trees, color: 'text-emerald-400' },
    { id: 'coffee', label: 'Coffee Shop Chatter', icon: Coffee, color: 'text-amber-400' },
    { id: 'waves', label: 'Ocean Waves', icon: Waves, color: 'text-teal-400' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Flame className="size-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pomodoro Study & Soundscapes</h2>
            <p className="text-xs text-slate-400">
              Custom deep focus intervals & Web Audio procedural ambient soundscapes
            </p>
          </div>
        </div>

        {/* Custom Duration Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-bold px-2">Work Duration:</span>
          {[15, 25, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => handleWorkDurationChange(mins)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                workDurationMinutes === mins ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="glass-panel p-8 rounded-2xl text-center space-y-6">
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 gap-1">
          <button
            onClick={() => switchMode('work')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'work' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🧠 Deep Work ({workDurationMinutes}m)
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ☕ Short Break (5m)
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'longBreak' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌴 Long Break (15m)
          </button>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative size-64 mx-auto my-4 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`${
                mode === 'work' ? 'text-indigo-500' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-purple-500'
              } stroke-current transition-all duration-1000`}
              strokeWidth="6"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl font-extrabold font-mono tracking-tight text-white">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-slate-400 capitalize">
              {mode === 'work' ? 'Focus Session' : 'Rest Break'}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Reset Timer"
          >
            <RotateCcw className="size-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="size-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="size-5 fill-current ml-0.5" />
                <span>Start Focus Session</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ambient Soundscapes Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="size-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Ambient Soundscapes Generator</h3>
          </div>
          <span className="text-xs text-slate-400">Web Audio Synthesis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {sounds.map((sound) => {
            const Icon = sound.icon;
            const isSelected = activeSound === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handleToggleSound(sound.id)}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Icon className="size-5" />
                </div>
                <span className="text-xs font-bold text-center">{sound.label}</span>
              </button>
            );
          })}
        </div>

        {/* Volume Slider */}
        {activeSound && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 animate-fade-in">
            <Volume2 className="size-4 text-indigo-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs font-bold text-slate-300 w-10 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

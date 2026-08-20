import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Search, 
  Volume2, 
  FileText, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

export interface TimestampChunk {
  timestamp: string; // e.g. "00:15"
  seconds: number;   // e.g. 15
  speaker?: string;  // e.g. "Speaker 1"
  text: string;      // e.g. "Welcome to the lecture."
}

interface TimestampedTranscriptViewerProps {
  mediaUrl?: string;
  mediaType?: 'audio' | 'video';
  chunks?: TimestampChunk[];
  rawTranscript?: string;
  onGenerateNotesFromTimestamped?: (fullText: string) => void;
}

export const TimestampedTranscriptViewer: React.FC<TimestampedTranscriptViewerProps> = ({
  mediaUrl,
  mediaType = 'audio',
  chunks,
  rawTranscript,
  onGenerateNotesFromTimestamped
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const mediaRef = useRef<HTMLMediaElement | null>(null);

  const displayChunks: TimestampChunk[] = chunks && chunks.length > 0
    ? chunks
    : (rawTranscript || '').split('\n').filter(Boolean).map((line, idx) => {
        const timeMatch = line.match(/\[(\d{2}:\d{2}(?::\d{2})?)\]/);
        const timeStr = timeMatch ? timeMatch[1] : `0${Math.floor(idx * 30 / 60)}:${(idx * 30 % 60).toString().padStart(2, '0')}`;
        const parts = timeStr.split(':').map(Number);
        const secs = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
        
        return {
          timestamp: timeStr,
          seconds: secs,
          speaker: idx % 2 === 0 ? 'Professor / Lecturer' : 'Student / Speaker',
          text: line.replace(/\[\d{2}:\d{2}(?::\d{2})?\]/, '').trim() || line
        };
      });

  const filteredChunks = displayChunks.filter(c => 
    c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.speaker && c.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || 0);
    }
  };

  const handleJumpToTimestamp = (targetSecs: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = targetSecs;
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCopyTranscript = () => {
    const fullText = displayChunks.map(c => `[${c.timestamp}] ${c.speaker ? c.speaker + ': ' : ''}${c.text}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Clock className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Timestamped Transcript Studio</h2>
            <p className="text-xs text-slate-400">
              Interactive sentence timestamps synchronized with audio/video media playback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTranscript}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            <span>{copied ? 'Copied!' : 'Copy Transcript'}</span>
          </button>

          {onGenerateNotesFromTimestamped && (
            <button
              onClick={() => onGenerateNotesFromTimestamped(displayChunks.map(c => c.text).join(' '))}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="size-4" />
              <span>Generate AI Notes from Transcript</span>
            </button>
          )}
        </div>
      </div>

      {/* HTML5 Synchronized Media Player (Audio/Video) */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-bold text-slate-200">
            <Volume2 className="size-4 text-indigo-400" /> Sync Media Player ({mediaType.toUpperCase()})
          </span>
          <span className="font-mono">{formatSeconds(currentTime)} / {formatSeconds(duration)}</span>
        </div>

        {mediaType === 'video' && mediaUrl ? (
          <video
            ref={mediaRef as any}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            controls
            className="w-full max-h-64 rounded-xl bg-black"
          />
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="size-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0"
            >
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (mediaRef.current) mediaRef.current.currentTime = val;
                  setCurrentTime(val);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <audio
              ref={mediaRef as any}
              src={mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Timestamped Chunks Transcript View */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Timestamped Sentence Blocks ({filteredChunks.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
          {filteredChunks.map((chunk, idx) => {
            const isActive = currentTime >= chunk.seconds && (idx === filteredChunks.length - 1 || currentTime < filteredChunks[idx + 1].seconds);

            return (
              <div
                key={idx}
                onClick={() => handleJumpToTimestamp(chunk.seconds)}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border shrink-0 flex items-center gap-1 transition-colors ${
                    isActive ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  <Clock className="size-3" />
                  <span>{chunk.timestamp}</span>
                </button>

                <div className="space-y-0.5">
                  {chunk.speaker && (
                    <span className="text-[11px] font-bold text-indigo-300 block">{chunk.speaker}</span>
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed">{chunk.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

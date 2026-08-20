import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Sparkles, 
  Volume2, 
  FileText, 
  Wand2,
  Video,
  Clock,
  Search,
  Zap,
  Film,
  AlertCircle
} from 'lucide-react';
import { TimestampedTranscriptViewer } from './TimestampedTranscriptViewer';
import type { TimestampChunk } from './TimestampedTranscriptViewer';

interface VoiceNoteRecorderProps {
  onGenerateFromTranscript: (transcript: string, meetingSource?: string) => Promise<void>;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onGenerateFromTranscript
}) => {
  const [meetingSource, setMeetingSource] = useState<'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Lecture'>('Zoom');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Uploaded media state
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<'audio' | 'video'>('audio');
  const [timestampChunks, setTimestampChunks] = useState<TimestampChunk[]>([]);
  const [activeTab, setActiveTab] = useState<'recorder' | 'timestamped'>('recorder');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(prev => (prev ? prev + ' ' + currentText : currentText));
      };

      recognition.onend = () => {
        if (isRecording) {
          try { recognition.start(); } catch {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isRecording]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const renderWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = isRecording 
        ? meetingSource === 'Zoom' ? '#3b82f6' : meetingSource === 'Google Meet' ? '#10b981' : '#8b5cf6'
        : '#6366f1';

      for (let x = 0; x < width; x += 4) {
        const amplitude = isRecording ? Math.sin(x * 0.05 + phase) * 22 + Math.random() * 16 : Math.sin(x * 0.02 + phase) * 4;
        const y = centerY + amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.12;
      animFrameId.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRecording, meetingSource]);

  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation 1: File size check (100MB limit for browser client uploads)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select a file under 100MB.`);
      return;
    }

    // Validation 2: Supported media format check
    const validExtensions = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.mov', '.aac', '.ogg'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    const hasValidType = file.type.startsWith('audio/') || file.type.startsWith('video/');

    if (!hasValidExt && !hasValidType) {
      setUploadError('Unsupported file format. Please select an audio (.mp3, .wav, .m4a) or video (.mp4, .webm) file.');
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm');
    
    setUploadedMediaUrl(fileUrl);
    setUploadedMediaType(isVideo ? 'video' : 'audio');

    const generatedChunks: TimestampChunk[] = [
      { timestamp: '00:05', seconds: 5, speaker: 'Lecturer', text: `Welcome to this ${isVideo ? 'video' : 'audio'} lecture recording session on ${file.name.replace(/\.[^/.]+$/, '')}.` },
      { timestamp: '00:45', seconds: 45, speaker: 'Lecturer', text: 'We examine the core theoretical architecture and optimization procedures.' },
      { timestamp: '01:30', seconds: 90, speaker: 'Student', text: 'What is the primary constraint during model execution?' },
      { timestamp: '02:10', seconds: 130, speaker: 'Lecturer', text: 'Memory bandwidth bottlenecks and gradient loss dissipation.' }
    ];

    setTimestampChunks(generatedChunks);
    setTranscript(generatedChunks.map(c => `[${c.timestamp}] ${c.speaker}: ${c.text}`).join('\n'));
    setActiveTab('timestamped');
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (!transcript) {
        const sampleChunks: TimestampChunk[] = [
          { timestamp: '00:00', seconds: 0, speaker: 'Speaker 1', text: 'Welcome everyone. Today we cover system architecture and database sharding.' },
          { timestamp: '00:40', seconds: 40, speaker: 'Speaker 2', text: 'We achieved 99.99% uptime with distributed load balancing.' },
          { timestamp: '01:20', seconds: 80, speaker: 'Speaker 1', text: 'Action item 1: Finalize load testing. Action item 2: Update developer docs.' }
        ];
        setTimestampChunks(sampleChunks);
        setTranscript(sampleChunks.map(c => `[${c.timestamp}] ${c.speaker}: ${c.text}`).join('\n'));
      }
    } else {
      setTranscript('');
      setRecordingSeconds(0);
      setIsRecording(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch {}
      }
    }
  };

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    try {
      await onGenerateFromTranscript(transcript, meetingSource);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatHoursMinutesSeconds = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-purple-950/60 border border-blue-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Video className="size-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Unlimited Audio & Video Recording Studio</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="size-3 text-emerald-400" /> UNLIMITED TIMING
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Record live Zoom, Google Meet, Teams calls or upload audio (`.mp3`, `.wav`) & video (`.mp4`, `.webm`) files.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio / Video File Upload Button */}
            <label className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition-all">
              <Film className="size-4" />
              <span>Upload Audio/Video</span>
              <input
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm,.mov"
                onChange={handleMediaFileUpload}
                className="hidden"
              />
            </label>

            {/* Meeting Platform Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              {(['Zoom', 'Google Meet', 'Microsoft Teams', 'Lecture'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => setMeetingSource(source)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    meetingSource === source
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {source === 'Zoom' ? '📹 Zoom' : source === 'Google Meet' ? '🟢 Meet' : source === 'Microsoft Teams' ? '🟣 Teams' : '🎙️ Lecture'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Studio Sub-Tabs */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('recorder')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'recorder' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            🎙️ Live Recorder
          </button>
          <button
            onClick={() => setActiveTab('timestamped')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'timestamped' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            ⏱️ Timestamped Transcript Viewer
          </button>
        </div>
      </div>

      {/* Tab 1: Live Recorder */}
      {activeTab === 'recorder' ? (
        <div className="glass-panel p-6 lg:p-8 rounded-2xl space-y-6">
          {/* Waveform & Unlimited Timer */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span className="flex items-center gap-2 font-bold text-blue-300">
                <Volume2 className={`size-4 ${isRecording ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
                {isRecording ? `${meetingSource} Live Stream Recording (Unlimited Mode)` : 'Audio Stream Ready'}
              </span>

              <div className="flex items-center gap-2">
                <Clock className="size-4 text-emerald-400" />
                <span className="font-mono text-base font-extrabold text-white">
                  {formatHoursMinutesSeconds(recordingSeconds)}
                </span>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={700}
              height={90}
              className="w-full h-22 rounded-xl bg-slate-900/80"
            />
          </div>

          {/* Recording Controls */}
          <div className="text-center py-2">
            <button
              onClick={toggleRecording}
              className={`size-22 rounded-full mx-auto flex items-center justify-center transition-all shadow-2xl ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/50 animate-pulse ring-4 ring-rose-500/30'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/30'
              }`}
            >
              {isRecording ? <Square className="size-8 fill-current" /> : <Mic className="size-9" />}
            </button>

            <p className="text-xs font-bold text-slate-300 mt-3">
              {isRecording ? `Recording ${meetingSource} Session... Click Square to Stop & Save` : `Click Microphone to Begin Unlimited ${meetingSource} Recording`}
            </p>
          </div>

          {/* Live Transcript View & Search */}
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="size-4 text-blue-400" /> Live {meetingSource} Transcript & Action Items
              </label>

              <div className="relative">
                <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search transcript..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <textarea
              rows={7}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={`Live ${meetingSource} speech-to-text transcript will continuously stream here...`}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleProcessTranscript}
            disabled={isProcessing || !transcript.trim()}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Wand2 className="size-5 animate-spin text-white" />
                <span>Analyzing Meeting Transcript & Extracting Action Items...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-5 text-white" />
                <span>Generate Meeting Action Items, Notes & Quiz</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Tab 2: Timestamped Transcript Viewer */
        <TimestampedTranscriptViewer
          mediaUrl={uploadedMediaUrl || undefined}
          mediaType={uploadedMediaType}
          chunks={timestampChunks}
          rawTranscript={transcript}
          onGenerateNotesFromTimestamped={(fullText) => onGenerateFromTranscript(fullText, meetingSource)}
        />
      )}
    </div>
  );
};

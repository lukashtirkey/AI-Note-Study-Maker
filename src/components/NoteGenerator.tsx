import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Layers, 
  BrainCircuit, 
  GitFork, 
  CheckCircle2, 
  Wand2, 
  BookOpen,
  Copy,
  Check,
  Tag,
  Upload,
  FileCode,
  CheckSquare
} from 'lucide-react';
import type { StudyNote, NavigationTab } from '../types';
import { exportNoteToPDF } from '../services/pdfExport';

interface NoteGeneratorProps {
  currentNote: StudyNote | null;
  onGenerateNote: (title: string, rawInput: string, subject: string) => Promise<void>;
  onSelectTab: (tab: NavigationTab) => void;
}

export const NoteGenerator: React.FC<NoteGeneratorProps> = ({
  currentNote,
  onGenerateNote,
  onSelectTab
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const presetTopics = [
    { title: 'Transformers & Self-Attention', subject: 'Computer Science', text: 'Transformer architectures rely on multi-head self-attention mechanisms to calculate relational dependencies between token sequences in parallel.' },
    { title: 'Synaptic Plasticity & LTP', subject: 'Neuroscience', text: 'Long-Term Potentiation (LTP) persistent strengthening of synapses based on high-frequency stimulation involving NMDA receptors and Ca2+ influx.' },
    { title: 'Nucleophilic Substitution SN1/SN2', subject: 'Chemistry', text: 'SN1 reaction is unimolecular proceeding via carbocation intermediate; SN2 is bimolecular concerted with Walden inversion of stereochemistry.' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setRawInput(text);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim() && !title.trim()) return;

    setIsGenerating(true);
    try {
      await onGenerateNote(title || subject, rawInput, subject);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreset = (preset: { title: string; subject: string; text: string }) => {
    setTitle(preset.title);
    setSubject(preset.subject);
    setRawInput(preset.text);
  };

  const handleCopyText = () => {
    if (!currentNote) return;
    const textToCopy = `# ${currentNote.title}\n\n## Summary\n${currentNote.summary}\n\n## Key Takeaways\n${currentNote.bulletPoints.map(b => `- ${b}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    if (!currentNote) return;
    const blob = new Blob([JSON.stringify(currentNote, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_study_note.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">AI Study Guide & Note Generator</h2>
            </div>
            <p className="text-sm text-slate-300">
              Transform raw text, lecture transcripts, or files into structured summaries, key term glossaries, 3D flashcard decks, and practice quizzes.
            </p>
          </div>

          {/* File Upload Button */}
          <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer shadow-md transition-all">
            <Upload className="size-4 text-indigo-400" />
            <span>Upload File (.txt, .md)</span>
            <input
              type="file"
              accept=".txt,.md,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Quick Presets:</span>
          {presetTopics.map((pt, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(pt)}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-indigo-600/40 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
            >
              ⚡ {pt.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Topic or Note Title
            </label>
            <input
              type="text"
              placeholder="e.g. Neural Networks & Transformer Attention"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Subject Category
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Biology & Neuroscience">Biology & Neuroscience</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="History">History</option>
              <option value="General">General Study</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Raw Study Content / Lecture Notes / Topic Details
          </label>
          <textarea
            rows={5}
            placeholder="Paste your raw notes, chapter text, or lecture transcript here..."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || (!rawInput.trim() && !title.trim())}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Wand2 className="size-5 animate-spin text-white" />
              <span>Analyzing & Synthesizing AI Study Guide...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-5 text-white" />
              <span>Generate AI Note, Flashcards & Quiz</span>
            </>
          )}
        </button>
      </form>

      {/* Render Generated Study Guide */}
      {currentNote && (
        <div className="glass-panel p-6 lg:p-8 rounded-2xl space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentNote.subject}
                </span>
                <span className="text-xs text-slate-400">Created: {currentNote.createdAt}</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-1">{currentNote.title}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <FileCode className="size-4 text-purple-400" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => exportNoteToPDF(currentNote)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
              >
                <Download className="size-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="p-5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="size-4 text-indigo-400" />
              Executive Summary
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {currentNote.summary}
            </p>
          </div>

          {/* Action Items (if meeting note) */}
          {currentNote.actionItems && currentNote.actionItems.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2">
              <h4 className="text-sm font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="size-4 text-blue-400" /> Meeting Action Items
              </h4>
              <ul className="space-y-1 text-xs text-slate-200">
                {currentNote.actionItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-blue-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bullet Takeaways */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              Core Takeaways & Rules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentNote.bulletPoints.map((point, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <span className="size-6 shrink-0 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Glossary Terms */}
          {currentNote.keyTerms && currentNote.keyTerms.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Tag className="size-4 text-purple-400" />
                Key Terms & Definitions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentNote.keyTerms.map((kt, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <p className="text-xs font-bold text-purple-300">{kt.term}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{kt.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Jump Buttons */}
          <div className="pt-4 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-400">Transform this note into interactive study modules:</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('flashcards')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <Layers className="size-4" />
                <span>Study 3D Flashcards</span>
              </button>

              <button
                onClick={() => onSelectTab('quiz')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <BrainCircuit className="size-4" />
                <span>Take Practice Quiz</span>
              </button>

              <button
                onClick={() => onSelectTab('concept-map')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <GitFork className="size-4" />
                <span>View Concept Map</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

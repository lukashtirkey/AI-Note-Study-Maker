export type NavigationTab = 
  | 'notes' 
  | 'flashcards' 
  | 'quiz' 
  | 'concept-map' 
  | 'voice-notes' 
  | 'timer' 
  | 'library';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  masteryScore?: number; // 0 to 100
  timesReviewed?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
  hint?: string;
}

export interface QuizResult {
  quizId: string;
  deckTitle: string;
  score: number;
  totalQuestions: number;
  date: string;
  answers: { questionId: string; selectedOption: number; isCorrect: boolean }[];
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  color?: string;
  children?: MindMapNode[];
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  rawInput: string;
  summary: string;
  bulletPoints: string[];
  actionItems?: string[]; // Meeting action items
  keyTerms: { term: string; definition: string }[];
  tags: string[];
  createdAt: string;
  meetingSource?: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Lecture' | 'General';
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  mindMap?: MindMapNode;
}

export interface StudyDeck {
  id: string;
  title: string;
  subject: string;
  description: string;
  icon: string;
  color: string;
  notes: StudyNote[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  mindMap: MindMapNode;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  type: 'rain' | 'lofi' | 'coffee' | 'forest' | 'space' | 'waves';
  volume: number;
  isPlaying: boolean;
}

export interface UserSettings {
  apiKey?: string;
  aiProvider: 'built-in' | 'openai' | 'gemini';
  theme: 'dark' | 'light';
  autoSave: boolean;
  studyGoalMinutesPerDay: number;
}

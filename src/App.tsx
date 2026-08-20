import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NoteGenerator } from './components/NoteGenerator';
import { FlashcardStudio } from './components/FlashcardStudio';
import { QuizArena } from './components/QuizArena';
import { ConceptVisualizer } from './components/ConceptVisualizer';
import { VoiceNoteRecorder } from './components/VoiceNoteRecorder';
import { FocusTimer } from './components/FocusTimer';
import { StudyLibrary } from './components/StudyLibrary';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';

import type { NavigationTab, StudyDeck, StudyNote, UserSettings, Flashcard } from './types';
import { PRESET_DECKS } from './data/presetDecks';
import { aiService } from './services/aiService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { supabaseDataService } from './services/supabaseDataService';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [decks, setDecks] = useState<StudyDeck[]>(() => {
    const saved = localStorage.getItem('studycraft_decks');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return PRESET_DECKS;
  });

  const [activeDeckId, setActiveDeckId] = useState<string>(() => decks[0]?.id || 'deck-ml-101');
  const [activeTab, setActiveTab] = useState<NavigationTab>('notes');
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('studycraft_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      aiProvider: 'built-in',
      theme: 'dark',
      autoSave: true,
      studyGoalMinutesPerDay: 30
    };
  });

  const loadUserCloudSessions = async (_userId: string) => {
    const cloudDecks = await supabaseDataService.fetchUserSessions();
    if (cloudDecks && cloudDecks.length > 0) {
      setDecks(cloudDecks);
      setActiveDeckId(cloudDecks[0].id);
    }
  };

  // Listen to Supabase Auth State & Fetch User Sessions from Database
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setViewMode('workspace');
        loadUserCloudSessions(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setViewMode('workspace');
        loadUserCloudSessions(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('studycraft_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('studycraft_settings', JSON.stringify(settings));
    document.documentElement.className = settings.theme;
  }, [settings]);

  const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0] || PRESET_DECKS[0];
  const currentNote = activeDeck?.notes[0] || null;

  const handleGenerateNote = async (title: string, rawInput: string, subject: string, meetingSource?: string) => {
    const newNote: StudyNote = await aiService.generateNote(title, rawInput, subject);
    if (meetingSource) {
      newNote.meetingSource = meetingSource as any;
      newNote.actionItems = [
        `Action Item 1: Review ${title} key takeaways with team members.`,
        `Action Item 2: Finalize technical deliverables and documentation before deployment.`,
        `Action Item 3: Schedule follow-up sync to review quiz performance metrics.`
      ];
    }
    
    // Save to Supabase DB if user is authenticated
    if (currentUser) {
      await supabaseDataService.saveStudySession(newNote, currentUser.id);
    }

    const existingDeckIdx = decks.findIndex(d => d.subject.toLowerCase() === subject.toLowerCase());
    
    if (existingDeckIdx >= 0) {
      const updatedDecks = [...decks];
      const targetDeck = updatedDecks[existingDeckIdx];
      targetDeck.notes.unshift(newNote);
      if (newNote.flashcards) targetDeck.flashcards.unshift(...newNote.flashcards);
      if (newNote.quiz) targetDeck.quiz.unshift(...newNote.quiz);
      if (newNote.mindMap) targetDeck.mindMap = newNote.mindMap;
      setDecks(updatedDecks);
      setActiveDeckId(targetDeck.id);
    } else {
      const newDeck: StudyDeck = {
        id: `deck-${Date.now()}`,
        title: newNote.title,
        subject: newNote.subject,
        description: newNote.summary,
        icon: 'BookOpen',
        color: 'from-indigo-600 to-purple-600',
        notes: [newNote],
        flashcards: newNote.flashcards || [],
        quiz: newNote.quiz || [],
        mindMap: newNote.mindMap || { id: 'mm-new', label: newNote.title, description: newNote.summary }
      };
      setDecks(prev => [newDeck, ...prev]);
      setActiveDeckId(newDeck.id);
    }
  };

  const handleUpdateCardMastery = (cardId: string, isCorrect: boolean) => {
    setDecks(prev =>
      prev.map(deck => {
        if (deck.id !== activeDeck.id) return deck;
        return {
          ...deck,
          flashcards: deck.flashcards.map(card => {
            if (card.id !== cardId) return card;
            const currentScore = card.masteryScore || 50;
            return {
              ...card,
              masteryScore: Math.min(100, Math.max(0, currentScore + (isCorrect ? 15 : -10))),
              timesReviewed: (card.timesReviewed || 0) + 1
            };
          })
        };
      })
    );
  };

  const handleAddFlashcard = (newCard: Flashcard) => {
    setDecks(prev =>
      prev.map(deck => {
        if (deck.id !== activeDeck.id) return deck;
        return {
          ...deck,
          flashcards: [newCard, ...deck.flashcards]
        };
      })
    );
  };

  const handleDeleteDeck = async (id: string) => {
    if (currentUser) {
      await supabaseDataService.deleteStudySession(id);
    }
    setDecks(prev => prev.filter(d => d.id !== id));
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setViewMode('landing');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all custom study decks to default presets?')) {
      setDecks(PRESET_DECKS);
      setActiveDeckId(PRESET_DECKS[0].id);
      localStorage.removeItem('studycraft_decks');
      setShowSettings(false);
    }
  };

  const totalMastered = decks.reduce(
    (sum, d) => sum + d.flashcards.filter(c => (c.masteryScore || 0) >= 80).length,
    0
  );

  if (viewMode === 'landing' && !currentUser) {
    return (
      <>
        <LandingPage
          onOpenAuth={() => setAuthModalOpen(true)}
          onEnterDemo={() => setViewMode('workspace')}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(usr) => {
            setCurrentUser(usr);
            setViewMode('workspace');
          }}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 ${settings.theme}`}>
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onUpdateSettings={setSettings}
        onOpenSettings={() => setShowSettings(true)}
        studyStreakDays={5}
        totalCardsMastered={totalMastered}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeDeckTitle={activeDeck?.title}
        />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === 'notes' && (
            <NoteGenerator
              currentNote={currentNote}
              onGenerateNote={(t, r, s) => handleGenerateNote(t, r, s)}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardStudio
              activeDeck={activeDeck}
              onUpdateFlashcardMastery={handleUpdateCardMastery}
              onAddFlashcard={handleAddFlashcard}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizArena
              activeDeck={activeDeck}
            />
          )}

          {activeTab === 'concept-map' && (
            <ConceptVisualizer
              activeDeck={activeDeck}
            />
          )}

          {activeTab === 'voice-notes' && (
            <VoiceNoteRecorder
              onGenerateFromTranscript={(t, src) => handleGenerateNote(`${src || 'Meeting'} Transcript Notes`, t, `${src || 'Meeting'} Session`, src)}
            />
          )}

          {activeTab === 'timer' && (
            <FocusTimer />
          )}

          {activeTab === 'library' && (
            <StudyLibrary
              decks={decks}
              activeDeckId={activeDeckId}
              onSelectDeck={(id) => {
                setActiveDeckId(id);
                setActiveTab('flashcards');
              }}
              onDeleteDeck={handleDeleteDeck}
            />
          )}
        </main>
      </div>

      {/* Settings & API Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSaveSettings={setSettings}
          onClose={() => setShowSettings(false)}
          onResetData={handleResetData}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(usr) => {
          setCurrentUser(usr);
          setViewMode('workspace');
        }}
      />
    </div>
  );
}

export default App;

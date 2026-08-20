import type { Flashcard, MindMapNode, QuizQuestion, StudyNote, UserSettings } from '../types';

export class AIService {
  private settings: UserSettings;

  constructor(settings?: UserSettings) {
    this.settings = settings || {
      aiProvider: 'built-in',
      theme: 'dark',
      autoSave: true,
      studyGoalMinutesPerDay: 30
    };
  }

  public updateSettings(settings: UserSettings) {
    this.settings = settings;
  }

  public getSettings(): UserSettings {
    return this.settings;
  }

  /**
   * Generates a complete study note using Netlify Serverless Functions -> Gemini/OpenAI API -> Built-In Fallback
   */
  public async generateNote(title: string, rawInput: string, subject: string): Promise<StudyNote> {
    // 1. Try Netlify Serverless Function endpoint first
    try {
      const serverlessRes = await fetch('/.netlify/functions/generate-study-material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, rawInput, subject })
      });

      if (serverlessRes.ok) {
        const data = await serverlessRes.json();
        if (data.status === 'success' || data.status === 'success_heuristic') {
          const noteId = `note-${Date.now()}`;
          const mindMap = await this.generateMindMap(title || subject, rawInput);
          
          return {
            id: noteId,
            title: title.trim() || `Study Notes - ${subject || 'General'}`,
            subject: subject || 'General Knowledge',
            rawInput,
            summary: data.summary || 'Summary unavailable.',
            bulletPoints: data.bulletPoints || [],
            keyTerms: data.keyTerms || [],
            tags: [subject.toLowerCase(), 'ai-generated'],
            createdAt: new Date().toISOString().split('T')[0],
            flashcards: (data.flashcards || []).map((f: any, i: number) => ({
              id: `fc-s-${Date.now()}-${i}`,
              front: f.front,
              back: f.back,
              category: f.category || subject,
              difficulty: f.difficulty || 'medium',
              masteryScore: 50,
              timesReviewed: 0
            })),
            quiz: (data.quiz || []).map((q: any, i: number) => ({
              id: `q-s-${Date.now()}-${i}`,
              question: q.question,
              options: q.options || ['A', 'B', 'C', 'D'],
              correctAnswer: q.correctAnswer || 0,
              explanation: q.explanation || '',
              hint: q.hint
            })),
            mindMap
          };
        }
      }
    } catch (err) {
      console.warn('Netlify serverless function call failed, attempting client engines:', err);
    }

    // 2. Client-side Gemini API fallback
    const provider = this.settings.aiProvider;
    const apiKey = this.settings.apiKey?.trim();

    if (provider === 'gemini' && apiKey) {
      try {
        const geminiResult = await this.callGeminiAPI(title, rawInput, subject, apiKey);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in engine:', err);
      }
    }

    // 3. Client-side OpenAI API fallback
    if (provider === 'openai' && apiKey) {
      try {
        const openAiResult = await this.callOpenAI(title, rawInput, subject, apiKey);
        if (openAiResult) return openAiResult;
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to built-in engine:', err);
      }
    }

    // 4. Built-in intelligent engine fallback
    await new Promise(resolve => setTimeout(resolve, 800));

    const cleanLines = rawInput.split('\n').filter(l => l.trim().length > 0);
    const summaryText = rawInput.length > 150 
      ? `This study guide analyzes ${subject || title}. ` + cleanLines.slice(0, 3).join(' ')
      : `Comprehensive study breakdown for ${title || subject}: Core theoretical frameworks, key mechanisms, and practical applications.`;

    const bulletPoints = cleanLines.length >= 3 
      ? cleanLines.slice(0, 6).map(line => line.length > 130 ? line.slice(0, 127) + '...' : line)
      : [
          `Primary Concept: ${title || 'Core Subject Matter'}`,
          `Fundamental Mechanism: Structure determines function and system stability.`,
          `Practical Application: Apply problem-solving routines to verify edge cases.`,
          `Spaced Review Strategy: Re-test memory retention over 24h, 3-day, and 7-day intervals.`
        ];

    const keyTerms: { term: string; definition: string }[] = [];
    const termMatches = rawInput.match(/([A-Z][a-zA-Z\s]{2,20})(?::|\s[-=]\s|\sis\s)/g);
    
    if (termMatches && termMatches.length > 0) {
      termMatches.slice(0, 5).forEach((match) => {
        const termStr = match.replace(/[:\-=\s]+$/, '').trim();
        keyTerms.push({
          term: termStr,
          definition: `Key concept in ${subject || 'this topic'} relating to ${termStr.toLowerCase()} properties.`
        });
      });
    }

    if (keyTerms.length === 0) {
      keyTerms.push(
        { term: title || 'Core Concept', definition: `The primary subject matter analyzed in this study session.` },
        { term: 'Fundamental Axiom', definition: 'The underlying rule governing the behavior of this domain.' },
        { term: 'Analytical Routine', definition: 'The systematic procedure used to evaluate and solve problems.' }
      );
    }

    const noteId = `note-${Date.now()}`;
    const generatedFlashcards = await this.generateFlashcards(rawInput || title, 5, subject);
    const generatedQuiz = await this.generateQuiz(rawInput || title, 4, subject);
    const generatedMindMap = await this.generateMindMap(title || subject, rawInput);

    return {
      id: noteId,
      title: title.trim() || `Study Notes - ${subject || 'General'}`,
      subject: subject || 'General Knowledge',
      rawInput,
      summary: summaryText,
      bulletPoints,
      keyTerms,
      tags: [subject.toLowerCase(), 'ai-generated', 'study-guide'].filter(Boolean),
      createdAt: new Date().toISOString().split('T')[0],
      flashcards: generatedFlashcards,
      quiz: generatedQuiz,
      mindMap: generatedMindMap
    };
  }

  private async callGeminiAPI(title: string, rawInput: string, subject: string, apiKey: string): Promise<StudyNote | null> {
    const prompt = `You are an expert AI study assistant. Generate a structured JSON study guide for topic "${title}" in subject "${subject}".
Input Content: "${rawInput.slice(0, 2000)}"

Return ONLY valid JSON matching this exact format:
{
  "summary": "High level summary string",
  "bulletPoints": ["point 1", "point 2", "point 3", "point 4"],
  "keyTerms": [{"term": "Term 1", "definition": "Def 1"}, {"term": "Term 2", "definition": "Def 2"}],
  "flashcards": [{"front": "Question", "back": "Answer", "category": "${subject}", "difficulty": "medium"}],
  "quiz": [{"question": "Q text", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Why correct", "hint": "Hint text"}]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const textResp = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = textResp.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      id: `note-gemini-${Date.now()}`,
      title: title || `Gemini Notes - ${subject}`,
      subject: subject || 'General',
      rawInput,
      summary: parsed.summary || 'Summary unavailable.',
      bulletPoints: parsed.bulletPoints || [],
      keyTerms: parsed.keyTerms || [],
      tags: [subject.toLowerCase(), 'gemini-ai'],
      createdAt: new Date().toISOString().split('T')[0],
      flashcards: (parsed.flashcards || []).map((f: any, i: number) => ({
        id: `fc-g-${Date.now()}-${i}`,
        front: f.front,
        back: f.back,
        category: f.category || subject,
        difficulty: f.difficulty || 'medium',
        masteryScore: 50,
        timesReviewed: 0
      })),
      quiz: (parsed.quiz || []).map((q: any, i: number) => ({
        id: `q-g-${Date.now()}-${i}`,
        question: q.question,
        options: q.options || ['A', 'B', 'C', 'D'],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || '',
        hint: q.hint
      })),
      mindMap: await this.generateMindMap(title || subject, rawInput)
    };
  }

  private async callOpenAI(title: string, rawInput: string, subject: string, apiKey: string): Promise<StudyNote | null> {
    const prompt = `Generate a structured JSON study guide for topic "${title}" in subject "${subject}". Input: "${rawInput.slice(0, 2000)}"`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an AI study guide maker. Output JSON with summary, bulletPoints, keyTerms, flashcards, quiz.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      id: `note-openai-${Date.now()}`,
      title: title || `OpenAI Notes - ${subject}`,
      subject: subject || 'General',
      rawInput,
      summary: parsed.summary || 'Summary unavailable.',
      bulletPoints: parsed.bulletPoints || [],
      keyTerms: parsed.keyTerms || [],
      tags: [subject.toLowerCase(), 'openai-gpt'],
      createdAt: new Date().toISOString().split('T')[0],
      flashcards: (parsed.flashcards || []).map((f: any, i: number) => ({
        id: `fc-o-${Date.now()}-${i}`,
        front: f.front,
        back: f.back,
        category: f.category || subject,
        difficulty: f.difficulty || 'medium',
        masteryScore: 50,
        timesReviewed: 0
      })),
      quiz: (parsed.quiz || []).map((q: any, i: number) => ({
        id: `q-o-${Date.now()}-${i}`,
        question: q.question,
        options: q.options || ['A', 'B', 'C', 'D'],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || '',
        hint: q.hint
      })),
      mindMap: await this.generateMindMap(title || subject, rawInput)
    };
  }

  public async generateFlashcards(inputContent: string, count: number = 5, subject: string = 'General'): Promise<Flashcard[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const sentences = inputContent.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 15);
    const flashcards: Flashcard[] = [];

    const topics = [
      { q: `What is the primary definition of the core concept in ${subject}?`, a: sentences[0] || `The fundamental principles of ${subject} focus on systematic analysis and application.` },
      { q: `What key rule governs the behavior described in this topic?`, a: sentences[1] || `Key rule: Structure determines function, and optimization reduces overall error.` },
      { q: `How do you apply these principles to solve complex problems?`, a: sentences[2] || `By breaking down the system into modular components and evaluating edge cases step-by-step.` },
      { q: `What is a common pitfall or misconception in this area?`, a: `Conflating correlation with causation, or ignoring baseline parameters in the initial condition.` },
      { q: `What is the recommended retention strategy for mastering this deck?`, a: `Utilize spaced repetition review with 3D flashcard self-testing every 48 hours.` }
    ];

    for (let i = 0; i < Math.min(count, topics.length); i++) {
      flashcards.push({
        id: `fc-gen-${Date.now()}-${i}`,
        front: topics[i].q,
        back: topics[i].a,
        category: subject,
        difficulty: i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy',
        masteryScore: 50,
        timesReviewed: 0
      });
    }

    return flashcards;
  }

  public async generateQuiz(inputContent: string, count: number = 4, subject: string = 'General'): Promise<QuizQuestion[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const cleanContent = inputContent.trim();

    return [
      {
        id: `quiz-gen-${Date.now()}-1`,
        question: `Which statement best describes the fundamental takeaway of ${subject}?`,
        options: [
          `It relies on systematic principles to optimize output and minimize error.`,
          `It is purely random and cannot be modeled mathematically.`,
          `It only applies to theoretical research without practical use.`,
          `It replaces all previous historical frameworks completely.`
        ],
        correctAnswer: 0,
        explanation: `Systematic modeling and structured optimization form the foundational backbone of ${subject}. (${cleanContent.length} chars analyzed)`,
        hint: `Look for the answer emphasizing systematic structure.`
      },
      {
        id: `quiz-gen-${Date.now()}-2`,
        question: `What is the first step when analyzing a problem in this domain?`,
        options: [
          `Skip data validation and jump directly to conclusions.`,
          `Deconstruct the input into core variables and baseline assumptions.`,
          `Guess the final answer based on intuition alone.`,
          `Delete all supporting documentation.`
        ],
        correctAnswer: 1,
        explanation: `Deconstructing complex problems into fundamental baseline variables ensures accuracy.`,
        hint: `Focus on initial structural decomposition.`
      },
      {
        id: `quiz-gen-${Date.now()}-3`,
        question: `Why is active recall superior to passive re-reading for long-term retention?`,
        options: [
          `It requires zero mental effort.`,
          `It strengthens neural synaptic pathways by forcing memory retrieval.`,
          `It reduces total study time to 5 seconds.`,
          `It changes the physical color of study notes.`
        ],
        correctAnswer: 1,
        explanation: `Active recall forces the brain to retrieve information from memory, driving synaptic plasticity and LTP.`,
        hint: `Think about synaptic memory consolidation.`
      },
      {
        id: `quiz-gen-${Date.now()}-4`,
        question: `How does spaced repetition optimize long-term memory consolidation?`,
        options: [
          `By cramming 10 hours before an exam.`,
          `By scheduling review sessions right as memory decay begins.`,
          `By sleeping 24 hours non-stop.`,
          `By ignoring hard flashcards completely.`
        ],
        correctAnswer: 1,
        explanation: `Reviewing material right before forgetting occurs reinforces memory traces in cortical networks.`,
        hint: `Think about timing reviews against memory decay curves.`
      }
    ].slice(0, count);
  }

  public async generateMindMap(title: string, inputContent: string): Promise<MindMapNode> {
    const cleanWords = inputContent.split(/\s+/).filter(w => w.length > 5);
    const subTopic1 = cleanWords[0] ? cleanWords[0].charAt(0).toUpperCase() + cleanWords[0].slice(1) : 'Theoretical Framework';
    const subTopic2 = cleanWords[2] ? cleanWords[2].charAt(0).toUpperCase() + cleanWords[2].slice(1) : 'Practical Applications';

    return {
      id: `mm-${Date.now()}`,
      label: title || 'Main Subject Overview',
      description: 'Core concepts & hierarchical structure',
      color: '#6366f1',
      children: [
        {
          id: `mm-sub-1`,
          label: subTopic1,
          description: 'Key principles and mathematical formulations',
          color: '#8b5cf6',
          children: [
            { id: `mm-sub-1-1`, label: 'Axioms & Rules', description: 'Fundamental baseline assumptions' },
            { id: `mm-sub-1-2`, label: 'Formulas & Equations', description: 'Quantitative expressions' }
          ]
        },
        {
          id: `mm-sub-2`,
          label: subTopic2,
          description: 'Real-world problem solving routines',
          color: '#ec4899',
          children: [
            { id: `mm-sub-2-1`, label: 'Empirical Studies', description: 'Case study evidence' },
            { id: `mm-sub-2-2`, label: 'System Optimization', description: 'Efficiency tuning & validation' }
          ]
        }
      ]
    };
  }
}

export const aiService = new AIService();

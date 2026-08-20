import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { StudyDeck, StudyNote } from '../types';

export class SupabaseDataService {
  /**
   * Fetch all study sessions owned by the authenticated user
   */
  public async fetchUserSessions(): Promise<StudyDeck[]> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Returning local study sessions.');
      return [];
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user sessions from Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Map DB study_sessions to StudyDeck format
      return data.map((row) => ({
        id: row.id,
        title: row.title,
        subject: row.subject,
        description: row.description || '',
        icon: 'BookOpen',
        color: 'from-indigo-600 to-purple-600',
        notes: [{
          id: `note-${row.id}`,
          title: row.title,
          subject: row.subject,
          rawInput: row.raw_transcript || '',
          summary: row.summary || '',
          bulletPoints: row.bullet_points || [],
          actionItems: row.action_items || [],
          keyTerms: row.key_terms || [],
          tags: [row.subject.toLowerCase()],
          createdAt: new Date(row.created_at).toISOString().split('T')[0],
          flashcards: row.flashcards || [],
          quiz: row.quiz || [],
          mindMap: row.mind_map || { id: `mm-${row.id}`, label: row.title }
        }],
        flashcards: row.flashcards || [],
        quiz: row.quiz || [],
        mindMap: row.mind_map || { id: `mm-${row.id}`, label: row.title }
      }));
    } catch (err) {
      console.error('Failed to fetch user sessions:', err);
      return [];
    }
  }

  /**
   * Save or update a study session in Supabase PostgreSQL DB
   */
  public async saveStudySession(note: StudyNote, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Session saved to localStorage.');
      return false;
    }

    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }

      if (!targetUserId) {
        console.warn('Cannot save to Supabase: User not authenticated.');
        return false;
      }

      const rowData = {
        id: note.id,
        user_id: targetUserId,
        title: note.title,
        subject: note.subject,
        description: note.summary,
        meeting_source: note.meetingSource || 'General',
        raw_transcript: note.rawInput,
        summary: note.summary,
        bullet_points: note.bulletPoints || [],
        action_items: note.actionItems || [],
        key_terms: note.keyTerms || [],
        flashcards: note.flashcards || [],
        quiz: note.quiz || [],
        mind_map: note.mindMap || {},
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('study_sessions')
        .upsert(rowData, { onConflict: 'id' });

      if (error) {
        console.error('Supabase study_sessions upsert error:', error);
        return false;
      }

      console.log('Successfully saved study session to Supabase PostgreSQL DB:', note.id);
      return true;
    } catch (err) {
      console.error('Error saving study session:', err);
      return false;
    }
  }

  /**
   * Delete a study session owned by the authenticated user
   */
  public async deleteStudySession(sessionId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting study session from Supabase:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  }

  /**
   * Upload an audio/video media file to Supabase Storage bucket 'recordings'
   */
  public async uploadMediaFile(file: File, userId?: string): Promise<{ path: string; publicUrl?: string } | null> {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Returning local object URL.');
      return { path: file.name, publicUrl: URL.createObjectURL(file) };
    }

    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }

      if (!targetUserId) return null;

      const fileExt = file.name.split('.').pop();
      const filePath = `${targetUserId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('recordings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(filePath);

      return {
        path: data.path,
        publicUrl: publicUrlData?.publicUrl
      };
    } catch (err) {
      console.error('Media upload exception:', err);
      return null;
    }
  }
}

export const supabaseDataService = new SupabaseDataService();

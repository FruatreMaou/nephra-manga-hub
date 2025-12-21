import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ReadingHistoryItem {
  id: string;
  user_id: string;
  manga_slug: string;
  manga_title: string;
  manga_cover: string | null;
  chapter_slug: string;
  chapter_title: string;
  read_at: string;
}

export const useReadingHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', user.id)
      .order('read_at', { ascending: false });

    if (error) {
      console.error('Error fetching reading history:', error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const addToHistory = async (
    mangaSlug: string,
    mangaTitle: string,
    chapterSlug: string,
    chapterTitle: string,
    mangaCover?: string
  ) => {
    if (!user) return false;

    // Upsert - update if exists, insert if not
    const { error } = await supabase
      .from('reading_history')
      .upsert(
        {
          user_id: user.id,
          manga_slug: mangaSlug,
          manga_title: mangaTitle,
          manga_cover: mangaCover || null,
          chapter_slug: chapterSlug,
          chapter_title: chapterTitle,
          read_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,manga_slug,chapter_slug',
        }
      );

    if (error) {
      console.error('Error adding to history:', error);
      return false;
    }

    await fetchHistory();
    return true;
  };

  const removeFromHistory = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('reading_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing from history:', error);
      return false;
    }

    await fetchHistory();
    return true;
  };

  const clearHistory = async () => {
    if (!user) return false;

    const { error } = await supabase
      .from('reading_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing history:', error);
      return false;
    }

    await fetchHistory();
    return true;
  };

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    refreshHistory: fetchHistory,
  };
};

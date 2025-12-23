import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadingProgress {
  scrollProgress: number;
  lastImageIndex: number;
}

const LOCAL_STORAGE_KEY = 'nephra-reading-progress';

export const useReadingProgress = (chapterSlug: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get local storage progress
  const getLocalProgress = useCallback((): Record<string, ReadingProgress> => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  // Save to local storage
  const saveLocalProgress = useCallback((slug: string, data: ReadingProgress) => {
    try {
      const all = getLocalProgress();
      all[slug] = data;
      
      // Keep only last 100 entries to prevent bloat
      const entries = Object.entries(all);
      if (entries.length > 100) {
        const sorted = entries.sort((a, b) => b[1].scrollProgress - a[1].scrollProgress);
        const trimmed = Object.fromEntries(sorted.slice(0, 100));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
      }
    } catch (e) {
      console.error('Failed to save reading progress locally:', e);
    }
  }, [getLocalProgress]);

  // Fetch progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      if (!chapterSlug) return;

      if (user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('reading_history')
          .select('scroll_progress, last_image_index')
          .eq('user_id', user.id)
          .eq('chapter_slug', chapterSlug)
          .single();

        if (!error && data && (data.scroll_progress > 0 || data.last_image_index > 0)) {
          setProgress({
            scrollProgress: data.scroll_progress || 0,
            lastImageIndex: data.last_image_index || 0,
          });
          setIsResuming(true);
        }
      } else {
        // Fetch from local storage
        const localProgress = getLocalProgress();
        if (localProgress[chapterSlug]) {
          setProgress(localProgress[chapterSlug]);
          setIsResuming(true);
        }
      }
    };

    fetchProgress();
  }, [chapterSlug, user, getLocalProgress]);

  // Save progress (debounced)
  const saveProgress = useCallback((scrollProgress: number, lastImageIndex: number) => {
    if (!chapterSlug) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to avoid too many writes
    saveTimeoutRef.current = setTimeout(async () => {
      const data: ReadingProgress = { scrollProgress, lastImageIndex };

      if (user) {
        // Update in Supabase
        await supabase
          .from('reading_history')
          .update({
            scroll_progress: scrollProgress,
            last_image_index: lastImageIndex,
          })
          .eq('user_id', user.id)
          .eq('chapter_slug', chapterSlug);
      } else {
        // Save locally
        saveLocalProgress(chapterSlug, data);
      }
    }, 500);
  }, [chapterSlug, user, saveLocalProgress]);

  // Clear resuming state
  const clearResuming = useCallback(() => {
    setIsResuming(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    progress,
    isResuming,
    saveProgress,
    clearResuming,
  };
};

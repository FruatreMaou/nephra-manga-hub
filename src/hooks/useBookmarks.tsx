import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Bookmark {
  id: string;
  user_id: string;
  manga_slug: string;
  manga_title: string;
  manga_cover: string | null;
  created_at: string;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const addBookmark = async (mangaSlug: string, mangaTitle: string, mangaCover?: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to bookmark manga',
        variant: 'destructive',
      });
      return false;
    }

    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      manga_slug: mangaSlug,
      manga_title: mangaTitle,
      manga_cover: mangaCover || null,
    });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Already Bookmarked',
          description: 'This manga is already in your bookmarks',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add bookmark',
          variant: 'destructive',
        });
      }
      return false;
    }

    await fetchBookmarks();
    toast({
      title: 'Bookmarked',
      description: `${mangaTitle} added to bookmarks`,
    });
    return true;
  };

  const removeBookmark = async (mangaSlug: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('manga_slug', mangaSlug);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark',
        variant: 'destructive',
      });
      return false;
    }

    await fetchBookmarks();
    return true;
  };

  const removeMultipleBookmarks = async (ids: string[]) => {
    if (!user) return false;

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .in('id', ids);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove bookmarks',
        variant: 'destructive',
      });
      return false;
    }

    await fetchBookmarks();
    toast({
      title: 'Removed',
      description: `${ids.length} bookmark(s) removed`,
    });
    return true;
  };

  const removeAllBookmarks = async () => {
    if (!user) return false;

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove all bookmarks',
        variant: 'destructive',
      });
      return false;
    }

    await fetchBookmarks();
    toast({
      title: 'Cleared',
      description: 'All bookmarks removed',
    });
    return true;
  };

  const isBookmarked = (mangaSlug: string) => {
    return bookmarks.some(b => b.manga_slug === mangaSlug);
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    removeMultipleBookmarks,
    removeAllBookmarks,
    isBookmarked,
    refreshBookmarks: fetchBookmarks,
  };
};

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useReadingHistory, ReadingHistoryItem } from '@/hooks/useReadingHistory';
import { formatDistanceToNow } from 'date-fns';

interface GroupedHistory {
  mangaSlug: string;
  mangaTitle: string;
  mangaCover: string | null;
  chapters: ReadingHistoryItem[];
  lastReadAt: string;
}

const History = () => {
  const { history, loading: historyLoading, removeFromHistory, clearHistory } = useReadingHistory();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group history by manga
  const groupedHistory = useMemo(() => {
    const groups: Map<string, GroupedHistory> = new Map();

    history.forEach((item) => {
      const existing = groups.get(item.manga_slug);
      if (existing) {
        existing.chapters.push(item);
        // Update last read time if this chapter was read more recently
        if (new Date(item.read_at) > new Date(existing.lastReadAt)) {
          existing.lastReadAt = item.read_at;
        }
      } else {
        groups.set(item.manga_slug, {
          mangaSlug: item.manga_slug,
          mangaTitle: item.manga_title,
          mangaCover: item.manga_cover,
          chapters: [item],
          lastReadAt: item.read_at,
        });
      }
    });

    // Sort groups by last read time (most recent first)
    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    );
  }, [history]);

  const toggleGroup = (mangaSlug: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(mangaSlug)) {
        next.delete(mangaSlug);
      } else {
        next.add(mangaSlug);
      }
      return next;
    });
  };

  const removeChapter = async (id: string) => {
    await removeFromHistory(id);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader 
            title="Reading History" 
            icon={<Clock className="w-5 h-5" />}
          />
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {historyLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : groupedHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No Reading History</h3>
            <p className="text-muted-foreground mb-6">
              Start reading manga to see your history here
            </p>
            <Link to="/browse">
              <Button className="btn-cosmic">
                Browse Manga
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedHistory.map((group) => {
              const isExpanded = expandedGroups.has(group.mangaSlug);
              const chaptersCount = group.chapters.length;

              return (
                <div 
                  key={group.mangaSlug}
                  className="glass-card rounded-xl overflow-hidden transition-all duration-300"
                >
                  {/* Manga Header - Clickable to expand */}
                  <button
                    onClick={() => toggleGroup(group.mangaSlug)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <Link 
                      to={`/manga/${group.mangaSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 w-14 h-20 rounded-lg overflow-hidden group"
                    >
                      <img
                        src={group.mangaCover || '/placeholder.svg'}
                        alt={group.mangaTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 text-left">
                      <Link 
                        to={`/manga/${group.mangaSlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-display font-semibold line-clamp-1 hover:text-primary transition-colors"
                      >
                        {group.mangaTitle}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {chaptersCount} chapter{chaptersCount > 1 ? 's' : ''} read
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(group.lastReadAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-muted/50 transition-transform duration-300 ${isExpanded ? 'rotate-0' : ''}`}>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Chapters List - Collapsible */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="border-t border-border/50 bg-muted/20">
                      {group.chapters
                        .sort((a, b) => new Date(b.read_at).getTime() - new Date(a.read_at).getTime())
                        .map((chapter, idx) => (
                          <div
                            key={chapter.id}
                            className={`flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors ${
                              idx !== group.chapters.length - 1 ? 'border-b border-border/30' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0 pl-[72px]">
                              <Link 
                                to={`/chapter/${chapter.chapter_slug}`}
                                className="text-sm text-primary hover:underline block"
                              >
                                {chapter.chapter_title}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(chapter.read_at), { addSuffix: true })}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => removeChapter(chapter.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default History;

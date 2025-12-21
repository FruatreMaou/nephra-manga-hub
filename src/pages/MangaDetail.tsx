import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, User, Calendar, Clock, Tag, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react';
import { getMangaDetail, getTypeBadgeClass, cleanChapterTitle } from '@/lib/api';
import { MangaDetail as MangaDetailType } from '@/types/manga';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/hooks/use-toast';

const MangaDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  
  const [manga, setManga] = useState<MangaDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    const fetchManga = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await getMangaDetail(slug);
        setManga(data);
      } catch (err) {
        setError('Failed to load manga details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [slug]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to bookmark manga',
        variant: 'destructive',
      });
      return;
    }

    if (!manga || !slug) return;

    if (isBookmarked(slug)) {
      await removeBookmark(slug);
      toast({
        title: 'Removed',
        description: 'Removed from bookmarks',
      });
    } else {
      await addBookmark(slug, manga.title, manga.image);
    }
  };

  const displayedChapters = showAllChapters 
    ? manga?.chapters 
    : manga?.chapters.slice(0, 20);

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="stars-bg" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 aspect-[3/4] rounded-xl shimmer" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-3/4 rounded shimmer" />
              <div className="h-4 w-1/4 rounded shimmer" />
              <div className="h-32 rounded shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen pt-20">
        <div className="stars-bg" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">{error || 'Manga not found'}</p>
          <Link to="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  const bookmarked = slug ? isBookmarked(slug) : false;

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Background blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl"
          style={{ backgroundImage: `url(${manga.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-64 md:w-80 rounded-xl overflow-hidden shadow-hover">
                <img
                  src={manga.image}
                  alt={manga.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-4">
                <span className={getTypeBadgeClass(manga.type)}>
                  {manga.type}
                </span>
                {manga.status && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    manga.status.toLowerCase() === 'ongoing' 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {manga.status}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl md:text-4xl font-bold mb-2">
                {manga.title}
              </h1>
              
              {manga.nativeTitle && (
                <p className="text-muted-foreground mb-4">{manga.nativeTitle}</p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 rating-glow fill-current" />
                <span className="font-semibold text-lg">{manga.rating}</span>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {manga.author && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Author:</span>
                    <span>{manga.author}</span>
                  </div>
                )}
                {manga.released && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Released:</span>
                    <span>{manga.released}</span>
                  </div>
                )}
                {manga.updated && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{manga.updated}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {manga.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {manga.genres.map((genre) => (
                    <Link
                      key={genre.slug}
                      to={`/genre/${genre.slug}`}
                      className="genre-tag text-xs"
                    >
                      {genre.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <div className="mb-6">
                <h3 className="font-display font-semibold mb-2">Synopsis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {manga.synopsis || 'No synopsis available.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {manga.chapters.length > 0 && (
                  <Link to={`/chapter/${manga.chapters[manga.chapters.length - 1].slug}`}>
                    <Button className="btn-cosmic">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Reading
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={handleBookmarkToggle}
                  className={bookmarked ? 'border-primary text-primary' : ''}
                >
                  {bookmarked ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 mr-2" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-2" />
                      Bookmark
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">
              Chapters ({manga.chapters.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
            {displayedChapters?.map((chapter) => (
              <Link
                key={chapter.slug}
                to={`/chapter/${chapter.slug}`}
                className="chapter-item flex items-center justify-between group"
              >
                <span className="font-medium group-hover:text-primary transition-colors">
                  {cleanChapterTitle(chapter.title)}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {chapter.date && (
                    <span className="text-xs">{chapter.date}</span>
                  )}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>

          {manga.chapters.length > 20 && !showAllChapters && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowAllChapters(true)}
            >
              Show All Chapters ({manga.chapters.length - 20} more)
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MangaDetail;

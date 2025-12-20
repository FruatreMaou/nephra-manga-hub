import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, List, Settings, Maximize, Minimize } from 'lucide-react';
import { getChapter } from '@/lib/api';
import { ChapterData } from '@/types/manga';
import { Button } from '@/components/ui/button';

const ChapterReader = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await getChapter(slug);
        setChapter(data);
      } catch (err) {
        setError('Failed to load chapter. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [slug]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && chapter?.prevChapter) {
        navigate(`/chapter/${chapter.prevChapter}`);
      } else if (e.key === 'ArrowRight' && chapter?.nextChapter) {
        navigate(`/chapter/${chapter.nextChapter}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapter, navigate]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Chapter not found'}</p>
          <Link to="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            {chapter.mangaSlug && (
              <Link 
                to={`/manga/${chapter.mangaSlug}`}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <List className="w-5 h-5" />
              </Link>
            )}
          </div>

          <h1 className="font-display text-sm md:text-base font-semibold truncate max-w-xs md:max-w-md">
            {chapter.title}
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="p-2"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="p-2"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div 
        className="pt-20 pb-20"
        onClick={() => setShowControls(!showControls)}
      >
        <div className="max-w-4xl mx-auto">
          {chapter.images.map((img, index) => (
            <img
              key={index}
              src={img.image}
              alt={`Page ${index + 1}`}
              className="w-full h-auto"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {chapter.prevChapter ? (
            <Link to={`/chapter/${chapter.prevChapter}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          )}

          <span className="text-sm text-muted-foreground">
            Use ← → arrow keys to navigate
          </span>

          {chapter.nextChapter ? (
            <Link to={`/chapter/${chapter.nextChapter}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;

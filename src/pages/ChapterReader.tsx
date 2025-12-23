import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, List, Maximize, Minimize, BookOpen, ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import { getChapter, getMangaDetail } from '@/lib/api';
import { ChapterData, MangaDetail } from '@/types/manga';
import { Button } from '@/components/ui/button';
import { useAuth } from hooks/useAuth';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Impor komponen Alert

const ChapterReader = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToHistory } = useReadingHistory();
  const { progress, isResuming, saveProgress, clearResuming } = useReadingProgress(slug || '');

  // State untuk UI dan data
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [mangaDetail, setMangaDetail] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showResumeIndicator, setShowResumeIndicator] = useState(false);
  const [imageError, setImageError] = useState(false); // State untuk error gambar

  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const hasScrolledToProgress = useRef(false);
  const imagesLoadedCount = useRef(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref untuk timeout kontrol

  // Efek untuk mereset state saat chapter berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    hasScrolledToProgress.current = false;
    imagesLoadedCount.current = 0;
    setScrollProgress(0);
    setShowControls(true); // Pastikan kontrol muncul saat chapter baru dimuat
    setImageError(false); // Reset error gambar
  }, [slug]);

  // Efek untuk mengambil data chapter dan detail manga
  useEffect(() => {
    const fetchChapter = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);
      setImageError(false);

      try {
        const data = await getChapter(slug);
        setChapter(data);

        if (data.mangaSlug) {
          try {
            const detail = await getMangaDetail(data.mangaSlug);
            setMangaDetail(detail);

            if (user) {
              addToHistory(
                data.mangaSlug,
                detail.title,
                slug,
                data.title,
                detail.image
              );
            }
          } catch (err) {
            console.error('Failed to fetch manga detail:', err);
            // Jangan setError di sini agar pembacaan chapter tetap bisa dilanjutkan
          }
        }
      } catch (err) {
        setError('Failed to load chapter. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [slug, user, addToHistory]);

  // Fungsi untuk menangani scroll dan progress
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setScrollProgress(progress);

    if (contentRef.current && chapter) {
      const images = contentRef.current.querySelectorAll('img');
      let lastVisibleIndex = 0;

      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2) {
          lastVisibleIndex = index;
        }
      });

      saveProgress(progress, lastVisibleIndex);
    }
  }, [chapter, saveProgress]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fungsi untuk melanjutkan baca dari posisi tersimpan
  const resumeReading = useCallback(() => {
    if (progress && progress.scrollProgress > 5) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTo = (progress.scrollProgress / 100) * docHeight;
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      setShowResumeIndicator(false);
      clearResuming();
    }
  }, [progress, clearResuming]);

  // Efek untuk menampilkan indikator lanjutkan membaca
  useEffect(() => {
    if (isResuming && progress && progress.scrollProgress > 5 && !hasScrolledToProgress.current) {
      setShowResumeIndicator(true);
      hasScrolledToProgress.current = true;

      const timeout = setTimeout(() => {
        setShowResumeIndicator(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isResuming, progress]);

  // Efek untuk navigasi keyboard
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

  // Fungsi untuk toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Fungsi untuk menyembunyikan kontrol otomatis
  const handleContentClick = () => {
    setShowControls(prev => !prev);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // Sembunyikan setelah 3 detik
  };

  // Tampilan saat loading
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

  // Tampilan saat error
  if (error || !chapter) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error || 'Chapter not found'}</p>
          <Link to="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Progress bar */}
      <div
        className="progress-indicator"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Resume indicator */}
      {showResumeIndicator && (
        <div className="resume-indicator flex items-center gap-3">
          <span className="text-sm">Continue from {Math.round(progress?.scrollProgress || 0)}%?</span>
          <Button size="sm" variant="default" onClick={resumeReading}>
            <RotateCcw className="w-3 h-3 mr-1" />
            Resume
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowResumeIndicator(false)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Top Navigation */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 glass border-b border-border/50 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <List className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="text-left">Chapters</SheetTitle>
                </SheetHeader>

                {chapter.mangaSlug && (
                  <Link
                    to={`/manga/${chapter.mangaSlug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
                    onClick={() => setSheetOpen(false)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back to Detail</span>
                  </Link>
                )}

                <ScrollArea className="h-[calc(100vh-120px)]">
                  <div className="p-2">
                    {mangaDetail?.chapters.map((ch) => (
                      <Link
                        key={ch.slug}
                        to={`/chapter/${ch.slug}`}
                        onClick={() => setSheetOpen(false)}
                        className={`block px-3 py-2 rounded-lg transition-colors ${
                          ch.slug === slug
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">{ch.title}</span>
                        </div>
                        {ch.date && (
                          <span className="text-xs text-muted-foreground ml-6">{ch.date}</span>
                        )}
                      </Link>
                    ))}
                    {!mangaDetail && (
                      <p className="text-sm text-muted-foreground text-center py-4">Loading chapters...</p>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
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
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div
        ref={contentRef}
        className="pt-20 pb-20"
        onClick={handleContentClick} // Gunakan fungsi baru
      >
        <div className="max-w-4xl mx-auto">
          {imageError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Image Loading Error</AlertTitle>
              <AlertDescription>
                Some images failed to load. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          )}
          {chapter.images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`Page ${index + 1} of ${chapter.title}`}
              className="w-full h-auto"
              loading="lazy"
              onLoad={() => {
                imagesLoadedCount.current++;
              }}
              onError={() => {
                setImageError(true); // Set state error jika ada gambar yang gagal
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 transition-transform duration-300 ${
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
            {Math.round(scrollProgress)}% read
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

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  Maximize,
  Minimize,
  BookOpen,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { getChapter, getMangaDetail } from '@/lib/api';
import { ChapterData, MangaDetail } from '@/types/manga';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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

const ChapterReader = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToHistory } = useReadingHistory();
  const { progress, isResuming, saveProgress, clearResuming } =
    useReadingProgress(slug || '');

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [mangaDetail, setMangaDetail] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showResumeIndicator, setShowResumeIndicator] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const hasScrolledToProgress = useRef(false);

  // reset on chapter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    lastScrollY.current = 0;
    hasScrolledToProgress.current = false;
    setScrollProgress(0);
  }, [slug]);

  // fetch chapter
  useEffect(() => {
    const fetchChapter = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getChapter(slug);
        setChapter(data);

        if (data.mangaSlug) {
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
        }
      } catch {
        setError('Failed to load chapter.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [slug, user, addToHistory]);

  // === SCROLL HANDLER (SATU-SATUNYA) ===
  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    window.requestAnimationFrame(() => {
      const currentY = window.scrollY || 0;

      // show / hide controls
      if (currentY > lastScrollY.current && currentY > 80) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
      lastScrollY.current = currentY;

      // progress
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progressValue =
        docHeight > 0 ? (currentY / docHeight) * 100 : 0;
      setScrollProgress(progressValue);

      // save progress
      if (contentRef.current && chapter) {
        const images = contentRef.current.querySelectorAll('img');
        let lastVisibleIndex = 0;

        images.forEach((img, index) => {
          const rect = img.getBoundingClientRect();
          if (rect.top < window.innerHeight / 2) {
            lastVisibleIndex = index;
          }
        });

        saveProgress(progressValue, lastVisibleIndex);
      }

      ticking.current = false;
    });
  }, [chapter, saveProgress]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // resume indicator
  useEffect(() => {
    if (
      isResuming &&
      progress &&
      progress.scrollProgress > 5 &&
      !hasScrolledToProgress.current
    ) {
      setShowResumeIndicator(true);
      hasScrolledToProgress.current = true;

      const t = setTimeout(() => setShowResumeIndicator(false), 5000);
      return () => clearTimeout(t);
    }
  }, [isResuming, progress]);

  const resumeReading = () => {
    if (!progress) return;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: (progress.scrollProgress / 100) * docHeight,
      behavior: 'smooth',
    });
    setShowResumeIndicator(false);
    clearResuming();
  };

  // fullscreen focus
  useEffect(() => {
    if (isFullscreen) setShowControls(false);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) return <div className="pt-20 text-center">Loading…</div>;
  if (error || !chapter)
    return <div className="pt-20 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="progress-indicator" style={{ width: `${scrollProgress}%` }} />

      {showResumeIndicator && (
        <div className="resume-indicator">
          <span>Continue reading?</span>
          <Button size="sm" onClick={resumeReading}>
            <RotateCcw className="w-3 h-3 mr-1" />
            Resume
          </Button>
        </div>
      )}

      {/* TOP NAV */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur bg-background/70
        transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="h-12 px-4 flex items-center justify-between">
          <Link to="/">
            <Home className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-medium truncate max-w-xs">
            {chapter.title}
          </h1>
          <Button size="icon" variant="ghost" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div ref={contentRef} className="pt-16 pb-20">
        <div className="max-w-4xl mx-auto">
          {chapter.images.map((src, i) => (
            <img key={i} src={src} loading="lazy" className="w-full" />
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur bg-background/70
        transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="h-12 px-4 flex justify-between items-center">
          <Link to={chapter.prevChapter ? `/chapter/${chapter.prevChapter}` : '#'}>
            <ChevronLeft />
          </Link>
          <span className="text-xs">{Math.round(scrollProgress)}%</span>
          <Link to={chapter.nextChapter ? `/chapter/${chapter.nextChapter}` : '#'}>
            <ChevronRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;

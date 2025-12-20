import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import { getHomeData } from '@/lib/api';
import { HomeData } from '@/types/manga';
import { MangaCard, MangaGridSkeleton } from '@/components/MangaCard';
import { ProjectGrid, ProjectGridSkeleton } from '@/components/ProjectCard';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';

const Index = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeData = await getHomeData();
        setData(homeData);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Stars background */}
      <div className="stars-bg" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Gateway to Manga Universe</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <span className="glow-text">NEPHRA</span>
              <br />
              <span className="text-foreground">MANGA</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Discover thousands of manga, manhwa, and manhua. 
              Read the latest chapters with a beautiful reading experience.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link to="/browse" className="btn-cosmic inline-flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Start Reading
              </Link>
              <Link 
                to="/genres" 
                className="px-6 py-3 rounded-lg border border-border hover:border-primary/50 
                  text-foreground font-semibold transition-all hover:bg-primary/5"
              >
                Browse Genres
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </section>

      {/* Hot Updates Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title="Hot Updates" 
            icon={<Flame className="w-5 h-5" />}
            viewAllLink="/browse?status=popular"
          />
          
          {loading ? (
            <MangaGridSkeleton count={8} />
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">{error}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {data?.hotUpdates.map((manga, index) => (
                <MangaCard key={manga.slug} manga={manga} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Project Updates Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title="Project Updates" 
            icon={<TrendingUp className="w-5 h-5" />}
            viewAllLink="/browse?status=ongoing"
          />
          
          {loading ? (
            <ProjectGridSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">{error}</div>
          ) : (
            <ProjectGrid projects={data?.projectUpdates || []} />
          )}
        </div>
      </section>

      {/* Latest Releases Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title="Latest Releases" 
            icon={<Sparkles className="w-5 h-5" />}
            viewAllLink="/browse"
          />
          
          {loading ? (
            <ProjectGridSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">{error}</div>
          ) : (
            <ProjectGrid projects={data?.latestReleases.slice(0, 6) || []} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

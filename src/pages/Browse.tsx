import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, TrendingUp, CheckCircle, Clock, Grid } from 'lucide-react';
import { 
  getLatestReleases, 
  getPopularManga, 
  getCompletedManga, 
  getOngoingManga,
  getProjects 
} from '@/lib/api';
import { MangaItem, PaginatedResponse } from '@/types/manga';
import { MangaGrid, MangaGridSkeleton } from '@/components/MangaCard';
import { Pagination } from '@/components/Pagination';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

type StatusFilter = 'latest' | 'popular' | 'completed' | 'ongoing' | 'projects';

const statusConfig: Record<StatusFilter, { label: string; icon: typeof Compass; fetcher: (page: number) => Promise<PaginatedResponse<MangaItem>> }> = {
  latest: { label: 'Latest', icon: Clock, fetcher: getLatestReleases },
  popular: { label: 'Popular', icon: TrendingUp, fetcher: getPopularManga },
  completed: { label: 'Completed', icon: CheckCircle, fetcher: getCompletedManga },
  ongoing: { label: 'Ongoing', icon: Grid, fetcher: getOngoingManga },
  projects: { label: 'Projects', icon: Compass, fetcher: getProjects },
};

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as StatusFilter) || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [data, setData] = useState<PaginatedResponse<MangaItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const config = statusConfig[status];
        const result = await config.fetcher(page);
        setData(result);
      } catch (err) {
        setError('Failed to load manga. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, page]);

  const handleStatusChange = (newStatus: StatusFilter) => {
    setSearchParams({ status: newStatus, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ status, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            <span className="glow-text">Browse</span> Manga
          </h1>
          <p className="text-muted-foreground">
            Explore our collection of manga, manhwa, and manhua
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {(Object.keys(statusConfig) as StatusFilter[]).map((key) => {
            const conf = statusConfig[key];
            const IconComponent = conf.icon;
            return (
              <Button
                key={key}
                variant={status === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(key)}
                className={`flex items-center gap-2 ${
                  status === key ? 'bg-gradient-primary border-0' : ''
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {conf.label}
              </Button>
            );
          })}
        </div>

        {/* Section Header */}
        <SectionHeader 
          title={config.label} 
          icon={<Icon className="w-5 h-5" />}
        />

        {/* Content */}
        {loading ? (
          <MangaGridSkeleton count={18} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <MangaGrid manga={data.data} />
            <Pagination
              currentPage={data.pagination.currentPage}
              hasNextPage={data.pagination.hasNextPage}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No manga found</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Browse;

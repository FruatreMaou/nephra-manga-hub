import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, TrendingUp, CheckCircle, Clock, Grid, Filter, ChevronDown } from 'lucide-react';
import { 
  getLatestReleases, 
  getPopularManga, 
  getCompletedManga, 
  getOngoingManga,
  getProjects,
  getGenres,
  getMangaByGenre
} from '@/lib/api';
import { MangaItem, PaginatedResponse, Genre } from '@/types/manga';
import { MangaGrid, MangaGridSkeleton } from '@/components/MangaCard';
import { Pagination } from '@/components/Pagination';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type StatusFilter = 'latest' | 'popular' | 'completed' | 'ongoing' | 'projects';
type TypeFilter = 'all' | 'manga' | 'manhwa' | 'manhua';

const statusConfig: Record<StatusFilter, { label: string; icon: typeof Compass; fetcher: (page: number) => Promise<PaginatedResponse<MangaItem>> }> = {
  latest: { label: 'Latest', icon: Clock, fetcher: getLatestReleases },
  popular: { label: 'Popular', icon: TrendingUp, fetcher: getPopularManga },
  completed: { label: 'Completed', icon: CheckCircle, fetcher: getCompletedManga },
  ongoing: { label: 'Ongoing', icon: Grid, fetcher: getOngoingManga },
  projects: { label: 'Projects', icon: Compass, fetcher: getProjects },
};

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as StatusFilter) || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const typeFilter = (searchParams.get('type') as TypeFilter) || 'all';
  const genreFilter = searchParams.get('genre') || '';

  const [data, setData] = useState<PaginatedResponse<MangaItem> | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch genres on mount
  useEffect(() => {
    getGenres().then(setGenres).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let result: PaginatedResponse<MangaItem>;
        
        if (genreFilter) {
          // Fetch by genre
          result = await getMangaByGenre(genreFilter, page);
        } else {
          // Fetch by status
          const config = statusConfig[status];
          result = await config.fetcher(page);
        }
        
        // Apply type filter client-side
        if (typeFilter !== 'all') {
          result = {
            ...result,
            data: result.data.filter(manga => 
              manga.type?.toLowerCase() === typeFilter.toLowerCase()
            )
          };
        }
        
        setData(result);
      } catch (err) {
        setError('Failed to load manga. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, page, typeFilter, genreFilter]);

  const handleStatusChange = (newStatus: StatusFilter) => {
    setSearchParams({ status: newStatus, page: '1', type: typeFilter });
  };

  const handleTypeChange = (newType: TypeFilter) => {
    const params: Record<string, string> = { status, page: '1', type: newType };
    if (genreFilter) params.genre = genreFilter;
    setSearchParams(params);
  };

  const handleGenreChange = (genreSlug: string) => {
    if (genreSlug) {
      setSearchParams({ genre: genreSlug, page: '1', type: typeFilter });
    } else {
      setSearchParams({ status, page: '1', type: typeFilter });
    }
  };

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = { page: newPage.toString(), type: typeFilter };
    if (genreFilter) {
      params.genre = genreFilter;
    } else {
      params.status = status;
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams({ status: 'latest', page: '1' });
  };

  const config = genreFilter 
    ? { label: genres.find(g => g.slug === genreFilter)?.title || 'Genre', icon: Filter }
    : statusConfig[status];
  const Icon = config.icon;

  const hasActiveFilters = typeFilter !== 'all' || genreFilter;

  return (
    <div className="min-h-screen pt-20">
      <div className="page-pattern" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Browse</span> Manga
          </h1>
          <p className="text-muted-foreground">
            Explore our collection of manga, manhwa, and manhua
          </p>
        </div>

        {/* Filters Section */}
        <div className="space-y-4 mb-8">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(statusConfig) as StatusFilter[]).map((key) => {
              const conf = statusConfig[key];
              const IconComponent = conf.icon;
              const isActive = !genreFilter && status === key;
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(key)}
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? 'filter-active' 
                      : 'filter-inactive'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {conf.label}
                </Button>
              );
            })}
          </div>

          {/* Additional Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex items-center gap-2 ${typeFilter !== 'all' ? 'border-primary/50 text-primary' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  {typeFilters.find(t => t.value === typeFilter)?.label}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass">
                {typeFilters.map((type) => (
                  <DropdownMenuItem 
                    key={type.value}
                    onClick={() => handleTypeChange(type.value)}
                    className={typeFilter === type.value ? 'bg-primary/10 text-primary' : ''}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Genre Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex items-center gap-2 ${genreFilter ? 'border-primary/50 text-primary' : ''}`}
                >
                <Compass className="w-4 h-4" />
                  {genreFilter 
                    ? genres.find(g => g.slug === genreFilter)?.title || 'Genre'
                    : 'All Genres'
                  }
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass max-h-64 overflow-auto custom-scrollbar">
                <DropdownMenuItem 
                  onClick={() => handleGenreChange('')}
                  className={!genreFilter ? 'bg-primary/10 text-primary' : ''}
                >
                  All Genres
                </DropdownMenuItem>
                {genres.map((genre) => (
                  <DropdownMenuItem 
                    key={genre.slug}
                    onClick={() => handleGenreChange(genre.slug)}
                    className={genreFilter === genre.slug ? 'bg-primary/10 text-primary' : ''}
                  >
                    {genre.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>
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
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </Button>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <MangaGrid manga={data.data} />
            <Pagination
              currentPage={page}
              hasNextPage={data.pagination.hasNextPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No manga found with the selected filters.</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Browse;

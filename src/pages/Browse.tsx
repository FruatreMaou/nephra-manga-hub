import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, TrendingUp, Clock, Layers, Filter, ChevronDown, CheckCircle, RefreshCw } from 'lucide-react';
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

type SectionFilter = 'latest' | 'popular' | 'projects';
type StatusFilter = 'all' | 'completed' | 'ongoing';
type TypeFilter = 'all' | 'manga' | 'manhwa' | 'manhua';

const sectionConfig: Record<SectionFilter, { label: string; icon: typeof Compass; fetcher: (page: number) => Promise<PaginatedResponse<MangaItem>> }> = {
  latest: { label: 'Latest', icon: Clock, fetcher: getLatestReleases },
  popular: { label: 'Popular', icon: TrendingUp, fetcher: getPopularManga },
  projects: { label: 'Projects', icon: Layers, fetcher: getProjects },
};

const statusFilters: { value: StatusFilter; label: string; icon: typeof CheckCircle }[] = [
  { value: 'all', label: 'All Status', icon: Filter },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'ongoing', label: 'Ongoing', icon: RefreshCw },
];

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = (searchParams.get('section') as SectionFilter) || 'latest';
  const statusFilter = (searchParams.get('status') as StatusFilter) || 'all';
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
        } else if (statusFilter !== 'all') {
          // Fetch by status (completed/ongoing)
          if (statusFilter === 'completed') {
            result = await getCompletedManga(page);
          } else {
            result = await getOngoingManga(page);
          }
        } else {
          // Fetch by section
          const config = sectionConfig[section];
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
  }, [section, statusFilter, page, typeFilter, genreFilter]);

  const handleSectionChange = (newSection: SectionFilter) => {
    setSearchParams({ section: newSection, page: '1', type: typeFilter, status: 'all' });
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    const params: Record<string, string> = { section, page: '1', type: typeFilter, status: newStatus };
    if (genreFilter) params.genre = genreFilter;
    setSearchParams(params);
  };

  const handleTypeChange = (newType: TypeFilter) => {
    const params: Record<string, string> = { section, page: '1', type: newType, status: statusFilter };
    if (genreFilter) params.genre = genreFilter;
    setSearchParams(params);
  };

  const handleGenreChange = (genreSlug: string) => {
    if (genreSlug) {
      setSearchParams({ genre: genreSlug, page: '1', type: typeFilter, status: statusFilter, section });
    } else {
      setSearchParams({ section, page: '1', type: typeFilter, status: statusFilter });
    }
  };

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = { page: newPage.toString(), type: typeFilter, status: statusFilter, section };
    if (genreFilter) {
      params.genre = genreFilter;
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams({ section: 'latest', page: '1' });
  };

  const getActiveLabel = () => {
    if (genreFilter) {
      return genres.find(g => g.slug === genreFilter)?.title || 'Genre';
    }
    if (statusFilter !== 'all') {
      return statusFilters.find(s => s.value === statusFilter)?.label || 'Status';
    }
    return sectionConfig[section].label;
  };

  const getActiveIcon = () => {
    if (genreFilter) return Filter;
    if (statusFilter !== 'all') {
      return statusFilters.find(s => s.value === statusFilter)?.icon || Filter;
    }
    return sectionConfig[section].icon;
  };

  const Icon = getActiveIcon();
  const hasActiveFilters = typeFilter !== 'all' || genreFilter || statusFilter !== 'all';

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
          {/* Section Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(sectionConfig) as SectionFilter[]).map((key) => {
              const conf = sectionConfig[key];
              const IconComponent = conf.icon;
              const isActive = !genreFilter && statusFilter === 'all' && section === key;
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSectionChange(key)}
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
            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex items-center gap-2 ${statusFilter !== 'all' ? 'border-primary/50 text-primary' : ''}`}
                >
                  {statusFilter === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
                   statusFilter === 'ongoing' ? <RefreshCw className="w-4 h-4" /> : 
                   <Filter className="w-4 h-4" />}
                  {statusFilters.find(s => s.value === statusFilter)?.label}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass">
                {statusFilters.map((status) => (
                  <DropdownMenuItem 
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={statusFilter === status.value ? 'bg-primary/10 text-primary' : ''}
                  >
                    <status.icon className="w-4 h-4 mr-2" />
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex items-center gap-2 ${typeFilter !== 'all' ? 'border-primary/50 text-primary' : ''}`}
                >
                  <Layers className="w-4 h-4" />
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
          title={getActiveLabel()} 
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
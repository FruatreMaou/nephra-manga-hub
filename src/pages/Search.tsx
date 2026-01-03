import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Clock, TrendingUp, Layers, ChevronDown } from 'lucide-react';
import { searchManga } from '@/lib/api';
import { MangaItem, PaginatedResponse } from '@/types/manga';
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

type SortFilter = 'relevance' | 'latest' | 'rating';
type TypeFilter = 'all' | 'manga' | 'manhwa' | 'manhua';

const sortFilters: { value: SortFilter; label: string; icon: typeof SearchIcon }[] = [
  { value: 'relevance', label: 'Relevance', icon: SearchIcon },
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'rating', label: 'Top Rated', icon: TrendingUp },
];

const typeFilters: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
];

const Search = () => {
  const { query } = useParams<{ query: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortFilter = (searchParams.get('sort') as SortFilter) || 'relevance';
  const typeFilter = (searchParams.get('type') as TypeFilter) || 'all';

  const [data, setData] = useState<PaginatedResponse<MangaItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;
      
      setLoading(true);
      setError(null);
      try {
        const result = await searchManga(query, page);
        
        // Apply client-side filters
        let filteredData = result.data;
        
        // Filter by type
        if (typeFilter !== 'all') {
          filteredData = filteredData.filter(manga => 
            manga.type?.toLowerCase() === typeFilter.toLowerCase()
          );
        }
        
        // Sort results
        if (sortFilter === 'latest') {
          filteredData = [...filteredData].sort((a, b) => {
            const chapterA = a.latestChapter || a.chapter || '';
            const chapterB = b.latestChapter || b.chapter || '';
            return chapterB.localeCompare(chapterA);
          });
        } else if (sortFilter === 'rating') {
          filteredData = [...filteredData].sort((a, b) => {
            const ratingA = parseFloat(a.rating || '0');
            const ratingB = parseFloat(b.rating || '0');
            return ratingB - ratingA;
          });
        }
        
        setData({
          ...result,
          data: filteredData
        });
      } catch (err) {
        setError('Failed to search. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, page, sortFilter, typeFilter]);

  // Reset page when query changes
  useEffect(() => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', '1');
      return params;
    });
  }, [query]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', newPage.toString());
      return params;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: SortFilter) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('sort', newSort);
      params.set('page', '1');
      return params;
    });
  };

  const handleTypeChange = (newType: TypeFilter) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('type', newType);
      params.set('page', '1');
      return params;
    });
  };

  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const hasActiveFilters = sortFilter !== 'relevance' || typeFilter !== 'all';

  return (
    <div className="min-h-screen pt-20">
      <div className="page-pattern" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <SectionHeader 
          title={`Search: "${query}"`}
          icon={<SearchIcon className="w-5 h-5" />}
        />

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Sort Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={`flex items-center gap-2 ${sortFilter !== 'relevance' ? 'border-primary/50 text-primary' : ''}`}
              >
                {sortFilter === 'latest' ? <Clock className="w-4 h-4" /> : 
                 sortFilter === 'rating' ? <TrendingUp className="w-4 h-4" /> : 
                 <SearchIcon className="w-4 h-4" />}
                {sortFilters.find(s => s.value === sortFilter)?.label}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="glass">
              {sortFilters.map((sort) => (
                <DropdownMenuItem 
                  key={sort.value}
                  onClick={() => handleSortChange(sort.value)}
                  className={sortFilter === sort.value ? 'bg-primary/10 text-primary' : ''}
                >
                  <sort.icon className="w-4 h-4 mr-2" />
                  {sort.label}
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
              currentPage={page}
              hasNextPage={data.pagination.hasNextPage}
              onPageChange={handlePageChange}
              className="mt-8"
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <SearchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any manga matching "{query}"
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear filters and try again
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;
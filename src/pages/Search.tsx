import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { searchManga } from '@/lib/api';
import { MangaItem, PaginatedResponse } from '@/types/manga';
import { MangaGrid, MangaGridSkeleton } from '@/components/MangaCard';
import { Pagination } from '@/components/Pagination';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Search = () => {
  const { query } = useParams<{ query: string }>();
  const [page, setPage] = useState(1);
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
        setData(result);
      } catch (err) {
        setError('Failed to search. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, page]);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        <SectionHeader 
          title={`Search: "${query}"`}
          icon={<SearchIcon className="w-5 h-5" />}
        />

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <SearchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              We couldn't find any manga matching "{query}"
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;

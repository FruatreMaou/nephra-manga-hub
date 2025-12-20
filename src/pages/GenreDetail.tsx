import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { getMangaByGenre } from '@/lib/api';
import { MangaItem, PaginatedResponse } from '@/types/manga';
import { MangaGrid, MangaGridSkeleton } from '@/components/MangaCard';
import { Pagination } from '@/components/Pagination';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

const GenreDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<MangaItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      try {
        const result = await getMangaByGenre(slug, page);
        setData(result);
      } catch (err) {
        setError('Failed to load manga. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const genreTitle = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        <SectionHeader 
          title={`Genre: ${genreTitle}`}
          icon={<Tag className="w-5 h-5" />}
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
            <p className="text-muted-foreground">No manga found in this genre</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default GenreDetail;

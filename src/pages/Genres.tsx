import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { getGenres } from '@/lib/api';
import { Genre } from '@/types/manga';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';

const Genres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (err) {
        setError('Failed to load genres. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        <SectionHeader 
          title="All Genres" 
          icon={<Tag className="w-5 h-5" />}
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg shimmer" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {genres.map((genre, index) => (
              <Link
                key={genre.slug}
                to={`/genre/${genre.slug}`}
                className="genre-tag text-center py-3 fade-up hover:scale-105 transition-transform"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {genre.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Genres;

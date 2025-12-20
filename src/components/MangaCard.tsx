import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MangaItem } from '@/types/manga';
import { getTypeBadgeClass } from '@/lib/api';

interface MangaCardProps {
  manga: MangaItem;
  index?: number;
}

export function MangaCard({ manga, index = 0 }: MangaCardProps) {
  return (
    <Link 
      to={`/manga/${manga.slug}`}
      className="manga-card group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-[3/4] relative overflow-hidden rounded-xl">
        <img
          src={manga.image}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={getTypeBadgeClass(manga.type)}>
            {manga.type}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm">
          <Star className="w-3 h-3 rating-glow fill-current" />
          <span className="text-xs font-semibold">{manga.rating}</span>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-display text-sm font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          {(manga.chapter || manga.latestChapter) && (
            <p className="text-xs text-muted-foreground">
              {manga.chapter || manga.latestChapter}
            </p>
          )}
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
        </div>
      </div>
    </Link>
  );
}

// Grid wrapper for manga cards
interface MangaGridProps {
  manga: MangaItem[];
  className?: string;
}

export function MangaGrid({ manga, className = '' }: MangaGridProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}>
      {manga.map((item, index) => (
        <MangaCard key={item.slug} manga={item} index={index} />
      ))}
    </div>
  );
}

// Skeleton loader for manga cards
export function MangaCardSkeleton() {
  return (
    <div className="manga-card">
      <div className="aspect-[3/4] rounded-xl shimmer" />
    </div>
  );
}

export function MangaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

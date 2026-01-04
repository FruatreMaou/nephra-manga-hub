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
      <div className="aspect-[3/4] relative overflow-hidden rounded-xl transition-all duration-500 ease-out group-hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.4)] group-hover:-translate-y-2">
        <img
          src={manga.image}
          alt={manga.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2 z-10 transition-transform duration-300 group-hover:scale-105">
          <span className={`type-badge ${getTypeBadgeClass(manga.type)}`}>
            {manga.type}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm transition-all duration-300 group-hover:bg-background/90 group-hover:scale-105">
          <Star className="w-3 h-3 rating-glow fill-current transition-transform duration-300 group-hover:rotate-12" />
          <span className="text-xs font-semibold">{manga.rating}</span>
        </div>

        {/* Info Overlay - slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 transition-all duration-300 ease-out translate-y-1 group-hover:translate-y-0">
          <h3 className="font-display text-sm font-semibold text-foreground line-clamp-2 mb-1 transition-colors duration-300 group-hover:text-primary">
            {manga.title}
          </h3>
          {(manga.chapter || manga.latestChapter) && (
            <p className="text-xs text-muted-foreground transition-opacity duration-300 opacity-80 group-hover:opacity-100">
              {manga.chapter || manga.latestChapter}
            </p>
          )}
        </div>

        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-primary/5 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-transparent" />
        </div>

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/30 transition-all duration-500 pointer-events-none" />
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

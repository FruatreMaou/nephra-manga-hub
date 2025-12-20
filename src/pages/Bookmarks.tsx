import { Link } from 'react-router-dom';
import { Bookmark as BookmarkIcon, Trash2 } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

// Placeholder for bookmarks - will be connected to Supabase
const Bookmarks = () => {
  const bookmarks: any[] = []; // Will be fetched from Supabase

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        <SectionHeader 
          title="My Bookmarks" 
          icon={<BookmarkIcon className="w-5 h-5" />}
        />

        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
              <BookmarkIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No Bookmarks Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding manga to your bookmarks to keep track of your favorites
            </p>
            <Link to="/browse">
              <Button className="btn-cosmic">
                Browse Manga
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id}
                className="glass-card rounded-xl p-4 flex gap-4"
              >
                <Link 
                  to={`/manga/${bookmark.manga_slug}`}
                  className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden"
                >
                  <img
                    src={bookmark.manga_image}
                    alt={bookmark.manga_title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/manga/${bookmark.manga_slug}`}
                    className="font-display font-semibold line-clamp-2 hover:text-primary transition-colors"
                  >
                    {bookmark.manga_title}
                  </Link>
                  <span className="text-xs text-muted-foreground block mt-1">
                    {bookmark.manga_type}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Bookmarks;

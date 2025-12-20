import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

// Placeholder for history - will be connected to Supabase
const History = () => {
  const history: any[] = []; // Will be fetched from Supabase

  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        <SectionHeader 
          title="Reading History" 
          icon={<Clock className="w-5 h-5" />}
        />

        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No Reading History</h3>
            <p className="text-muted-foreground mb-6">
              Start reading manga to see your history here
            </p>
            <Link to="/browse">
              <Button className="btn-cosmic">
                Browse Manga
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id}
                className="glass-card rounded-xl p-4 flex gap-4"
              >
                <Link 
                  to={`/manga/${item.manga_slug}`}
                  className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden"
                >
                  <img
                    src={item.manga_image}
                    alt={item.manga_title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/manga/${item.manga_slug}`}
                    className="font-display font-semibold line-clamp-1 hover:text-primary transition-colors"
                  >
                    {item.manga_title}
                  </Link>
                  <Link 
                    to={`/chapter/${item.chapter_slug}`}
                    className="text-sm text-primary hover:underline block mt-1"
                  >
                    {item.chapter_title}
                  </Link>
                  <span className="text-xs text-muted-foreground block mt-1">
                    Read {item.read_at}
                  </span>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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

export default History;

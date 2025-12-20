import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold glow-text">
                NEPHRA MANGA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Discover and read your favorite manga, manhwa, and manhua online. 
              Updated daily with the latest chapters from around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse All
                </Link>
              </li>
              <li>
                <Link to="/browse?status=popular" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Popular
                </Link>
              </li>
              <li>
                <Link to="/genres" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Genres
                </Link>
              </li>
              <li>
                <Link to="/browse?status=completed" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Completed
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Connect</h3>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Nephra Manga. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

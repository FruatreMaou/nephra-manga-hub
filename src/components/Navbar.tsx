import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, Menu, X, Home, BookOpen, Compass, Bookmark, Clock, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  user?: { email: string } | null;
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Browse', icon: Compass },
    { path: '/genres', label: 'Genres', icon: BookOpen },
  ];

  const userLinks = [
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/history', label: 'History', icon: Clock },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center animate-glow-pulse">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold glow-text hidden sm:block">
              NEPHRA MANGA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link flex items-center gap-2 text-sm ${
                  isActive(link.path) ? 'text-primary active' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search manga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 text-sm rounded-full bg-muted/50 border border-border/50 
                  focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </form>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {userLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`p-2 rounded-lg transition-colors ${
                      isActive(link.path) 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                  </Link>
                ))}
                <div className="w-px h-6 bg-border mx-2" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="btn-cosmic">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search manga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 text-sm rounded-xl bg-muted/50 border border-border/50 
                    focus:outline-none focus:border-primary/50 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.path) 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="h-px bg-border my-2" />
                  {userLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(link.path) 
                          ? 'bg-primary/20 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Mobile User Actions */}
            <div className="mt-4 pt-4 border-t border-border/50">
              {user ? (
                <div className="flex items-center justify-between px-4">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full btn-cosmic">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

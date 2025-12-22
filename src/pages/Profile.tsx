import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, BookmarkIcon, Clock, Edit2, Check, X, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { SectionHeader } from '@/components/SectionHeader';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut, updateUsername } = useAuth();
  const { bookmarks, loading: bookmarksLoading, removeBookmark, removeMultipleBookmarks, removeAllBookmarks } = useBookmarks();
  const { history, loading: historyLoading } = useReadingHistory();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    if (profile) {
      setNewUsername(profile.username);
    }
  }, [profile]);

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Username cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setSavingUsername(true);
    const { error } = await updateUsername(newUsername.trim());
    setSavingUsername(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update username',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Username updated',
      });
      setIsEditingUsername(false);
    }
  };

  const handleSelectBookmark = (id: string) => {
    setSelectedBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleSelectAllBookmarks = () => {
    if (selectedBookmarks.length === bookmarks.length) {
      setSelectedBookmarks([]);
    } else {
      setSelectedBookmarks(bookmarks.map(b => b.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBookmarks.length === 0) return;
    await removeMultipleBookmarks(selectedBookmarks);
    setSelectedBookmarks([]);
  };

  const handleDeleteAllBookmarks = async () => {
    await removeAllBookmarks();
    setSelectedBookmarks([]);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <div className="min-h-screen pt-20">
      <div className="stars-bg" />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              {isEditingUsername ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="max-w-xs"
                    placeholder="Enter username"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveUsername}
                    disabled={savingUsername}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(profile?.username || 'user');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold">
                    {profile?.username || 'user'}
                  </h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="mb-8">
          <SectionHeader
            title="Bookmarks"
            icon={<BookmarkIcon className="w-5 h-5" />}
          />

          {bookmarks.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllBookmarks}
              >
                {selectedBookmarks.length === bookmarks.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedBookmarks.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedBookmarks.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAllBookmarks}
                className="text-destructive hover:text-destructive"
              >
                Delete All
              </Button>
            </div>
          )}

          {bookmarksLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-8 glass-card rounded-xl">
              <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookmarks yet</p>
              <Link to="/browse">
                <Button className="mt-4">Browse Manga</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="glass-card rounded-xl overflow-hidden relative group"
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedBookmarks.includes(bookmark.id)}
                      onCheckedChange={() => handleSelectBookmark(bookmark.id)}
                      className="bg-background/80"
                    />
                  </div>
                  <Link to={`/manga/${bookmark.manga_slug}`}>
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={bookmark.manga_cover || '/placeholder.svg'}
                        alt={bookmark.manga_title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {bookmark.manga_title}
                      </h3>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      removeBookmark(bookmark.manga_slug);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reading History Section */}
        <div>
          <SectionHeader
            title="Reading History"
            icon={<Clock className="w-5 h-5" />}
          />

          {historyLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 glass-card rounded-xl">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reading history</p>
              <Link to="/browse">
                <Button className="mt-4">Start Reading</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-4 flex gap-4"
                >
                  <Link
                    to={`/manga/${item.manga_slug}`}
                    className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden"
                  >
                    <img
                      src={item.manga_cover || '/placeholder.svg'}
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
                      {formatDistanceToNow(new Date(item.read_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;

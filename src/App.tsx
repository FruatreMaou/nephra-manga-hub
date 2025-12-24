import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Genres from "./pages/Genres";
import GenreDetail from "./pages/GenreDetail";
import Search from "./pages/Search";
import MangaDetail from "./pages/MangaDetail";
import ChapterReader from "./pages/ChapterReader";
import Auth from "./pages/Auth";
import History from "./pages/History";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component that conditionally renders Navbar
const AppLayout = () => {
  const location = useLocation();
  const isChapterReader = location.pathname.startsWith('/chapter/');

  return (
    <>
      {!isChapterReader && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/genre/:slug" element={<GenreDetail />} />
        <Route path="/search/:query" element={<Search />} />
        <Route path="/manga/:slug" element={<MangaDetail />} />
        <Route path="/chapter/:slug" element={<ChapterReader />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/genre/:slug" element={<GenreDetail />} />
            <Route path="/search/:query" element={<Search />} />
            <Route path="/manga/:slug" element={<MangaDetail />} />
            <Route path="/chapter/:slug" element={<ChapterReader />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

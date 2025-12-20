// API Types for Nephra Manga

export interface MangaItem {
  title: string;
  slug: string;
  image: string;
  chapter?: string;
  latestChapter?: string;
  rating: string;
  type: 'Manga' | 'Manhwa' | 'Manhua';
}

export interface ChapterInfo {
  title: string;
  time?: string;
  date?: string;
  slug: string;
}

export interface ProjectUpdate extends MangaItem {
  chapters: ChapterInfo[];
}

export interface HomeData {
  hotUpdates: MangaItem[];
  projectUpdates: ProjectUpdate[];
  latestReleases: ProjectUpdate[];
}

export interface Genre {
  title: string;
  slug: string;
}

export interface MangaDetail {
  title: string;
  nativeTitle?: string;
  image: string;
  rating: string;
  synopsis: string;
  released?: string;
  author?: string;
  status?: string;
  type: string;
  updated?: string;
  genres: Genre[];
  chapters: ChapterInfo[];
}

export interface ChapterNavigation {
  prev?: string;
  next?: string;
  allChapters?: string;
}

export interface ChapterAPIResponse {
  title: string;
  comicSlug: string;
  images: string[];
  navigation: ChapterNavigation;
}

export interface ChapterData {
  title: string;
  images: string[];
  prevChapter?: string;
  nextChapter?: string;
  mangaSlug?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    nextPage: number | null;
  };
}

export interface APIResponse<T> {
  creator: string;
  success: boolean;
  data: T;
  pagination?: {
    currentPage: number;
    hasNextPage: boolean;
    nextPage: number | null;
  };
}

// User related types
export interface Bookmark {
  id: string;
  user_id: string;
  manga_slug: string;
  manga_title: string;
  manga_image: string;
  manga_type: string;
  created_at: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  manga_slug: string;
  manga_title: string;
  manga_image: string;
  manga_type: string;
  chapter_slug: string;
  chapter_title: string;
  read_at: string;
}

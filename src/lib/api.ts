import { 
  APIResponse, 
  HomeData, 
  Genre, 
  MangaItem, 
  MangaDetail, 
  ChapterData,
  ChapterAPIResponse,
  PaginatedResponse 
} from '@/types/manga';

const BASE_URL = 'https://www.sankavollerei.com/comic/komikcast';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const json: APIResponse<T> = await response.json();
  if (!json.success) {
    throw new Error('API returned unsuccessful response');
  }
  return json.data;
}

async function fetchPaginatedAPI<T>(endpoint: string): Promise<PaginatedResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error('API returned unsuccessful response');
  }
  return {
    data: json.data,
    pagination: json.pagination || { currentPage: 1, hasNextPage: false, nextPage: null }
  };
}

// Home page data
export async function getHomeData(): Promise<HomeData> {
  return fetchAPI<HomeData>('/home');
}

// All manga list
export async function getAllManga(): Promise<MangaItem[]> {
  return fetchAPI<MangaItem[]>('/list');
}

// Latest releases with pagination
export async function getLatestReleases(page: number = 1): Promise<PaginatedResponse<MangaItem>> {
  return fetchPaginatedAPI<MangaItem>(`/latest/${page}`);
}

// Popular manga with pagination
export async function getPopularManga(page: number = 1): Promise<PaginatedResponse<MangaItem>> {
  return fetchPaginatedAPI<MangaItem>(`/populer/${page}`);
}

// Completed manga with pagination
export async function getCompletedManga(page: number = 1): Promise<PaginatedResponse<MangaItem>> {
  return fetchPaginatedAPI<MangaItem>(`/completed/${page}`);
}

// Ongoing manga with pagination
export async function getOngoingManga(page: number = 1): Promise<PaginatedResponse<MangaItem>> {
  return fetchPaginatedAPI<MangaItem>(`/ongoing/${page}`);
}

// Project list with pagination
export async function getProjects(page: number = 1): Promise<PaginatedResponse<MangaItem>> {
  return fetchPaginatedAPI<MangaItem>(`/projects/${page}`);
}

// Search manga
export async function searchManga(query: string, page: number = 1): Promise<PaginatedResponse<MangaItem>> {
  return fetchPaginatedAPI<MangaItem>(`/search/${encodeURIComponent(query)}/${page}`);
}

// All genres
export async function getGenres(): Promise<Genre[]> {
  return fetchAPI<Genre[]>('/genres');
}

// Filter by genre with pagination
export async function getMangaByGenre(slug: string, page: number = 1): Promise<PaginatedResponse<MangaItem>> {
  return fetchPaginatedAPI<MangaItem>(`/genre/${slug}/${page}`);
}

// Manga detail
export async function getMangaDetail(slug: string): Promise<MangaDetail> {
  return fetchAPI<MangaDetail>(`/detail/${slug}`);
}

// Read chapter
export async function getChapter(slug: string): Promise<ChapterData> {
  const response = await fetchAPI<ChapterAPIResponse>(`/chapter/${slug}`);
  
  // Transform API response to our ChapterData format
  return {
    title: response.title || slug.replace(/-/g, ' ').replace(/bahasa indonesia/gi, '').trim(),
    images: response.images,
    prevChapter: response.navigation?.prev || undefined,
    nextChapter: response.navigation?.next || undefined,
    mangaSlug: response.comicSlug
  };
}

// Helper to clean chapter title (removes newlines)
export function cleanChapterTitle(title: string): string {
  return title.replace(/\n/g, ' ').trim();
}

// Helper to get type badge class
export function getTypeBadgeClass(type: string): string {
  switch (type.toLowerCase()) {
    case 'manga':
      return 'badge-manga';
    case 'manhwa':
      return 'badge-manhwa';
    case 'manhua':
      return 'badge-manhua';
    default:
      return 'badge-manga';
  }
}

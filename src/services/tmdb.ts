import axios from 'axios';
import { Movie, Cast, Episode } from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export const tmdbIsConfigured = Boolean(API_KEY);

const TMDB_CONFIG_ERROR =
  'TMDB is not configured. Set VITE_TMDB_API_KEY in your .env (see .env.example), then restart the dev server.';

function assertTmdbConfigured() {
  if (!API_KEY) {
    throw new Error(TMDB_CONFIG_ERROR);
  }
}

type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
  published_at?: string;
};

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const tmdbService = {
  getTrending: async (type: 'movie' | 'tv' | 'all' = 'all'): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/trending/${type}/week`);
    const results = data.results || [];
    if (type === 'all') {
      return results
        .filter((item: any) => item?.media_type === 'movie' || item?.media_type === 'tv')
        .map((item: any) => ({ ...item, media_type: item.media_type }));
    }
    return results.map((item: any) => ({ ...item, media_type: type }));
  },

  getPopular: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/${type}/popular`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getTopRated: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/${type}/top_rated`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getLatest: async (type: 'movie' | 'tv'): Promise<Movie[]> => {
    assertTmdbConfigured();
    const endpoint = type === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
    const { data } = await tmdb.get(endpoint);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getMoviesByGenre: async (genreId: number): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get('/discover/movie', {
      params: { with_genres: genreId },
    });
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
  },

  getDetails: async (type: 'movie' | 'tv', id: number): Promise<Movie> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/${type}/${id}`);
    return { ...data, media_type: type };
  },

  getCredits: async (type: 'movie' | 'tv', id: number): Promise<Cast[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/${type}/${id}/credits`);
    return (data.cast || []).slice(0, 10);
  },

  getSimilar: async (type: 'movie' | 'tv', id: number): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/${type}/${id}/similar`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
  },

  getEpisodes: async (tvId: number, seasonNumber: number): Promise<Episode[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
    return data.episodes || [];
  },

  search: async (query: string): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get('/search/multi', {
      params: { query },
    });
    return (data.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  },

  getTitleLogoPath: async (type: 'movie' | 'tv', id: number): Promise<string | null> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/${type}/${id}/images`, {
      params: {
        include_image_language: 'en,null',
      },
    });

    const logos = (data?.logos || []) as Array<{
      file_path: string;
      iso_639_1: string | null;
      vote_average: number;
      vote_count: number;
      width: number;
    }>;

    if (logos.length === 0) return null;

    const rank = (logo: (typeof logos)[number]) => {
      const languageRank = logo.iso_639_1 === 'en' ? 0 : logo.iso_639_1 == null ? 1 : 2;
      // Primary: language preference; then community votes; then width as tie-breaker.
      return [languageRank, -logo.vote_count, -logo.vote_average, -logo.width] as const;
    };

    const best = [...logos].sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      for (let i = 0; i < ra.length; i++) {
        if (ra[i] !== rb[i]) return ra[i] - rb[i];
      }
      return 0;
    })[0];

    return best?.file_path || null;
  },

  getPersonDetails: async (id: number): Promise<any> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/person/${id}`);
    return data;
  },

  getPersonCombinedCredits: async (id: number): Promise<any> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/person/${id}/combined_credits`);
    return data;
  },

  getVideos: async (type: 'movie' | 'tv', id: number): Promise<TmdbVideo[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/${type}/${id}/videos`);
    return (data?.results || []) as TmdbVideo[];
  },

  getBestTrailerKey: async (type: 'movie' | 'tv', id: number): Promise<string | null> => {
    const videos = await tmdbService.getVideos(type, id);
    const trailers = videos.filter((v) => v?.type === 'Trailer' && v?.site === 'YouTube' && v?.key);
    if (trailers.length === 0) return null;

    // Prefer official trailers, otherwise use the first YouTube trailer in TMDB order.
    const preferred = trailers.find((v) => v.official) ?? trailers[0];
    return preferred?.key || null;
  },

  getImageUrl: (path: string | null | undefined, size: 'w500' | 'original' = 'w500') => {
    if (!path) return undefined;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  },

  getMoviesByStudio: async (companyId: number): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get('/discover/movie', {
      params: { with_companies: companyId, sort_by: 'popularity.desc' },
    });
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
  },

  getCollection: async (collectionId: number): Promise<{ id: number; name: string; backdrop_path: string | null; parts: Movie[] }> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get(`/collection/${collectionId}`);
    return { ...data, parts: (data.parts || []).map((p: any) => ({ ...p, media_type: 'movie' })) };
  },

  getTrendingAnime: async (): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get('/trending/tv/week');
    return (data.results || [])
      .filter((item: any) => item.genre_ids?.includes(16))
      .map((item: any) => ({ ...item, media_type: 'tv' }));
  },

  getPopularAnime: async (): Promise<Movie[]> => {
    assertTmdbConfigured();
    const { data } = await tmdb.get('/discover/tv', {
      params: { with_genres: 16, sort_by: 'popularity.desc' },
    });
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));
  },
};

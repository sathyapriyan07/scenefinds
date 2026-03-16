export interface Movie {
  id: number;
  title: string;
  name?: string; // for TV shows
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  runtime?: number;
  number_of_seasons?: number;
  genres?: { id: number; name: string }[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  addedAt: number;
}

export interface ContinueWatching {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  progress: number; // percentage or seconds
  season?: number;
  episode?: number;
  updatedAt: number;
}

export interface HeroBanner {
  id: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  titleLogo?: string;
  customDescription?: string;
  customBackdrop?: string;
  isActive: boolean;
  order: number;
}

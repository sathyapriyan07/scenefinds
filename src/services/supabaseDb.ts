import { supabase, supabaseIsConfigured } from '../supabase';

export type WatchlistRow = {
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  added_at: string;
};

export type ContinueWatchingRow = {
  user_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  progress: number | null;
  season: number | null;
  episode: number | null;
  updated_at: string;
};

function assertConfigured() {
  if (!supabaseIsConfigured) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

export async function getWatchlist(userId: string): Promise<WatchlistRow[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return (data || []) as WatchlistRow[];
}

export async function isInWatchlist(userId: string, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
  assertConfigured();
  const { data, error } = await supabase
    .from('watchlist')
    .select('tmdb_id')
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function addToWatchlist(input: {
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
}): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from('watchlist').upsert({
    user_id: input.userId,
    tmdb_id: input.tmdbId,
    media_type: input.mediaType,
    title: input.title,
    poster_path: input.posterPath,
    added_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function removeFromWatchlist(userId: string, tmdbId: number, mediaType: 'movie' | 'tv'): Promise<void> {
  assertConfigured();
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType);
  if (error) throw error;
}

export async function getContinueWatching(userId: string, limit = 10): Promise<ContinueWatchingRow[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from('continue_watching')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as ContinueWatchingRow[];
}

export async function upsertContinueWatching(input: {
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  progress: number | null;
  season: number | null;
  episode: number | null;
}): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from('continue_watching').upsert({
    user_id: input.userId,
    tmdb_id: input.tmdbId,
    media_type: input.mediaType,
    title: input.title,
    poster_path: input.posterPath,
    progress: input.progress,
    season: input.season,
    episode: input.episode,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}


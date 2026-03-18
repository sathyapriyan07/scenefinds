import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { MovieRow } from '../components/MovieRow';
import { TopTenRow } from '../components/TopTenRow';
import { StudiosSection } from '../components/StudiosSection';
import { CollectionsSection } from '../components/CollectionsSection';
import { StreamingPlatforms } from '../components/StreamingPlatforms';
import { tmdbIsConfigured, tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import { getContinueWatching } from '../services/supabaseDb';

const Home = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [latest, setLatest] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Movie[]>([]);
  const [popularAnime, setPopularAnime] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [
          trendingData,
          popularMoviesData,
          topRatedData,
          latestData,
          popularTVData,
          actionData,
          comedyData,
          trendingAnimeData,
          popularAnimeData,
        ] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular('movie'),
          tmdbService.getTopRated('movie'),
          tmdbService.getLatest('movie'),
          tmdbService.getPopular('tv'),
          tmdbService.getMoviesByGenre(28),
          tmdbService.getMoviesByGenre(35),
          tmdbService.getTrendingAnime(),
          tmdbService.getPopularAnime(),
        ]);

        setTrending(trendingData);
        setPopularMovies(popularMoviesData);
        setTopRated(topRatedData);
        setLatest(latestData);
        setPopularTV(popularTVData);
        setAction(actionData);
        setComedy(comedyData);
        setTrendingAnime(trendingAnimeData);
        setPopularAnime(popularAnimeData);

        if (user) {
          try {
            const rows = await getContinueWatching(user.id, 10);
            const cwData = rows.map((data) => {
              return {
                id: data.tmdb_id,
                tmdbId: data.tmdb_id,
                title: data.title,
                poster_path: data.poster_path || '',
                media_type: data.media_type,
                overview: '',
                backdrop_path: '',
                release_date: '',
                vote_average: 0,
                genre_ids: []
              } as Movie;
            });
            setContinueWatching(cwData);
          } catch (cwError) {
            console.warn('Continue watching query failed:', cwError);
            setContinueWatching([]);
          }
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load titles.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, refreshTick]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasAnyContent =
    continueWatching.length > 0 ||
    trending.length > 0 ||
    popularMovies.length > 0 ||
    topRated.length > 0 ||
    latest.length > 0 ||
    popularTV.length > 0 ||
    action.length > 0 ||
    comedy.length > 0;

  if (!hasAnyContent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 shadow-2xl shadow-black/40">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Nothing to show yet
          </h1>
          {!tmdbIsConfigured ? (
            <>
              <p className="text-zinc-300 leading-relaxed mb-5">
                TMDB is not configured, so the Home feed cannot load movies and shows.
              </p>
              <div className="rounded-xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 font-mono overflow-x-auto mb-5">
                <div>VITE_TMDB_API_KEY=&quot;YOUR_TMDB_KEY&quot;</div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Add it to your <span className="font-mono">.env</span> (see <span className="font-mono">.env.example</span>), then restart the dev server.
              </p>
            </>
          ) : (
            <>
              <p className="text-zinc-300 leading-relaxed mb-5">
                The app couldn&apos;t load titles from TMDB right now.
              </p>
              {errorMessage && (
                <div className="rounded-xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200 mb-5">
                  {errorMessage}
                </div>
              )}
              <button
                onClick={() => {
                  setLoading(true);
                  setRefreshTick((n) => n + 1);
                }}
                className="bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Hero movies={trending.slice(0, 5)} />
      
      <div className="relative z-10 mt-6 md:mt-10 lg:mt-12">
        {continueWatching.length > 0 && (
          <MovieRow title="Continue Watching" movies={continueWatching} />
        )}
        <TopTenRow title="Trending Now" movies={trending} />
        <TopTenRow title="Top 10 Movies" movies={topRated} />
        <TopTenRow title="Top 10 TV Shows" movies={popularTV} />
        <TopTenRow title="Popular Movies" movies={popularMovies} />
        <TopTenRow title="Trending Anime" movies={trendingAnime} />
        <TopTenRow title="Popular Anime" movies={popularAnime} />
        <StudiosSection />
        <StreamingPlatforms />
        <CollectionsSection />
        <TopTenRow title="Latest Movies" movies={latest} />
        <TopTenRow title="Action Movies" movies={action} />
        <TopTenRow title="Comedy Movies" movies={comedy} />
      </div>
    </div>
  );
};

export default Home;

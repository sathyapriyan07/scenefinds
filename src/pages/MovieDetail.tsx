import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie, Cast } from '../types';
import { MovieRow } from '../components/MovieRow';
import { YouTubeBackdrop } from '../components/YouTubeBackdrop';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [titleLogoPath, setTitleLogoPath] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [allowTrailerAutoplay, setAllowTrailerAutoplay] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Respect reduced-motion users by not auto-playing video backgrounds.
    try {
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      setAllowTrailerAutoplay(!prefersReduced);
    } catch {
      setAllowTrailerAutoplay(true);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [movieData, castData, similarData, logoPath, bestTrailerKey] = await Promise.all([
          tmdbService.getDetails('movie', parseInt(id)),
          tmdbService.getCredits('movie', parseInt(id)),
          tmdbService.getSimilar('movie', parseInt(id)),
          tmdbService.getTitleLogoPath('movie', parseInt(id)),
          tmdbService.getBestTrailerKey('movie', parseInt(id)),
        ]);
        setMovie(movieData);
        setCast(castData);
        setSimilar(similarData);
        setTitleLogoPath(logoPath);
        setTrailerKey(bestTrailerKey);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load movie details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;

    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', user.uid),
      where('tmdbId', '==', parseInt(id))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsInWatchlist(!snapshot.empty);
    });

    return () => unsubscribe();
  }, [user, id]);

  const toggleWatchlist = async () => {
    if (!user || !movie) return;

    const watchlistId = `${user.uid}_${movie.id}`;
    if (isInWatchlist) {
      await deleteDoc(doc(db, 'watchlist', watchlistId));
    } else {
      await setDoc(doc(db, 'watchlist', watchlistId), {
        userId: user.uid,
        tmdbId: movie.id,
        mediaType: 'movie',
        title: movie.title,
        posterPath: movie.poster_path,
        addedAt: Date.now(),
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Can’t load this title</h1>
          <p className="text-zinc-300 leading-relaxed mb-6">{errorMessage}</p>
          <Link
            to="/"
            className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Movie not found</h1>
          <Link
            to="/"
            className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-black">
      {/* Hero Banner */}
      <div className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              tmdbService.getImageUrl(movie.backdrop_path, 'original') ||
              'https://via.placeholder.com/1920x1080?text=No+Backdrop'
            }
            alt={movie.title}
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080?text=No+Backdrop';
            }}
          />

          {trailerKey && (
            <YouTubeBackdrop
              videoKey={trailerKey}
              title={`${movie.title} trailer`}
              enabled={allowTrailerAutoplay}
              onError={() => setTrailerKey(null)}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end pb-12 md:pb-20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 w-full overflow-hidden">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-300 mb-6 uppercase tracking-widest">
                <div className="flex items-center gap-1 text-white">
                  <Star size={14} fill="currentColor" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span>{movie.release_date.split('-')[0]}</span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span>{movie.runtime} min</span>
                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                <span className="px-1.5 py-0.5 border border-zinc-600 rounded text-[10px]">4K</span>
              </div>

              {titleLogoPath ? (
                <img
                  src={tmdbService.getImageUrl(titleLogoPath, 'original')}
                  alt={movie.title}
                  className="max-h-16 md:max-h-24 max-w-[18rem] md:max-w-[26rem] w-auto mb-5 object-contain drop-shadow-[0_14px_34px_rgba(0,0,0,0.6)]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    setTitleLogoPath(null);
                  }}
                />
              ) : (
                <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6 font-display leading-[0.9]">
                  {movie.title}
                </h1>
              )}

              <p className="text-base md:text-lg text-zinc-300 max-w-2xl line-clamp-3 md:line-clamp-none mb-10 font-medium leading-relaxed">
                {movie.overview}
              </p>

              <div className="flex items-center gap-3 mt-5">
                <Link
                  to={`/watch/movie/${movie.id}`}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
                >
                  <Play size={18} fill="currentColor" className="md:w-5 md:h-5" />
                  <span>Play Now</span>
                </Link>
                <button
                  onClick={toggleWatchlist}
                  className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-neutral-800 transition-all active:scale-95"
                >
                  {isInWatchlist ? <Check size={18} className="md:w-5 md:h-5" /> : <Plus size={18} className="md:w-5 md:h-5" />}
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      <div className="py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8 text-white/90">Cast & Crew</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 scroll-snap-x">
            {cast.map((person) => (
              <Link
                key={person.id}
                to={`/person/${person.id}`}
                className="flex-shrink-0 w-28 md:w-36 group snap-start"
              >
                <div className="aspect-square rounded-full overflow-hidden border border-white/5 mb-4 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={tmdbService.getImageUrl(person.profile_path) || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>
                <p className="text-xs font-bold text-white mb-1 truncate">{person.name}</p>
                <p className="text-[10px] font-medium text-zinc-500 truncate uppercase tracking-tighter">{person.character}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      <MovieRow title="More Like This" movies={similar} />
    </div>
  );
};

export default MovieDetail;

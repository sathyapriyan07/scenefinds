import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { Movie } from '../types';
import { tmdbService } from '../services/tmdb';

interface HeroProps {
  movies: Movie[];
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const Hero: React.FC<HeroProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleLogoCache = useRef<Record<number, string | null>>({});
  const [titleLogoById, setTitleLogoById] = useState<Record<number, string | null>>({});
  const [brokenLogoById, setBrokenLogoById] = useState<Record<number, true>>({});

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentIndex(index);
    }
  };

  if (movies.length === 0) return null;

  useEffect(() => {
    let cancelled = false;

    const candidates = movies
      .slice(0, 5)
      .filter((m) => m?.media_type === 'movie' || m?.media_type === 'tv')
      .filter((m) => !(m.id in titleLogoCache.current));

    if (candidates.length === 0) return;

    (async () => {
      const settled = await Promise.allSettled(
        candidates.map(async (m) => {
          const path = await tmdbService.getTitleLogoPath(m.media_type, m.id);
          return [m.id, path] as const;
        }),
      );

      if (cancelled) return;

      const updates: Record<number, string | null> = {};
      for (const result of settled) {
        if (result.status === 'fulfilled') {
          const [id, path] = result.value;
          updates[id] = path;
        }
      }

      const keys = Object.keys(updates);
      if (keys.length === 0) return;

      for (const key of keys) {
        titleLogoCache.current[Number(key)] = updates[Number(key)] ?? null;
      }

      setTitleLogoById((prev) => ({ ...prev, ...updates }));
    })();

    return () => {
      cancelled = true;
    };
  }, [movies]);

  return (
    <div className="relative h-[85vh] md:h-[95vh] w-full bg-black">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full"
      >
        {movies.map((movie) => {
          const releaseYear = (movie.release_date || movie.first_air_date || '').split('-')[0];
          const genreName = movie.genre_ids?.[0] ? GENRE_MAP[movie.genre_ids[0]] : null;
          const titleLogoPath = brokenLogoById[movie.id] ? null : titleLogoById[movie.id];
          
          return (
            <div key={movie.id} className="flex-shrink-0 w-full h-full snap-start relative">
              <img
                src={tmdbService.getImageUrl(movie.backdrop_path, 'original') || 'https://via.placeholder.com/1920x1080?text=No+Backdrop'}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex items-end pb-12 md:pb-20">
                <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Star size={14} fill="currentColor" className="text-white" />
                        <span className="text-xs font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                      </div>
                      {releaseYear && (
                        <>
                          <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                          <span className="text-xs font-medium text-zinc-400">{releaseYear}</span>
                        </>
                      )}
                      {genreName && (
                        <>
                          <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{genreName}</span>
                        </>
                      )}
                    </div>
                    
                    {titleLogoPath ? (
                      <img
                        src={tmdbService.getImageUrl(titleLogoPath, 'original')}
                        alt={movie.title || movie.name}
                        className="max-h-24 md:max-h-36 w-auto mb-3 object-contain drop-shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setBrokenLogoById((prev) => ({ ...prev, [movie.id]: true }));
                        }}
                      />
                    ) : (
                      <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-3 font-display leading-[0.9]">
                        {movie.title || movie.name}
                      </h1>
                    )}
                    
                    <p className="text-base md:text-lg text-zinc-300 line-clamp-2 mb-5 max-w-xl font-medium leading-relaxed">
                      {movie.overview}
                    </p>

                    <div className="flex items-center gap-3">
                      <Link
                        to={`/watch/${movie.media_type}/${movie.id}`}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/10"
                      >
                        <Play size={18} fill="currentColor" className="md:w-5 md:h-5" />
                        <span>Play Now</span>
                      </Link>
                      <Link
                        to={`/${movie.media_type}/${movie.id}`}
                        className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm md:text-base hover:bg-neutral-800 transition-all active:scale-95"
                      >
                        <Info size={18} className="md:w-5 md:h-5" />
                        <span>Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20 opacity-40">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              scrollRef.current?.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: 'smooth' });
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentIndex ? "w-12 bg-white" : "w-3 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

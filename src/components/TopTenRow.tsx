import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { tmdbService } from '../services/tmdb';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  18: 'Drama', 14: 'Fantasy', 27: 'Horror', 10749: 'Romance', 878: 'Sci-Fi',
  53: 'Thriller', 10759: 'Action & Adventure', 10765: 'Sci-Fi & Fantasy',
};

interface TopTenRowProps {
  title: string;
  movies: Movie[];
}

export const TopTenRow: React.FC<TopTenRowProps> = ({ title, movies }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

  const top10 = movies.slice(0, 10);

  return (
    <section className="py-4 md:py-6 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-2xl font-semibold tracking-tight text-white/90">{title}</h2>
          <ChevronRight size={20} className="text-neutral-400" />
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x snap-mandatory"
        >
          {top10.map((movie, index) => {
            const imageUrl = tmdbService.getImageUrl(movie.poster_path) || tmdbService.getImageUrl(movie.backdrop_path) || 'https://via.placeholder.com/300x400?text=No+Image';
            const genre = movie.genre_ids?.[0] ? GENRE_MAP[movie.genre_ids[0]] : null;

            return (
              <Link
                key={movie.id}
                to={`/${movie.media_type || 'movie'}/${movie.id}`}
                className="flex-shrink-0 snap-start relative group w-[30vw] sm:w-[22vw] md:w-[18vw] lg:w-[14vw] max-w-[200px] min-w-[110px]"
              >
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden hover:scale-105 transition duration-300">
                  <img
                    src={imageUrl}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Image'; }}
                  />
                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* rank number */}
                  <span className="absolute top-2 left-3 text-3xl font-bold text-white/90 drop-shadow-lg leading-none">
                    {index + 1}
                  </span>

                  {/* title + genre */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5">
                    <h3 className="text-xs md:text-sm font-semibold text-white leading-tight line-clamp-2">
                      {movie.title || movie.name}
                    </h3>
                    {genre && (
                      <p className="text-[10px] text-neutral-300">{genre}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '../types';
import { tmdbService } from '../services/tmdb';

interface PosterCardProps {
  movie: Movie;
}

export const PosterCard: React.FC<PosterCardProps> = ({ movie }) => {
  const posterUrl = tmdbService.getImageUrl(movie.poster_path) || 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <Link 
      to={`/${movie.media_type || 'movie'}/${movie.id}`} 
      className="flex-shrink-0 group snap-start w-[30%] sm:w-[22%] md:w-[18%] lg:w-[15%] min-w-[105px] md:min-w-[180px]"
    >
      <motion.div
        whileHover={{ scale: 1.04, y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shadow-lg"
      >
        <img
          src={posterUrl}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Poster';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-2 md:p-3">
          <div className="flex items-center gap-1.5 text-white mb-0.5 md:mb-1">
            <Star size={8} fill="currentColor" className="text-accent md:w-2.5 md:h-2.5" />
            <span className="text-[8px] md:text-[10px] font-black">{movie.vote_average.toFixed(1)}</span>
          </div>
          <h3 className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight leading-tight line-clamp-1 md:line-clamp-2">{movie.title || movie.name}</h3>
        </div>
      </motion.div>
    </Link>
  );
};

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <section className="py-4 md:py-8 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white/90">
            {title}
          </h2>
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 transition-colors text-white/70 hover:text-white"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 transition-colors text-white/70 hover:text-white"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <PosterCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

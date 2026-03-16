import React, { useEffect, useState } from 'react';
import { MovieRow } from '../components/MovieRow';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

const Movies = () => {
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [latest, setLatest] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tmdbService.getPopular('movie'),
      tmdbService.getTopRated('movie'),
      tmdbService.getLatest('movie'),
      tmdbService.getMoviesByGenre(28),
      tmdbService.getMoviesByGenre(35),
    ]).then(([pop, top, lat, act, com]) => {
      setPopular(pop);
      setTopRated(top);
      setLatest(lat);
      setAction(act);
      setComedy(com);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-20 pb-20">
      <MovieRow title="Popular Movies" movies={popular} />
      <MovieRow title="Top Rated" movies={topRated} />
      <MovieRow title="Latest Movies" movies={latest} />
      <MovieRow title="Action" movies={action} />
      <MovieRow title="Comedy" movies={comedy} />
    </div>
  );
};

export default Movies;

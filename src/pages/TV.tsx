import React, { useEffect, useState } from 'react';
import { MovieRow } from '../components/MovieRow';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

const TV = () => {
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [latest, setLatest] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tmdbService.getPopular('tv'),
      tmdbService.getTopRated('tv'),
      tmdbService.getLatest('tv'),
    ]).then(([pop, top, lat]) => {
      setPopular(pop);
      setTopRated(top);
      setLatest(lat);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-20 pb-20">
      <MovieRow title="Popular TV Shows" movies={popular} />
      <MovieRow title="Top Rated TV Shows" movies={topRated} />
      <MovieRow title="On The Air" movies={latest} />
    </div>
  );
};

export default TV;

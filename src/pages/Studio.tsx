import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MovieRow } from '../components/MovieRow';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

const studioNames: Record<number, string> = {
  420: 'Marvel Studios', 3: 'Pixar', 2: 'Walt Disney Pictures',
  174: 'Warner Bros', 33: 'Universal Pictures', 521: 'DreamWorks',
  4: 'Paramount', 5: 'Columbia Pictures', 25: '20th Century Studios', 923: 'Legendary',
};

const Studio = () => {
  const { id } = useParams<{ id: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const studioId = Number(id);
  const studioName = studioNames[studioId] || 'Studio';

  useEffect(() => {
    tmdbService.getMoviesByStudio(studioId)
      .then(setMovies)
      .finally(() => setLoading(false));
  }, [studioId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-20 pb-20">
      <MovieRow title={studioName} movies={movies} />
    </div>
  );
};

export default Studio;

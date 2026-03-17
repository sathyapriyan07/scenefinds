import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MovieRow } from '../components/MovieRow';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

const platformNames: Record<number, string> = {
  8: 'Netflix', 119: 'Prime Video', 122: 'JioHotstar',
  350: 'Apple TV+', 384: 'HBO Max', 15: 'Hulu',
  531: 'Paramount+', 386: 'Peacock',
};

const Platform = () => {
  const { id } = useParams<{ id: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const providerId = Number(id);
  const platformName = platformNames[providerId] || 'Platform';

  useEffect(() => {
    Promise.all([
      tmdbService.getContentByPlatform(providerId, 'movie'),
      tmdbService.getContentByPlatform(providerId, 'tv'),
    ]).then(([mov, ser]) => {
      setMovies(mov);
      setSeries(ser);
    }).finally(() => setLoading(false));
  }, [providerId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-20 pb-20">
      <MovieRow title={`${platformName} — Movies`} movies={movies} />
      <MovieRow title={`${platformName} — Series`} movies={series} />
    </div>
  );
};

export default Platform;

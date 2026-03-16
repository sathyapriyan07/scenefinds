import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MovieRow } from '../components/MovieRow';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

const Collection = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tmdbService.getCollection(Number(id)).then((col) => {
      setName(col.name);
      setBackdrop(col.backdrop_path);
      setMovies(col.parts.sort((a: any, b: any) => (a.release_date || '').localeCompare(b.release_date || '')));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-20">
      {backdrop && (
        <div className="relative h-[40vh] w-full">
          <img src={tmdbService.getImageUrl(backdrop, 'original')} alt={name} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-4 md:left-8">
            <h1 className="text-3xl md:text-5xl font-bold">{name}</h1>
            <p className="text-neutral-400 mt-1">{movies.length} movies</p>
          </div>
        </div>
      )}
      <div className="mt-6">
        <MovieRow title="" movies={movies} />
      </div>
    </div>
  );
};

export default Collection;

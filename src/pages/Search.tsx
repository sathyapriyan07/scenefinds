import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { PosterCard } from '../components/MovieRow';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await tmdbService.search(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <div className="min-h-screen pt-6 md:pt-8 pb-20">
      <div className="max-w-screen-md mx-auto px-4 overflow-hidden">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-4">Search</h1>
          <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <SearchIcon className="text-neutral-500" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Movies, TV Shows, and More"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-500"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-neutral-500 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {results.map((movie) => (
              <PosterCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No results found for "{query}"</p>
          </div>
        )}

        {!query && (
          <div className="mt-8">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest opacity-50">Discover something new</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

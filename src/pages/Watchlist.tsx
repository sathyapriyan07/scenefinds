import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Movie } from '../types';
import { PosterCard } from '../components/MovieRow';
import { Bookmark } from 'lucide-react';

const Watchlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'watchlist'),
      where('userId', '==', user.uid),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.tmdbId,
          tmdbId: data.tmdbId,
          title: data.title,
          poster_path: data.posterPath,
          media_type: data.mediaType,
          overview: '',
          backdrop_path: '',
          release_date: '',
          vote_average: 0,
          genre_ids: []
        } as Movie;
      });
      setWatchlist(items);
      setLoading(false);
    }, (error) => {
      console.error('Watchlist error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
        <Bookmark size={64} className="text-zinc-700 mb-6" />
        <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Your Watchlist is empty</h2>
        <p className="text-zinc-500 max-w-sm">Sign in to save movies and series to your personal watchlist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display">Watchlist</h1>
            <p className="text-zinc-500 font-medium">Movies and TV Shows you've saved to watch later.</p>
          </div>
          <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-zinc-400">
            {watchlist.length} {watchlist.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Bookmark size={48} className="text-zinc-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
            <p className="text-zinc-500">Find movies and shows to add them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {watchlist.map((movie) => (
              <PosterCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;

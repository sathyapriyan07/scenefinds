import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';

const Watch = () => {
  const { id, season, episode } = useParams<{ id: string; season?: string; episode?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const mediaType = season ? 'tv' : 'movie';
  const tmdbId = parseInt(id || '0');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setDetailsError(null);
        const data = await tmdbService.getDetails(mediaType, tmdbId);
        setMovie(data);
      } catch (error) {
        console.error('Error fetching watch details:', error);
        setDetailsError(error instanceof Error ? error.message : 'Failed to load title details.');
      }
    };
    fetchDetails();
  }, [tmdbId, mediaType]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Vidking player sends progress updates via postMessage
      // Note: This depends on the specific implementation of the player
      if (event.data && event.data.type === 'progress' && user && movie) {
        const progress = event.data.progress; // percentage or seconds
        const progressId = `${user.uid}_${tmdbId}`;
        
        await setDoc(doc(db, 'continue_watching', progressId), {
          userId: user.uid,
          tmdbId,
          mediaType,
          title: movie.title || movie.name,
          posterPath: movie.poster_path,
          progress,
          season: season ? parseInt(season) : null,
          episode: episode ? parseInt(episode) : null,
          updatedAt: Date.now(),
        }, { merge: true });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, movie, tmdbId, mediaType, season, episode]);

  const iframeSrc = mediaType === 'movie'
    ? `https://www.vidking.net/embed/movie/${tmdbId}?autoPlay=true`
    : `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true&nextEpisode=true&episodeSelector=true`;

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors pointer-events-auto"
        >
          <ArrowLeft size={24} />
        </button>
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors pointer-events-auto"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {detailsError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-4">
          <div className="max-w-xl rounded-xl border border-white/10 bg-black/70 backdrop-blur-md px-4 py-3 text-sm text-zinc-200 shadow-2xl">
            {detailsError}
          </div>
        </div>
      )}

      <iframe
        src={iframeSrc}
        className="w-full h-full border-none"
        allowFullScreen
        title="Video Player"
      />
    </div>
  );
};

export default Watch;

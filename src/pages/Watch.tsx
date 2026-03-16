import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { upsertContinueWatching } from '../services/supabaseDb';

const Watch = () => {
  const { id, season, episode } = useParams<{ id: string; season?: string; episode?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

        await upsertContinueWatching({
          userId: user.id,
          tmdbId,
          mediaType,
          title: movie.title || movie.name || '',
          posterPath: movie.poster_path || null,
          progress: typeof progress === 'number' ? progress : null,
          season: season ? parseInt(season) : null,
          episode: episode ? parseInt(episode) : null,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, movie, tmdbId, mediaType, season, episode]);

  useEffect(() => {
    const onFullscreenChange = async () => {
      const docAny = document as any;
      const fullscreenElement = document.fullscreenElement || docAny.webkitFullscreenElement || null;
      const active = Boolean(fullscreenElement);
      setIsFullscreen(active);

      // Best-effort: lock to landscape while fullscreen, unlock on exit.
      try {
        if (active) {
          await (screen.orientation as any)?.lock?.('landscape');
        } else {
          (screen.orientation as any)?.unlock?.();
        }
      } catch {
        // Orientation lock is not supported on all mobile browsers (notably iOS Safari).
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    (document as any).addEventListener?.('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      (document as any).removeEventListener?.('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const docAny = document as any;
    const el = containerRef.current;
    if (!el) return;

    const fullscreenElement = document.fullscreenElement || docAny.webkitFullscreenElement || null;
    const isActive = Boolean(fullscreenElement);

    try {
      if (!isActive) {
        const request =
          (el as any).requestFullscreen ||
          (el as any).webkitRequestFullscreen ||
          (el as any).msRequestFullscreen;
        await request?.call(el);

        try {
          await (screen.orientation as any)?.lock?.('landscape');
        } catch {
          // ignore
        }
      } else {
        const exit =
          document.exitFullscreen ||
          docAny.webkitExitFullscreen ||
          docAny.msExitFullscreen;
        await exit?.call(document);

        try {
          (screen.orientation as any)?.unlock?.();
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore: fullscreen may be blocked depending on browser/user gesture context.
    }
  };

  const iframeSrc = mediaType === 'movie'
    ? `https://www.vidking.net/embed/movie/${tmdbId}?autoPlay=true`
    : `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true&nextEpisode=true&episodeSelector=true`;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black">
      {/* Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors pointer-events-auto"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        </div>
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
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        title="Video Player"
      />
    </div>
  );
};

export default Watch;

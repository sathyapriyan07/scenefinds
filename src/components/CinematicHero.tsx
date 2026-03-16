import React, { useEffect, useMemo, useRef, useState } from 'react';
import { YouTubeBackdrop } from './YouTubeBackdrop';

type Props = {
  title: string;
  backdropUrl: string;
  trailerKey: string | null;
  allowTrailerAutoplay: boolean;
  onTrailerError?: () => void;
  children: React.ReactNode;
};

export const CinematicHero: React.FC<Props> = ({
  title,
  backdropUrl,
  trailerKey,
  allowTrailerAutoplay,
  onTrailerError,
  children,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoadTrailer, setShouldLoadTrailer] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mqMobile = window.matchMedia?.('(max-width: 767px)');
    const mqReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    const setFromMediaQueries = () => {
      setIsMobile(Boolean(mqMobile?.matches));
      setPrefersReducedMotion(Boolean(mqReduced?.matches));
    };

    setFromMediaQueries();

    const onChange = () => setFromMediaQueries();
    mqMobile?.addEventListener?.('change', onChange);
    mqReduced?.addEventListener?.('change', onChange);

    return () => {
      mqMobile?.removeEventListener?.('change', onChange);
      mqReduced?.removeEventListener?.('change', onChange);
    };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const trailerEnabled = useMemo(() => {
    if (!trailerKey) return false;
    if (!allowTrailerAutoplay) return false;
    if (prefersReducedMotion) return false;
    if (isMobile) return false; // mobile fallback: image only
    return true;
  }, [trailerKey, allowTrailerAutoplay, prefersReducedMotion, isMobile]);

  useEffect(() => {
    if (!trailerEnabled) {
      setShouldLoadTrailer(false);
      setVideoReady(false);
      return;
    }
    if (!isVisible) {
      // Pause and crossfade back to image when off-screen.
      setVideoReady(false);
      return;
    }
    setShouldLoadTrailer(true);
  }, [trailerEnabled, isVisible]);

  return (
    <div
      ref={heroRef}
      className={`hero relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-black ${isVisible ? 'is-visible' : ''}`}
    >
      {/* Static Backdrop (instant) */}
      <img
        src={backdropUrl}
        alt={title}
        className={`hero-backdrop absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          videoReady ? 'opacity-0' : 'opacity-100'
        }`}
        loading="eager"
        fetchPriority="high"
        referrerPolicy="no-referrer"
      />

      {/* Trailer layer (lazy + only when visible) */}
      {trailerKey && (
        <YouTubeBackdrop
          videoKey={trailerKey}
          title={`${title} trailer`}
          enabled={trailerEnabled}
          active={isVisible}
          shouldLoad={shouldLoadTrailer}
          onPlayingChange={(playing) => setVideoReady(playing)}
          onError={() => {
            setVideoReady(false);
            onTrailerError?.();
          }}
        />
      )}

      {/* Cinematic overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end pb-12 md:pb-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

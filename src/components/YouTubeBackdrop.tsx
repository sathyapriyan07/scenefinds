import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<any> | null = null;

function loadYouTubeIframeApi(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-youtube-iframe-api="true"]');
    if (existing) {
      // Script tag exists but API not ready yet; wait for callback.
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      return;
    }

    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.dataset.youtubeIframeApi = 'true';
    script.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));
    document.head.appendChild(script);
  });

  return ytApiPromise;
}

type Props = {
  videoKey: string;
  title: string;
  enabled: boolean;
  active: boolean;
  shouldLoad: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onError?: () => void;
};

export const YouTubeBackdrop: React.FC<Props> = ({
  videoKey,
  title,
  enabled,
  active,
  shouldLoad,
  onPlayingChange,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    setReady(false);
    readyRef.current = false;
    onPlayingChange?.(false);
  }, [videoKey, enabled, onPlayingChange]);

  useEffect(() => {
    if (!enabled) return;
    if (!shouldLoad) return;
    if (!videoKey) return;
    if (!containerRef.current) return;

    let cancelled = false;
    let timeoutId: number | undefined;
    let didInit = false;
    let startTimerId: number | undefined;

    const destroy = () => {
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };

    const start = async () => {
      try {
        const YT = await loadYouTubeIframeApi();
        if (cancelled) return;

        destroy();

        playerRef.current = new YT.Player(containerRef.current, {
          host: 'https://www.youtube-nocookie.com',
          videoId: videoKey,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            loop: 1,
            playlist: videoKey,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              try {
                const iframe = event?.target?.getIframe?.() as HTMLIFrameElement | undefined;
                if (iframe) {
                  iframe.setAttribute(
                    'allow',
                    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                  );
                  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                  iframe.setAttribute('title', title);
                }
                event?.target?.mute?.();
                if (active) event?.target?.playVideo?.();
                else event?.target?.pauseVideo?.();
              } catch {
                // ignore
              }
              // Some browsers allow onReady but block autoplay; we fade in on PLAYING instead.
            },
            onStateChange: (event: any) => {
              try {
                const state = event?.data;
                if (state === YT.PlayerState.PLAYING) {
                  if (!cancelled) {
                    readyRef.current = true;
                    setReady(true);
                    onPlayingChange?.(true);
                  }
                } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED) {
                  if (!cancelled) {
                    readyRef.current = false;
                    setReady(false);
                    onPlayingChange?.(false);
                  }
                }
              } catch {
                // ignore
              }
            },
            onError: () => {
              if (cancelled) return;
              onError?.();
              setReady(false);
              readyRef.current = false;
              onPlayingChange?.(false);
              destroy();
            },
          },
        });
        didInit = true;

        // Some failures (or blocked embeds) never fire onError; avoid showing a stuck layer.
        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          if (readyRef.current) return;
          onError?.();
          destroy();
        }, 4500);
      } catch {
        if (cancelled) return;
        onError?.();
        setReady(false);
        destroy();
      }
    };

    // Lazy start: render poster first, then start the player after initial paint/idle.
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: any) => number);
    if (ric) {
      startTimerId = ric(() => {
        if (!cancelled) void start();
      }, { timeout: 800 });
    } else {
      startTimerId = window.setTimeout(() => {
        if (!cancelled) void start();
      }, 120);
    }

    return () => {
      cancelled = true;
      try {
        const cancelRic = (window as any).cancelIdleCallback as undefined | ((id: number) => void);
        if (startTimerId && cancelRic) cancelRic(startTimerId);
        else if (startTimerId) window.clearTimeout(startTimerId);
      } catch {
        // ignore
      }
      if (timeoutId) window.clearTimeout(timeoutId);
      if (didInit) destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoKey, enabled, shouldLoad]);

  useEffect(() => {
    if (!enabled) return;
    const player = playerRef.current;
    if (!player) return;

    try {
      player.mute?.();
      if (active) player.playVideo?.();
      else player.pauseVideo?.();
    } catch {
      // ignore
    }
  }, [active, enabled]);

  return (
    <div
      className={`hero-trailer absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label={title}
    >
      <div
        ref={containerRef}
        className={`hero-trailer__player absolute top-1/2 left-1/2 w-[140%] h-[140%] -translate-x-1/2 -translate-y-1/2 ${
          // Mobile is disabled by CinematicHero, but keep a smaller scale as a safety net.
          'max-md:w-[120%] max-md:h-[120%]'
        }`}
      />
    </div>
  );
};

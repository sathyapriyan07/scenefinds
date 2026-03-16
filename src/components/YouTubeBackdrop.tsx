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
  onError?: () => void;
};

export const YouTubeBackdrop: React.FC<Props> = ({ videoKey, title, enabled, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    setReady(false);
    readyRef.current = false;
  }, [videoKey, enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (!videoKey) return;
    if (!containerRef.current) return;

    let cancelled = false;
    let timeoutId: number | undefined;
    let didInit = false;

    const destroy = () => {
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };

    (async () => {
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
                event?.target?.playVideo?.();
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
    })();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (didInit) destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoKey, enabled]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        style={{
          // Cover the container even though YouTube uses fixed 16:9.
          width: '100%',
          height: '100%',
        }}
      >
        <div
          ref={containerRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '120vw',
            height: '67.5vw', // 120vw * 9/16
            minWidth: '120vh',
            minHeight: '67.5vh',
            maxWidth: 'none',
            maxHeight: 'none',
          }}
        />
      </div>
    </div>
  );
};

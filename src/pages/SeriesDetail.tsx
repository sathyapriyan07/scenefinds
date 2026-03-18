import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, ChevronDown, MoreHorizontal } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie, Cast, Episode } from '../types';
import { MovieRow } from '../components/MovieRow';
import { CinematicHero } from '../components/CinematicHero';
import { useAuth } from '../context/AuthContext';
import { addToWatchlist, isInWatchlist as checkIsInWatchlist, removeFromWatchlist } from '../services/supabaseDb';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  18: 'Drama', 14: 'Fantasy', 27: 'Horror', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 53: 'Thriller', 10759: 'Action & Adventure', 10765: 'Sci-Fi & Fantasy',
};

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [series, setSeries] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [titleLogoPath, setTitleLogoPath] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [allowTrailerAutoplay, setAllowTrailerAutoplay] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [epDropdownOpen, setEpDropdownOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const episodeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      setAllowTrailerAutoplay(!prefersReduced);
    } catch {
      setAllowTrailerAutoplay(true);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [seriesData, similarData, logoPath, bestTrailerKey, castData] = await Promise.all([
          tmdbService.getDetails('tv', parseInt(id)),
          tmdbService.getSimilar('tv', parseInt(id)),
          tmdbService.getTitleLogoPath('tv', parseInt(id)),
          tmdbService.getBestTrailerKey('tv', parseInt(id)),
          tmdbService.getCredits('tv', parseInt(id)),
        ]);
        setSeries(seriesData);
        setSimilar(similarData);
        setTitleLogoPath(logoPath);
        setTrailerKey(bestTrailerKey);
        setCast(castData);
        const episodesData = await tmdbService.getEpisodes(parseInt(id), 1);
        setEpisodes(episodesData);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load series details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    tmdbService.getEpisodes(parseInt(id), selectedSeason).then(setEpisodes).catch(console.error);
  }, [id, selectedSeason]);

  useEffect(() => {
    if (!user || !id) { setIsInWatchlist(false); return; }
    let cancelled = false;
    checkIsInWatchlist(user.id, parseInt(id), 'tv')
      .then((ok) => { if (!cancelled) setIsInWatchlist(ok); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, id]);

  const toggleWatchlist = async () => {
    if (!user || !series) return;
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(user.id, series.id, 'tv');
        setIsInWatchlist(false);
      } else {
        await addToWatchlist({ userId: user.id, tmdbId: series.id, mediaType: 'tv', title: series.name || series.title, posterPath: series.poster_path || null });
        setIsInWatchlist(true);
      }
    } catch (error) { console.error('Watchlist toggle failed:', error); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (errorMessage) return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 pb-20">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950/60 p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Can't load this title</h1>
        <p className="text-zinc-300 mb-6">{errorMessage}</p>
        <Link to="/" className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all">Back to Home</Link>
      </div>
    </div>
  );

  if (!series) return null;

  const backdropUrl = tmdbService.getImageUrl(series.backdrop_path, 'original') || 'https://via.placeholder.com/1920x1080?text=No+Backdrop';
  const year = (series.first_air_date || '').split('-')[0];
  const genres = (series.genre_ids || []).slice(0, 2).map((g: number) => GENRE_MAP[g]).filter(Boolean);

  return (
    <div className="min-h-screen pb-24 bg-black">

      {/* ── CINEMATIC HERO with trailer autoplay ── */}
      <CinematicHero
        title={series.name}
        backdropUrl={backdropUrl}
        trailerKey={trailerKey}
        allowTrailerAutoplay={allowTrailerAutoplay}
        onTrailerError={() => setTrailerKey(null)}
      >
        <div className="max-w-3xl">
          {/* metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300 mb-4">
            <div className="flex items-center gap-1">
              <Star size={11} fill="currentColor" className="text-yellow-400" />
              <span className="font-bold text-white">{series.vote_average.toFixed(1)}</span>
            </div>
            {year && <><span className="text-neutral-600">•</span><span>{year}</span></>}
            <span className="text-neutral-600">•</span>
            <span className="bg-neutral-800 px-2 py-0.5 rounded-md">{series.number_of_seasons} Seasons</span>
            {genres.map((g) => (
              <span key={g} className="bg-neutral-800 px-2 py-0.5 rounded-md">{g}</span>
            ))}
            <span className="bg-neutral-800 px-2 py-0.5 rounded-md font-bold">4K</span>
          </div>

          {/* title logo or text */}
          {titleLogoPath ? (
            <img
              src={tmdbService.getImageUrl(titleLogoPath, 'original')!}
              alt={series.name}
              className="max-h-16 md:max-h-24 max-w-[18rem] md:max-w-[26rem] w-auto mb-4 object-contain drop-shadow-[0_14px_34px_rgba(0,0,0,0.6)]"
              referrerPolicy="no-referrer"
              onError={() => setTitleLogoPath(null)}
            />
          ) : (
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 font-display leading-[0.9]">
              {series.name}
            </h1>
          )}

          {/* description */}
          <p className={`text-sm md:text-base text-zinc-300 max-w-xl leading-relaxed mb-1 ${expanded ? '' : 'line-clamp-2'}`}>
            {series.overview}
          </p>
          {(series.overview || '').length > 120 && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-neutral-400 uppercase tracking-wider mb-4">
              {expanded ? 'Less' : 'More'}
            </button>
          )}

          {/* actions */}
          <div className="flex items-center gap-3 mt-4">
            <Link
              to={`/watch/tv/${series.id}/1/1`}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-95"
            >
              <Play size={15} fill="currentColor" />
              Play
            </Link>
            <button
              onClick={toggleWatchlist}
              className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center hover:bg-neutral-700 transition-all active:scale-95"
            >
              {isInWatchlist ? <Check size={16} /> : <Plus size={16} />}
            </button>
          </div>
        </div>
      </CinematicHero>

      {/* ── EPISODES ── */}
      <div className="mt-6 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-xl font-semibold">Episodes</h2>
          <div className="flex items-center gap-2">
            {/* Episode dropdown */}
            <div className="relative">
              <button
                onClick={() => setEpDropdownOpen(!epDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm hover:bg-neutral-800 transition-colors"
              >
                Episode {selectedEpisode}
                <ChevronDown size={14} className={`transition-transform duration-200 ${epDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {epDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 max-h-60 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-20">
                  {episodes.map((ep) => (
                    <button
                      key={ep.episode_number}
                      onClick={() => {
                        setSelectedEpisode(ep.episode_number);
                        setEpDropdownOpen(false);
                        document.getElementById(`episode-${ep.episode_number}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 transition-colors ${
                        selectedEpisode === ep.episode_number ? 'text-white font-semibold' : 'text-neutral-300'
                      }`}
                    >
                      Episode {ep.episode_number} — {ep.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Season dropdown */}
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => { setSelectedSeason(parseInt(e.target.value)); setSelectedEpisode(1); }}
                className="appearance-none bg-neutral-900 border border-neutral-800 pl-4 pr-9 py-2 rounded-full text-sm font-medium focus:outline-none cursor-pointer hover:bg-neutral-800 transition-colors"
              >
                {Array.from({ length: series.number_of_seasons || 0 }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-zinc-900">Season {i + 1}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
            </div>
          </div>
        </div>

        <div ref={episodeScrollRef} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 snap-x snap-mandatory">
          {episodes.map((episode) => (
            <Link
              key={episode.id}
              to={`/watch/tv/${series.id}/${selectedSeason}/${episode.episode_number}`}
              className="flex-shrink-0 snap-start w-[85vw] md:w-[400px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 group relative"
              id={`episode-${episode.episode_number}`}
            >
              <div className="relative aspect-video">
                <img
                  src={tmdbService.getImageUrl(episode.still_path) || 'https://via.placeholder.com/500x281?text=No+Preview'}
                  alt={episode.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x281?text=No+Preview'; }}
                />
                {/* gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                {/* play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Play size={18} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
                {/* three dot */}
                <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center z-10" onClick={(e) => e.preventDefault()}>
                  <MoreHorizontal size={14} />
                </button>
                {/* text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5">
                  <p className="text-[10px] text-neutral-300">Episode {episode.episode_number} {episode.runtime ? `· ${episode.runtime}m` : ''}</p>
                  <h3 className="text-sm font-semibold text-white leading-tight truncate">{episode.name}</h3>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">{episode.overview}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CAST & CREW ── */}
      {cast.length > 0 && (
        <div className="mt-8 px-4 max-w-screen-xl mx-auto">
          <h2 className="text-base md:text-xl font-semibold mb-4">Cast & Crew</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 snap-x snap-mandatory">
            {cast.map((person) => (
              <Link key={person.id} to={`/person/${person.id}`} className="flex-shrink-0 w-20 md:w-28 group snap-start">
                <div className="aspect-square rounded-full overflow-hidden border border-white/5 mb-2 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={tmdbService.getImageUrl(person.profile_path) || 'https://via.placeholder.com/300x300?text=?'}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=?'; }}
                  />
                </div>
                <p className="text-xs font-semibold text-white truncate">{person.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{person.character}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── MORE LIKE THIS ── */}
      <div className="mt-8">
        <MovieRow title="More Like This" movies={similar} />
      </div>
    </div>
  );
};

export default SeriesDetail;

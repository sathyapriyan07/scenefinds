import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import { MovieRow } from '../components/MovieRow';

type PersonDetails = {
  id: number;
  name: string;
  biography?: string;
  profile_path?: string | null;
  known_for_department?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
};

type CombinedCredits = {
  cast?: Array<any>;
  crew?: Array<any>;
};

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(
      new Date(date),
    );
  } catch {
    return date;
  }
}

function normalizeCreditToMovie(item: any): Movie | null {
  const mediaType = item?.media_type;
  if (mediaType !== 'movie' && mediaType !== 'tv') return null;

  const title = mediaType === 'movie' ? item?.title : item?.name;
  const releaseDate = mediaType === 'movie' ? item?.release_date : item?.first_air_date;
  const posterPath = item?.poster_path ?? '';
  const backdropPath = item?.backdrop_path ?? '';

  if (!item?.id || !title) return null;

  return {
    id: item.id,
    title,
    name: mediaType === 'tv' ? title : undefined,
    overview: item?.overview ?? '',
    poster_path: posterPath,
    backdrop_path: backdropPath,
    release_date: releaseDate ?? '',
    first_air_date: mediaType === 'tv' ? (releaseDate ?? '') : undefined,
    vote_average: typeof item?.vote_average === 'number' ? item.vote_average : 0,
    genre_ids: Array.isArray(item?.genre_ids) ? item.genre_ids : [],
    media_type: mediaType,
  };
}

const PersonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id || 0);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<CombinedCredits | null>(null);

  useEffect(() => {
    if (!personId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [details, combinedCredits] = await Promise.all([
          tmdbService.getPersonDetails(personId),
          tmdbService.getPersonCombinedCredits(personId),
        ]);

        if (cancelled) return;
        setPerson(details);
        setCredits(combinedCredits);
      } catch (error) {
        console.error('Error fetching person details:', error);
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load person details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [personId]);

  const knownFor = useMemo(() => {
    const raw = credits?.cast ?? [];
    const popularityById = new Map<number, number>();
    for (const item of raw) {
      if (typeof item?.id === 'number' && typeof item?.popularity === 'number') {
        popularityById.set(item.id, item.popularity);
      }
    }

    const normalized = raw
      .map(normalizeCreditToMovie)
      .filter(Boolean) as Movie[];

    // Prefer higher vote_count/popularity if present, else vote_average.
    const sorted = [...normalized].sort((a, b) => {
      const ap = popularityById.get(a.id) ?? 0;
      const bp = popularityById.get(b.id) ?? 0;
      if (bp !== ap) return bp - ap;
      return (b.vote_average || 0) - (a.vote_average || 0);
    });

    // De-dupe by id and cap.
    const seen = new Set<number>();
    const unique: Movie[] = [];
    for (const item of sorted) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      unique.push(item);
      if (unique.length >= 20) break;
    }
    return unique;
  }, [credits]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Can’t load this person</h1>
          <p className="text-zinc-300 leading-relaxed mb-6">{errorMessage}</p>
          <Link
            to="/"
            className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-950/60 p-6 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Person not found</h1>
          <Link
            to="/"
            className="inline-flex bg-white text-black px-5 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const profileUrl =
    tmdbService.getImageUrl(person.profile_path ?? undefined, 'w500') ||
    'https://via.placeholder.com/500x750?text=No+Photo';

  const birthday = person.birthday ? formatDate(person.birthday) : null;
  const deathday = person.deathday ? formatDate(person.deathday) : null;

  return (
    <div className="min-h-screen pb-20 bg-black">
      <div className="relative pt-24 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-transparent to-transparent" />

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/15 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-10 items-start">
            <div className="w-full max-w-[240px]">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl">
                <img
                  src={profileUrl}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Photo';
                  }}
                />
              </div>
            </div>

            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-display leading-[0.95]">
                {person.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                {person.known_for_department && <span>{person.known_for_department}</span>}
                {birthday && (
                  <>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    <span>{birthday}</span>
                  </>
                )}
                {deathday && (
                  <>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    <span>{deathday}</span>
                  </>
                )}
                {person.place_of_birth && (
                  <>
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    <span className="normal-case tracking-normal text-zinc-300">{person.place_of_birth}</span>
                  </>
                )}
              </div>

              {person.biography && (
                <p className="text-base md:text-lg text-zinc-300 leading-relaxed mt-6 max-w-3xl whitespace-pre-line">
                  {person.biography}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {knownFor.length > 0 && <MovieRow title="Known For" movies={knownFor} />}
    </div>
  );
};

export default PersonDetail;

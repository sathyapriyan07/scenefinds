import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';

const COLLECTION_IDS = [10, 1241, 119, 528, 86311, 131296, 748, 9485, 87359, 2806];

interface CollectionData {
  id: number;
  name: string;
  backdrop_path: string | null;
  parts: any[];
}

export const CollectionsSection: React.FC = () => {
  const [collections, setCollections] = useState<CollectionData[]>([]);

  useEffect(() => {
    Promise.all(COLLECTION_IDS.map((id) => tmdbService.getCollection(id)))
      .then((results) => setCollections(results.filter((c) => c.backdrop_path)));
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="py-4 md:py-8 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white/90">Collections</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x snap-mandatory">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/collection/${col.id}`}
              className="flex-shrink-0 snap-start w-[280px] md:w-[420px] aspect-video relative rounded-xl overflow-hidden group hover:scale-105 transition duration-300"
            >
              <img
                src={tmdbService.getImageUrl(col.backdrop_path, 'original')}
                alt={col.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-lg font-semibold text-white leading-tight">{col.name}</p>
                <p className="text-sm text-neutral-300">{col.parts.length} movies</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

const studios = [
  { name: 'Marvel Studios', logo: '/studios/marvel.png', id: 420 },
  { name: 'Pixar', logo: '/studios/pixar.svg', id: 3 },
  { name: 'Walt Disney Pictures', logo: '/studios/waltdisney.png', id: 2 },
  { name: 'Warner Bros', logo: '/studios/warnerbros.png', id: 174 },
  { name: 'Universal Pictures', logo: '/studios/Universal_Pictures_logo.svg', id: 33 },
  { name: 'DreamWorks', logo: '/studios/dreamworks.png', id: 521 },
  { name: 'Paramount', logo: '/studios/Paramount.svg', id: 4 },
  { name: 'Columbia Pictures', logo: '/studios/Columbia.png', id: 5 },
  { name: '20th Century Studios', logo: '/studios/20th century studios.png', id: 25 },
  { name: 'Legendary', logo: '/studios/legendary-pictures-logo.svg', id: 923 },
];

export const StudiosSection: React.FC = () => {
  return (
    <section className="py-4 md:py-8">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white/90 mb-3 md:mb-4">
          Studios
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {studios.map((studio) => (
            <Link
              key={studio.id}
              to={`/studio/${studio.id}`}
              className="rounded-xl bg-neutral-100 flex items-center justify-center h-[80px] md:h-[100px] p-4 hover:scale-105 transition duration-300 hover:bg-white"
            >
              <img
                src={studio.logo}
                alt={studio.name}
                className="max-h-10 object-contain w-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<span class="text-black font-bold text-sm text-center">${studio.name}</span>`;
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

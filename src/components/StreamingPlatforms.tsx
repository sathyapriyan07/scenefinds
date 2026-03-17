import React from 'react';
import { Link } from 'react-router-dom';

const platforms = [
  { name: 'Netflix', logo: '/platforms/netflix.png', id: 8 },
  { name: 'Prime Video', logo: '/platforms/Amazon_Prime_Video_logo.svg.png', id: 119 },
  { name: 'JioHotstar', logo: '/platforms/JioHotstar_2025.png', id: 122 },
  { name: 'Apple TV+', logo: '/platforms/Apple_TV+_logo.png', id: 350 },
  { name: 'HBO Max', logo: '/platforms/hbo_max-logo_brandlogos.net_eex1k.png', id: 384 },
  { name: 'Hulu', logo: '/platforms/hulu-logo_brandlogos.net_y7ezt.png', id: 15 },
  { name: 'Paramount+', logo: '/platforms/Paramount_Plus.svg', id: 531 },
  { name: 'Peacock', logo: '/platforms/nbcuniversal-peacock-logo.png', id: 386 },
];

export const StreamingPlatforms: React.FC = () => {
  return (
    <section className="py-4 md:py-8">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white/90 mb-3 md:mb-4">
          Streaming Platforms
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              to={`/platform/${platform.id}`}
              className="rounded-xl bg-neutral-100 flex items-center justify-center h-[80px] md:h-[100px] p-4 hover:scale-105 transition duration-300 hover:bg-white"
            >
              <img
                src={platform.logo}
                alt={platform.name}
                className="max-h-10 object-contain w-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<span class="text-black font-bold text-sm text-center">${platform.name}</span>`;
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

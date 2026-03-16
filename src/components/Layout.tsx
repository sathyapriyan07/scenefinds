import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Tv, Film, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Header = () => {
  const { user, signInWithGoogle } = useAuth();
  const location = useLocation();

  return (
    <header 
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 transition-all duration-500 bg-transparent"
    >
      <div className="flex items-center gap-12">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png.png" alt="SceneFinds" className="w-10 h-10 transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tighter hidden sm:block font-display">SCENEFINDS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={cn("text-xs font-bold uppercase tracking-widest transition-colors hover:text-white", location.pathname === '/' ? "text-white" : "text-zinc-500")}>Home</Link>
          <Link to="/search" className={cn("text-xs font-bold uppercase tracking-widest transition-colors hover:text-white", location.pathname === '/search' ? "text-white" : "text-zinc-500")}>Search</Link>
          <Link to="/watchlist" className={cn("text-xs font-bold uppercase tracking-widest transition-colors hover:text-white", location.pathname === '/watchlist' ? "text-white" : "text-zinc-500")}>Watchlist</Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/search" className="text-zinc-400 hover:text-white transition-colors opacity-80 hover:opacity-100">
          <Search size={20} />
        </Link>
        
        {user ? (
          <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:border-white/40 transition-colors">
            <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </Link>
        ) : (
          <button 
            onClick={() => {
              void signInWithGoogle().catch((e) => console.error('Sign in failed:', e));
            }}
            className="text-sm font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Movies', icon: Film, path: '/movies' },
    { label: 'TV Shows', icon: Tv, path: '/tv-shows' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-white scale-110" : "text-zinc-500"
            )}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-white pb-16 md:pb-0">
      <Header />
      <main className="relative">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

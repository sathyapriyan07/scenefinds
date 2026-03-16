import React from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { LogOut, User as UserIcon, Shield, Bookmark, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent">
            <img src={user.photoURL || undefined} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-2">{user.displayName}</h1>
            <p className="text-zinc-500 mb-6">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-6 py-2 rounded-full font-bold text-sm hover:bg-accent/20 transition-colors"
                >
                  <Shield size={18} />
                  ADMIN PANEL
                </button>
              )}
              <button 
                onClick={() => auth.signOut()}
                className="flex items-center gap-2 bg-white/5 text-white border border-white/10 px-6 py-2 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
              >
                <LogOut size={18} />
                SIGN OUT
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => navigate('/watchlist')}
            className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-accent transition-colors text-left"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Bookmark size={24} />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest">Watchlist</h3>
              <p className="text-xs text-zinc-500">View your saved movies and series</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-accent transition-colors text-left"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest">Continue Watching</h3>
              <p className="text-xs text-zinc-500">Pick up where you left off</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

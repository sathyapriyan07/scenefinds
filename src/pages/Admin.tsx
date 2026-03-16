import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Film, Tv, Users, Image as ImageIcon } from 'lucide-react';

const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold uppercase tracking-tighter mb-8">Admin Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Movies', value: '1,240', icon: Film },
        { label: 'Total Series', value: '450', icon: Tv },
        { label: 'Total Users', value: '12,890', icon: Users },
        { label: 'Active Banners', value: '5', icon: ImageIcon },
      ].map((stat) => (
        <div key={stat.label} className="bg-surface border border-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <stat.icon className="text-accent" size={24} />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Stats</span>
          </div>
          <p className="text-3xl font-bold mb-1">{stat.value}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <div className="min-h-screen pt-16 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-border p-6 flex flex-col gap-2">
        <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-widest">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/admin/movies" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-widest">
          <Film size={18} /> Movies
        </Link>
        <Link to="/admin/series" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-widest">
          <Tv size={18} /> Series
        </Link>
        <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-widest">
          <Users size={18} /> Users
        </Link>
        <Link to="/admin/banners" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold text-sm uppercase tracking-widest">
          <ImageIcon size={18} /> Banners
        </Link>
      </aside>

      {/* Admin Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/movies" element={<div className="p-8">Manage Movies (Coming Soon)</div>} />
          <Route path="/series" element={<div className="p-8">Manage Series (Coming Soon)</div>} />
          <Route path="/users" element={<div className="p-8">Manage Users (Coming Soon)</div>} />
          <Route path="/banners" element={<div className="p-8">Manage Banners (Coming Soon)</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;

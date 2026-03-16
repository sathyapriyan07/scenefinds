import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const Watch = lazy(() => import('./pages/Watch'));
const Search = lazy(() => import('./pages/Search'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/Profile'));
const PersonDetail = lazy(() => import('./pages/PersonDetail'));
const Movies = lazy(() => import('./pages/Movies'));
const TV = lazy(() => import('./pages/TV'));

const Loading = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/tv/:id" element={<SeriesDetail />} />
              <Route path="/watch/movie/:id" element={<Watch />} />
              <Route path="/watch/tv/:id/:season/:episode" element={<Watch />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/tv-shows" element={<TV />} />
              <Route path="/search" element={<Search />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/person/:id" element={<PersonDetail />} />
              <Route path="/admin/*" element={<Admin />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicProvider, useMusic } from './context/MusicContext';

import CustomCursor from './components/CustomCursor';
import MusicPlayer from './components/MusicPlayer';
import OverlayEffects from './components/OverlayEffects';

import WelcomeScreen from './pages/WelcomeScreen';
import LoginScreen from './pages/LoginScreen';
import WorldEntry from './pages/WorldEntry';
import Journey from './pages/Journey';
import MemoryAlbum from './pages/MemoryAlbum';
import Feedback from './pages/Feedback';
import FinalPage from './pages/FinalPage';

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playMusic, changeTrack } = useMusic();

  // Switch track whenever route changes
  useEffect(() => {
    changeTrack(location.pathname);
  }, [location.pathname]);

  const handleWelcomeProceed = () => {
    playMusic();
    navigate('/login');
  };

  const handleLoginSuccess = () => {
    playMusic();
    navigate('/entry');
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white selection:bg-pink-500 selection:text-white">
      <CustomCursor />
      <OverlayEffects />
      <MusicPlayer />

      <Routes>
        <Route path="/" element={<WelcomeScreen onProceed={handleWelcomeProceed} />} />
        <Route path="/login" element={<LoginScreen onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/entry" element={
          <ProtectedRoute><WorldEntry onComplete={() => navigate('/journey')} /></ProtectedRoute>
        } />
        <Route path="/journey" element={
          <ProtectedRoute><Journey onNext={() => navigate('/album')} /></ProtectedRoute>
        } />
        <Route path="/album" element={
          <ProtectedRoute><MemoryAlbum onNext={() => navigate('/feedback')} /></ProtectedRoute>
        } />
        <Route path="/feedback" element={
          <ProtectedRoute><Feedback onComplete={() => navigate('/final')} /></ProtectedRoute>
        } />
        <Route path="/final" element={
          <ProtectedRoute><FinalPage onRestart={() => navigate('/')} /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AuthProvider>
        <MusicProvider>
          <MainLayout />
        </MusicProvider>
      </AuthProvider>
    </AppProvider>
  </BrowserRouter>
);

export default App;

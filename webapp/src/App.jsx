import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CliquesView from './components/CliquesView';
import ProfileView from './components/ProfileView';
import StoriesView from './components/StoriesView';
import ShopView from './components/ShopView';
import CameraView from './components/CameraView';
import SpotlightView from './components/SpotlightView';
import SuccessView from './components/SuccessView';
import SplashView from './components/SplashView';
import LoginView from './components/LoginView';
import TopHeader from './components/TopHeader';
import { useUIStore, useAuthStore } from './store';

function App() {
  const { activeTab, setActiveTab } = useUIStore();
  const { fetchProfile, user } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('clique_auth_success');
  });
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const path = location.pathname.substring(1);
    const validTabs = ['chat', 'cliques', 'stories', 'profile', 'shop', 'camera', 'spotlight'];
    if (validTabs.includes(path)) {
      setActiveTab(path);
    }
  }, [location, setActiveTab]);

  const handleLogin = () => {
    localStorage.setItem('clique_auth_success', 'true');
    setIsAuthenticated(true);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'chat': return <ChatView />;
      case 'cliques': return <CliquesView />;
      case 'stories': return <StoriesView />;
      case 'profile': return <ProfileView />;
      case 'shop': return <ShopView />;
      case 'spotlight': return <SpotlightView />;
      case 'camera': return <CameraView />;
      default: return <CameraView />;
    }
  };

  if (showSplash) {
    return <SplashView onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated && !user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/payment-success" element={<SuccessView type="subscription" />} />
      <Route path="/upgrade-success" element={<SuccessView type="upgrade" />} />
      <Route path="*" element={
        <div className="app-layout">
          <TopHeader />
          <Sidebar />
          <main className="main-view-container">
            {renderView()}
          </main>
        </div>
      } />
    </Routes>
  );
}

export default App;

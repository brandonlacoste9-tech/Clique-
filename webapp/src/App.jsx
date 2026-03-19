import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CliquesView from './components/CliquesView';
import ProfileView from './components/ProfileView';
import StoriesView from './components/StoriesView';
import ShopView from './components/ShopView';
import CameraView from './components/CameraView';
import SuccessView from './components/SuccessView';
import SplashView from './components/SplashView';
import { useUIStore, useAuthStore } from './store';

function App() {
  const { activeTab, setActiveTab } = useUIStore();
  const { fetchProfile } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const path = location.pathname.substring(1);
    if (['chat', 'cliques', 'stories', 'profile', 'shop', 'camera'].includes(path)) {
      setActiveTab(path);
    }
  }, [location, setActiveTab]);

  const renderView = () => {
    switch (activeTab) {
      case 'chat': return <ChatView />;
      case 'cliques': return <CliquesView />;
      case 'stories': return <StoriesView />;
      case 'profile': return <ProfileView />;
      case 'shop': return <ShopView />;
      case 'camera': return <CameraView />;
      default: return <CameraView />;
    }
  };

  return (
    <Routes>
      <Route path="/payment-success" element={<SuccessView type="subscription" />} />
      <Route path="/upgrade-success" element={<SuccessView type="upgrade" />} />
      <Route path="*" element={
        <>
          {showSplash && <SplashView onComplete={() => setShowSplash(false)} />}
          <div className="app-layout">
            <Sidebar />
            {renderView()}
          </div>
        </>
      } />
    </Routes>
  );
}

export default App;

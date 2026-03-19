import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CliquesView from './components/CliquesView';
import ProfileView from './components/ProfileView';
import StoriesView from './components/StoriesView';
import ShopView from './components/ShopView';
import SuccessView from './components/SuccessView';
import SplashView from './components/SplashView';
import { useUIStore } from './store';
import { useState } from 'react';

function App() {
  const { activeTab, setActiveTab } = useUIStore();
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.substring(1);
    if (['chat', 'cliques', 'stories', 'profile', 'shop'].includes(path)) {
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
      default: return <ChatView />;
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

import React from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CliquesView from './components/CliquesView';
import ProfileView from './components/ProfileView';
import StoriesView from './components/StoriesView';
import { useUIStore } from './store';

function App() {
  const { activeTab } = useUIStore();

  const renderView = () => {
    switch (activeTab) {
      case 'chat': return <ChatView />;
      case 'cliques': return <CliquesView />;
      case 'stories': return <StoriesView />;
      case 'profile': return <ProfileView />;
      default: return <ChatView />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      {renderView()}
    </div>
  );
}

export default App;

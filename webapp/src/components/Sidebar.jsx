import React from 'react';
import { useUIStore } from '../store';

const TABS = [
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'cliques', icon: '📍', label: 'Cliques' },
  { id: 'stories', icon: '⚡', label: 'Stories' },
  { id: 'profile', icon: '👑', label: 'Profile' },
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo" title="ChatSnap">CS</div>

      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          title={tab.label}
        >
          {tab.icon}
        </button>
      ))}

      <div className="sidebar-spacer" />

      <div className="sidebar-avatar" title="Profile" onClick={() => setActiveTab('profile')}>
        <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          🐝
        </span>
      </div>
    </nav>
  );
}

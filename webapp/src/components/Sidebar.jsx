import React from 'react';
import { useUIStore } from '../store';

const TABS = [
  { id: 'chat', icon: '✉', label: 'Messages' },
  { id: 'cliques', icon: '◎', label: 'Cliques' },
  { id: 'stories', icon: '◇', label: 'Stories' },
  { id: 'profile', icon: '○', label: 'Profile' },
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <nav className="sidebar">
      <div className="logo-s" title="ChatSnap">CS</div>

      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          title={tab.label}
          style={{ fontSize: activeTab === tab.id ? '1.1rem' : '1rem' }}
        >
          {tab.icon}
        </button>
      ))}

      <div className="sidebar-spacer" />

      <button 
        className={`sidebar-btn ${activeTab === 'shop' ? 'active' : ''}`}
        onClick={() => setActiveTab('shop')}
        title="Shop"
      >
        ◆
      </button>
    </nav>
  );
}

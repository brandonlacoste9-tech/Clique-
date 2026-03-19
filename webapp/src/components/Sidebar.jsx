import React from 'react';
import { useUIStore } from '../store';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <nav className="sidebar">
      {/* Profile at top */}
      <button 
        className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
        style={{ marginBottom: '32px', borderRadius: '50%' }}
      >
        👤
      </button>

      {/* Main Tabs - Snap Style Order */}
      <div style={{ display: 'flex', flexDirection: 'inherit', gap: 16 }}>
        <button 
          className={`sidebar-btn ${activeTab === 'cliques' ? 'active' : ''}`}
          onClick={() => setActiveTab('cliques')}
          title="Map/Discover"
        >
          🔍
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          title="Chat"
          style={{ position: 'relative' }}
        >
          💬
          <Badge count={2} color="var(--snap-blue)" />
        </button>

        {/* Central Bee / Camera Button */}
        <button 
          className={`sidebar-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
          title="Snap"
          style={{ 
            background: activeTab === 'camera' ? 'var(--snap-yellow)' : '#000',
            color: '#fff',
            borderRadius: '24px',
            transform: activeTab === 'camera' ? 'scale(1.15)' : 'scale(1)',
            boxShadow: activeTab === 'camera' ? '0 10px 30px rgba(255, 252, 0, 0.5)' : 'none'
          }}
        >
          🐝
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
          title="Stories"
        >
          ♾️
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
          title="Spotlight"
        >
          💎
        </button>
      </div>

      <div style={{ marginTop: 'auto' }}>
         <button className="sidebar-btn" style={{ fontSize: 16 }}>⚙️</button>
      </div>
    </nav>
  );
}

function Badge({ count, color }) {
  if (!count) return null;
  return (
    <div style={{
      position: 'absolute',
      top: -4,
      right: -4,
      background: color,
      color: '#fff',
      fontSize: 10,
      fontWeight: 800,
      width: 18,
      height: 18,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #fff'
    }}>
      {count}
    </div>
  );
}

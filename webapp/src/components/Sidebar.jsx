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
        style={{ marginBottom: 'auto', borderRadius: '50%', background: activeTab === 'profile' ? 'var(--snap-yellow)' : '#eee' }}
      >
        👤
      </button>

      {/* Main Tabs */}
      <div style={{ display: 'flex', flexDirection: 'inherit', gap: 16 }}>
        <button 
          className={`sidebar-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          title="Chat"
          style={{ position: 'relative' }}
        >
          💬
          <Badge count={2} color="var(--snap-blue)" />
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'cliques' ? 'active' : ''}`}
          onClick={() => setActiveTab('cliques')}
          title="Cliques"
        >
          👥
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
          title="Stories"
        >
          🟣
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
          title="Premium Shop"
        >
          💎
        </button>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'inherit', gap: 16 }}>
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

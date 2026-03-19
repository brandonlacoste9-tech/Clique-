import React from 'react';
import { useUIStore } from '../store';

const HiveIcons = {
  Map: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  ),
  Snap: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
    </svg>
  ),
  Stories: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
    </svg>
  ),
  Spotlight: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
};

export default function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  const navItems = [
    { id: 'cliques', icon: <HiveIcons.Map />, title: 'Map' },
    { id: 'chat', icon: <HiveIcons.Chat />, title: 'Chat', badge: 2 },
    { id: 'camera', icon: '🐝', title: 'Snap', special: true }, // Keep Bee for central Snap
    { id: 'stories', icon: <HiveIcons.Stories />, title: 'Stories' },
    { id: 'spotlight', icon: <HiveIcons.Spotlight />, title: 'Spotlight' },
  ];

  return (
    <nav className="sidebar">
      <div className="nav-container">
        {navItems.map((item) => (
          <button 
            key={item.id}
            className={`sidebar-btn ${activeTab === item.id ? 'active' : ''} ${item.special ? 'special-btn' : ''}`}
            onClick={() => setActiveTab(item.id)}
            title={item.title}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.badge && <Badge count={item.badge} color="var(--snap-blue)" />}
            <span className="nav-label">{item.title}</span>
          </button>
        ))}
      </div>

      <style>{`
        .nav-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          width: 100%;
        }

        .nav-icon { font-size: 24px; z-index: 2; }
        .nav-label { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-top: 4px; display: none; }

        .special-btn {
          width: 60px !important;
          height: 60px !important;
          background: #000 !important;
          color: #fff !important;
          border-radius: 24px !important;
          margin: 8px 0;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .special-btn.active {
          background: var(--snap-yellow) !important;
          color: #000 !important;
          box-shadow: 0 10px 30px rgba(255, 252, 0, 0.45) !important;
        }

        @media (max-width: 768px) {
           .nav-container {
              flex-direction: row;
              justify-content: space-around;
              height: 100%;
              align-items: center;
              padding: 0 12px;
           }
           .nav-label { display: block; opacity: 0.6; }
           .sidebar-btn.active .nav-label { opacity: 1; color: #000; }
           
           .sidebar-btn { 
             flex-direction: column; 
             width: auto !important; 
             height: auto !important; 
             background: none !important; 
             box-shadow: none !important;
             gap: 2px;
           }
           .special-btn { 
             margin: 0; 
             transform: translateY(-8px); 
             width: 64px !important; 
             height: 64px !important;
             box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
           }
        }
      `}</style>
    </nav>
  );
}

function Badge({ count, color }) {
  if (!count) return null;
  return (
    <div style={{
      position: 'absolute',
      top: -4,
      right: -8,
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
      border: '2px solid #fff',
      zIndex: 10
    }}>
      {count}
    </div>
  );
}

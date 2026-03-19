import React from 'react';
import { useUIStore, useAuthStore } from '../store';

const HeaderIcons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Add: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
       <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
};

export default function TopHeader() {
  const { activeTab, setActiveTab } = useUIStore();
  const { user } = useAuthStore();

  const getTitle = () => {
    switch (activeTab) {
      case 'chat': return 'Chat';
      case 'cliques': return 'Map';
      case 'stories': return 'Stories';
      case 'shop': return 'Shop';
      case 'camera': return '';
      default: return 'The Hive';
    }
  };

  const isCamera = activeTab === 'camera';

  return (
    <div className={`top-header fade-in ${isCamera ? 'is-camera' : ''}`}>
       {/* Profile Left */}
       <div 
         className="header-avatar" 
         onClick={() => setActiveTab('profile')}
         style={{
            background: isCamera ? 'rgba(255,255,255,0.2)' : (activeTab === 'profile' ? 'var(--snap-yellow)' : 'rgba(0,0,0,0.05)'),
            border: activeTab === 'profile' ? '2px solid #fff' : 'none',
            color: isCamera ? '#fff' : '#000',
            backdropFilter: 'blur(10px)'
         }}
       >
         {user?.displayName?.[0] || '🐝'}
       </div>

       {/* Centered Search/Title Bar */}
       <div className="search-bar-inline" style={{
          background: isCamera ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
          color: isCamera ? '#fff' : '#000'
       }}>
          <span style={{ marginRight: 8, display: 'flex' }}><HeaderIcons.Search /></span>
          <input 
            type="text" 
            placeholder={isCamera ? 'Search' : `Search ${getTitle()}`}
            className="search-input-ghost"
            style={{ color: 'inherit' }}
          />
       </div>

       {/* Right Actions */}
       <div className="header-actions">
          <div className="header-icon" style={{
             background: isCamera ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
             color: isCamera ? '#fff' : '#000'
          }}>
            <HeaderIcons.Add />
          </div>
       </div>

       <style>{`
          .top-header {
            position: absolute;
            top: 24px;
            left: 24px;
            right: 24px;
             /* Removed height so it doesn't block interactions */
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 2000;
            pointer-events: none;
          }
          .top-header > * { pointer-events: auto; }
          
          .header-avatar {
            width: 44px;
            height: 44px;
            border-radius: 17px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: all 0.2s;
            background: #fff;
            color: #000;
          }
          .header-avatar:hover { transform: scale(1.05); }

          .search-bar-inline {
            flex: 1;
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(16px);
            border-radius: 20px;
            height: 44px;
            display: flex;
            align-items: center;
            padding: 0 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .search-input-ghost {
            background: none; border: none; flex: 1; font-size: 14px; font-weight: 500;
          }
          .header-actions {
             display: flex; gap: 8px;
          }
          .header-icon {
            width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.7);
            backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center;
            font-size: 18px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }

          @media (max-width: 768px) {
             .top-header { top: 12px; left: 12px; right: 12px; }
             .search-bar-inline { display: none; } /* On mobile search is usually a standalone button or icon */
             .header-actions { margin-left: auto; }
          }
       `}</style>
    </div>
  );
}

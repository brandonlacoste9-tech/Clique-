import React from 'react';
import { useAuthStore, useUIStore } from '../store';

export default function ProfileView() {
  const { user, login } = useAuthStore();
  const { setActiveTab } = useUIStore();

  if (!user) {
    return (
      <div className="main-content fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 100, height: 100, background: 'var(--snap-yellow)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 24, boxShadow: '0 8px 20px rgba(255, 252, 0, 0.3)' }}>
          👤
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Ready to join?</h2>
        <p style={{ color: 'var(--text3)', marginBottom: 24, textAlign: 'center' }}>Connect with your friends and start sharing snaps.</p>
        <button 
          className="buy-btn" 
          onClick={() => login('admin', 'password')}
          style={{ width: '100%', maxWidth: 280, background: 'var(--snap-blue)', color: '#fff' }}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="main-content fade-in" style={{ flex: 1, overflowY: 'auto' }}>
      {/* Header Profile Section - Snap Style */}
      <div style={{ 
        background: 'var(--snap-yellow)', 
        padding: '60px 24px 40px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        position: 'relative'
      }}>
        <div style={{
          width: 120, height: 120,
          background: '#fff',
          borderRadius: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 64,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '4px solid #000',
          marginBottom: 16
        }}>
          🐝
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000', marginBottom: 4 }}>{user.full_name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
          <span>@{user.username}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{user.prestige_score || 0} Points</span>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Tier / Status */}
        <div style={{ 
            background: '#fff', 
            borderRadius: '24px', 
            padding: '20px', 
            border: '1px solid var(--border)',
            display: 'flex', 
            justifyContent: 'space-around',
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div className="profile-stat">
            <span className="profile-stat-val" style={{ color: 'var(--snap-purple)' }}>{user.tier || 'Scout'}</span>
            <span className="profile-stat-label">Member Rank</span>
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--border)', alignSelf: 'center' }}></div>
          <div className="profile-stat">
            <span className="profile-stat-val" style={{ color: 'var(--snap-blue)' }}>{user.cliqueCount || 0}</span>
            <span className="profile-stat-label">Cliques</span>
          </div>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <ProfileTile icon="🟣" label="My Story" count={3} />
          <ProfileTile icon="👥" label="Friends" count={120} />
          <ProfileTile icon="🟡" label="Snap Code" color="var(--snap-yellow)" />
          <ProfileTile icon="💎" label="Premium Shop" onClick={() => setActiveTab('shop')} color="#E0F2FE" />
        </div>

        {/* List Options */}
        <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
           <ProfileRow icon="🏠" label="Location Sharing" status="Ghost Mode" />
           <ProfileRow icon="🛡️" label="Privacy & Settings" />
           <ProfileRow icon="🐝" label="Clique Management" />
           <ProfileRow icon="🚪" label="Sign Out" onClick={() => window.location.reload()} danger />
        </div>
      </div>
    </div>
  );
}

function ProfileTile({ icon, label, count, onClick, color }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: color || '#fff',
        borderRadius: '20px', padding: '16px',
        border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 8,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
      }}
    >
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <span style={{ fontWeight: 700, fontSize: 13 }}>{label}</span>
         {count && <span style={{ fontSize: 12, color: 'var(--text3)' }}>{count}</span>}
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, status, onClick, danger }) {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--border)', cursor: 'pointer',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: danger ? 'var(--red)' : 'var(--text)' }}>{label}</span>
      {status && <span style={{ fontSize: 12, color: 'var(--text3)' }}>{status}</span>}
      <span style={{ color: 'var(--text3)', fontSize: 18 }}>›</span>
    </div>
  );
}

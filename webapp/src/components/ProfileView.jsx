import React from 'react';
import { useAuthStore } from '../store';

export default function ProfileView() {
  const { user } = useAuthStore();

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Profile</div>
        </div>
        <div className="panel-list" style={{ padding: '16px' }}>
          <MenuItem icon="👥" label="My Friends" value="24" />
          <MenuItem icon="🔥" label="Active Streaks" value={String(user?.streakCount || 0)} />
          <MenuItem icon="🏆" label="Elite Score" value={String(user?.snapScore || 0)} />
          <MenuItem icon="🎨" label="Customize" />
          <MenuItem icon="⚙️" label="Settings" />
          <MenuItem icon="🔒" label="Privacy" />
          <MenuItem icon="❓" label="Help" />
        </div>
      </div>

      <div className="main-content">
        <div className="profile-page fade-in">
          <div className="profile-avatar-lg">🐝</div>
          <div className="profile-name">{user?.displayName || 'USER'}</div>
          <div className="profile-username">@{user?.username || 'guest'}</div>

          {user?.bio && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 400 }}>
              {user.bio}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            📍 {user?.location || 'Québec'}
          </div>

          {/* Hive Status */}
          <div style={{
            background: 'rgba(30,30,30,0.8)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: 20,
            padding: '20px 32px',
            textAlign: 'center',
            width: '100%',
            maxWidth: 500,
          }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: 3, color: 'var(--gold)' }}>
              HIVE STATUS
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 6 }}>
              {user?.sovereignTier || 'INITIÉ'} (FREE)
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value">{user?.influenceScore?.toFixed(1) || '0.0'}</div>
              <div className="profile-stat-label">Influence</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{user?.snapScore || 0}</div>
              <div className="profile-stat-label">Elite Score</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value">{user?.streakCount || 0}</div>
              <div className="profile-stat-label">Sovereignty</div>
            </div>
          </div>

          {/* CHATSNAP+ Premium */}
          <div className="premium-banner" onClick={() => alert('CHATSNAP+ coming soon!\n\nGhost Mode, Story Vision & Unlimited Prestige.\n\n$4.99/month')}>
            <div className="premium-banner-icon">👑</div>
            <div className="premium-banner-info">
              <div className="premium-banner-title">UPGRADE TO CHATSNAP+</div>
              <div className="premium-banner-sub">More prestige for only $4.99/month</div>
            </div>
            <span style={{ color: 'var(--gold-hive)', fontSize: '1.5rem', fontWeight: 'bold' }}>›</span>
          </div>

          {/* Beehive Shop */}
          <div style={{ width: '100%', maxWidth: 500 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: 3, color: 'var(--gold-hive)', marginBottom: 12 }}>
              THE BEEHIVE SHOP 🐝
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
              <ShopItem emoji="🍯" name="Royal Jelly" price="$49.99" />
              <ShopItem emoji="🗡️" name="Golden Sting" price="$19.99" />
              <ShopItem emoji="✨" name="Hive Essence" price="$9.99" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MenuItem({ icon, label, value }) {
  return (
    <div className="convo-item" style={{ cursor: 'pointer' }}>
      <span style={{ fontSize: '1.2rem', width: 32, textAlign: 'center' }}>{icon}</span>
      <div className="convo-info">
        <div className="convo-name" style={{ fontSize: '0.85rem' }}>{label}</div>
      </div>
      {value && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{value}</span>}
      <span style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: 'bold', marginLeft: 8 }}>›</span>
    </div>
  );
}

function ShopItem({ emoji, name, price }) {
  return (
    <div
      style={{
        width: 120,
        height: 140,
        background: 'var(--surface)',
        border: '1px solid rgba(252,209,22,0.15)',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(252,209,22,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(252,209,22,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <span style={{ fontSize: '2rem', marginBottom: 4 }}>{emoji}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{name}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold-hive)' }}>{price}</span>
    </div>
  );
}

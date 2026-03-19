import React, { useState } from 'react';
import { useAuthStore, useUIStore } from '../store';
import { createSubscriptionSession, updateProfile } from '../api';

export default function ProfileView() {
  const { user, updateUserSettings } = useAuthStore();
  const { setActiveTab } = useUIStore();
  const [loading, setLoading] = useState(false);

  const ghostMode = user?.settings?.ghostMode || user?.settings?.ghost_mode || false;
  const isPremium = user?.sovereignTier === 'CLIQUE+' || user?.sovereign_tier === 'CLIQUE+' || user?.subscription_tier === 'CLIQUE+';

  const toggleGhostMode = async () => {
    if (!isPremium) {
      alert('Ghost Mode requires a CHATSNAP+ subscription');
      setActiveTab('shop');
      return;
    }
    try {
      const newStatus = !ghostMode;
      await updateProfile({ ghostMode: newStatus });
      updateUserSettings({ ghostMode: newStatus });
    } catch (err) {
      console.error(err);
      alert('Failed to update Ghost Mode');
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createSubscriptionSession();
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      alert('Failed to connect to payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content fade-in" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="profile-page">
        {/* Header Actions */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 24 }}>
          <button className="sidebar-btn" onClick={toggleGhostMode} title="Ghost Mode" style={{ borderRadius: 10 }}>
            {ghostMode ? '👻' : '👁'}
          </button>
          <button className="sidebar-btn" title="Settings" style={{ borderRadius: 10 }}>⚙</button>
        </div>

        {/* Hex Score */}
        <div className="hex-score">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon 
              points="60,4 112,32 112,88 60,116 8,88 8,32" 
              stroke="url(#hexGrad)" 
              strokeWidth="1.5" 
              fill="none" 
              strokeDasharray="6 3"
            />
            <defs>
              <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--gold-lt)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="hex-inner">
            <div className="hex-number">{user?.influenceScore?.toFixed(0) || user?.influence_score?.toFixed?.(0) || '0'}</div>
            <div className="hex-label">Influence</div>
          </div>
        </div>

        <div className="profile-name-big">{user?.displayName || user?.display_name || user?.username || 'User'}</div>
        <div className="profile-tier-badge">{user?.sovereignTier || user?.sovereign_tier || user?.subscription_tier || 'FREE'}</div>

        {/* Stats */}
        <div className="profile-stats-row">
          <StatBox label="Friends" value={user?.friend_count || 0} />
          <StatBox label="Cliques" value={user?.clique_count || 0} />
          <StatBox label="Score" value={user?.snapScore || user?.snap_score || 0} />
        </div>

        {/* Ghost Mode Card */}
        <div style={{
          width: '100%', maxWidth: 480,
          background: 'var(--bg3)', border: ghostMode ? '1px solid var(--border-gold)' : '1px solid var(--border)',
          borderRadius: 16, padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, transition: 'all 0.3s var(--ease-out)'
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 2, letterSpacing: '0.05em' }}>GHOST MODE</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {ghostMode ? 'Active — you are invisible' : 'Off — you are visible'}
            </div>
          </div>
          <div 
            onClick={toggleGhostMode}
            style={{
              width: 44, height: 24, borderRadius: 20,
              background: ghostMode ? 'var(--gold)' : 'var(--bg4)',
              cursor: 'pointer', position: 'relative', transition: '0.2s'
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: ghostMode ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: '0.2s'
            }} />
          </div>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 480 }}>
          <ProfileMenuCard label="Influence" sub="View details" onClick={() => setActiveTab('shop')} />
          <ProfileMenuCard label="Shop" sub="Boosts & Premium" onClick={() => setActiveTab('shop')} />
        </div>

        {/* Premium Card */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
                CHATSNAP<span style={{ color: 'var(--gold)' }}>+</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>$4.99 / month</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <PlusFeature text="Ghost Mode — invisible browsing" />
            <PlusFeature text="Story Vision — see your viewers" />
            <PlusFeature text="Accelerated Prestige" />
            <PlusFeature text="Exclusive Sovereign badge" />
          </div>
          <button className="buy-btn" onClick={handleSubscribe} disabled={loading}>
            {loading ? 'Redirecting...' : 'Activate CHATSNAP+'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="stat-box">
      <div className="stat-val">{value}</div>
      <div className="stat-lab">{label}</div>
    </div>
  );
}

function ProfileMenuCard({ label, sub, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '18px 16px', cursor: 'pointer',
        transition: 'all 0.25s var(--ease-out)'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,151,58,0.25)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function PlusFeature({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
      <span style={{ color: 'var(--gold)', fontSize: 10 }}>◆</span> {text}
    </div>
  );
}

import React, { useState } from 'react';
import { useAuthStore, useUIStore } from '../store';
import { createSubscriptionSession, updateProfile } from '../api';

export default function ProfileView() {
  const { user, updateUserSettings } = useAuthStore();
  const { setActiveTab } = useUIStore();
  const [loading, setLoading] = useState(false);

  // Ghost Mode logic
  const ghostMode = user?.settings?.ghostMode || false;
  const isPremium = user?.sovereignTier === 'CLIQUE+' || user?.sovereignTier === 'SOVEREIGN';

  const toggleGhostMode = async () => {
    if (!isPremium) {
      alert("Ghost Mode nécessite un abonnement CHATSNAP+ ✦");
      setActiveTab('shop');
      return;
    }

    try {
      const newStatus = !ghostMode;
      await updateProfile({ ghostMode: newStatus });
      updateUserSettings({ ghostMode: newStatus });
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du Ghost Mode.');
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createSubscriptionSession();
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      alert('Échec de la connexion à Stripe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content fade-in" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="profile-page">
        {/* Header Actions */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 20 }}>
          <button className="sidebar-btn" onClick={toggleGhostMode} title="Ghost Mode">
            {ghostMode ? '👻' : '👁️'}
          </button>
          <button className="sidebar-btn" title="Settings">⚙️</button>
        </div>

        {/* Hex Score Section */}
        <div className="hex-score">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon 
              points="60,4 112,32 112,88 60,116 8,88 8,32" 
              stroke="url(#hexGrad)" 
              strokeWidth="2" 
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
            <div className="hex-number">{user?.influenceScore?.toFixed(0) || '0'}</div>
            <div className="hex-label">Influence</div>
          </div>
        </div>

        <div className="profile-name-big">{user?.displayName || 'USER'}</div>
        <div className="profile-tier-badge">{user?.sovereignTier || 'INITIÉ'}</div>

        {/* Stats Row */}
        <div className="profile-stats-row">
          <StatBox label="Amis" value="347" />
          <StatBox label="Cliques" value="12" />
          <StatBox label="Score" value={user?.snapScore || 0} />
        </div>

        {/* Ghost Mode Status */}
        <div style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--bg3)',
          border: ghostMode ? '1px solid var(--border-gold)' : '1px solid var(--border)',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          transition: 'all 0.3s'
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 2 }}>✦ GHOST MODE</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {ghostMode ? 'Actif — vous êtes invisible' : 'Désactivé — vous êtes visible'}
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
          <ProfileMenuCard 
            icon="⬡" 
            label="Influence" 
            sub="Voir détails" 
            onClick={() => setActiveTab('shop')} 
          />
          <ProfileMenuCard 
            icon="🍯" 
            label="Shop" 
            sub="Boosts & Premium" 
            onClick={() => setActiveTab('shop')} 
          />
        </div>

        {/* Premium Upgrade */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>
                CHATSNAP<span style={{ color: 'var(--gold)' }}>+</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>$4.99 / mois</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <PlusFeature text="Ghost Mode — navigation invisible" />
            <PlusFeature text="Story Vision — voyez vos vues" />
            <PlusFeature text="Prestige accéléré" />
          </div>
          <button className="buy-btn" onClick={handleSubscribe} disabled={loading}>
            {loading ? 'Redirection...' : 'Activer CHATSNAP+ ✦'}
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

function ProfileMenuCard({ icon, label, sub, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '16px',
        cursor: 'pointer',
        transition: '0.2s'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-gold)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
    </div>
  );
}

function PlusFeature({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
      <span style={{ color: 'var(--gold)' }}>✦</span> {text}
    </div>
  );
}

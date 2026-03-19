import React, { useState } from 'react';
import { useAuthStore, useUIStore } from '../store';
import { createSubscriptionSession, createUpgradeSession } from '../api';

export default function ShopView() {
  const { setActiveTab } = useUIStore();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createSubscriptionSession();
      window.location.href = checkoutUrl;
    } catch (err) {
      alert('Failed to start checkout. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyUpgrade = async (itemId) => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createUpgradeSession(itemId);
      window.location.href = checkoutUrl;
    } catch (err) {
      alert('Failed to start checkout. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content fade-in" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button className="sidebar-btn" onClick={() => setActiveTab('profile')}>←</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28 }}>🍯 Beehive Shop</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Amplifiez votre influence dans la ruche</p>

        {/* Premium Card */}
        <div className="premium-card" style={{ maxWidth: 'none', marginBottom: 32, opacity: loading ? 0.7 : 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>CHATSNAP<span style={{ color: 'var(--gold)' }}>+</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
            <Feature text="Ghost Mode — naviguez en invisible" />
            <Feature text="Story Vision — voyez qui vous regarde" />
            <Feature text="Prestige accéléré — montez plus vite" />
            <Feature text="Aurum Whisper — notifications exclusives" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)', marginBottom: 16 }}>
            $4.99 <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 400 }}>/ mois</span>
          </div>
          <button className="buy-btn" onClick={handleSubscribe} disabled={loading}>
            {loading ? 'Redirection...' : 'Activer CHATSNAP+ ✦'}
          </button>
        </div>

        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 11, 
          fontWeight: 700, 
          color: 'var(--text3)', 
          letterSpacing: '0.12em', 
          textTransform: 'uppercase',
          marginBottom: 16 
        }}>
          Boosts Uniques
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ShopItem 
            icon="🍯" 
            name="Royal Jelly" 
            desc="Boost d'influence massif + glow Royal permanent" 
            price="$49.99" 
            onClick={() => handleBuyUpgrade('royal_jelly')}
            loading={loading}
          />
          <ShopItem 
            icon="⚡" 
            name="Golden Sting" 
            desc="Multiplicateur ×2 d'influence pendant 30 jours" 
            price="$19.99" 
            onClick={() => handleBuyUpgrade('golden_sting')}
            loading={loading}
          />
          <ShopItem 
            icon="✨" 
            name="Hive Essence" 
            desc="Recharge unique de prestige — récupérez votre rang" 
            price="$9.99" 
            onClick={() => handleBuyUpgrade('hive_essence')}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text2)' }}>
      <span style={{ color: 'var(--gold)' }}>✦</span> {text}
    </div>
  );
}

function ShopItem({ icon, name, desc, price, onClick, loading }) {
  return (
    <div 
      className="shop-item"
      onClick={!loading ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        cursor: loading ? 'default' : 'pointer',
        transition: '0.2s',
        opacity: loading ? 0.7 : 1
      }}
      onMouseEnter={(e) => { if(!loading) { e.currentTarget.style.borderColor = 'var(--border-gold)'; e.currentTarget.style.background = 'var(--bg4)'; } }}
      onMouseLeave={(e) => { if(!loading) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; } }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: 'var(--bg4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--gold)' }}>
        {price}
      </div>
    </div>
  );
}

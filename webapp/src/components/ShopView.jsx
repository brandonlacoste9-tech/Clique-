import React, { useState } from 'react';
import { useUIStore } from '../store';
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
      console.error(err);
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
      console.error(err);
      alert('Failed to start checkout. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content fade-in" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '48px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <button className="sidebar-btn" onClick={() => setActiveTab('profile')} style={{ borderRadius: 12 }}>←</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32 }}>Honey Shop</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 32, letterSpacing: '0.02em' }}>Amplify your influence across the hive 🔱</p>

        {/* Premium Card */}
        <div className="premium-card" style={{ maxWidth: 'none', marginBottom: 40, opacity: loading ? 0.7 : 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700 }}>CHATSNAP<span style={{ color: 'var(--gold)' }}>+</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }}>
            <Feature text="Ghost Mode — browse invisibly" />
            <Feature text="Story Vision — see who views your content" />
            <Feature text="Accelerated Prestige — climb tiers faster" />
            <Feature text="Sovereign Badge — exclusive elite status" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)', marginBottom: 20 }}>
            $4.99 <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 400 }}>/ month</span>
          </div>
          <button className="buy-btn" onClick={handleSubscribe} disabled={loading}>
            {loading ? 'Processing...' : 'Activate CHATSNAP+ 🔱'}
          </button>
        </div>

        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 12, 
          fontWeight: 600, 
          color: 'var(--text3)', 
          letterSpacing: '0.15em', 
          textTransform: 'uppercase',
          marginBottom: 20 
        }}>
          Exclusive Upgrades
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ShopItem 
            symbol="◎" 
            name="Royal Jelly" 
            desc="Massive influence boost + permanent sovereign glow" 
            price="$49.99" 
            onClick={() => handleBuyUpgrade('royal_jelly')}
            loading={loading}
          />
          <ShopItem 
            symbol="✦" 
            name="Golden Sting" 
            desc="2× Influence multiplier for 30 days" 
            price="$19.99" 
            onClick={() => handleBuyUpgrade('golden_sting')}
            loading={loading}
          />
          <ShopItem 
            symbol="✧" 
            name="Hive Essence" 
            desc="One-time prestige recharge — reclaim your rank" 
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
      <span style={{ color: 'var(--gold)', fontSize: 12 }}>◆</span> {text}
    </div>
  );
}

function ShopItem({ symbol, name, desc, price, onClick, loading }) {
  return (
    <div 
      className="shop-item"
      onClick={!loading ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '24px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        cursor: loading ? 'default' : 'pointer',
        transition: 'all 0.3s var(--ease-out)',
        opacity: loading ? 0.7 : 1
      }}
      onMouseEnter={(e) => { if(!loading) { e.currentTarget.style.borderColor = 'rgba(201,151,58,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
      onMouseLeave={(e) => { if(!loading) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; } }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(201,151,58,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0, color: 'var(--gold)', border: '1px solid rgba(201,151,58,0.15)'
      }}>{symbol}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{desc}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--gold)' }}>
        {price}
      </div>
    </div>
  );
}

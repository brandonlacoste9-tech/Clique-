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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <button className="sidebar-btn" onClick={() => setActiveTab('profile')} style={{ borderRadius: 14 }}>←</button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em' }}>Honey Shop</h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 32, fontWeight: 500 }}>Amplify your influence across the hive 🔱</p>

        {/* Premium Card - Snap Yellow Style */}
        <div className="premium-card" style={{ maxWidth: 'none', marginBottom: 40, opacity: loading ? 0.7 : 1, boxShadow: '0 10px 40px rgba(255, 252, 0, 0.4)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>CHATSNAP<span style={{ color: '#000', opacity: 0.5 }}>+</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '24px 0' }}>
            <Feature text="Ghost Mode — browse invisibly" />
            <Feature text="Story Vision — see who views your content" />
            <Feature text="Accelerated Prestige — climb tiers faster" />
            <Feature text="Sovereign Badge — exclusive elite status" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#000', marginBottom: 20 }}>
            $4.99 <span style={{ fontSize: 13, opacity: 0.6, fontWeight: 600 }}>/ month</span>
          </div>
          <button className="buy-btn" onClick={handleSubscribe} disabled={loading} style={{ width: '100%', padding: '18px', fontSize: 16 }}>
            {loading ? 'Processing...' : 'Activate Now 🔱'}
          </button>
        </div>

        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 12, 
          fontWeight: 800, 
          color: 'var(--text3)', 
          letterSpacing: '0.15em', 
          textTransform: 'uppercase',
          marginBottom: 24 
        }}>
          One-Time Boosts
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ShopItem 
            symbol="◎" 
            name="Royal Jelly" 
            desc="Massive influence boost + permanent sovereign glow" 
            price="$49.99" 
            color="var(--snap-yellow)"
            onClick={() => handleBuyUpgrade('royal_jelly')}
            loading={loading}
          />
          <ShopItem 
            symbol="✦" 
            name="Golden Sting" 
            desc="2× Influence multiplier for 30 days" 
            price="$19.99" 
            color="var(--snap-blue)"
            onClick={() => handleBuyUpgrade('golden_sting')}
            loading={loading}
          />
          <ShopItem 
            symbol="✧" 
            name="Hive Essence" 
            desc="One-time prestige recharge — reclaim your rank" 
            price="$9.99" 
            color="var(--snap-purple)"
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'rgba(0,0,0,0.7)', fontWeight: 600 }}>
       <span style={{ color: '#000', fontSize: 14 }}>✦</span> {text}
    </div>
  );
}

function ShopItem({ symbol, name, desc, price, color, onClick, loading }) {
  return (
    <div 
      className="shop-item"
      onClick={!loading ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '24px',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '28px',
        cursor: loading ? 'default' : 'pointer',
        transition: 'all 0.3s var(--ease-out)',
        opacity: loading ? 0.7 : 1,
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}
      onMouseEnter={(e) => { if(!loading) { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={(e) => { if(!loading) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >
      <div style={{
        width: 60, height: 60, borderRadius: '20px',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0, color: (color === 'var(--snap-yellow)' ? '#000' : '#fff'),
        boxShadow: `0 4px 15px ${color}44`
      }}>{symbol}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{desc}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
        {price}
      </div>
    </div>
  );
}

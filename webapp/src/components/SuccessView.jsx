import React from 'react';
import { useUIStore } from '../store';

export default function SuccessView({ type }) {
  const { setActiveTab } = useUIStore();
  const isUpgrade = type === 'upgrade';
  
  return (
    <div className="main-content fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        
        {/* Animated Checkmark */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--snap-yellow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, marginBottom: 24,
          boxShadow: '0 8px 20px rgba(255, 252, 0, 0.3)',
          animation: 'snap-pop 0.5s var(--spring)'
        }}>
          ✨
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, marginBottom: 12, color: '#000' }}>
          {isUpgrade ? 'Boost Activated!' : 'Welcome to ChatSnap+!'}
        </h1>
        
        <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 320, lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
          {isUpgrade 
            ? 'Your influence has been amplified. Your new privileges are now live across the hive.'
            : 'You are now part of the elite. Ghost Mode and all Premium features are unlocked.'}
        </p>

        <button 
          className="buy-btn" 
          onClick={() => {
            window.history.replaceState({}, '', '/');
            setActiveTab('profile');
          }}
          style={{ width: '100%', background: 'var(--snap-blue)', color: '#fff' }}
        >
          Return to Profile
        </button>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
          A confirmation has been sent to your email.
        </div>
      </div>

      <style>{`
        @keyframes snap-pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

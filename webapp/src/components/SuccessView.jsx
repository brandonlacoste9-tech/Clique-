import React from 'react';
import { useUIStore } from '../store';

export default function SuccessView({ type }) {
  const { setActiveTab } = useUIStore();

  const isUpgrade = type === 'upgrade';
  
  return (
    <div className="main-content fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="profile-page" style={{ alignItems: 'center', textAlign: 'center', padding: '0 24px' }}>
        
        {/* Animated Checkmark */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'var(--gold-glow)',
          border: '2px solid var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, marginBottom: 32,
          animation: 'pulse-gold 2s infinite'
        }}>
          ✨
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, marginBottom: 16 }}>
          {isUpgrade ? 'Boost Activé !' : 'Bienvenue chez ChatSnap+ !'}
        </h1>
        
        <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 400, lineHeight: 1.6, marginBottom: 40 }}>
          {isUpgrade 
            ? 'Votre influence a été amplifiée. Vos nouveaux privilèges sont désormais actifs dans toute la ruche.'
            : 'Vous faites maintenant partie de l\'élite. Le Ghost Mode et tous les avantages Premium sont déverrouillés.'}
        </p>

        <button 
          className="buy-btn" 
          onClick={() => {
            // Reset URL to root manually to clean up the browser bar
            window.history.replaceState({}, '', '/');
            setActiveTab('profile');
          }}
          style={{ maxWidth: 240 }}
        >
          Retour au Profil ✦
        </button>

        <div style={{ marginTop: 24, fontSize: 13, color: 'var(--text3)' }}>
          Une confirmation a été envoyée par courriel.
        </div>
      </div>
    </div>
  );
}

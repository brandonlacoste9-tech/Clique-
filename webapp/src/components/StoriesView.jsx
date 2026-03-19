import React, { useState } from 'react';

export default function StoriesView() {
  const [activeStory, setActiveStory] = useState(null);

  const stories = [
    { id: 'me-1', user: 'MOI (Imperial)', emoji: '👑', bg: 'var(--bg2)', msg: 'Vues premium activées 🐝', time: 'il y a 5m', icon: '🍯', isMine: true },
    { id: '1', user: 'Véronique 🌹', emoji: '🌹', bg: '#1A0820', msg: 'Soirée au Plateau 🔥🔥', time: 'il y a 1h', icon: '🌃' },
    { id: '2', user: 'KingFred 👑', emoji: '👑', bg: '#0A1A08', msg: 'Go Habs Go 🏒❄️', time: 'il y a 2h', icon: '🏒' },
    { id: '3', user: 'SophieMTL', emoji: '🦋', bg: '#0A0A1A', msg: 'Aurores boréales ce soir???', time: 'il y a 3h', icon: '🌌' },
    { id: '4', user: 'TiGuy 🐝', emoji: '🐝', bg: '#1A1005', msg: 'Québec souverain! 🍁', time: 'il y a 4h', icon: '🍁' },
  ];

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">STORIES</div>
        </div>
        <div className="panel-list">
          {/* Add story */}
          <div className="convo-item">
            <div className="convo-avatar" style={{ border: '2px dashed var(--border-gold)', background: 'var(--bg4)', color: 'var(--gold)', fontSize: '1.5rem' }}>
              ＋
            </div>
            <div className="convo-info">
              <div className="convo-name">Ajouter une Story</div>
              <div className="convo-preview">Partager avec la ruche</div>
            </div>
          </div>

          <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>RÉCENTES</div>
          {stories.map((s) => (
            <div key={s.id} className="convo-item" onClick={() => setActiveStory(s)}>
              <div className="story-ring" style={{ width: 52, height: 52, padding: 2.5 }}>
                <div className="story-ring-inner" style={{ fontSize: 24, background: 'var(--bg3)', border: '2px solid var(--bg)' }}>{s.emoji}</div>
              </div>
              <div className="convo-info">
                <div className="convo-name">{s.user}</div>
                <div className="convo-preview" style={{ color: 'var(--text2)' }}>Nouveau contenu</div>
              </div>
              <span className="convo-time">{s.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {activeStory ? (
          <div className="fade-in" style={{ flex: 1, background: activeStory.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Story Progress */}
            <div style={{ position: 'absolute', top: 20, left: 12, right: 12, display: 'flex', gap: 4 }}>
               <div style={{ flex: 1, height: 2, background: '#fff', borderRadius: 99 }}></div>
               <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}></div>
               <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}></div>
            </div>

            {/* Top Info */}
            <div style={{ position: 'absolute', top: 32, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '1px solid rgba(255,255,255,0.3)' }}>
                {activeStory.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{activeStory.user}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{activeStory.time}</div>
              </div>
              <button 
                onClick={() => setActiveStory(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
              >✕</button>
            </div>

            {/* Content */}
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: 120, marginBottom: 20 }}>{activeStory.icon}</div>
               <div style={{ 
                 fontFamily: 'var(--font-display)', 
                 fontSize: 32, 
                 fontWeight: 800, 
                 color: '#fff', 
                 textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                 padding: '0 20px'
               }}>{activeStory.msg}</div>
            </div>

            {activeStory.isMine ? (
              <div 
                style={{ 
                  position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(201,151,58,0.25)', border: '1px solid var(--border-gold)',
                  borderRadius: '24px', padding: '12px 24px', width: '280px',
                  backdropFilter: 'blur(20px)', color: '#fff'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 8, textAlign: 'center' }}>
                  👁 STORY VISION — 3 VUES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ViewerRow name="Alex Tremblay" time="2m" />
                  <ViewerRow name="Nathan B." time="5m" ss />
                  <ViewerRow name="Marie-Ève" time="10m" />
                </div>
              </div>
            ) : (
              <div style={{ 
                position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 99, padding: '8px 16px', fontSize: 12, color: '#fff',
                backdropFilter: 'blur(10px)'
              }}>
                Répondre à la story...
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-screen">
            <div style={{ fontSize: 80 }}>⚡</div>
            <div className="welcome-title">STORIES</div>
            <div className="welcome-subtitle">
              Tap a story to view it. Share moments with your hive — they disappear in 24 hours.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ViewerRow({ name, time, ss }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }}></div>
        <span>{name}</span>
        {ss && <span style={{ fontSize: 10, color: '#ff4b4b', fontWeight: 800 }}>[CAPTURE 📸]</span>}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{time}</div>
    </div>
  );
}

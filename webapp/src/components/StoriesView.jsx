import React, { useState } from 'react';

function Avatar({ name, size = 52, active }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div className="story-circle">
      <div className="story-ring" style={{ 
        width: size, height: size, 
        background: active ? 'linear-gradient(135deg, var(--gold), var(--gold-lt), #FF6B35)' : 'var(--border)' 
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: `hsl(${hue}, 25%, 15%)`,
          border: `2px solid var(--bg-deep)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-body)', fontWeight: 600,
          fontSize: size * 0.3, color: `hsl(${hue}, 40%, 60%)`,
        }}>
          {initials}
        </div>
      </div>
    </div>
  );
}

export default function StoriesView() {
  const [activeStory, setActiveStory] = useState(null);

  const stories = [
    { id: 'me-1', user: 'You', bg: 'var(--bg2)', msg: 'Premium vision active 🔱', time: '5m ago', icon: '💎', isMine: true },
    { id: '1', user: 'Vero', bg: '#1A0820', msg: 'City lights tonight 🔥🔥', time: '1h ago', icon: '🌃' },
    { id: '2', user: 'Fred King', bg: '#0A1A08', msg: 'Late night sessions 🏒', time: '2h ago', icon: '🏒' },
    { id: '3', user: 'Sophie M', bg: '#0A0A1A', msg: 'Aurore Borealis tonight?', time: '3h ago', icon: '🌌' },
    { id: '4', user: 'Nathan B', bg: '#1A1005', msg: 'Clique energy! 🔱', time: '4h ago', icon: '🔱' },
  ];

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Stories</div>
        </div>
        <div className="panel-list">
          {/* Add story */}
          <div className="convo-item">
            <div className="convo-avatar" style={{ border: '2px dashed var(--border-gold)', background: 'var(--bg4)', color: 'var(--gold)', fontSize: '1.2rem' }}>
              ＋
            </div>
            <div className="convo-info">
              <div className="convo-name">Add to Story</div>
              <div className="convo-preview">Share with your hive</div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Recent Updates</div>
          {stories.map((s) => (
            <div key={s.id} className="convo-item" onClick={() => setActiveStory(s)}>
              <Avatar name={s.user} size={52} active={!s.viewed} />
              <div className="convo-info">
                <div className="convo-name">{s.user}</div>
                <div className="convo-preview" style={{ color: 'var(--text2)' }}>New story update</div>
              </div>
              <span className="convo-time">{s.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {activeStory ? (
          <div className="fade-in" style={{ flex: 1, background: activeStory.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {/* Story Progress */}
            <div style={{ position: 'absolute', top: 20, left: 12, right: 12, display: 'flex', gap: 4 }}>
               <div style={{ flex: 1, height: 2, background: '#fff', borderRadius: 99 }}></div>
               <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}></div>
               <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 99 }}></div>
            </div>

            {/* Top Info */}
            <div style={{ position: 'absolute', top: 32, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                {activeStory.user[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{activeStory.user}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{activeStory.time}</div>
              </div>
              <button 
                onClick={() => setActiveStory(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: 10 }}
              >✕</button>
            </div>

            {/* Content */}
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: 100, marginBottom: 20, filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }}>{activeStory.icon}</div>
               <div style={{ 
                 fontFamily: 'var(--font-display)', 
                 fontSize: 32, 
                 fontWeight: 700, 
                 color: '#fff', 
                 textShadow: '0 4px 30px rgba(0,0,0,0.6)',
                 padding: '0 40px',
                 lineHeight: 1.2
               }}>{activeStory.msg}</div>
            </div>

            {activeStory.isMine ? (
              <div 
                style={{ 
                  position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px', padding: '16px 20px', width: '320px',
                  backdropFilter: 'blur(30px)', color: '#fff'
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', marginBottom: 12, textAlign: 'center', letterSpacing: '0.1em' }}>
                  ✧ STORY VISION — 3 VIEWERS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <ViewerRow name="Alex Tremblay" time="2m" />
                  <ViewerRow name="Nathan B." time="5m" ss />
                  <ViewerRow name="Marie-Eve" time="10m" />
                </div>
              </div>
            ) : (
              <div style={{ 
                position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 99, padding: '12px 24px', fontSize: 13, color: '#fff',
                backdropFilter: 'blur(20px)', width: '70%', textAlign: 'center'
              }}>
                Reply to story...
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 64, opacity: 0.8 }}>⚡</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '0.05em' }}>STORIES</div>
            <div style={{ fontSize: 14, color: 'var(--text3)', maxWidth: 300, lineHeight: 1.6 }}>
              Select a story to view recent moments from your hive. Stories disappear after 24 hours.
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
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)' }}></div>
        <span style={{ fontWeight: 500 }}>{name}</span>
        {ss && <span style={{ fontSize: 9, color: '#ff4b4b', fontWeight: 700, background: 'rgba(255,75,75,0.1)', padding: '2px 6px', borderRadius: 4 }}>SCREENSHOT 📸</span>}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{time}</div>
    </div>
  );
}

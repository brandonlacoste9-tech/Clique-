import React, { useState } from 'react';

function Avatar({ name, size = 52, active }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const snapColors = ['#00B1FF', '#9B51E0', '#FF4BBD', '#2ECC71', '#FF9500'];
  const colorIndex = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % snapColors.length;
  const bgColor = snapColors[colorIndex];
  
  return (
    <div className="story-circle" style={{ position: 'relative' }}>
      <div className="story-ring" style={{ 
        width: size, height: size, 
        padding: 3,
        background: active ? 'linear-gradient(135deg, var(--snap-purple), var(--snap-pink))' : 'var(--border)' 
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: bgColor,
          border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-body)', fontWeight: 700,
          fontSize: size * 0.35, color: '#fff',
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
    { id: 'me-1', user: 'You', bg: '#F7F7F7', msg: 'The grind never stops 🔱', time: '5m', icon: '🔋', isMine: true },
    { id: '1', user: 'Vero', bg: '#FFF5F8', msg: 'Weekend vibes! 🌸', time: '1h', icon: '🌸' },
    { id: '2', user: 'Fred King', bg: '#F0F9FF', msg: 'Late night sessions 🏒', time: '2h', icon: '🏒' },
    { id: '3', user: 'Sophie M', bg: '#FDF2F8', msg: 'Finally here! ✨', time: '3h', icon: '✨' },
    { id: '4', user: 'Nathan B', bg: '#F0FFF4', msg: 'Code is life 🌿', time: '4h', icon: '🌿' },
  ];

  return (
    <>
      <div className="panel fade-in">
        <div className="panel-header">
          <div className="panel-title">Stories</div>
        </div>
        <div className="panel-list">
          {/* Add story */}
          <div className="convo-item">
            <div className="convo-avatar" style={{ border: '2px dashed var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text3)', fontSize: '1.2rem' }}>
              ＋
            </div>
            <div className="convo-info">
              <div className="convo-name">Add My Story</div>
              <div className="convo-preview">Share moments with your friends</div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Recent Friends</div>
          {stories.map((s) => (
            <div key={s.id} className="convo-item" onClick={() => setActiveStory(s)}>
              <Avatar name={s.user} size={52} active={!s.viewed} />
              <div className="convo-info">
                <div className="convo-name">{s.user}</div>
                <div className="convo-preview" style={{ color: 'var(--text2)' }}>Click to view story</div>
              </div>
              <span className="convo-time">{s.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        {activeStory ? (
          <div className="fade-in" style={{ flex: 1, background: activeStory.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {/* Story Progress Bars */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4 }}>
               <div style={{ flex: 1, height: 2.5, background: 'rgba(0,0,0,0.2)', borderRadius: 99 }}></div>
               <div style={{ flex: 1, height: 2.5, background: 'rgba(0,0,0,0.05)', borderRadius: 99 }}></div>
               <div style={{ flex: 1, height: 2.5, background: 'rgba(0,0,0,0.05)', borderRadius: 99 }}></div>
            </div>

            {/* Header Info */}
            <div style={{ position: 'absolute', top: 24, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--snap-purple)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                {activeStory.user[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#000', fontWeight: 700, fontSize: 15 }}>{activeStory.user}</div>
                <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: 11 }}>{activeStory.time} ago</div>
              </div>
              <button 
                onClick={() => setActiveStory(null)}
                style={{ background: 'none', border: 'none', color: '#000', fontSize: 24, cursor: 'pointer', padding: 8, opacity: 0.6 }}
              >✕</button>
            </div>

            {/* Content Display */}
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: 96, marginBottom: 20, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}>{activeStory.icon}</div>
               <div style={{ 
                 fontFamily: 'var(--font-display)', 
                 fontSize: 32, 
                 fontWeight: 800, 
                 color: '#000', 
                 padding: '0 40px',
                 lineHeight: 1.2
               }}>{activeStory.msg}</div>
            </div>

            {activeStory.isMine ? (
              <div 
                style={{ 
                  position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: '24px', padding: '20px', width: '300px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)', color: '#000'
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--snap-purple)', marginBottom: 16, textAlign: 'center', letterSpacing: '0.1em' }}>
                  ✧ STORY VISION — 3 VIEWS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ViewerRow name="Alex Tremblay" time="2m" />
                  <ViewerRow name="Nathan B." time="5m" ss />
                  <ViewerRow name="Marie-Eve" time="10m" />
                </div>
              </div>
            ) : (
              <div style={{ 
                position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
                background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 99, padding: '14px 24px', fontSize: 14, color: 'rgba(0,0,0,0.5)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.06)', width: '75%', textAlign: 'center'
              }}>
                Reply to the story...
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-screen">
            <div style={{ fontSize: 72, background: 'var(--bg-subtle)', padding: 32, borderRadius: '50px', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)' }}>
               🐝
            </div>
            <h2 className="welcome-title">Stories</h2>
            <p className="welcome-subtitle">
              See what your friends have been up to lately. These moments only last for 24 hours.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function ViewerRow({ name, time, ss }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--snap-purple)' }}></div>
        <span style={{ fontWeight: 600 }}>{name}</span>
        {ss && <span style={{ fontSize: 9, color: '#ff4b4b', fontWeight: 800, background: 'rgba(255,75,75,0.08)', padding: '2px 8px', borderRadius: 6 }}>SHOT 📸</span>}
      </div>
      <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: 11, fontWeight: 700 }}>{time}</div>
    </div>
  );
}

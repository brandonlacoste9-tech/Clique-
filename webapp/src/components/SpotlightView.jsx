import React from 'react';

export default function SpotlightView() {
  const spotlightContent = [
    { id: 1, title: 'Queen Bee Routine 🐝', author: '@hivemaster', likes: '1.2M', bg: 'linear-gradient(180deg, #111 0%, #000 100%)' },
    { id: 2, title: 'Royal Jelly Unboxing ✨', author: '@elitedrones', likes: '450K', bg: 'linear-gradient(135deg, #FFFC00 0%, #000 100%)' },
    { id: 3, title: 'SnapLight Demo 🔱', author: '@thehive', likes: '2.4M', bg: 'linear-gradient(45deg, #00B1FF 0%, #000 100%)' },
  ];

  return (
    <div className="main-content spotlight-container fade-in" style={{
      height: '100%', width: '100%',
      overflowY: 'auto',
      scrollSnapType: 'y mandatory',
      background: '#000'
    }}>
      {spotlightContent.map((item) => (
        <div key={item.id} style={{
          height: '100%', width: '100%',
          scrollSnapAlign: 'start',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: item.bg
        }}>
          {/* Content Info */}
          <div style={{
            position: 'absolute', bottom: 120, left: 24, right: 80,
            color: '#fff',
            zIndex: 10
          }}>
             <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>{item.title}</h2>
             <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>{item.author}</p>
          </div>

          {/* Social Actions Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 120,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            zIndex: 10
          }}>
            <Action icon="❤️" label={item.likes} />
            <Action icon="💬" label="View Chat" />
            <Action icon="↗️" label="Boost" />
          </div>

          {/* Immersive Mock Visual */}
          <div className="honey-glow-view" style={{ fontSize: 140, opacity: 0.2 }}>🐝</div>
        </div>
      ))}

      <style>{`
        .spotlight-container::-webkit-scrollbar { display: none; }
        .spotlight-container { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function Action({ icon, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
       <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)'
       }}>{icon}</div>
       <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', opacity: 0.8 }}>{label}</span>
    </div>
  );
}

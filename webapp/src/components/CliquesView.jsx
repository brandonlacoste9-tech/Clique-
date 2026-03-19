import React, { useEffect } from 'react';
import { useCliquesStore } from '../store';

function Avatar({ name, size = 52 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const snapColors = ['#00B1FF', '#9B51E0', '#FF4BBD', '#2ECC71', '#FF9500'];
  const colorIndex = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % snapColors.length;
  const bgColor = snapColors[colorIndex];
  
  return (
    <div style={{
      width: size, height: size, borderRadius: '18px',
      background: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', fontWeight: 700,
      fontSize: size * 0.4, color: '#fff',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

export default function CliquesView() {
  const { cliques, fetchCliques } = useCliquesStore();

  useEffect(() => {
    fetchCliques();
  }, [fetchCliques]);

  return (
    <>
      <div className="panel fade-in">
        <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="panel-title">Cliques</div>
          <button style={{ background: 'var(--snap-yellow)', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>＋</button>
        </div>
        <div className="panel-list">
          <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>My Active Cliques</div>
          {cliques.length === 0 ? (
             <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
               <div style={{ fontSize: 32, marginBottom: 16 }}>🐝</div>
               <p style={{ fontSize: 13 }}>No cliques yet. Start a new one to swarm!</p>
             </div>
          ) : (
            cliques.map((clique) => (
              <div key={clique.id} className="convo-item">
                <Avatar name={clique.name} />
                <div className="convo-info">
                  <div className="convo-name">{clique.name}</div>
                  <div className="convo-preview">{clique.memberCount || 0} members · {clique.onlineCount || 0} online</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
                  Active
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="main-content fade-in">
        <div className="welcome-screen">
          <div style={{ fontSize: 72, background: 'var(--bg-subtle)', padding: 32, borderRadius: '50px', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)' }}>
            👥
          </div>
          <h2 className="welcome-title">Clique Discovery</h2>
          <p className="welcome-subtitle">Find or create exclusive swarms to chat, share, and rise through the ranks together.</p>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%', maxWidth: 400 }}>
             <TrendingCard label="Elite Club" color="var(--snap-blue)" />
             <TrendingCard label="Gaming" color="var(--snap-purple)" />
             <TrendingCard label="Creative Hub" color="var(--snap-pink)" />
             <TrendingCard label="Code Swarm" color="var(--snap-green)" />
          </div>
        </div>
      </div>
    </>
  );
}

function TrendingCard({ label, color }) {
  return (
    <div style={{
       background: '#fff', borderRadius: '24px', padding: '20px', 
       border: '1px solid var(--border)', cursor: 'pointer',
       boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
       transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
       <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginBottom: 8 }}></div>
       <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
       <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Trending</div>
    </div>
  );
}

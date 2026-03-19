import React, { useEffect } from 'react';
import { useCliquesStore } from '../store';

function Avatar({ name, size = 40 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: `hsl(${hue}, 30%, 18%)`,
      border: `1px solid hsl(${hue}, 35%, 25%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', fontWeight: 600,
      fontSize: size * 0.36, color: `hsl(${hue}, 45%, 65%)`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function CliquesView() {
  const { cliques, fetchCliques, loading } = useCliquesStore();

  useEffect(() => { fetchCliques(); }, [fetchCliques]);

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Discover</div>
          <div className="panel-search">
            <input type="text" placeholder="Find a Clique..." />
          </div>
        </div>
        <div className="panel-list">
          <div style={{ padding: '0 4px' }}>
            <SectionHeader title="Trending" action="See all" />
            {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>Loading...</div>}
            {!loading && cliques.slice(0, 3).map(c => (
              <DiscoverItem key={c.id} name={c.name} sub={`${c.member_count || c.members || 0} members`} />
            ))}
            {!loading && cliques.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No cliques found nearby</div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div style={{ padding: '28px 24px 12px' }}>
          <SectionHeader title="Cliques Near You" action="View all" />
        </div>
        
        <div className="cliques-grid">
          {cliques.map((clique) => (
            <div key={clique.id} className="clique-card fade-in">
              <Avatar name={clique.name} size={44} />
              <div className="clique-name" style={{ marginTop: 12 }}>{clique.name}</div>
              <div className="clique-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                  <span>{clique.member_count || clique.members || 0} members</span>
                </div>
                {clique.distance && <div style={{ marginTop: 4, color: 'var(--text3)' }}>{clique.distance}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </span>
      <span style={{ fontSize: 12, color: 'var(--gold)', cursor: 'pointer', fontWeight: 500 }}>{action}</span>
    </div>
  );
}

function DiscoverItem({ name, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg3)', borderRadius: 14, cursor: 'pointer', marginBottom: 6, transition: 'background 0.2s', border: '1px solid var(--border)' }}>
      <Avatar name={name} size={38} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

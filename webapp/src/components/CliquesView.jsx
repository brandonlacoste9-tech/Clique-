import React from 'react';
import { useCliquesStore } from '../store';

export default function CliquesView() {
  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">DISCOVER</div>
          <div className="panel-search">
            <input type="text" placeholder="Trouver un Clique..." />
          </div>
        </div>
        <div className="panel-list">
          <div style={{ padding: '0 8px' }}>
            <SectionHeader title="PLACES" action="See all" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <DiscoverItem emoji="🏙️" name="Montréal Central" sub="5.2k Actifs" />
              <DiscoverItem emoji="🎢" name="La Ronde Crew" sub="1.2k Actifs" />
              <DiscoverItem emoji="🛹" name="Bowl de Québec" sub="842 Actifs" />
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Stories Bar */}
        <div className="stories-header">
          <StoryItem emoji="➕" name="Vous" />
          <StoryItem emoji="🌹" name="Véro" active />
          <StoryItem emoji="🏒" name="Fred" active />
          <StoryItem emoji="🦋" name="Sophie" />
          <StoryItem emoji="🏙️" name="Marc" />
          <StoryItem emoji="🎸" name="Julie" />
        </div>

        <div style={{ padding: '24px 24px 8px' }}>
          <SectionHeader title="📍 CLIQUES PRÈS DE VOUS" action="Voir tout" />
        </div>
        
        <div className="cliques-grid">
          <CliquesGrid />
        </div>
      </div>
    </>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.1em' }}>
        {title}
      </span>
      <span style={{ fontSize: 11, color: 'var(--gold)', cursor: 'pointer' }}>{action}</span>
    </div>
  );
}

function StoryItem({ emoji, name, active }) {
  return (
    <div className="story-circle">
      <div className="story-ring" style={{ background: active ? 'linear-gradient(135deg, var(--gold), var(--gold-lt), #FF6B35)' : 'var(--bg4)' }}>
        <div className="story-ring-inner">{emoji}</div>
      </div>
      <span className="story-name">{name}</span>
    </div>
  );
}

function DiscoverItem({ emoji, name, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg3)', borderRadius: 14, cursor: 'pointer' }}>
      <div style={{ width: 40, height: 40, background: 'var(--bg4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: 20 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
      </div>
    </div>
  );
}

function CliquesGrid() {
  const { cliques } = useCliquesStore();

  return (
    <>
      {cliques.map((clique) => (
        <div key={clique.id} className="clique-card fade-in">
          <span className="clique-emoji">{clique.emoji}</span>
          <div className="clique-name">{clique.name}</div>
          <div className="clique-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
              <span>{clique.members} membres</span>
            </div>
            <div style={{ marginTop: 2 }}>📍 {clique.distance}</div>
          </div>
        </div>
      ))}
    </>
  );
}

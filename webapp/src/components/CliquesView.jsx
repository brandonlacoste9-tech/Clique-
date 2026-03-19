import React from 'react';
import { useCliquesStore } from '../store';

export default function CliquesView() {
  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Discover Cliques</div>
          <div className="panel-search">
            <input type="text" placeholder="Search nearby cliques..." />
          </div>
        </div>
        <div className="panel-list" style={{ padding: '8px 12px' }}>
          <StoriesRow />
        </div>
      </div>

      <div className="main-content">
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '1px' }}>
            📍 Nearby Cliques
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Find your people. Join the hive.
          </p>
        </div>
        <CliquesGrid />
      </div>
    </>
  );
}

function StoriesRow() {
  const stories = [
    { name: 'Your Story', emoji: '➕', viewed: false },
    { name: 'Alex T', emoji: '🧑‍💻', viewed: false },
    { name: 'Marie-Ève', emoji: '👩‍🎨', viewed: false },
    { name: 'Jayden', emoji: '🏀', viewed: true },
    { name: 'Sophie', emoji: '🎵', viewed: true },
    { name: 'Nathan', emoji: '📸', viewed: false },
  ];

  return (
    <div className="stories-row" style={{ borderBottom: 'none', padding: '8px 0' }}>
      {stories.map((s, i) => (
        <div key={i} className="story-circle">
          <div className={`story-ring ${s.viewed ? 'viewed' : ''}`}>
            <div className="story-ring-inner">{s.emoji}</div>
          </div>
          <span className="story-name">{s.name}</span>
        </div>
      ))}
    </div>
  );
}

function CliquesGrid() {
  const { cliques } = useCliquesStore();

  return (
    <div className="cliques-grid">
      {cliques.map((clique) => (
        <div key={clique.id} className="clique-card fade-in">
          <div className="clique-card-emoji">{clique.emoji}</div>
          <div className="clique-card-name">{clique.name}</div>
          <div className="clique-card-meta">
            <span>👥 {clique.members} members</span>
            <span>📍 {clique.distance}</span>
          </div>
          <span className="clique-card-tag">{clique.tag}</span>
        </div>
      ))}
    </div>
  );
}

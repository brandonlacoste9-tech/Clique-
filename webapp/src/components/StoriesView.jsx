import React from 'react';

export default function StoriesView() {
  const stories = [
    { id: '1', user: 'Alex T', emoji: '🧑‍💻', preview: 'Just vibing at the café ☕', time: '2h ago', viewed: false },
    { id: '2', user: 'Marie-Ève', emoji: '👩‍🎨', preview: 'New art piece 🎨', time: '4h ago', viewed: false },
    { id: '3', user: 'Jayden K', emoji: '🏀', preview: 'Game day 🏀🔥', time: '6h ago', viewed: true },
    { id: '4', user: 'Sophie L', emoji: '🎵', preview: 'Concert vibes 🎶', time: '8h ago', viewed: true },
    { id: '5', user: 'Nathan B', emoji: '📸', preview: 'Golden hour shots', time: '10h ago', viewed: false },
  ];

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Stories</div>
        </div>
        <div className="panel-list">
          {/* Add story */}
          <div className="convo-item" style={{ cursor: 'pointer' }}>
            <div className="convo-avatar" style={{ background: 'var(--gold)', color: '#000', fontSize: '1.5rem' }}>
              ＋
            </div>
            <div className="convo-info">
              <div className="convo-name">Add Story</div>
              <div className="convo-preview">Share with your hive</div>
            </div>
          </div>

          {stories.map((s) => (
            <div key={s.id} className="convo-item" style={{ cursor: 'pointer' }}>
              <div className={`story-ring ${s.viewed ? 'viewed' : ''}`} style={{ width: 48, height: 48, flexShrink: 0 }}>
                <div className="story-ring-inner" style={{ fontSize: '1.3rem' }}>{s.emoji}</div>
              </div>
              <div className="convo-info">
                <div className="convo-name">{s.user}</div>
                <div className="convo-preview">{s.preview}</div>
              </div>
              <span className="convo-time">{s.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="welcome-screen">
          <div style={{ fontSize: '4rem' }}>⚡</div>
          <div className="welcome-title">Stories</div>
          <div className="welcome-subtitle">
            Tap a story to view it. Share moments with your hive — they disappear in 24 hours.
          </div>
        </div>
      </div>
    </>
  );
}

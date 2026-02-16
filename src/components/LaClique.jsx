import React, { useState } from 'react';
import '../styles/LaClique.css';

function LaClique() {
  const [friends] = useState([
    { id: 1, name: 'Jean Dupont', status: 'active', verified: true },
    { id: 2, name: 'Marie Laurent', status: 'active', verified: true },
    { id: 3, name: 'Pierre Martin', status: 'idle', verified: true },
    { id: 4, name: 'Sophie Bernard', status: 'active', verified: true },
  ]);

  return (
    <div className="la-clique">
      <h1 className="clique-title">La Clique</h1>
      <p className="clique-subtitle">Your Inner Circle</p>
      
      <div className="clique-list">
        {friends.map(friend => (
          <div key={friend.id} className="clique-member">
            <div className="member-avatar">
              <div className={`status-indicator ${friend.status}`}></div>
              <div className="avatar-placeholder">
                {friend.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="member-info">
              <div className="member-name">
                {friend.name}
                {friend.verified && <span className="verified-badge">✓</span>}
              </div>
              <div className="member-status">
                {friend.status === 'active' ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
            <button className="dispatch-button">
              Send Dispatch
            </button>
          </div>
        ))}
      </div>
      
      <div className="clique-footer">
        <p className="verified-nodes-notice">
          Only verified nodes in La Clique
        </p>
      </div>
    </div>
  );
}

export default LaClique;

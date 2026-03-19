import React, { useEffect, useState } from 'react';

export default function EliteGreeting({ user, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 4500); // 4.5 seconds of glory

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="sovereign-banner fade-in">
       <div style={{
         width: 32, height: 32, borderRadius: 8, background: 'var(--gold)',
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         fontSize: 18, color: 'var(--bg2)', fontWeight: 800,
         boxShadow: '0 0 15px var(--gold-glow)'
       }}>
         👑
       </div>
       <div style={{ flex: 1 }}>
         <div className="sovereign-text">L'IMPERIAL <span style={{ textTransform: 'uppercase' }}>{user.displayName}</span> ARRIVE</div>
         <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            "{user.entranceMessage || 'La ruche s\'incline ⚜️'}"
         </div>
       </div>
       <div className="shimmer-gold" style={{ width: 40, height: 2, background: 'var(--gold)' }}></div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

export default function EliteGreeting({ user, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 4500); // 4.5 seconds of buzz

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="hive-banner fade-in">
       <div style={{
         width: 36, height: 36, borderRadius: 10, background: 'var(--snap-yellow)',
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         fontSize: 20, color: '#000', fontWeight: 800,
         boxShadow: '0 0 20px rgba(255, 252, 0, 0.5)'
       }}>
         🐝
       </div>
       <div style={{ flex: 1 }}>
         <div className="hive-text">ELITE <span style={{ textTransform: 'uppercase' }}>{user.displayName}</span> HAS ARRIVED</div>
         <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>
            "{user.entranceMessage || 'The Hive bows 🔱'}"
         </div>
       </div>
       <div className="shimmer-honey" style={{ width: 44, height: 3, background: 'var(--snap-yellow)', borderRadius: 2 }}></div>
    </div>
  );
}

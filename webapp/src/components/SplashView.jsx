import React, { useEffect, useState } from 'react';

export default function SplashView({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 3800); // Cinematic 3.8s

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="splash-view">
      <div className="splash-logo">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15L65 40H35L50 15Z" fill="var(--gold)" />
          <circle cx="50" cy="55" r="25" fill="var(--gold)" fillOpacity="0.8" />
          <path d="M25 55C25 45 10 40 10 55C10 70 25 65 25 55Z" fill="var(--gold)" fillOpacity="0.4" />
          <path d="M75 55C75 45 90 40 90 55C90 70 75 65 75 55Z" fill="var(--gold)" fillOpacity="0.4" />
          <rect x="47" y="10" width="2" height="15" fill="var(--gold)" />
          <rect x="51" y="10" width="2" height="15" fill="var(--gold)" />
        </svg>
      </div>
      <div className="splash-text">ChatSnap</div>
      <div style={{ color: 'var(--text3)', fontSize: 10, letterSpacing: 6, marginTop: 12, opacity: 0.6 }}>
        The Hive Awaits
      </div>
      
      <div style={{ position: 'absolute', bottom: 60, width: 200, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
        <div style={{ width: '100%', height: '100%', background: 'var(--gold)', animation: 'loader 3s forwards cubic-bezier(0.1, 0.5, 0.5, 1)' }} />
      </div>

      <style>{`
        @keyframes loader {
          0% { width: 0%; filter: blur(2px); }
          50% { width: 70%; filter: blur(0px); }
          100% { width: 100%; filter: blur(0px); }
        }
      `}</style>
    </div>
  );
}

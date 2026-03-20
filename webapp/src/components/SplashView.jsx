import React, { useEffect, useState } from 'react';

export default function SplashView({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 2500); // 2.5s snap splash

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--snap-yellow)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
          width: 140, height: 140,
          background: '#FFFFFF',
          borderRadius: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80,
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
          border: '4px solid #000'
      }}>
        🐝
      </div>
      <div style={{ 
          marginTop: 24, 
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 800,
          color: '#000',
          letterSpacing: '-0.02em',
          animation: 'snap-bounce 1s infinite var(--spring)'
      }}>
        Clique
      </div>
      
      <div style={{ position: 'absolute', bottom: 80, width: 180, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <div style={{ width: '100%', height: '100%', background: '#000', animation: 'snap-loader 2s forwards linear' }} />
      </div>

      <style>{`
        @keyframes snap-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes snap-loader {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

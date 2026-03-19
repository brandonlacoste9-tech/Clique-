import React, { useState } from 'react';

export default function CameraView() {
  const [isCapping, setIsCapping] = useState(false);

  return (
    <div className="main-content fade-in" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      background: '#000', 
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Controls */}
      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 16 }}>
           <div className="camera-icon">🔍</div>
           <div className="camera-icon">🔄</div>
        </div>
        <div className="camera-icon">⚡</div>
      </div>

      {/* Camera Preview Area (Mock) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 120, animation: 'snap-bounce 2s infinite' }}>🐝</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>Capture the Buzz</h2>
            <p style={{ opacity: 0.6, fontSize: 14 }}>Try Lenses or send a quick Bee Snap</p>
         </div>
      </div>

      {/* Right Toolbar */}
      <div style={{ position: 'absolute', top: 120, right: 24, display: 'flex', flexDirection: 'column', gap: 24, zIndex: 10 }}>
        <div className="camera-icon">🎵</div>
        <div className="camera-icon">🎨</div>
        <div className="camera-icon">⌛</div>
        <div className="camera-icon">🌀</div>
      </div>

      {/* Bottom Controls */}
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        <button 
          onMouseDown={() => setIsCapping(true)}
          onMouseUp={() => setIsCapping(false)}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '6px solid #fff',
            background: isCapping ? '#ff4bbd' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isCapping ? 'scale(1.2)' : 'scale(1)',
            cursor: 'pointer'
          }}
        >
          <div style={{ width: '80%', height: '80%', borderRadius: '50%', background: '#fff' }}></div>
        </button>
        <div style={{ marginTop: 24, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>
          TAP FOR PHOTO — HOLD FOR VIDEO
        </div>
      </div>

      <style>{`
        .camera-icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
        }
        .camera-icon:hover { background: rgba(255,255,255,0.25); transform: scale(1.1); }
        @keyframes snap-bounce {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-10px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

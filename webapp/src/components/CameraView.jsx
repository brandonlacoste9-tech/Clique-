import React, { useState, useRef } from 'react';

/**
 * HiveIcons - Set of high-fidelity vector icons for the camera interface.
 * Inspired by native camera UX patterns.
 */
const HiveIcons = {
  Rotate: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 16h5v5"/>
    </svg>
  ),
  Flash: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  Memories: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  Lenses: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  )
};

export default function CameraView() {
  const [facing, setFacing] = useState('user');
  const [flashOn, setFlashOn] = useState(false);
  const [isCapping, setIsCapping] = useState(false);
  const [activeLens, setActiveLens] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showFocusRing, setShowFocusRing] = useState(false);
  const [focusPos, setFocusPos] = useState({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const dragStartY = useRef(0);
  const [isDraggingZoom, setIsDraggingZoom] = useState(false);

  const lenses = [
    { name: 'Elite', icon: '🐝', color: 'var(--snap-yellow)' },
    { name: 'Royal', icon: '✨', color: '#ff4d4d' },
    { name: 'Night', icon: '🌙', color: '#6366f1' },
    { name: 'Focus', icon: '🎯', color: '#22c55e' },
    { name: 'Aura', icon: '💖', color: '#ec4899' },
  ];

  const handleFlip = () => {
    setFlipping(true);
    setTimeout(() => {
      setFacing(f => f === 'user' ? 'environment' : 'user');
      setFlipping(false);
    }, 600);
  };

  const handleViewfinderClick = (e) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleFlip();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setFocusPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setShowFocusRing(true);
      setTimeout(() => setShowFocusRing(false), 800);
    }
    lastTap.current = now;
  };

  const handleCaptureDown = (e) => {
    dragStartY.current = e.clientY;
    setIsCapping(true);
    setIsDraggingZoom(true);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingZoom) return;
    const deltaY = dragStartY.current - e.clientY;
    // Map drag distance to 1x-5x zoom
    const newZoom = Math.min(Math.max(1 + (deltaY / 150), 1), 5);
    setZoom(newZoom);
  };

  const handleCaptureUp = () => {
    setIsCapping(false);
    setIsDraggingZoom(false);
  };

  return (
    <div 
      className={`main-content camera-screen-v2 ${flipping ? 'is-flipping' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handleCaptureUp}
      onPointerLeave={handleCaptureUp}
    >
      {/* 1. VIEWFIENDER / FEED */}
      <div 
        className="camera-viewfinder"
        onClick={handleViewfinderClick}
        style={{ 
          transform: `scale(${zoom})`,
          transition: isDraggingZoom ? 'none' : 'transform 0.4s cubic-bezier(0.1, 0.7, 0.1, 1)' 
        }}
      >
        <div className={`mock-feed-bg ${facing}`} />
        
        {/* Animated Bee (The Hive Heartbeat) */}
        <div className="hive-heartbeat">
           <span style={{ fontSize: '10rem', filter: 'drop-shadow(0 0 30px rgba(255,252,0,0.5))' }}>
             {lenses[activeLens].icon}
           </span>
        </div>

        {/* Focus Ring */}
        {showFocusRing && (
          <div className="focus-indicator" style={{ left: focusPos.x, top: focusPos.y }}>
            <div className="ring-pulse" />
          </div>
        )}
      </div>

      {/* 2. FLASH OVERLAY */}
      <div className={`camera-flash-fx ${flashOn ? 'is-active' : ''}`} />

      {/* 3. RIGHT TOOLBAR (Precision Controls) */}
      <div className="camera-side-toolbar">
         <ToolbarBtn onClick={handleFlip}><HiveIcons.Rotate /></ToolbarBtn>
         <ToolbarBtn 
            onClick={() => setFlashOn(!flashOn)} 
            active={flashOn}
         >
           <HiveIcons.Flash />
         </ToolbarBtn>
         <ToolbarBtn>✨</ToolbarBtn>
         <ToolbarBtn>🎵</ToolbarBtn>
         <ToolbarBtn>🌙</ToolbarBtn>
      </div>

      {/* 4. ZOOM INDICATOR */}
      {zoom > 1 && (
        <div className="zoom-pill">
           {zoom.toFixed(1)}x
        </div>
      )}

      {/* 5. BOTTOM NAVIGATION / CAPTURE */}
      <div className="camera-footer">
        <div className="footer-btn memories">
           <HiveIcons.Memories />
        </div>

        <div className="capture-shutter-container">
           <div className={`shutter-ring ${isCapping ? 'active' : ''}`} />
           <button 
             className={`main-capture-btn ${isCapping ? 'is-capping' : ''}`}
             onPointerDown={handleCaptureDown}
           >
             <div className="capture-inner" />
           </button>
        </div>

        <div className="footer-btn lenses">
           <HiveIcons.Lenses />
        </div>
      </div>

      {/* 6. LENSES CAROUSEL */}
      <div className="lenses-shelf">
         <div className="shelf-track">
           {lenses.map((lens, i) => (
             <div 
               key={i} 
               className={`lens-item ${activeLens === i ? 'is-active' : ''}`}
               onClick={() => setActiveLens(i)}
             >
               <div className="lens-glass">
                 {lens.icon}
               </div>
               <span className="lens-label">{lens.name}</span>
             </div>
           ))}
         </div>
      </div>

      <style>{`
        .camera-screen-v2 {
          flex: 1;
          background: #000;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          color: white;
          user-select: none;
          touch-action: none;
        }

        .camera-viewfinder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          overflow: hidden;
        }

        .mock-feed-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
        }

        .hive-heartbeat {
          animation: hive-float 5s ease-in-out infinite;
          opacity: 0.2;
          z-index: 2;
        }

        @keyframes hive-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        .focus-indicator {
          position: absolute;
          width: 80px;
          height: 80px;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 10;
        }

        .ring-pulse {
          width: 100%;
          height: 100%;
          border: 2px solid var(--snap-yellow);
          border-radius: 50%;
          animation: focus-ping 0.8s ease-out forwards;
        }

        @keyframes focus-ping {
          0% { transform: scale(1.5); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0; }
        }

        .camera-flash-fx {
          position: absolute;
          inset: 0;
          background: white;
          opacity: 0;
          pointer-events: none;
          z-index: 100;
          transition: opacity 0.1s;
        }
        .camera-flash-fx.is-active {
          opacity: 0.3;
        }

        .camera-side-toolbar {
          position: absolute;
          top: 40px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          z-index: 50;
          background: rgba(0,0,0,0.3);
          padding: 12px;
          border-radius: 28px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .toolbar-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: rgba(255,255,255,0.05);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-btn.active {
          color: var(--snap-yellow);
          background: rgba(255,252,0,0.1);
        }

        .zoom-pill {
          position: absolute;
          bottom: 220px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.6);
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 14px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          z-index: 60;
        }

        .camera-footer {
          position: absolute;
          bottom: 60px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          z-index: 50;
        }

        .footer-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .capture-shutter-container {
          position: relative;
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shutter-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.3s;
        }
        .shutter-ring.active {
          border-color: var(--snap-yellow);
          transform: scale(1.1);
          animation: rotation 4s linear infinite;
        }

        .main-capture-btn {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: transparent;
          border: 6px solid white;
          padding: 6px;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .main-capture-btn.is-capping {
          transform: scale(1.2);
        }

        .capture-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: white;
          transition: background 0.2s;
        }
        .main-capture-btn.is-capping .capture-inner {
          background: var(--snap-yellow);
        }

        .lenses-shelf {
          position: absolute;
          bottom: 160px;
          width: 100%;
          z-index: 40;
          padding-bottom: 20px;
        }
        .shelf-track {
          display: flex;
          gap: 16px;
          padding: 0 40px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .shelf-track::-webkit-scrollbar { display: none; }

        .lens-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: transform 0.3s;
        }
        .lens-item.is-active {
          transform: scale(1.1);
        }

        .lens-glass {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: all 0.3s;
        }
        .lens-item.is-active .lens-glass {
          border-color: var(--snap-yellow);
          background: rgba(255,252,0,0.2);
          box-shadow: 0 0 20px rgba(255,252,0,0.3);
        }
        .lens-label {
          font-size: 11px;
          font-weight: 800;
          color: white;
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .lens-item.is-active .lens-label {
          opacity: 1;
        }

        .is-flipping .camera-viewfinder {
          animation: flip-3d 0.6s ease-in-out;
        }

        @keyframes flip-3d {
          0% { transform: rotateY(0) scale(1.0); }
          50% { transform: rotateY(90deg) scale(1.1); }
          100% { transform: rotateY(180deg) scale(1.0); }
        }

        @keyframes rotation {
          from { transform: rotate(0deg) scale(1.1); }
          to { transform: rotate(360deg) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function ToolbarBtn({ children, onClick, active }) {
  return (
    <button 
      className={`toolbar-btn ${active ? 'active' : ''}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}

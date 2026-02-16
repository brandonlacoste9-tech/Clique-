import React, { useRef, useState, useEffect } from 'react';
import '../styles/CameraLens.css';

function CameraLens({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    // Request camera access
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || capturing) return;

    setCapturing(true);
    setShowGlow(true);

    // Capture the frame
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    
    // Trigger the burnished gold glow animation
    setTimeout(() => {
      setShowGlow(false);
      setCapturing(false);
      onCapture({ type: 'image', data: imageData, timestamp: Date.now() });
    }, 500);
  };

  return (
    <div className="camera-lens">
      <div className="viewfinder-container">
        <div className="gold-rim">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="camera-video"
          />
          {showGlow && <div className="burnished-gold-glow"></div>}
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="camera-controls">
        <button 
          className="capture-button"
          onClick={handleCapture}
          disabled={capturing}
        >
          <div className="capture-button-inner"></div>
        </button>
      </div>
    </div>
  );
}

export default CameraLens;

import React, { useState } from 'react';
import CameraLens from './components/CameraLens';
import DispatchList from './components/DispatchList';
import LaClique from './components/LaClique';
import './styles/App.css';

function App() {
  const [currentView, setCurrentView] = useState('camera'); // 'camera', 'dispatches', 'clique'
  const [dispatches, setDispatches] = useState([
    { id: 1, from: 'Jean', sealed: true, timestamp: Date.now(), type: 'image' },
    { id: 2, from: 'Marie', sealed: true, timestamp: Date.now(), type: 'video' },
  ]);

  const handleCapture = (mediaData) => {
    console.log('Media captured:', mediaData);
    // In a real implementation, this would send via P2P
  };

  const handleOpenDispatch = (dispatchId) => {
    setDispatches(dispatches.map(d => 
      d.id === dispatchId ? { ...d, sealed: false } : d
    ));
  };

  return (
    <div className="app">
      <div className="leather-background">
        {currentView === 'camera' && (
          <CameraLens onCapture={handleCapture} />
        )}
        {currentView === 'dispatches' && (
          <DispatchList 
            dispatches={dispatches} 
            onOpenDispatch={handleOpenDispatch}
          />
        )}
        {currentView === 'clique' && (
          <LaClique />
        )}
        
        <nav className="navigation">
          <button 
            className={`nav-button ${currentView === 'clique' ? 'active' : ''}`}
            onClick={() => setCurrentView('clique')}
          >
            La Clique
          </button>
          <button 
            className={`nav-button ${currentView === 'camera' ? 'active' : ''}`}
            onClick={() => setCurrentView('camera')}
          >
            Lens
          </button>
          <button 
            className={`nav-button ${currentView === 'dispatches' ? 'active' : ''}`}
            onClick={() => setCurrentView('dispatches')}
          >
            Dispatches
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;

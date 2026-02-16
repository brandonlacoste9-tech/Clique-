import React, { useState } from 'react';
import '../styles/DispatchList.css';

function DispatchList({ dispatches, onOpenDispatch }) {
  const [breakingSeals, setBreakingSeals] = useState({});

  const handleBreakSeal = (dispatchId) => {
    setBreakingSeals(prev => ({ ...prev, [dispatchId]: true }));
    
    // Animate seal breaking, then open dispatch
    setTimeout(() => {
      onOpenDispatch(dispatchId);
      setBreakingSeals(prev => ({ ...prev, [dispatchId]: false }));
    }, 800);
  };

  return (
    <div className="dispatch-list">
      <h1 className="dispatch-title">Sealed Dispatches</h1>
      
      <div className="dispatches-container">
        {dispatches.length === 0 ? (
          <p className="no-dispatches">No dispatches received</p>
        ) : (
          dispatches.map(dispatch => (
            <div key={dispatch.id} className="dispatch-item">
              <div className="dispatch-header">
                <span className="dispatch-from">{dispatch.from}</span>
                <span className="dispatch-time">
                  {new Date(dispatch.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="dossier-container">
                {dispatch.sealed ? (
                  <div 
                    className={`wax-seal ${breakingSeals[dispatch.id] ? 'breaking' : ''}`}
                    onClick={() => handleBreakSeal(dispatch.id)}
                  >
                    <div className="seal-circle">
                      <div className="seal-c">C</div>
                    </div>
                    <p className="seal-hint">Tap to break seal</p>
                  </div>
                ) : (
                  <div className="dispatch-content">
                    <div className="content-placeholder">
                      <p>Dispatch viewed</p>
                      <p className="scrubber-notice">File will be scrubbed after viewing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DispatchList;

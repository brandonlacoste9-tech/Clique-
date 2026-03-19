import React, { useState } from 'react';
import { useAuthStore } from '../store';

export default function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock login for now
    setTimeout(() => {
      login({ id: '1', displayName: 'King Bee', email });
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'var(--snap-yellow)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 10000
    }}>
      <div style={{ fontSize: 100, marginBottom: 24, animation: 'bounce 2s infinite' }}>🐝</div>
      
      <div style={{
        background: '#fff',
        width: '100%',
        maxWidth: 400,
        borderRadius: '32px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 32, 
          fontWeight: 800, 
          textAlign: 'center',
          marginBottom: 8
        }}>Welcome to The Hive</h1>
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--text3)', 
          fontSize: 14,
          marginBottom: 32 
        }}>Sign in to start your buzz.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: '#000', textTransform: 'uppercase' }}>Email Address</label>
            <input 
              type="email" 
              required
              placeholder="bee@thehive.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: '2px solid var(--bg-subtle)',
                background: 'var(--bg-subtle)',
                fontSize: 16,
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
              marginTop: 16,
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '18px',
              borderRadius: '20px',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {loading ? 'Entering the Hive...' : 'Log In'}
          </button>
        </form>

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
          By continuing, you agree to the Hive Rules.
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

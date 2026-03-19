import React, { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '../store';

function Avatar({ name, size = 48, online, isElite }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const snapColors = ['#00B1FF', '#9B51E0', '#FF4BBD', '#2ECC71', '#FF9500'];
  const colorIndex = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % snapColors.length;
  const bgColor = snapColors[colorIndex];
  
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {isElite && (
        <div className="elite-aura" style={{ position: 'absolute', inset: -3, borderRadius: '20px', background: 'linear-gradient(45deg, var(--snap-yellow), transparent)', border: '1px solid gold', opacity: 0.6, zIndex: 0 }} />
      )}
      <div style={{
        width: '100%', height: '100%', borderRadius: '18px',
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-body)', fontWeight: 700,
        fontSize: size * 0.4, color: '#fff',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        position: 'relative', zIndex: 1
      }}>
        {initials}
      </div>
      {online && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 14, height: 14, borderRadius: '50%',
          background: 'var(--snap-green)', border: '2px solid #fff',
          zIndex: 2
        }} />
      )}
      {isElite && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          fontSize: 16, zIndex: 2
        }}>🔱</div>
      )}
    </div>
  );
}

export default function ChatView() {
  const { conversations, activeConversation, messages, setActiveConversation, addMessage, fetchConversations } = useMessagesStore();
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation) return;
    addMessage(activeConversation.id, {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setInput('');
  };

  const filtered = conversations.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="panel fade-in">
        <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="panel-title">Chat</div>
          <button style={{ background: 'var(--bg-subtle)', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18 }}>＋</button>
        </div>
        
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search friends..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px', borderRadius: '12px',
                background: 'var(--bg-subtle)', border: 'none', fontSize: 14,
                color: 'var(--text)'
              }}
            />
          </div>
        </div>

        <div className="panel-list">
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🐝</div>
              <p style={{ fontSize: 13 }}>No one here yet.</p>
            </div>
          ) : (
            filtered.map((convo) => (
              <div 
                key={convo.id} 
                className={`convo-item ${activeConversation?.id === convo.id ? 'active' : ''} ${convo.isElite ? 'elite-member' : ''}`}
                onClick={() => setActiveConversation(convo)}
              >
                <Avatar name={convo.name} online={convo.online} isElite={convo.isElite} />
                <div className="convo-info">
                  <div className="convo-name" style={{ color: convo.isElite ? 'var(--snap-yellow)' : 'inherit', fontWeight: 800 }}>
                    {convo.name} {convo.isElite && '🔱'}
                  </div>
                  <div className="convo-preview" style={{ color: convo.isElite ? 'rgba(255,252,0,0.6)' : (convo.unread ? 'var(--snap-blue)' : 'var(--text3)'), fontWeight: convo.unread ? 700 : 400 }}>
                    {convo.unread ? 'New Snap ✦' : convo.lastMessage || 'Send a Buzz 🐝'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                   <span style={{ fontSize: 11, color: 'var(--text3)' }}>{convo.time}</span>
                   {convo.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--snap-blue)' }} />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`main-content ${activeConversation ? 'active' : ''} fade-in`}>
        {activeConversation ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="sidebar-btn" onClick={() => setActiveConversation(null)} style={{ width: 32, height: 32, fontSize: 16 }}>←</button>
              <Avatar name={activeConversation.name} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeConversation.name}</div>
                <div style={{ fontSize: 11, color: 'var(--snap-green)', fontWeight: 600 }}>Active Now</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                 <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>📞</button>
                 <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>📹</button>
              </div>
            </div>

            <div className="chat-messages">
              {messages[activeConversation.id]?.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'message-mine' : 'message-theirs'}`}>
                  {msg.text}
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{msg.timestamp}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <button type="button" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>📸</button>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Send a Chat" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {input.trim() ? (
                <button type="submit" style={{ background: 'var(--snap-blue)', color: '#fff', border: 'none', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  ➤
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>🎙️</button>
                  <button type="button" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>☺</button>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="welcome-screen">
             <div style={{ width: 120, height: 120, background: 'var(--snap-yellow)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, boxShadow: '0 10px 30px rgba(255, 252, 0, 0.3)' }}>
               🐝
             </div>
             <h2 className="welcome-title">Snap to Start</h2>
             <p className="welcome-subtitle">Pick a friend to start chatting or sharing moments.</p>
          </div>
        )}
      </div>
    </>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useMessagesStore, useAuthStore } from '../store';
import EliteGreeting from './EliteGreeting';

export default function ChatView() {
  const { conversations, activeConversation, messages, setActiveConversation, addMessage } = useMessagesStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  const messagesEndRef = useRef(null);

  // Trigger elite greeting when entering a chat
  useEffect(() => {
    if (activeConversation) {
      const t = setTimeout(() => setShowGreeting(true), 10);
      return () => clearTimeout(t);
    }
  }, [activeConversation]);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeMessages = activeConversation ? (messages[activeConversation.id] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeConversation) return;
    addMessage(activeConversation.id, {
      id: `m${Date.now()}`,
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Conversations Panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">MESSAGES</div>
          <div className="panel-search">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="panel-list">
          {filtered.map((convo) => (
            <div
              key={convo.id}
              className={`convo-item ${activeConversation?.id === convo.id ? 'active' : ''}`}
              onClick={() => setActiveConversation(convo)}
            >
              <div className="convo-avatar">
                {convo.avatar}
                {convo.online && <div className="convo-online" />}
              </div>
              <div className="convo-info">
                <div className="convo-name">{convo.name}</div>
                <div className={`convo-preview ${convo.unread > 0 ? 'unread' : ''}`}>
                  {convo.lastMessage}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className="convo-time">{convo.time}</span>
                {convo.unread > 0 && <span className="unread-badge">{convo.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="main-content">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="convo-avatar" style={{ width: 44, height: 44, fontSize: 20 }}>
                {activeConversation.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{activeConversation.name}</div>
                <div style={{ fontSize: 11, color: 'var(--green)' }}>● En ligne</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="sidebar-btn" style={{ width: 36, height: 36 }}>📹</button>
                <button className="sidebar-btn" style={{ width: 36, height: 36 }}>⋯</button>
              </div>
            </div>

            <div className="chat-messages">
              {showGreeting && (
                <EliteGreeting 
                  user={activeConversation.online ? { displayName: activeConversation.name, entranceMessage: "Un Souverain s'est manifesté. 🔱" } : user} 
                  onComplete={() => setShowGreeting(false)} 
                />
              )}
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`msg ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                  {msg.sender !== 'me' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, alignSelf: 'flex-end', flexShrink: 0 }}>
                      {activeConversation.avatar}
                    </div>
                  )}
                  <div>
                    <div className="msg-bubble">{msg.text}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3, textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                      {msg.time} {msg.sender === 'me' && <span style={{ color: 'var(--gold-lt)' }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-bar">
              <button className="sidebar-btn" style={{ width: 40, height: 40, borderRadius: '50%' }}>😎</button>
              <input
                className="chat-input"
                type="text"
                placeholder="Message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" onClick={handleSend}>➤</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40, textAlign: 'center' }}>
            <div style={{ padding: '12px 24px', background: 'var(--gold-glow)', border: '1px solid var(--gold)', borderRadius: 12, fontWeight: 900, color: 'var(--gold)', letterSpacing: 2 }}>
              CHATSNAP
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>The Hive Awaits</div>
            <div style={{ fontSize: 14, color: 'var(--text3)', maxWidth: 360, lineHeight: 1.6 }}>
              Select a conversation to start messaging, or explore nearby Cliques to find your people.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

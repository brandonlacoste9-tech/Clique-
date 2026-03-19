import React, { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '../store';

function Avatar({ name, size = 48, online }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hue = [...(name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue}, 35%, 22%)`,
      border: `1px solid hsl(${hue}, 40%, 30%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', fontWeight: 600,
      fontSize: size * 0.36, color: `hsl(${hue}, 50%, 72%)`,
      flexShrink: 0, position: 'relative',
      letterSpacing: '0.03em',
    }}>
      {initials}
      {online && <div className="convo-online" />}
    </div>
  );
}

export default function ChatView() {
  const { conversations, activeConversation, messages, setActiveConversation, addMessage, fetchConversations } = useMessagesStore();
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const filtered = conversations.filter((c) => {
    const name = c.name || c.display_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

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

  const getConvoName = (c) => c.name || c.display_name || 'Unknown';

  return (
    <>
      {/* Conversations Panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Messages</div>
          <div className="panel-search">
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="panel-list">
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
              {conversations.length === 0 ? 'No conversations yet' : 'No results found'}
            </div>
          )}
          {filtered.map((convo) => (
            <div
              key={convo.id}
              className={`convo-item ${activeConversation?.id === convo.id ? 'active' : ''}`}
              onClick={() => setActiveConversation(convo)}
            >
              <Avatar name={getConvoName(convo)} size={48} online={convo.online} />
              <div className="convo-info">
                <div className="convo-name">{getConvoName(convo)}</div>
                <div className={`convo-preview ${convo.unread > 0 ? 'unread' : ''}`}>
                  {convo.lastMessage || convo.last_message || 'Start a conversation'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className="convo-time">{convo.time || ''}</span>
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
              <Avatar name={getConvoName(activeConversation)} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16, fontFamily: 'var(--font-body)' }}>{getConvoName(activeConversation)}</div>
                <div style={{ fontSize: 11, color: activeConversation.online ? 'var(--green)' : 'var(--text3)' }}>
                  {activeConversation.online ? 'Online' : 'Offline'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="sidebar-btn" style={{ width: 36, height: 36, borderRadius: 10 }}>📹</button>
                <button className="sidebar-btn" style={{ width: 36, height: 36, borderRadius: 10 }}>⋯</button>
              </div>
            </div>

            <div className="chat-messages">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`msg ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                  {msg.sender !== 'me' && (
                    <Avatar name={getConvoName(activeConversation)} size={28} />
                  )}
                  <div>
                    <div className="msg-bubble">{msg.text}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3, textAlign: msg.sender === 'me' ? 'right' : 'left' }}>
                      {msg.time} {msg.sender === 'me' && <span style={{ color: 'var(--gold)', opacity: 0.6 }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-bar">
              <input
                className="chat-input"
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" onClick={handleSend}>➤</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40, textAlign: 'center' }}>
            <div style={{ 
              padding: '14px 28px', 
              background: 'rgba(201,151,58,0.08)', 
              border: '1px solid var(--border-gold)', 
              borderRadius: 14, 
              fontFamily: 'var(--font-display)',
              fontWeight: 700, 
              color: 'var(--gold)', 
              letterSpacing: '0.15em',
              fontSize: 20,
            }}>
              CHATSNAP
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Welcome</div>
            <div style={{ fontSize: 14, color: 'var(--text3)', maxWidth: 320, lineHeight: 1.7 }}>
              Select a conversation to start messaging, or explore nearby Cliques to find your people.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

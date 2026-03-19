import React, { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '../store';

export default function ChatView() {
  const { conversations, activeConversation, messages, setActiveConversation, addMessage } = useMessagesStore();
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

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
                <div className="convo-preview">{convo.lastMessage}</div>
              </div>
              <div className="convo-meta">
                <span className="convo-time">{convo.time}</span>
                {convo.unread > 0 && <span className="convo-badge">{convo.unread}</span>}
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
              <div className="convo-avatar" style={{ width: 40, height: 40, fontSize: '1.2rem' }}>
                {activeConversation.avatar}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{activeConversation.name}</div>
                {activeConversation.online && (
                  <div className="chat-header-status">Online now</div>
                )}
              </div>
              <div className="chat-header-actions">
                <button className="chat-action-btn" title="Voice call">📞</button>
                <button className="chat-action-btn" title="Video call">📹</button>
                <button className="chat-action-btn" title="More">⋯</button>
              </div>
            </div>

            <div className="chat-messages">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.sender === 'me' ? 'sent' : 'received'} fade-in`}>
                  <div>
                    <div className="message-bubble">{msg.text}</div>
                    <div className="message-time">
                      {msg.time}
                      {msg.sender === 'me' && <span className="message-status">✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-bar">
              <button className="chat-action-btn" title="Attach">📎</button>
              <input
                className="chat-input"
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="chat-send-btn" onClick={handleSend} title="Send">▸</button>
            </div>
          </>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-logo">CHATSNAP</div>
            <div className="welcome-title">The Hive Awaits</div>
            <div className="welcome-subtitle">
              Select a conversation to start messaging, or explore nearby Cliques to find your people.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

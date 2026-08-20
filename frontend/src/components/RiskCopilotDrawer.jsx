import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, HelpCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function RiskCopilotDrawer({ isOpen, onClose, scenarioId, transaction }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello Analyst! I am **RiskWise Copilot**, your mathematically grounded payment risk intelligence assistant. Ask me anything about this transaction's linear contributions, counterfactual bounds, or governance constraints.",
      suggested_followups: [
        'Why did we maintain decline for the ₹91k transaction?',
        'What is the minimum amount for auto-approval?',
        'Why is customer age immutable?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          scenario_id: scenarioId,
          transaction: transaction,
        }),
      });

      if (res.ok) {
        const botMsg = await res.json();
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Encountered an issue processing query. Please check backend connection.',
          },
        ]);
      }
    } catch (err) {
      console.error('Copilot query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Network error connecting to RiskWise Copilot engine.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ maxWidth: '580px', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                RiskWise AI Copilot
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Zero-hallucination natural language risk intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '0.25rem',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            padding: '0.5rem 0',
          }}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-500)',
                      flexShrink: 0,
                    }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div
                    style={{
                      background: isUser ? 'var(--primary-600)' : 'var(--bg-surface-elevated)',
                      border: isUser ? 'none' : '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '0.7rem 0.875rem',
                      fontSize: '0.76rem',
                      color: isUser ? '#ffffff' : 'var(--text-primary)',
                      lineHeight: 1.55,
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                      }}
                    />
                  </div>

                  {/* Suggested Followups */}
                  {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {msg.suggested_followups.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.66rem',
                            padding: '0.2rem 0.5rem',
                            background: 'var(--bg-surface-card)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--primary-500)',
                            fontWeight: 600,
                          }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      background: 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Bot className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing decision facts & calculating bounds...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            gap: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <input
            type="text"
            className="scenario-select"
            style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}
            placeholder="Ask anything (e.g. 'What is the auto-approve threshold?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

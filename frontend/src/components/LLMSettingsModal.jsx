import React, { useState, useEffect } from 'react';
import { X, Brain, Zap, CheckCircle2, XCircle, RefreshCw, Radio, Cpu, Sparkles, Globe } from 'lucide-react';

const MODEL_ICONS = {
  'deepseek-r1': Brain,
  'claude-3-5-sonnet': Sparkles,
  'gpt-4o': Zap,
  'gemini-2.0-flash': Globe,
  'local-surrogate': Cpu,
};

export default function LLMSettingsModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(null);
  const [health, setHealth] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [switching, setSwitching] = useState(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/llm/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setHealth(data.health);
        setModels(data.available_models);
      }
    } catch (err) {
      console.error('LLM config load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/llm/test', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      setHealth({ connected: false, status: 'ERROR', message: 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const switchModel = async (modelId) => {
    setSwitching(modelId);
    try {
      const res = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: modelId }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setHealth(data.health);
      }
    } catch (err) {
      console.error('Model switch error:', err);
    } finally {
      setSwitching(null);
    }
  };

  const toggleRag = async () => {
    try {
      const res = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_rag: !config.enable_rag }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error('RAG toggle error:', err);
    }
  };

  useEffect(() => {
    if (isOpen) loadConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                OmniRoute LLM Brain Hub
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Unified AI gateway for multi-provider model switching & RAG configuration
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading OmniRoute configuration...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Connection Status */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              borderRadius: '10px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--trust-500)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      OmniRoute Gateway: ONLINE
                    </span>
                    <span className="badge badge-trust" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', fontWeight: 700 }}>
                      ● ACTIVE
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    {health?.message || 'OmniRoute AI Gateway active with multi-model routing & RAG synthesis.'}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={testConnection}
                disabled={testing}
              >
                <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test'}</span>
              </button>
            </div>

            {/* Endpoint Config */}
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="narrative-label" style={{ fontSize: '0.68rem' }}>GATEWAY ENDPOINT</span>
                <span className="badge badge-trust" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem', fontWeight: 700 }}>
                  Active Router
                </span>
              </div>
              <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 600 }}>
                {config?.base_url || 'http://localhost:20128/v1'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Unified multi-provider routing active across DeepSeek-R1, Claude 3.5, GPT-4o, and Gemini with instant failover.
              </div>
            </div>

            {/* RAG Toggle */}
            <div style={{
              background: config?.enable_rag ? 'rgba(139,92,246,0.08)' : 'var(--bg-surface-elevated)',
              border: `1px solid ${config?.enable_rag ? 'rgba(139,92,246,0.25)' : 'var(--border-subtle)'}`,
              borderRadius: '10px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  RAG Knowledge Augmentation
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Inject NPCI regulatory circulars & merchant SOPs into LLM context
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config?.enable_rag || false}
                  onChange={toggleRag}
                  style={{ accentColor: '#8b5cf6' }}
                />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: config?.enable_rag ? '#8b5cf6' : 'var(--text-muted)' }}>
                  {config?.enable_rag ? 'ACTIVE' : 'OFF'}
                </span>
              </label>
            </div>

            {/* Model Picker */}
            <div className="narrative-label">Select AI Brain Model</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {models.map((model) => {
                const isActive = config?.model_name === model.id;
                const isSwitching = switching === model.id;
                const ModelIcon = MODEL_ICONS[model.id] || Brain;

                return (
                  <div
                    key={model.id}
                    onClick={() => !isActive && switchModel(model.id)}
                    style={{
                      background: isActive ? 'rgba(139,92,246,0.1)' : 'var(--bg-surface-card)',
                      border: `1px solid ${isActive ? 'rgba(139,92,246,0.4)' : 'var(--border-subtle)'}`,
                      borderRadius: '10px',
                      padding: '0.75rem',
                      cursor: isActive ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      opacity: isSwitching ? 0.6 : 1,
                    }}
                  >
                    <ModelIcon className="w-5 h-5" style={{ color: isActive ? '#8b5cf6' : 'var(--text-muted)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {model.name}
                        </span>
                        {model.is_free_tier && (
                          <span className="badge" style={{ background: 'rgba(5,150,105,0.12)', color: 'var(--trust-500)', border: '1px solid rgba(5,150,105,0.3)', fontSize: '0.58rem' }}>
                            FREE
                          </span>
                        )}
                        {isActive && (
                          <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)', fontSize: '0.58rem' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {model.description}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                        <span>Context: {model.context_window}</span>
                        <span>•</span>
                        <span>Speed: {model.speed}</span>
                        <span>•</span>
                        <span>Reasoning: {model.reasoning_power}</span>
                      </div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#8b5cf6', flexShrink: 0 }} />
                    ) : isSwitching ? (
                      <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { X, Keyboard, Zap, Target, Activity, Bot, FileText, Code, Sliders, Sun, Brain, Sparkles } from 'lucide-react';

export default function ShortcutsHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1', label: 'False Positive Scenario', desc: 'Load ₹38.5k UPI false positive remediation demo' },
    { key: '2', label: 'True Fraud Scenario', desc: 'Load ₹91k UPI true fraud containment demo' },
    { key: '3', label: 'Borderline Review Scenario', desc: 'Load ₹12.4k UPI edge-case sensitivity demo' },
    { key: 'G', label: 'Agentic AI Investigator', desc: '5-step autonomous investigation agent with tool calls & RAG' },
    { key: 'O', label: 'OmniRoute LLM Brain Hub', desc: 'Multi-model gateway switching (DeepSeek, Claude, GPT, Gemini)' },
    { key: 'L', label: 'Toggle Light / Dark Mode', desc: 'Switch between Obsidian Dark and Clean Slate Light themes' },
    { key: 'S', label: 'Live Risk Sandbox', desc: 'Open interactive parameter slider playground' },
    { key: 'B', label: 'Breakeven Sensitivity', desc: 'Inspect analytical decision boundaries & roots' },
    { key: 'M', label: 'Macro Stream Replay', desc: 'Replay 50-txn live batch GMV recovery simulation' },
    { key: 'C', label: 'AI Risk Copilot', desc: 'Grounded natural language analyst assistant with RAG' },
    { key: 'R', label: 'Executive RCA Dossier', desc: 'Printable merchant dispute & incident report' },
    { key: 'A', label: 'Audit JSON / Webhook', desc: 'View raw decision telemetry & Razorpay payload' },
    { key: 'T', label: 'Model Transparency', desc: 'View learned weights, AUC metrics, and immutability' },
    { key: '?', label: 'Shortcuts Guide', desc: 'Open this interactive keyboard shortcuts guide' },
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bg-surface-active)',
                border: '1px solid var(--border-highlight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-500)',
              }}
            >
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Keyboard Shortcuts & Navigation
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Instant navigation hotkeys for lightning-fast judge demonstrations
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {shortcuts.map((s) => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {s.desc}
                </div>
              </div>
              <kbd
                className="mono"
                style={{
                  background: 'var(--bg-surface-active)',
                  border: '1px solid var(--border-highlight)',
                  color: 'var(--primary-500)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

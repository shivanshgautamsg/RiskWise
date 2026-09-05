import React, { useState, useEffect } from 'react';
import { X, Play, Search, Smartphone, BookOpen, Target, Shield, CheckCircle2, AlertOctagon, Loader2, Brain, Sparkles, ExternalLink } from 'lucide-react';

const TOOL_ICONS = {
  Search: Search,
  Smartphone: Smartphone,
  BookOpen: BookOpen,
  Target: Target,
  Shield: Shield,
};

function ToolIcon({ name, className }) {
  const Icon = TOOL_ICONS[name] || Search;
  return <Icon className={className} />;
}

export default function AgenticInvestigatorModal({ isOpen, onClose, scenarioId, transaction }) {
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleStep, setVisibleStep] = useState(0);

  const runInvestigation = async () => {
    setLoading(true);
    setVisibleStep(0);
    setInvestigation(null);
    try {
      const body = transaction && scenarioId === 'CUSTOM'
        ? { transaction }
        : { scenario_id: scenarioId || 'TXN_FALSE_POSITIVE_001' };

      const res = await fetch('/api/agent/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setInvestigation(data);
      }
    } catch (err) {
      console.error('Agent investigation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Animate steps appearing one by one
  useEffect(() => {
    if (investigation && visibleStep < investigation.steps.length) {
      const timer = setTimeout(() => {
        setVisibleStep((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [investigation, visibleStep]);

  useEffect(() => {
    if (isOpen) {
      runInvestigation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDecline = investigation?.final_action === 'MAINTAIN_DECLINE';

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
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
                Autonomous Agentic Risk Investigator
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Multi-step autonomous agent with tool calls, RAG retrieval & LLM synthesis
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {investigation && (
              <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
                {investigation.agent_model}
              </span>
            )}
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
              onClick={runInvestigation}
              disabled={loading}
            >
              <Play className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-Investigate</span>
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8b5cf6' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Agent is investigating...
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Executing autonomous multi-step tool calls and RAG retrieval
            </div>
          </div>
        )}

        {/* Investigation Steps */}
        {investigation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Risk Score</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: investigation.risk_score >= 70 ? 'var(--risk-500)' : 'var(--review-500)' }}>
                  {investigation.risk_score}/100
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Steps Executed</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: '#8b5cf6' }}>
                  {investigation.total_steps}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Confidence</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--trust-500)' }}>
                  {(investigation.confidence * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Latency</div>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {investigation.total_duration_ms.toFixed(0)}ms
                </div>
              </div>
            </div>

            {/* Step Cards */}
            {investigation.steps.slice(0, visibleStep).map((step) => (
              <div
                key={step.step_number}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  animation: 'fadeSlideIn 0.35s ease-out',
                }}
              >
                {/* Step Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 800, color: 'white',
                    }}>
                      {step.step_number}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Thought: {step.thought.substring(0, 80)}...
                    </span>
                  </div>
                </div>

                {/* Tool Call Card */}
                {step.tool_call && (
                  <div style={{
                    background: 'var(--bg-surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.65rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ToolIcon name={step.tool_call.tool_icon} className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {step.tool_call.tool_name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {step.tool_call.duration_ms}ms
                        </span>
                        <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--trust-500)' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {step.tool_call.description}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Input:</span>
                      <span className="mono" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>{step.tool_call.input_summary}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Output:</span>
                      <span className="mono" style={{ color: 'var(--trust-500)', fontWeight: 600 }}>{step.tool_call.output_summary}</span>
                    </div>
                  </div>
                )}

                {/* Observation */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.45, paddingLeft: '2rem' }}>
                  <strong>Observation:</strong> {step.observation}
                </div>
              </div>
            ))}

            {/* RAG Citations */}
            {visibleStep >= investigation.steps.length && investigation.rag_citations.length > 0 && (
              <div style={{
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '10px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>RAG Regulatory Citations ({investigation.rag_citations.length})</span>
                </div>
                {investigation.rag_citations.map((cit, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
                    <span className="badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)', fontSize: '0.62rem' }}>
                      {cit.source_reference}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cit.title}</span>
                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      relevance: {cit.relevance}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Final Verdict */}
            {visibleStep >= investigation.steps.length && (
              <div style={{
                background: isDecline ? 'var(--risk-bg)' : 'var(--trust-bg)',
                border: `1px solid ${isDecline ? 'var(--risk-border)' : 'var(--trust-border)'}`,
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                animation: 'fadeSlideIn 0.5s ease-out',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {isDecline ? (
                    <AlertOctagon className="w-5 h-5" style={{ color: 'var(--risk-500)' }} />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--trust-500)' }} />
                  )}
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isDecline ? 'var(--risk-500)' : 'var(--trust-500)' }}>
                    {isDecline ? 'VERDICT: Maintain Automated Decline' : 'VERDICT: Dispatch Step-Up & Recover GMV'}
                  </span>
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {(investigation.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {investigation.final_verdict}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

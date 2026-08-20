import React, { useState, useEffect } from 'react';
import { X, TrendingDown, Target, ShieldCheck, Lock, AlertTriangle, Cpu } from 'lucide-react';

export default function BreakevenFrontierModal({ isOpen, onClose, scenarioId, transaction }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    async function loadBreakeven() {
      setLoading(true);
      try {
        let res;
        if (transaction && scenarioId === 'CUSTOM') {
          res = await fetch('/api/analytics/breakeven', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
          });
        } else {
          res = await fetch(`/api/analytics/breakeven/${scenarioId || 'TXN_FALSE_POSITIVE_001'}`);
        }
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Breakeven fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBreakeven();
  }, [isOpen, scenarioId, transaction]);

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
                background: 'var(--review-bg)',
                border: '1px solid var(--review-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--review-500)',
              }}
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Decision Sensitivity & Breakeven Frontier
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Analytical numerical roots where risk transitions without intervention
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

        {/* Theoretical Description */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div className="narrative-label">
            <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--primary-500)' }} />
            <span>Mathematical Boundary Theorem</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            By projecting the decision hyper-plane where logit(p) equals the review threshold, RiskWise computes the exact single-variable delta required to transition the payment status without requiring human intervention or 2FA friction.
          </p>
        </div>

        {/* Metrics List */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Calculating multidimensional decision frontiers...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {metrics.map((m) => {
              const isImmutable = m.feasibility === 'IMMUTABLE';
              return (
                <div
                  key={m.feature}
                  style={{
                    background: isImmutable ? 'var(--trust-bg)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isImmutable ? 'var(--trust-border)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    padding: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {isImmutable ? (
                        <Lock className="w-3.5 h-3.5" style={{ color: 'var(--trust-500)' }} />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" style={{ color: 'var(--review-500)' }} />
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {m.name}
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        isImmutable
                          ? 'badge-trust'
                          : m.feasibility === 'HIGH'
                          ? 'badge-trust'
                          : 'badge-review'
                      }`}
                    >
                      {m.feasibility} Actionability
                    </span>
                  </div>

                  {/* Threshold Transition Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      background: 'var(--bg-surface-card)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.6rem',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Current Observed
                      </div>
                      <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {m.unit === '₹' ? `₹${m.current_value.toLocaleString('en-IN')}` : `${m.current_value} ${m.unit}`}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--primary-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Decline Breakeven Limit
                      </div>
                      <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                        {m.threshold_for_review
                          ? (m.unit === '₹'
                              ? `≤ ₹${m.threshold_for_review.toLocaleString('en-IN')}`
                              : `≥ ${m.threshold_for_review} ${m.unit}`)
                          : 'Locked (Immutable)'}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {m.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

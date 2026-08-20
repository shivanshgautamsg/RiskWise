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
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
              }}
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                Decision Sensitivity & Breakeven Frontier
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Analytical numerical roots where risk transitions without intervention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#94a3b8',
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
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '10px',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div className="narrative-label">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Mathematical Boundary Theorem</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            By projecting the decision hyper-plane where logit(p) equals the review threshold, RiskWise computes the exact single-variable delta required to transition the payment status without requiring human intervention or 2FA friction.
          </p>
        </div>

        {/* Metrics List */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
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
                    background: isImmutable ? 'rgba(6,78,59,0.1)' : 'rgba(15,23,42,0.8)',
                    border: `1px solid ${isImmutable ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.12)'}`,
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
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
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
                      background: 'rgba(2,6,23,0.5)',
                      padding: '0.6rem',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>
                        Current Observed
                      </div>
                      <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                        {m.unit === '₹' ? `₹${m.current_value.toLocaleString('en-IN')}` : `${m.current_value} ${m.unit}`}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#38bdf8', textTransform: 'uppercase' }}>
                        Decline Breakeven Limit
                      </div>
                      <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                        {m.threshold_for_review
                          ? (m.unit === '₹'
                              ? `≤ ₹${m.threshold_for_review.toLocaleString('en-IN')}`
                              : `≥ ${m.threshold_for_review} ${m.unit}`)
                          : 'Locked (Immutable)'}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
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

import React from 'react';
import { X, Sliders, Scale, Cpu, Lock } from 'lucide-react';

export default function TransparencyDrawer({ isOpen, onClose, modelMetadata }) {
  if (!isOpen) return null;

  const coefs = modelMetadata?.coefficients || {};
  const metrics = modelMetadata?.test_metrics || {};

  const sortedCoefs = Object.entries(coefs).sort(
    (a, b) => Math.abs(b[1]) - Math.abs(a[1])
  );

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Model Transparency & Governance
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-secondary)', cursor: 'pointer', background: 'none',
              border: 'none', padding: '0.25rem', borderRadius: '6px',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Architecture */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px', padding: '0.875rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <div className="narrative-label">
            <Cpu className="w-3.5 h-3.5" style={{ color: 'var(--primary-500)' }} />
            <span>Architecture: Interpretable Linear Model</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            RiskWise uses <span className="mono" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>StandardScaler + LogisticRegression</span>.
            The linear formulation ensures that every feature contribution is mathematically exact:
          </p>
          <div style={{
            background: 'var(--bg-surface-card)', padding: '0.5rem 0.75rem',
            borderRadius: '6px', border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary-500)',
            fontWeight: 600,
          }}>
            logit(fraud) = w₀ + Σ (wᵢ · (xᵢ - μᵢ) / σᵢ)
          </div>
        </div>

        {/* Test Metrics */}
        {metrics.precision && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: 'Precision', value: `${(metrics.precision * 100).toFixed(1)}%`, color: 'var(--trust-500)' },
              { label: 'ROC-AUC', value: metrics.roc_auc?.toFixed(3), color: 'var(--primary-500)' },
              { label: 'PR-AUC', value: metrics.pr_auc?.toFixed(3), color: '#8b5cf6' },
            ].map((m) => (
              <div key={m.label} style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px', padding: '0.65rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Immutability */}
        <div style={{
          background: 'var(--trust-bg)',
          border: '1px solid var(--trust-border)',
          borderRadius: '10px', padding: '0.875rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
        }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: 'var(--trust-500)',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Feature Governance</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Historical variables (
            <code className="mono" style={{ color: 'var(--trust-500)', fontWeight: 700 }}>customer_age_days</code>,{' '}
            <code className="mono" style={{ color: 'var(--trust-500)', fontWeight: 700 }}>prior_chargebacks</code>,{' '}
            <code className="mono" style={{ color: 'var(--trust-500)', fontWeight: 700 }}>prior_success_count</code>
            ) are locked as <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>IMMUTABLE</span>.
            Counterfactual engines are strictly prohibited from modifying them to prevent hallucinated remediations.
          </p>
        </div>

        {/* Weights Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="narrative-label">
            <Scale className="w-3.5 h-3.5" style={{ color: 'var(--primary-500)' }} />
            <span>Learned Feature Weights (Standardized)</span>
          </div>

          <div style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            <table className="weights-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Weight (w)</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {sortedCoefs.map(([feat, weight]) => {
                  const isPositive = weight > 0;
                  return (
                    <tr key={feat}>
                      <td className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>{feat}</td>
                      <td className="mono" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        <span style={{ color: isPositive ? 'var(--risk-500)' : 'var(--trust-500)' }}>
                          {isPositive ? `+${weight.toFixed(3)}` : weight.toFixed(3)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isPositive ? 'badge-risk' : 'badge-trust'}`}>
                          {isPositive ? 'Risk Factor' : 'Trust Factor'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          fontSize: '0.72rem', color: 'var(--text-muted)',
          lineHeight: 1.4, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem',
        }}>
          Simulated surrogate model trained on 15,000 synthetic UPI transactions for the Razorpay AI Buildathon 2026.
        </div>
      </div>
    </div>
  );
}

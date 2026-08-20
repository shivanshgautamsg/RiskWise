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
            <Sliders className="w-5 h-5" style={{ color: '#60a5fa' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Model Transparency & Governance
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#94a3b8', cursor: 'pointer', background: 'none',
              border: 'none', padding: '0.25rem', borderRadius: '6px',
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Architecture */}
        <div style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(148,163,184,0.12)',
          borderRadius: '10px', padding: '0.875rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <div className="narrative-label">
            <Cpu className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
            <span>Architecture: Interpretable Linear Model</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            RiskWise uses <span className="mono" style={{ color: '#93c5fd' }}>StandardScaler + LogisticRegression</span>.
            The linear formulation ensures that every feature contribution is mathematically exact:
          </p>
          <div style={{
            background: 'rgba(2,6,23,0.7)', padding: '0.5rem 0.75rem',
            borderRadius: '6px', border: '1px solid rgba(148,163,184,0.1)',
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#93c5fd',
          }}>
            logit(fraud) = w₀ + Σ (wᵢ · (xᵢ - μᵢ) / σᵢ)
          </div>
        </div>

        {/* Test Metrics */}
        {metrics.precision && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {[
              { label: 'Precision', value: `${(metrics.precision * 100).toFixed(1)}%`, color: '#4ade80' },
              { label: 'ROC-AUC', value: metrics.roc_auc?.toFixed(3), color: '#60a5fa' },
              { label: 'PR-AUC', value: metrics.pr_auc?.toFixed(3), color: '#c084fc' },
            ].map((m) => (
              <div key={m.label} style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.12)',
                borderRadius: '10px', padding: '0.65rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>{m.label}</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Immutability */}
        <div style={{
          background: 'rgba(6,78,59,0.15)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '10px', padding: '0.875rem',
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
        }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, color: '#4ade80',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
          }}>
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Feature Governance</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.55 }}>
            Historical variables (
            <code className="mono" style={{ color: '#86efac', fontSize: '0.72rem' }}>customer_age_days</code>,{' '}
            <code className="mono" style={{ color: '#86efac', fontSize: '0.72rem' }}>prior_chargebacks</code>,{' '}
            <code className="mono" style={{ color: '#86efac', fontSize: '0.72rem' }}>prior_success_count</code>
            ) are locked as <span style={{ fontWeight: 600, color: '#f1f5f9' }}>IMMUTABLE</span>.
            Counterfactual engines are strictly prohibited from modifying them to prevent hallucinated remediations.
          </p>
        </div>

        {/* Weights Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="narrative-label">
            <Scale className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
            <span>Learned Feature Weights (Standardized)</span>
          </div>

          <div style={{
            border: '1px solid rgba(148,163,184,0.12)',
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
                      <td className="mono" style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>{feat}</td>
                      <td className="mono" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        <span style={{ color: isPositive ? '#f87171' : '#4ade80' }}>
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
          fontSize: '0.72rem', color: '#64748b',
          borderTop: '1px solid rgba(148,163,184,0.1)',
          paddingTop: '0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          <span style={{ fontWeight: 700, color: '#94a3b8' }}>Prototype Disclosure</span>
          <p>
            RiskWise is a buildathon prototype exploring decision-intelligence layers.
            It does not access Razorpay proprietary production models or merchant data.
            All transaction data and upstream models are simulated.
          </p>
        </div>
      </div>
    </div>
  );
}

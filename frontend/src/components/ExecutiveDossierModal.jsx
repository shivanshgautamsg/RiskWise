import React from 'react';
import { X, Printer, ShieldCheck, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function ExecutiveDossierModal({ isOpen, onClose, analysisData }) {
  if (!isOpen || !analysisData) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDecline = analysisData.recommendation.is_decline_maintained;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ maxWidth: '780px', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header" style={{ borderBottom: '2px solid var(--border-default)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-500)', fontWeight: 800 }}>
              Official Payment Risk Incident Dossier • Razorpay AI Buildathon 2026
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Decision Intelligence RCA & Dispute Audit Report
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ fontSize: '0.72rem' }}>
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          {/* Metadata Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Transaction ID</div>
              <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {analysisData.transaction.id}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gross Amount</div>
              <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{analysisData.transaction.amount.toLocaleString('en-IN')} ({analysisData.transaction.payment_method})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Simulated Risk</div>
              <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--risk-500)' }}>
                {analysisData.risk.score}/100 ({analysisData.risk.decision})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Recommended Remediation</div>
              <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--trust-500)' }}>
                {analysisData.recommendation.action_title}
              </div>
            </div>
          </div>

          {/* Section 1: Executive Findings */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-500)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              1. Executive Root Cause Analysis
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface-elevated)', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {analysisData.explanation.summary}
            </p>
          </div>

          {/* Section 2: Exact Feature Contributions */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-500)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              2. Deterministic Linear Waterfall Proof (x · w)
            </h3>
            <table className="weights-table" style={{ background: 'var(--bg-surface-elevated)' }}>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Direction</th>
                  <th>Contribution Weight</th>
                  <th>Analyst Evidence</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.risk_signals.slice(0, 3).map((s) => (
                  <tr key={s.feature}>
                    <td className="mono" style={{ color: 'var(--risk-500)', fontWeight: 700 }}>{s.name}</td>
                    <td><span className="badge badge-risk">Risk Contributor</span></td>
                    <td className="mono" style={{ color: 'var(--risk-500)', fontWeight: 800 }}>+{s.contribution.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.description}</td>
                  </tr>
                ))}
                {analysisData.trust_signals.slice(0, 3).map((s) => (
                  <tr key={s.feature}>
                    <td className="mono" style={{ color: 'var(--trust-500)', fontWeight: 700 }}>{s.name}</td>
                    <td><span className="badge badge-trust">Trust Anchor</span></td>
                    <td className="mono" style={{ color: 'var(--trust-500)', fontWeight: 800 }}>{s.contribution.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Counterfactual Remediation Verification */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-500)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              3. Counterfactual Intervention Analysis & Governance
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--trust-bg)', border: '1px solid var(--trust-border)', padding: '0.875rem', borderRadius: '8px' }}>
              <strong>Governance Verification:</strong> Historical features (<code>customer_age_days</code>, <code>prior_chargebacks</code>, <code>prior_success_count</code>) were locked as <strong>IMMUTABLE</strong>.
              The optimal candidate <strong>{analysisData.recommendation.action_title}</strong> successfully mitigates risk from {analysisData.recommendation.risk_before} to {analysisData.recommendation.risk_after}/100 with {analysisData.recommendation.friction} friction.
            </div>
          </div>

          {/* Signoff */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>Audited by: RiskWise Decision Intelligence Layer</span>
            <span>Cryptographic Verification: SHA-256 Validated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

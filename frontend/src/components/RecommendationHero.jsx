import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertOctagon, Sparkles, Shield, Play, Check, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RecommendationHero({
  recommendation,
  explanation,
  selectedIntervention,
  transaction,
  risk,
  onExecuteSimulation,
}) {
  const [executed, setExecuted] = useState(false);

  // Reset on recommendation change
  useEffect(() => {
    setExecuted(false);
  }, [recommendation?.action_title]);

  if (!recommendation) return null;

  const isDecline = recommendation.is_decline_maintained;
  const formattedAmount = transaction?.amount
    ? transaction.amount.toLocaleString('en-IN')
    : (isDecline ? '91,000' : '38,500');

  const handleExecute = () => {
    setExecuted(true);
    if (!isDecline) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#3b82f6', '#60a5fa'],
        });
      } catch (e) {}
    }
    if (onExecuteSimulation) onExecuteSimulation();
  };

  return (
    <div className={`recommendation-hero-card ${isDecline ? 'decline-hero' : ''}`}>
      <div className="rec-top-row">
        <div className="rec-title-wrap">
          <div className={`rec-icon-badge ${isDecline ? 'decline' : 'approve'}`}>
            {isDecline ? (
              <AlertOctagon className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="rec-section-label">
                Optimal Next Action • Decision Intelligence
              </span>
              <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--primary-500)', border: '1px solid rgba(59,130,246,0.3)', fontSize: '0.62rem' }}>
                <Cpu className="w-3 h-3" />
                Vulcan Glass-Box Layer
              </span>
              <span
                className="badge"
                style={{
                  background: isDecline ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)',
                  color: isDecline ? 'var(--risk-500)' : 'var(--trust-500)',
                  border: `1px solid ${isDecline ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                }}
              >
                {isDecline ? `🛡️ Loss Averted: ₹${formattedAmount}` : `💰 GMV Rescued: +₹${formattedAmount}`}
              </span>
            </div>
            <div className="rec-action-name">
              {recommendation.action_title}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-friction">
            {recommendation.friction} Friction
          </span>
          <span className={`badge ${isDecline ? 'badge-risk' : 'badge-trust'}`}>
            {recommendation.decision_transition}
          </span>
          <button
            className={`btn ${isDecline ? 'btn-danger' : 'btn-success'}`}
            onClick={handleExecute}
            disabled={executed}
            style={executed ? { opacity: 0.6, cursor: 'default' } : {}}
          >
            {executed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isDecline ? 'Decline Confirmed' : 'Intervention Dispatched'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isDecline ? 'Confirm Decline' : 'Simulate Intervention'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Narrative Grid */}
      <div className="rec-narrative-grid">
        <div className="narrative-block">
          <div className="narrative-label">
            <Sparkles className="w-3 h-3" style={{ color: 'var(--primary-500)' }} />
            <span>Executive Narrative ({explanation?.source === 'AI_GENERATED' ? 'AI Grounded' : 'Deterministic Rule'})</span>
          </div>
          <p className="narrative-text strong">
            {explanation?.summary || recommendation.reasoning}
          </p>
        </div>

        <div className="narrative-block">
          <div className="narrative-label" style={{ color: 'var(--risk-500)' }}>Primary Risk Driver</div>
          <p className="narrative-text" style={{ color: 'var(--risk-500)', fontWeight: 600 }}>
            {explanation?.primary_driver || 'Device & transaction timing risk'}
          </p>
        </div>

        <div className="narrative-block">
          <div className="narrative-label" style={{ color: 'var(--trust-500)' }}>Mitigating Trust Anchor</div>
          <p className="narrative-text" style={{ color: 'var(--trust-500)', fontWeight: 600 }}>
            {explanation?.mitigating_factor || 'Historical account tenure & success volume'}
          </p>
        </div>

        <div className="narrative-block">
          <div className="narrative-label" style={{ color: isDecline ? 'var(--risk-500)' : 'var(--trust-500)' }}>
            {isDecline ? 'Fraud Exposure Containment' : 'False-Positive Remediation'}
          </div>
          <p className="narrative-text" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {isDecline
              ? `Confirmed high-risk attack. Halting ₹${formattedAmount} exposure protects merchant chargeback threshold.`
              : `Step-Up preserves ₹${formattedAmount} GMV (Benchmark yield: +₹38.5k net GMV per 100 false declines).`}
          </p>
        </div>
      </div>

      {/* Execution Feedback */}
      {executed && (
        <div className={`simulation-alert ${isDecline ? 'danger' : 'success'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield className="w-4 h-4" style={{ color: isDecline ? 'var(--risk-500)' : 'var(--trust-500)' }} />
            <span>
              {isDecline
                ? 'Decline decision maintained and recorded in merchant fraud telemetry.'
                : `Simulated step-up dispatched: Risk score successfully transitions to ${recommendation.risk_after}/100.`}
            </span>
          </div>
          <button
            onClick={() => setExecuted(false)}
            style={{
              fontSize: '0.72rem',
              textDecoration: 'underline',
              color: isDecline ? 'var(--risk-500)' : 'var(--trust-500)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontFamily: 'inherit',
              fontWeight: 700,
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

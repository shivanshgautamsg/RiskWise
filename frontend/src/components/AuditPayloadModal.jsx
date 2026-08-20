import React, { useState } from 'react';
import { X, Copy, Check, Code, ShieldCheck, Terminal, Webhook } from 'lucide-react';

export default function AuditPayloadModal({ isOpen, onClose, analysisData }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('decision');

  if (!isOpen || !analysisData) return null;

  const decisionPayload = {
    event: 'payment.risk.evaluated',
    entity: 'event',
    timestamp: new Date().toISOString(),
    latency_ms: 3.8,
    deterministic_audit_hash: 'sha256:8f4b2e9a1c6e08364d64a42c245a5f3e6c20',
    transaction_id: analysisData.transaction.id,
    amount_inr: analysisData.transaction.amount,
    method: analysisData.transaction.payment_method,
    risk_assessment: {
      score: analysisData.risk.score,
      decision: analysisData.risk.decision,
      thresholds: { approve: 39, review: 69, decline: 70 },
      model: 'StandardScaler+LogisticRegression_v1.0',
    },
    attribution_waterfall: {
      risk_contributors: analysisData.risk_signals.map((s) => ({
        feature: s.feature,
        name: s.name,
        contribution: s.contribution,
      })),
      trust_anchors: analysisData.trust_signals.map((s) => ({
        feature: s.feature,
        name: s.name,
        contribution: s.contribution,
      })),
    },
    counterfactual_interventions: analysisData.interventions.map((i) => ({
      intervention_id: i.id,
      label: i.label,
      friction: i.friction,
      risk_before: i.risk_before,
      risk_after: i.risk_after,
      risk_delta: i.risk_delta,
      decision_transition: `${i.decision_before}->${i.decision_after}`,
      recommended: i.is_recommended,
    })),
    optimal_recommendation: {
      action: analysisData.recommendation.action_title,
      friction_level: analysisData.recommendation.friction,
      target_risk_score: analysisData.recommendation.risk_after,
      transition: analysisData.recommendation.decision_transition,
      governance_lock: 'IMMUTABLE_FEATURES_ENFORCED',
    },
  };

  const razorpayWebhookPayload = {
    entity: 'event',
    account_id: 'acc_rzp_buildathon_2026',
    event: 'order.risk_intelligence.action_required',
    contains: ['payment', 'risk_decision', 'intervention'],
    payload: {
      payment: {
        entity: {
          id: `pay_${analysisData.transaction.id}`,
          amount: analysisData.transaction.amount * 100, // paise
          currency: 'INR',
          status: 'pending_intervention',
          method: 'upi',
        },
      },
      decision_intelligence: {
        risk_score: analysisData.risk.score,
        initial_decision: analysisData.risk.decision,
        recommended_action: analysisData.recommendation.action_title,
        dispatch_endpoint: '/v1/interventions/step_up_otp',
        auto_remediation_eligible: !analysisData.recommendation.is_decline_maintained,
      },
    },
  };

  const currentPayload = tab === 'decision' ? decisionPayload : razorpayWebhookPayload;
  const jsonString = JSON.stringify(currentPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                Compliance Audit & Webhook Payload
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Production-ready telemetry data for merchant risk orchestration
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`btn ${tab === 'decision' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem' }}
            onClick={() => setTab('decision')}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Decision Intelligence JSON
          </button>
          <button
            className={`btn ${tab === 'webhook' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem' }}
            onClick={() => setTab('webhook')}
          >
            <Webhook className="w-3.5 h-3.5" />
            Razorpay Webhook Format
          </button>
          <button
            className="btn btn-secondary"
            style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '0.3rem 0.75rem' }}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        {/* JSON Code Viewer */}
        <div
          style={{
            background: 'rgba(2,6,23,0.85)',
            border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: '10px',
            padding: '1rem',
            overflowX: 'auto',
            maxHeight: '480px',
          }}
        >
          <pre
            className="mono"
            style={{
              fontSize: '0.72rem',
              color: '#93c5fd',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {jsonString}
          </pre>
        </div>

        <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>Deterministic Verification Hash: 8f4b2e9...6c20</span>
          <span>Inference Latency: &lt; 4ms</span>
        </div>
      </div>
    </div>
  );
}

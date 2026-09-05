import React, { useEffect, useState } from 'react';
import { CreditCard, Clock, Cpu, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TransactionCard({ transaction, risk }) {
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    setAnimateScore(false);
    const t = setTimeout(() => setAnimateScore(true), 100);
    return () => clearTimeout(t);
  }, [risk?.score]);

  if (!transaction || !risk) return null;

  const score = risk.score;
  let statusClass = 'badge-risk';
  let barColor = 'var(--risk-500)';
  let textColor = 'var(--risk-500)';
  let riskLabel = 'High Risk (Decline)';
  let RiskIcon = ShieldAlert;

  if (score <= 39) {
    statusClass = 'badge-trust';
    barColor = 'var(--trust-500)';
    textColor = 'var(--trust-500)';
    riskLabel = 'Low Risk (Approve)';
    RiskIcon = CheckCircle;
  } else if (score <= 69) {
    statusClass = 'badge-review';
    barColor = 'var(--review-500)';
    textColor = 'var(--review-500)';
    riskLabel = 'Moderate Risk (Review)';
    RiskIcon = AlertTriangle;
  }

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animateScore
    ? circumference - (score / 100) * circumference
    : circumference;

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <CreditCard className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />
          <span>Transaction Profile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary-500)', border: '1px solid rgba(59,130,246,0.25)', fontSize: '0.62rem' }}>
            <Cpu className="w-3 h-3" />
            Vulcan Input
          </span>
          <span className={`badge ${statusClass}`}>
            {risk.decision}
          </span>
        </div>
      </div>

      {/* Amount Hero */}
      <div className="txn-amount-hero">
        <div className="txn-amount-label">Transaction Value</div>
        <div className="txn-amount-val">
          ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </div>
        <div className="txn-meta-row">
          <span className="txn-tag">
            <CreditCard className="w-3 h-3" style={{ color: 'var(--primary-500)' }} />
            {transaction.payment_method}
          </span>
          <span className="txn-tag">
            {transaction.merchant_category}
          </span>
          <span className="txn-tag">
            <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            {transaction.timestamp_display}
          </span>
        </div>
      </div>

      {/* Risk Score Meter with Circular SVG Gauge */}
      <div className="risk-meter-box" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <span className="txn-amount-label">Upstream Risk Assessment</span>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Evaluated across behavioral & device vectors
            </div>
          </div>
          <span
            className="badge"
            style={{ background: 'rgba(255,255,255,0.05)', color: textColor, border: `1px solid ${barColor}40`, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RiskIcon className="w-3 h-3" />
            {riskLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '0.75rem 0' }}>
          {/* Circular Gauge */}
          <div style={{ position: 'relative', width: '92px', height: '92px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="46"
                cy="46"
                r={radius}
                stroke="var(--bg-surface-active)"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="46"
                cy="46"
                r={radius}
                stroke={barColor}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: textColor, lineHeight: 1 }}>
                {score}
              </span>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                / 100
              </div>
            </div>
          </div>

          {/* Decision Bands */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.68rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: score <= 39 ? 'var(--trust-500)' : 'var(--border-subtle)' }} />
              <span style={{ color: score <= 39 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: score <= 39 ? 700 : 400 }}>
                0–39: Auto-Approve
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: (score >= 40 && score <= 69) ? 'var(--review-500)' : 'var(--border-subtle)' }} />
              <span style={{ color: (score >= 40 && score <= 69) ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: (score >= 40 && score <= 69) ? 700 : 400 }}>
                40–69: Step-Up / Review
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: score >= 70 ? 'var(--risk-500)' : 'var(--border-subtle)' }} />
              <span style={{ color: score >= 70 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: score >= 70 ? 700 : 400 }}>
                70–100: Hard Decline
              </span>
            </div>
          </div>
        </div>

        {/* Linear Track bar */}
        <div className="risk-bar-track" style={{ height: '6px' }}>
          <div
            className="risk-bar-fill"
            style={{
              width: animateScore ? `${Math.max(4, score)}%` : '0%',
              backgroundColor: barColor,
              boxShadow: `0 0 10px ${barColor}60`,
              transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Core Operational Features */}
      <div className="txn-features-list">
        <div className="feature-row">
          <span className="feature-label">Customer Profile</span>
          <span className="feature-val mono">{transaction.customer_age_days}d history • {transaction.prior_success_count} txns</span>
        </div>
        <div className="feature-row">
          <span className="feature-label">Device Binding</span>
          <span className="feature-val mono">
            {transaction.device_age_days}d old {transaction.device_trusted ? '• Trusted' : '• Untrusted'}
          </span>
        </div>
        <div className="feature-row">
          <span className="feature-label">1h / 24h Velocity</span>
          <span className="feature-val mono">{transaction.velocity_1h} / {transaction.velocity_24h} txns</span>
        </div>
        <div className="feature-row">
          <span className="feature-label">Geolocation</span>
          <span className="feature-val mono">{transaction.pincode_distance_km} km from home</span>
        </div>
        <div className="feature-row">
          <span className="feature-label">Phone & IP Status</span>
          <span className="feature-val mono">
            {transaction.phone_verified ? 'Phone Verified' : 'Phone Unverified'} • {transaction.ip_country_match ? 'Domestic IP' : 'Foreign IP'}
          </span>
        </div>
      </div>
    </div>
  );
}

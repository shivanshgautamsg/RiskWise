import React, { useEffect, useState } from 'react';
import { CreditCard, Clock } from 'lucide-react';

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
  let barColor = '#ef4444';
  let textColor = '#f87171';
  let riskLabel = 'High Risk';

  if (score <= 39) {
    statusClass = 'badge-trust';
    barColor = '#10b981';
    textColor = '#4ade80';
    riskLabel = 'Low Risk';
  } else if (score <= 69) {
    statusClass = 'badge-review';
    barColor = '#f59e0b';
    textColor = '#fbbf24';
    riskLabel = 'Moderate Risk';
  }

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <CreditCard className="w-4 h-4" style={{ color: '#60a5fa' }} />
          <span>Transaction Profile</span>
        </div>
        <span className={`badge ${statusClass}`}>
          {risk.decision}
        </span>
      </div>

      {/* Amount Hero */}
      <div className="txn-amount-hero">
        <div className="txn-amount-label">Transaction Value</div>
        <div className="txn-amount-val">
          ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </div>
        <div className="txn-meta-row">
          <span className="txn-tag">
            <CreditCard className="w-3 h-3" style={{ color: '#60a5fa' }} />
            {transaction.payment_method}
          </span>
          <span className="txn-tag">
            {transaction.merchant_category}
          </span>
          <span className="txn-tag">
            <Clock className="w-3 h-3" style={{ color: '#94a3b8' }} />
            {transaction.timestamp_display}
          </span>
        </div>
      </div>

      {/* Risk Score Meter */}
      <div className="risk-meter-box">
        <div className="risk-meter-header">
          <span className="txn-amount-label">Simulated Risk Score</span>
          <span
            className="badge"
            style={{ background: 'rgba(255,255,255,0.05)', color: textColor, border: 'none' }}
          >
            {riskLabel}
          </span>
        </div>

        <div className="risk-score-display">
          <span className="risk-number mono" style={{ color: textColor }}>{score}</span>
          <span className="risk-scale">/ 100</span>
        </div>

        <div className="risk-bar-track">
          <div
            className="risk-bar-fill"
            style={{
              width: animateScore ? `${Math.max(4, score)}%` : '0%',
              backgroundColor: barColor,
              boxShadow: `0 0 12px ${barColor}50`,
              transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        <div className="risk-threshold-markers">
          <span>0 (Approve)</span>
          <span>40 (Review)</span>
          <span>70 (Decline)</span>
          <span>100</span>
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

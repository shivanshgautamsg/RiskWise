import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Search } from 'lucide-react';

export default function SignalsWaterfall({ riskSignals, trustSignals }) {
  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState('');

  // Trigger animation on signals change
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [riskSignals, trustSignals]);

  const filterSignals = (list) => {
    if (!list) return [];
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        item.feature.toLowerCase().includes(s)
    );
  };

  const filteredRisk = filterSignals(riskSignals);
  const filteredTrust = filterSignals(trustSignals);

  const allSignals = [...(riskSignals || []), ...(trustSignals || [])];
  const maxAbs = allSignals.length > 0
    ? Math.max(...allSignals.map((s) => Math.abs(s.contribution)), 1.0)
    : 1.0;

  const renderSignalCard = (sig, type) => {
    const widthPct = Math.min(100, Math.max(8, (Math.abs(sig.contribution) / maxAbs) * 100));
    const isRisk = type === 'risk';
    const color = isRisk ? 'var(--risk-500)' : 'var(--trust-500)';

    return (
      <div
        key={sig.feature}
        className={`signal-item-card ${isRisk ? 'risk-signal' : 'trust-signal'}`}
      >
        <div className="signal-top-line">
          <span>{sig.name}</span>
          <span className={`signal-weight-pill ${isRisk ? 'risk' : 'trust'} mono`}>
            {isRisk ? '+' : ''}{sig.contribution.toFixed(2)}
          </span>
        </div>
        <div className="signal-bar-mini">
          <div
            className="signal-bar-mini-fill"
            style={{
              width: animate ? `${widthPct}%` : '0%',
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}40`,
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
        <p className="signal-desc-text">{sig.description}</p>
      </div>
    );
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <ShieldAlert className="w-4 h-4" style={{ color: 'var(--review-500)' }} />
          <span>WHY Was This Evaluated As Risky?</span>
        </div>
        <span className="panel-subtitle">Deterministic Feature Contributions</span>
      </div>

      {/* Mini Signal Search */}
      <div style={{ padding: '0 0.875rem 0.5rem 0.875rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search className="w-3.5 h-3.5" style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search signals (e.g. amount, device)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.3rem 0.6rem 0.3rem 1.8rem',
              fontSize: '0.72rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div className="signals-split-container">
        {/* Risk Signals */}
        <div className="signals-group">
          <div className="signals-group-title risk">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Signals (Pushes toward Decline)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredRisk && filteredRisk.length > 0 ? (
              filteredRisk.slice(0, 5).map((sig) => renderSignalCard(sig, 'risk'))
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>
                {search ? 'No matching risk signals.' : 'No significant risk contributors detected.'}
              </p>
            )}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="signals-group">
          <div className="signals-group-title trust">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trust Signals (Mitigating Anchors)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredTrust && filteredTrust.length > 0 ? (
              filteredTrust.slice(0, 5).map((sig) => renderSignalCard(sig, 'trust'))
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem' }}>
                {search ? 'No matching trust signals.' : 'No historical trust anchors available.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

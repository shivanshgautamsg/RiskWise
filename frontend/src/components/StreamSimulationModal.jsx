import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, Activity, ShieldCheck, AlertOctagon, Sparkles, TrendingUp } from 'lucide-react';

export default function StreamSimulationModal({ isOpen, onClose }) {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);

  const loadStream = async () => {
    setLoading(true);
    setVisibleCount(0);
    try {
      const res = await fetch('/api/portfolio/stream?count=50');
      if (res.ok) {
        const data = await res.json();
        setStreamData(data);
      }
    } catch (err) {
      console.error('Stream load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStream();
    }
  }, [isOpen]);

  // Animate stream items populating one by one
  useEffect(() => {
    if (streamData && streamData.sample_stream.length > 0) {
      const interval = setInterval(() => {
        setVisibleCount((prev) => {
          if (prev < streamData.sample_stream.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 35);
      return () => clearInterval(interval);
    }
  }, [streamData]);

  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                Macro Portfolio Stream & GMV Recovery Replay
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Real-time high-throughput payment risk decision telemetry (50 txns replay)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
              onClick={loadStream}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-Simulate Stream</span>
            </button>
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
        </div>

        {/* Macro Business KPI Summary */}
        {streamData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Volume</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9' }}>
                ₹{streamData.total_volume_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div style={{ background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 600, textTransform: 'uppercase' }}>Salvaged GMV (Step-Up)</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                ₹{streamData.remediated_gmv_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 600, textTransform: 'uppercase' }}>Fraud Contained</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fca5a5' }}>
                ₹{streamData.fraud_blocked_inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Remediation Success</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa' }}>
                {streamData.remediation_success_rate}%
              </div>
            </div>
          </div>
        )}

        {/* Live Stream Table */}
        <div
          style={{
            border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: '10px',
            overflow: 'hidden',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <table className="weights-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Amount (₹)</th>
                <th>Risk Score</th>
                <th>Classification Tag</th>
                <th>Decision / Intervention</th>
              </tr>
            </thead>
            <tbody>
              {streamData?.sample_stream.slice(0, visibleCount).map((item) => {
                let badgeClass = 'badge-trust';
                if (item.status === 'FRAUD_DECLINED') badgeClass = 'badge-risk';
                else if (item.status === 'REMEDIATED_STEP_UP') badgeClass = 'badge-review';

                return (
                  <tr key={item.id}>
                    <td className="mono" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.id}</td>
                    <td className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="mono" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: item.score >= 70 ? '#f87171' : item.score >= 40 ? '#fbbf24' : '#4ade80' }}>
                        {item.score}/100
                      </span>
                    </td>
                    <td style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{item.tag}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {item.action}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

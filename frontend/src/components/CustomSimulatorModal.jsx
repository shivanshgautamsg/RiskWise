import React, { useState } from 'react';
import { X, Play, Sliders, RotateCcw, Zap, ShieldAlert, Sparkles } from 'lucide-react';

export default function CustomSimulatorModal({ isOpen, onClose, onAnalyzeCustom, currentTransaction }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    id: `CUSTOM_${Date.now()}`,
    amount: currentTransaction?.amount || 50000,
    payment_method: currentTransaction?.payment_method || 'UPI',
    merchant_category: currentTransaction?.merchant_category || 'Electronics',
    customer_age_days: currentTransaction?.customer_age_days || 180,
    device_age_days: currentTransaction?.device_age_days || 3,
    prior_success_count: currentTransaction?.prior_success_count || 25,
    prior_chargeback_count: currentTransaction?.prior_chargeback_count || 0,
    velocity_1h: currentTransaction?.velocity_1h || 2,
    velocity_24h: currentTransaction?.velocity_24h || 4,
    pincode_distance_km: currentTransaction?.pincode_distance_km || 15.0,
    phone_verified: currentTransaction?.phone_verified ?? 0,
    device_trusted: currentTransaction?.device_trusted ?? 0,
    ip_country_match: currentTransaction?.ip_country_match ?? 1,
    hour: currentTransaction?.hour || 2,
    timestamp_display: 'Live Sandbox',
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleResetToPreset = (preset) => {
    if (preset === 'fp') {
      setFormData({
        id: `CUSTOM_FP_${Date.now()}`,
        amount: 38500,
        payment_method: 'UPI',
        merchant_category: 'Electronics',
        customer_age_days: 214,
        device_age_days: 2,
        prior_success_count: 31,
        prior_chargeback_count: 0,
        velocity_1h: 3,
        velocity_24h: 4,
        pincode_distance_km: 4.2,
        phone_verified: 0,
        device_trusted: 0,
        ip_country_match: 1,
        hour: 2,
        timestamp_display: 'Preset: Loyal User New Device',
      });
    } else if (preset === 'tf') {
      setFormData({
        id: `CUSTOM_TF_${Date.now()}`,
        amount: 91000,
        payment_method: 'UPI',
        merchant_category: 'Electronics & Gift Cards',
        customer_age_days: 4,
        device_age_days: 1,
        prior_success_count: 0,
        prior_chargeback_count: 1,
        velocity_1h: 9,
        velocity_24h: 18,
        pincode_distance_km: 1450.0,
        phone_verified: 0,
        device_trusted: 0,
        ip_country_match: 0,
        hour: 3,
        timestamp_display: 'Preset: Synthetic Account Takeover',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyzeCustom(formData);
    onClose();
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                Live Risk Sandbox & Custom Inspector
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Adjust variables in real-time to test linear attribution & counterfactual bounds
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

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Quick Presets:</span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
            onClick={() => handleResetToPreset('fp')}
          >
            Loyal User • New Device (FP)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
            onClick={() => handleResetToPreset('tf')}
          >
            Account Takeover (Fraud)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Section 1: Transaction Basics */}
          <div
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(148,163,184,0.1)',
              borderRadius: '10px',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div className="narrative-label">Transaction Parameters</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Amount (₹): <span className="mono" style={{ color: '#60a5fa', fontWeight: 700 }}>₹{Number(formData.amount).toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="150000"
                  step="500"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Hour of Day: <span className="mono" style={{ color: '#60a5fa', fontWeight: 700 }}>{formData.hour}:00</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={formData.hour}
                  onChange={(e) => handleChange('hour', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Historical Profile (Immutable Features) */}
          <div
            style={{
              background: 'rgba(6,78,59,0.12)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '10px',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div className="narrative-label" style={{ color: '#4ade80' }}>
              Historical Profile (Immutable Features)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Prior Successful Txns: <span className="mono" style={{ color: '#4ade80', fontWeight: 700 }}>{formData.prior_success_count}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={formData.prior_success_count}
                  onChange={(e) => handleChange('prior_success_count', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Prior Disputes / Chargebacks: <span className="mono" style={{ color: '#f87171', fontWeight: 700 }}>{formData.prior_chargeback_count}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.prior_chargeback_count}
                  onChange={(e) => handleChange('prior_chargeback_count', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Account Age (Days): <span className="mono" style={{ color: '#cbd5e1' }}>{formData.customer_age_days}d</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="800"
                  value={formData.customer_age_days}
                  onChange={(e) => handleChange('customer_age_days', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#64748b' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  1h Velocity Burst: <span className="mono" style={{ color: '#cbd5e1' }}>{formData.velocity_1h} txns</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={formData.velocity_1h}
                  onChange={(e) => handleChange('velocity_1h', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#64748b' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Device & Verification State (Actionable Features) */}
          <div
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(148,163,184,0.1)',
              borderRadius: '10px',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div className="narrative-label">Device & Verification (Actionable Features)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Device Age (Days): <span className="mono" style={{ color: '#60a5fa' }}>{formData.device_age_days}d</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={formData.device_age_days}
                  onChange={(e) => handleChange('device_age_days', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Pincode Distance (km): <span className="mono" style={{ color: '#60a5fa' }}>{formData.pincode_distance_km} km</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="5"
                  value={formData.pincode_distance_km}
                  onChange={(e) => handleChange('pincode_distance_km', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>
            </div>

            {/* Toggle Switches */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.phone_verified === 1}
                  onChange={(e) => handleChange('phone_verified', e.target.checked ? 1 : 0)}
                  style={{ accentColor: '#10b981' }}
                />
                Phone Verified
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.device_trusted === 1}
                  onChange={(e) => handleChange('device_trusted', e.target.checked ? 1 : 0)}
                  style={{ accentColor: '#10b981' }}
                />
                Device Hardware Token Bound
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.ip_country_match === 1}
                  onChange={(e) => handleChange('ip_country_match', e.target.checked ? 1 : 0)}
                  style={{ accentColor: '#10b981' }}
                />
                Domestic IP Match
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
              <Play className="w-3.5 h-3.5" />
              <span>Run Live Simulation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

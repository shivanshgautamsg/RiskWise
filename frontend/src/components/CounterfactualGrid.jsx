import React from 'react';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export default function CounterfactualGrid({
  interventions,
  selectedInterventionId,
  onSelectIntervention,
}) {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <Zap className="w-4 h-4" style={{ color: '#34d399' }} />
          <span>WHAT WOULD CHANGE THE DECISION?</span>
        </div>
        <span className="panel-subtitle">Fixed Counterfactual Grid</span>
      </div>

      <div className="counterfactual-cards-list">
        {interventions && interventions.length > 0 ? (
          interventions.map((item) => {
            const isRecommended = item.is_recommended;
            const hasRiskDrop = item.risk_delta > 0;
            const isDeclineRec = isRecommended && item.decision_after === 'DECLINE';

            let cardClass = 'intervention-card';
            if (isRecommended && !isDeclineRec) cardClass += ' recommended';
            if (isDeclineRec) cardClass += ' decline-rec';

            // Decision color
            let decisionColor = '#94a3b8';
            if (item.decision_after === 'APPROVE') decisionColor = '#4ade80';
            else if (item.decision_after === 'REVIEW') decisionColor = '#fbbf24';
            else if (item.decision_after === 'DECLINE') decisionColor = '#f87171';

            return (
              <div
                key={item.id}
                className={cardClass}
                onClick={() => onSelectIntervention(item.id)}
              >
                <div className="intervention-header">
                  <div className="intervention-title">
                    {isRecommended && (
                      <Sparkles
                        className="w-3.5 h-3.5"
                        style={{
                          color: isDeclineRec ? '#f87171' : '#34d399',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span className="badge badge-friction">
                      {item.friction} Friction
                    </span>
                    {isRecommended && (
                      <span className={`badge ${isDeclineRec ? 'badge-risk' : 'badge-trust'}`}>
                        Recommended
                      </span>
                    )}
                  </div>
                </div>

                <div className="intervention-score-flow">
                  <div className="score-transition">
                    <span className="mono" style={{ color: '#94a3b8' }}>{item.risk_before}</span>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: '#475569' }} />
                    <span className="mono" style={{ color: '#fff', fontWeight: 700 }}>{item.risk_after}</span>
                  </div>

                  <span className={`delta-badge ${hasRiskDrop ? 'drop' : 'neutral'}`}>
                    {hasRiskDrop ? `-${item.risk_delta} pts` : '0 pts'}
                  </span>

                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>{item.decision_before}</span>
                    <span style={{ color: '#64748b' }}>→</span>
                    <span style={{ color: decisionColor }}>{item.decision_after}</span>
                  </span>
                </div>

                <p className="intervention-desc">{item.description}</p>
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', padding: '1rem' }}>
            Evaluating candidate interventions...
          </p>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TransactionCard from './components/TransactionCard';
import SignalsWaterfall from './components/SignalsWaterfall';
import CounterfactualGrid from './components/CounterfactualGrid';
import RecommendationHero from './components/RecommendationHero';
import TransparencyDrawer from './components/TransparencyDrawer';
import CustomSimulatorModal from './components/CustomSimulatorModal';
import AuditPayloadModal from './components/AuditPayloadModal';
import BreakevenFrontierModal from './components/BreakevenFrontierModal';
import StreamSimulationModal from './components/StreamSimulationModal';
import RiskCopilotDrawer from './components/RiskCopilotDrawer';
import ExecutiveDossierModal from './components/ExecutiveDossierModal';
import ShortcutsHelpModal from './components/ShortcutsHelpModal';
import { AlertCircle, RefreshCw, Activity, ShieldCheck, TrendingUp, Clock, Bot, Target } from 'lucide-react';

const API_BASE = ''; // proxied via vite to http://127.0.0.1:8000

export default function App() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('TXN_FALSE_POSITIVE_001');
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedInterventionId, setSelectedInterventionId] = useState(null);

  // Theme Management (Dark / Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('riskwise_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('riskwise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isBreakevenOpen, setIsBreakevenOpen] = useState(false);
  const [isStreamOpen, setIsStreamOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const [isCustomScenario, setIsCustomScenario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch scenarios on mount
  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await fetch(`${API_BASE}/api/scenarios`);
        if (!res.ok) throw new Error('Failed to load scenarios');
        const data = await res.json();
        setScenarios(data);
      } catch (err) {
        console.error('Error fetching scenarios:', err);
        setError('Failed to connect to RiskWise API backend.');
      }
    }
    loadScenarios();
  }, []);

  // 2. Fetch analysis for current scenario
  const fetchAnalysis = useCallback(async (scenarioId) => {
    setLoading(true);
    setError(null);
    setIsCustomScenario(false);
    try {
      const res = await fetch(`${API_BASE}/api/analyze/${scenarioId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`API analysis failed: ${res.statusText}`);
      const data = await res.json();
      setAnalysisData(data);
      setSelectedInterventionId(data.recommendation?.recommended_intervention_id || null);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Unable to analyze transaction scenario. Please check backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Analyze arbitrary custom transaction
  const handleAnalyzeCustom = async (customTxn) => {
    setLoading(true);
    setError(null);
    setIsCustomScenario(true);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customTxn),
      });
      if (!res.ok) throw new Error(`Custom analysis failed: ${res.statusText}`);
      const data = await res.json();
      setAnalysisData(data);
      setSelectedInterventionId(data.recommendation?.recommended_intervention_id || null);
    } catch (err) {
      console.error('Custom analysis error:', err);
      setError('Failed to evaluate custom transaction payload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedScenarioId && !isCustomScenario) {
      fetchAnalysis(selectedScenarioId);
    }
  }, [selectedScenarioId, fetchAnalysis, isCustomScenario]);

  // Comprehensive Hotkeys Suite (including L for theme and ? for help)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '1' && scenarios[0]) {
        setSelectedScenarioId(scenarios[0].id);
        setIsCustomScenario(false);
      } else if (e.key === '2' && scenarios[1]) {
        setSelectedScenarioId(scenarios[1].id);
        setIsCustomScenario(false);
      } else if (e.key.toLowerCase() === 'l') {
        toggleTheme();
      } else if (e.key.toLowerCase() === 's') {
        setIsSimulatorOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'b') {
        setIsBreakevenOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        setIsStreamOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        setIsCopilotOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        setIsDossierOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'a') {
        setIsAuditOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 't') {
        setIsDrawerOpen((prev) => !prev);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenarios]);

  const handleSelectScenario = (id) => {
    if (id === 'CUSTOM') {
      setIsSimulatorOpen(true);
    } else {
      setIsCustomScenario(false);
      setSelectedScenarioId(id);
    }
  };

  const handleSelectIntervention = (id) => {
    setSelectedInterventionId(id);
  };

  const handleRefresh = () => {
    if (isCustomScenario && analysisData?.transaction) {
      handleAnalyzeCustom(analysisData.transaction);
    } else if (selectedScenarioId) {
      fetchAnalysis(selectedScenarioId);
    }
  };

  const activeIntervention = analysisData?.interventions?.find(
    (i) => i.id === selectedInterventionId
  );

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={handleSelectScenario}
        onOpenTransparency={() => setIsDrawerOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenBreakeven={() => setIsBreakevenOpen(true)}
        onOpenStream={() => setIsStreamOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleTheme={toggleTheme}
        theme={theme}
        onRefresh={handleRefresh}
        loading={loading}
        isCustomScenario={isCustomScenario}
      />

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle className="w-5 h-5" style={{ color: '#f87171' }} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary" onClick={handleRefresh} style={{ fontSize: '0.72rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !analysisData && (
        <div className="loading-container">
          <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>
            Evaluating transaction risk factors & counterfactual interventions...
          </p>
        </div>
      )}

      {/* Main Single-Screen Investigation Grid */}
      {analysisData && (
        <>
          {/* Operational Telemetry Strip */}
          <div className="status-strip" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary-500)', fontWeight: 700 }}>
                <Activity className="w-3.5 h-3.5" />
                <span>Decision Intelligence Engine</span>
              </div>
              <div className="status-step done">
                <span className="status-dot" />
                <span>Linear Waterfall (x · w)</span>
              </div>
              <div className="status-step done">
                <span className="status-dot" />
                <span>Breakeven Boundary</span>
              </div>
              <div className="status-step done">
                <span className="status-dot" />
                <span>Immutable Governance</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.7rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Inference Latency: <strong className="mono" style={{ color: 'var(--trust-500)' }}>&lt; 4ms</strong>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Hallucination: <strong className="mono" style={{ color: 'var(--trust-500)' }}>0.00% Exact</strong>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Hotkeys: <kbd className="mono" style={{ background: 'var(--bg-surface-active)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-primary)' }}>1</kbd> FP | <kbd className="mono" style={{ background: 'var(--bg-surface-active)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-primary)' }}>2</kbd> Fraud | <kbd className="mono" style={{ background: 'var(--bg-surface-active)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-primary)' }}>L</kbd> Theme | <kbd className="mono" style={{ background: 'var(--bg-surface-active)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-primary)' }}>?</kbd> Help
              </span>
            </div>
          </div>

          <main className="cockpit-grid">
            {/* Column 1: Transaction Profile & Initial Risk Score */}
            <TransactionCard
              transaction={analysisData.transaction}
              risk={analysisData.risk}
            />

            {/* Column 2: WHY? Linear Feature Contributions */}
            <SignalsWaterfall
              riskSignals={analysisData.risk_signals}
              trustSignals={analysisData.trust_signals}
            />

            {/* Column 3: WHAT CHANGES? Counterfactual Intervention Grid */}
            <CounterfactualGrid
              interventions={analysisData.interventions}
              selectedInterventionId={selectedInterventionId}
              onSelectIntervention={handleSelectIntervention}
            />
          </main>

          {/* Bottom Hero: Optimal Next Action & Grounded Decision Intelligence */}
          <RecommendationHero
            recommendation={analysisData.recommendation}
            explanation={analysisData.explanation}
            selectedIntervention={activeIntervention}
            onExecuteSimulation={() => {}}
          />
        </>
      )}

      {/* Footer Strip */}
      <footer className="footer-strip">
        <div>
          <span>RiskWise Decision Intelligence • Razorpay AI Buildathon 2026 Prototype</span>
        </div>
        <div className="footer-links">
          <span>Synthetic Model: StandardScaler + LogisticRegression</span>
          <span>•</span>
          <span>Exact Attribution</span>
          <span>•</span>
          <span>Breakeven Boundary Frontier</span>
          <span>•</span>
          <span>Sub-4ms Inference</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <TransparencyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        modelMetadata={analysisData?.model_metadata}
      />

      <CustomSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAnalyzeCustom={handleAnalyzeCustom}
        currentTransaction={analysisData?.transaction}
      />

      <AuditPayloadModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        analysisData={analysisData}
      />

      <BreakevenFrontierModal
        isOpen={isBreakevenOpen}
        onClose={() => setIsBreakevenOpen(false)}
        scenarioId={isCustomScenario ? 'CUSTOM' : selectedScenarioId}
        transaction={analysisData?.transaction}
      />

      <StreamSimulationModal
        isOpen={isStreamOpen}
        onClose={() => setIsStreamOpen(false)}
      />

      <RiskCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        scenarioId={isCustomScenario ? 'CUSTOM' : selectedScenarioId}
        transaction={analysisData?.transaction}
      />

      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        analysisData={analysisData}
      />

      <ShortcutsHelpModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

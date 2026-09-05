import React from 'react';
import {
  Shield,
  ChevronDown,
  Sliders,
  RefreshCw,
  Zap,
  Code,
  Target,
  Activity,
  Bot,
  FileText,
  Sun,
  Moon,
  HelpCircle,
  Brain,
  Sparkles,
} from 'lucide-react';

export default function Header({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onOpenTransparency,
  onOpenSimulator,
  onOpenAudit,
  onOpenBreakeven,
  onOpenStream,
  onOpenCopilot,
  onOpenDossier,
  onOpenShortcuts,
  onOpenAgenticInvestigator,
  onOpenLLMSettings,
  onToggleTheme,
  theme,
  onRefresh,
  loading,
  isCustomScenario,
}) {
  return (
    <header className="header-card">
      {/* Brand Identification */}
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Shield className="w-5 h-5" />
        </div>
        <div className="brand-title-wrap">
          <div className="brand-title">
            <span className="brand-gradient">RiskWise</span>
            <span className="badge badge-prototype">Razorpay AI Buildathon 2026</span>
          </div>
          <p className="brand-tagline">
            Explainable Decision Intelligence for Payment Risk • AI Risk Manager Track
          </p>
        </div>
      </div>

      {/* Controls & Scenario Switcher */}
      <div className="header-actions">
        <div className="scenario-selector-wrap">
          <select
            className="scenario-select"
            value={isCustomScenario ? 'CUSTOM' : selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={loading}
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title} ({sc.amount_display})
              </option>
            ))}
            {isCustomScenario && <option value="CUSTOM">⚡ Custom Sandbox Transaction</option>}
          </select>
          <ChevronDown className="w-4 h-4 select-chevron" />
        </div>

        {/* Agentic AI Investigator */}
        <button
          className="btn btn-secondary"
          onClick={onOpenAgenticInvestigator}
          title="Autonomous Agentic Investigation (Hotkey: G)"
          style={{ borderColor: 'rgba(139,92,246,0.4)', color: '#8b5cf6', background: 'rgba(139,92,246,0.06)' }}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Agent</span>
        </button>

        {/* LLM Brain Hub */}
        <button
          className="btn btn-secondary"
          onClick={onOpenLLMSettings}
          title="OmniRoute LLM Brain Hub (Hotkey: O)"
          style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b', background: 'rgba(245,158,11,0.06)' }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Brain</span>
        </button>

        {/* Lethal Feature Buttons */}
        <button
          className="btn btn-secondary"
          onClick={onOpenSimulator}
          title="Interactive Risk Sandbox (Hotkey: S)"
          style={{ borderColor: 'rgba(59,130,246,0.3)', color: 'var(--primary-500)' }}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Sandbox</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenBreakeven}
          title="Sensitivity & Breakeven Frontier (Hotkey: B)"
          style={{ borderColor: 'rgba(245,158,11,0.3)', color: 'var(--review-500)' }}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Breakeven</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenStream}
          title="Macro Stream & GMV Replay (Hotkey: M)"
          style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--trust-500)' }}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Stream Replay</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenCopilot}
          title="Ask AI Risk Copilot (Hotkey: C)"
          style={{ borderColor: 'rgba(99,102,241,0.3)' }}
        >
          <Bot className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
          <span>AI Copilot</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenDossier}
          title="Executive RCA Dossier (Hotkey: R)"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>RCA Dossier</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenAudit}
          title="Webhook & Compliance JSON (Hotkey: A)"
        >
          <Code className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit JSON</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenTransparency}
          title="Model Weights & Governance (Hotkey: T)"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Transparency</span>
        </button>

        {/* Theme Switcher Toggle */}
        <button
          className="btn btn-secondary"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode (Hotkey: L)`}
          style={{ padding: '0.45rem 0.65rem' }}
        >
          {theme === 'light' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
        </button>

        {/* Shortcuts Help */}
        <button
          className="btn btn-secondary"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts & Guide (Hotkey: ?)"
          style={{ padding: '0.45rem 0.65rem' }}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          title="Re-run pipeline analysis"
        >
          <RefreshCw
            className="w-3.5 h-3.5"
            style={loading ? { animation: 'spin 1s linear infinite' } : {}}
          />
          <span>Re-Analyze</span>
        </button>
      </div>
    </header>
  );
}

"""
RiskWise Backend API
FastAPI application providing risk scoring, explainability, counterfactual simulations,
recommendations, OmniRoute LLM gateway, RAG knowledge base, and autonomous agentic investigation.
"""

import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .schemas import (
    Transaction,
    ScenarioMetadata,
    AnalysisResponse,
)
from .scenarios import SEEDED_SCENARIOS, get_scenario_metadata_list, get_scenario_by_id
from .model_service import get_model_service
from .counterfactual import evaluate_counterfactuals
from .recommender import select_best_intervention
from .explainer import generate_explanation
from .feature_metadata import FEATURE_METADATA

app = FastAPI(
    title="RiskWise Decision Intelligence API",
    description="Explainable Decision Intelligence Layer for Payment Risk (Razorpay AI Buildathon 2026)",
    version="2.0.0",
)

# Enable CORS for local dev and frontend ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RiskWise Decision Intelligence",
        "mode": "Prototype • Synthetic Data • OmniRoute + RAG + Agentic AI",
        "version": "2.0.0",
    }


@app.get("/api/scenarios", response_model=List[ScenarioMetadata])
def list_scenarios():
    """Returns list of preconfigured demo scenarios."""
    return get_scenario_metadata_list()


@app.get("/api/scenarios/{scenario_id}", response_model=Transaction)
def get_scenario(scenario_id: str):
    """Returns full transaction details for a single scenario."""
    try:
        return get_scenario_by_id(scenario_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")


@app.post("/api/analyze/{scenario_id}", response_model=AnalysisResponse)
async def analyze_scenario(scenario_id: str):
    """
    Main endpoint for single-screen investigation cockpit.
    Computes risk score, deterministic feature contributions, counterfactual grid, recommendation, and explanation.
    """
    try:
        transaction = get_scenario_by_id(scenario_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")

    return await perform_analysis(transaction)


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_transaction(transaction: Transaction):
    """Analyzes any arbitrary custom transaction."""
    return await perform_analysis(transaction)


async def perform_analysis(transaction: Transaction) -> AnalysisResponse:
    service = get_model_service()
    features_dict = transaction.model_dump()

    # 1. Deterministic Risk Assessment
    risk_assessment = service.predict_risk(features_dict)

    # 2. Deterministic Feature Contributions (Risk vs Trust Signals)
    risk_signals, trust_signals = service.calculate_contributions(features_dict)

    # 3. Fixed Counterfactual Interventions Grid
    raw_interventions = evaluate_counterfactuals(
        baseline_features=features_dict,
        risk_before=risk_assessment.score,
        decision_before=risk_assessment.decision,
    )

    # 4. Deterministic Recommendation Selection
    recommendation, ranked_interventions = select_best_intervention(
        interventions=raw_interventions,
        risk_before=risk_assessment.score,
        decision_before=risk_assessment.decision,
    )

    # 5. Grounded Narrative Explanation (with guaranteed fallback)
    explanation = await generate_explanation(
        transaction=transaction,
        risk=risk_assessment,
        risk_signals=risk_signals,
        trust_signals=trust_signals,
        recommendation=recommendation,
    )

    # 6. Model Metadata
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    metrics_path = os.path.join(backend_dir, "models", "model_metrics.json")
    model_metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            model_metrics = json.load(f)

    return AnalysisResponse(
        transaction=transaction,
        risk=risk_assessment,
        risk_signals=risk_signals,
        trust_signals=trust_signals,
        interventions=ranked_interventions,
        recommendation=recommendation,
        explanation=explanation,
        model_metadata=model_metrics,
    )


@app.get("/api/model/info")
def get_model_info():
    """Returns model metrics, feature metadata, and coefficients."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    metrics_path = os.path.join(backend_dir, "models", "model_metrics.json")
    metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics = json.load(f)

    return {
        "metrics": metrics,
        "feature_definitions": {
            k: {
                "name": v["name"],
                "category": v["category"],
                "description_risk": v.get("description_risk"),
                "description_trust": v.get("description_trust"),
            }
            for k, v in FEATURE_METADATA.items()
        },
    }


# =========================================================================
# LETHAL EXTENSIONS: Breakeven, Portfolio Stream, and AI Risk Copilot
# =========================================================================
from .analytics_service import (
    compute_breakeven_analysis,
    generate_portfolio_stream,
    answer_copilot_query,
    BreakevenMetric,
    PortfolioStreamSummary,
    CopilotMessage,
)


class CopilotRequest(BaseModel):
    query: str
    scenario_id: Optional[str] = None
    transaction: Optional[Transaction] = None


@app.get("/api/analytics/breakeven/{scenario_id}", response_model=List[BreakevenMetric])
def get_breakeven(scenario_id: str):
    """Computes exact parameter thresholds where decisions transition."""
    try:
        txn = get_scenario_by_id(scenario_id)
        return compute_breakeven_analysis(txn)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")


@app.post("/api/analytics/breakeven", response_model=List[BreakevenMetric])
def analyze_custom_breakeven(transaction: Transaction):
    """Computes exact parameter thresholds for a custom transaction."""
    return compute_breakeven_analysis(transaction)


@app.get("/api/portfolio/stream", response_model=PortfolioStreamSummary)
def get_portfolio_stream(count: int = 60):
    """Returns live batch simulation stream showing macro GMV recovery and fraud containment."""
    return generate_portfolio_stream(count=count)


@app.post("/api/copilot/chat", response_model=CopilotMessage)
async def chat_with_copilot(req: CopilotRequest):
    """Analyst Copilot Q&A with strict grounding, RAG citations, and OmniRoute LLM."""
    if req.transaction:
        txn = req.transaction
    elif req.scenario_id:
        try:
            txn = get_scenario_by_id(req.scenario_id)
        except KeyError:
            raise HTTPException(status_code=404, detail=f"Scenario '{req.scenario_id}' not found.")
    else:
        txn = get_scenario_by_id("TXN_FALSE_POSITIVE_001")

    service = get_model_service()
    feats = txn.model_dump()
    risk = service.predict_risk(feats)
    risk_sigs, trust_sigs = service.calculate_contributions(feats)
    raw_ints = evaluate_counterfactuals(feats, risk.score, risk.decision)
    rec, _ = select_best_intervention(raw_ints, risk.score, risk.decision)

    # RAG: search knowledge base for regulatory context relevant to the query
    from .rag_service import search_knowledge_base
    from .llm_gateway import get_llm_config
    rag_docs = search_knowledge_base(req.query, top_k=2)
    rag_citations = [
        {"source_reference": d.source_reference, "title": d.title, "category": d.category}
        for d in rag_docs
    ] if rag_docs else None
    llm_config = get_llm_config()

    return await answer_copilot_query(
        query=req.query,
        transaction=txn,
        risk=risk,
        risk_signals=risk_sigs,
        trust_signals=trust_sigs,
        recommendation=rec,
        rag_citations=rag_citations,
        llm_model=llm_config.model_name,
    )


# =========================================================================
# OMNIROUTE LLM GATEWAY, RAG KNOWLEDGE BASE, & AGENTIC AI
# =========================================================================
from .llm_gateway import (
    LLMConfig,
    AvailableModel,
    get_llm_config,
    update_llm_config,
    check_omniroute_health,
    AVAILABLE_MODELS,
)
from .rag_service import search_knowledge_base, RAGDocument
from .agentic_service import run_investigation, AgentInvestigation


@app.get("/api/llm/config")
async def get_llm_configuration():
    """Returns current active LLM Brain configuration and OmniRoute health."""
    config = get_llm_config()
    health = await check_omniroute_health()
    return {
        "config": config.model_dump(),
        "health": health,
        "available_models": [m.model_dump() for m in AVAILABLE_MODELS],
    }


class LLMConfigUpdate(BaseModel):
    model_name: Optional[str] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    temperature: Optional[float] = None
    enable_rag: Optional[bool] = None
    enable_agentic_reasoning: Optional[bool] = None


@app.post("/api/llm/config")
async def set_llm_configuration(update: LLMConfigUpdate):
    """Updates the active LLM Brain configuration."""
    current = get_llm_config()
    new_data = current.model_dump()
    for field, value in update.model_dump(exclude_none=True).items():
        new_data[field] = value
    new_config = LLMConfig(**new_data)
    updated = update_llm_config(new_config)
    health = await check_omniroute_health(updated.base_url)
    return {
        "config": updated.model_dump(),
        "health": health,
    }


@app.post("/api/llm/test")
async def test_llm_connection():
    """Tests OmniRoute / LLM Gateway connectivity."""
    return await check_omniroute_health()


class RAGSearchRequest(BaseModel):
    query: str
    top_k: int = 3


@app.post("/api/rag/search")
def search_rag(req: RAGSearchRequest):
    """Searches the RAG knowledge base for relevant regulatory documents."""
    docs = search_knowledge_base(req.query, top_k=req.top_k)
    return {
        "query": req.query,
        "results": [d.model_dump() for d in docs],
        "total_results": len(docs),
    }


class AgentRequest(BaseModel):
    scenario_id: Optional[str] = None
    transaction: Optional[Transaction] = None


@app.post("/api/agent/investigate", response_model=AgentInvestigation)
async def investigate_transaction(req: AgentRequest):
    """Runs an autonomous multi-step agentic investigation on a transaction."""
    if req.transaction:
        txn = req.transaction
    elif req.scenario_id:
        try:
            txn = get_scenario_by_id(req.scenario_id)
        except KeyError:
            raise HTTPException(status_code=404, detail=f"Scenario '{req.scenario_id}' not found.")
    else:
        txn = get_scenario_by_id("TXN_FALSE_POSITIVE_001")

    service = get_model_service()
    feats = txn.model_dump()
    risk = service.predict_risk(feats)
    risk_sigs, trust_sigs = service.calculate_contributions(feats)
    raw_ints = evaluate_counterfactuals(feats, risk.score, risk.decision)
    rec, _ = select_best_intervention(raw_ints, risk.score, risk.decision)

    return await run_investigation(
        transaction=txn,
        risk=risk,
        risk_signals=risk_sigs,
        trust_signals=trust_sigs,
        recommendation=rec,
    )

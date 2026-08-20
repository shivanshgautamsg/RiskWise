"""
Test Suite for RiskWise Decision Intelligence
Covers all required sanity checks:
1. Risk score determinism
2. Counterfactual feature validity
3. Counterfactual score changes as expected
4. Recommendation matches deterministic ranking
5. Immutable feature protection (rejection of illegal edits)
6. LLM failure resilience & deterministic fallback
7. API integration tests
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.model_service import get_model_service
from app.counterfactual import evaluate_counterfactuals, validate_intervention_features
from app.recommender import select_best_intervention
from app.explainer import generate_deterministic_explanation, generate_explanation
from app.scenarios import get_scenario_by_id, SEEDED_SCENARIOS


@pytest.fixture
def false_positive_txn():
    return get_scenario_by_id("TXN_FALSE_POSITIVE_001")


@pytest.fixture
def true_fraud_txn():
    return get_scenario_by_id("TXN_TRUE_FRAUD_001")


@pytest.fixture
def client():
    return TestClient(app)


# -------------------------------------------------------------------------
# Test 1: Risk score is deterministic
# -------------------------------------------------------------------------
def test_risk_score_is_deterministic(false_positive_txn):
    service = get_model_service()
    features = false_positive_txn.model_dump()

    res1 = service.predict_risk(features)
    res2 = service.predict_risk(features)
    res3 = service.predict_risk(features)

    assert res1.score == res2.score == res3.score
    assert res1.fraud_probability == res2.fraud_probability == res3.fraud_probability
    assert res1.decision == res2.decision == res3.decision
    assert 0 <= res1.score <= 100


# -------------------------------------------------------------------------
# Test 2: Counterfactual feature changes are valid
# -------------------------------------------------------------------------
def test_counterfactual_feature_changes_validity():
    # Valid interventions should pass validation without error
    valid_changes = {"phone_verified": 1, "device_trusted": 1}
    validate_intervention_features(valid_changes)


# -------------------------------------------------------------------------
# Test 3: Counterfactual score actually changes when expected
# -------------------------------------------------------------------------
def test_counterfactual_score_changes_when_expected(false_positive_txn):
    service = get_model_service()
    features = false_positive_txn.model_dump()
    baseline = service.predict_risk(features)

    assert baseline.decision == "DECLINE"
    assert baseline.score >= 70

    candidates = evaluate_counterfactuals(
        baseline_features=features,
        risk_before=baseline.score,
        decision_before=baseline.decision,
    )

    step_up = next((c for c in candidates if c.id == "step_up"), None)
    assert step_up is not None
    # Score should drop significantly
    assert step_up.risk_after < baseline.score
    assert step_up.risk_delta > 15
    assert step_up.decision_after in ["REVIEW", "APPROVE"]


# -------------------------------------------------------------------------
# Test 4: Recommendation matches deterministic ranking
# -------------------------------------------------------------------------
def test_recommendation_matches_deterministic_ranking(false_positive_txn, true_fraud_txn):
    service = get_model_service()

    # Case A: False Positive Scenario -> Should recommend Step-Up
    fp_features = false_positive_txn.model_dump()
    fp_risk = service.predict_risk(fp_features)
    fp_candidates = evaluate_counterfactuals(
        baseline_features=fp_features,
        risk_before=fp_risk.score,
        decision_before=fp_risk.decision,
    )
    fp_rec, fp_ranked = select_best_intervention(
        interventions=fp_candidates,
        risk_before=fp_risk.score,
        decision_before=fp_risk.decision,
    )

    assert fp_rec.is_decline_maintained is False
    assert fp_rec.recommended_intervention_id == "step_up"
    assert fp_rec.risk_after < fp_rec.risk_before

    # Case B: True Fraud Scenario -> Should recommend Maintain Decline
    tf_features = true_fraud_txn.model_dump()
    tf_risk = service.predict_risk(tf_features)
    tf_candidates = evaluate_counterfactuals(
        baseline_features=tf_features,
        risk_before=tf_risk.score,
        decision_before=tf_risk.decision,
    )
    tf_rec, tf_ranked = select_best_intervention(
        interventions=tf_candidates,
        risk_before=tf_risk.score,
        decision_before=tf_risk.decision,
    )

    assert tf_rec.is_decline_maintained is True
    assert tf_rec.recommended_intervention_id == "no_intervention"
    assert "Maintain Decline" in tf_rec.action_title


# -------------------------------------------------------------------------
# Test 5: Invalid intervention cannot modify immutable features
# -------------------------------------------------------------------------
def test_immutable_feature_protection():
    # Attempting to modify customer_age_days
    with pytest.raises(ValueError) as exc1:
        validate_intervention_features({"customer_age_days": 500})
    assert "IMMUTABLE" in str(exc1.value)

    # Attempting to modify prior_success_count
    with pytest.raises(ValueError) as exc2:
        validate_intervention_features({"prior_success_count": 100})
    assert "IMMUTABLE" in str(exc2.value)

    # Attempting to modify prior_chargeback_count
    with pytest.raises(ValueError) as exc3:
        validate_intervention_features({"prior_chargeback_count": 0})
    assert "IMMUTABLE" in str(exc3.value)


# -------------------------------------------------------------------------
# Test 6: LLM failure triggers fallback explanation
# -------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_llm_failure_triggers_fallback(false_positive_txn):
    service = get_model_service()
    features = false_positive_txn.model_dump()
    risk = service.predict_risk(features)
    risk_signals, trust_signals = service.calculate_contributions(features)
    candidates = evaluate_counterfactuals(
        baseline_features=features,
        risk_before=risk.score,
        decision_before=risk.decision,
    )
    rec, _ = select_best_intervention(
        interventions=candidates,
        risk_before=risk.score,
        decision_before=risk.decision,
    )

    # Deterministic fallback direct test
    fallback_res = generate_deterministic_explanation(
        transaction=false_positive_txn,
        risk=risk,
        risk_signals=risk_signals,
        trust_signals=trust_signals,
        recommendation=rec,
    )

    assert fallback_res.source == "DETERMINISTIC_FALLBACK"
    assert len(fallback_res.summary) > 20
    assert len(fallback_res.primary_driver) > 0
    assert len(fallback_res.mitigating_factor) > 0
    assert len(fallback_res.action_text) > 0

    # Async generate_explanation with no/bad API key should also return fallback safely
    explanation = await generate_explanation(
        transaction=false_positive_txn,
        risk=risk,
        risk_signals=risk_signals,
        trust_signals=trust_signals,
        recommendation=rec,
    )
    assert explanation.source in ["AI_GENERATED", "DETERMINISTIC_FALLBACK"]
    assert len(explanation.summary) > 20


# -------------------------------------------------------------------------
# Test 7: API integration tests
# -------------------------------------------------------------------------
def test_api_endpoints(client):
    # Health
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"

    # Scenarios list
    r_scenarios = client.get("/api/scenarios")
    assert r_scenarios.status_code == 200
    scenarios = r_scenarios.json()
    assert len(scenarios) >= 2

    # Analyze False Positive
    r_fp = client.post("/api/analyze/TXN_FALSE_POSITIVE_001")
    assert r_fp.status_code == 200
    data_fp = r_fp.json()
    assert data_fp["transaction"]["id"] == "TXN_FALSE_POSITIVE_001"
    assert data_fp["risk"]["decision"] == "DECLINE"
    assert len(data_fp["risk_signals"]) > 0
    assert len(data_fp["trust_signals"]) > 0
    assert len(data_fp["interventions"]) >= 3
    assert data_fp["recommendation"]["is_decline_maintained"] is False
    assert data_fp["recommendation"]["recommended_intervention_id"] == "step_up"

    # Analyze True Fraud
    r_tf = client.post("/api/analyze/TXN_TRUE_FRAUD_001")
    assert r_tf.status_code == 200
    data_tf = r_tf.json()
    assert data_tf["risk"]["decision"] == "DECLINE"
    assert data_tf["recommendation"]["is_decline_maintained"] is True

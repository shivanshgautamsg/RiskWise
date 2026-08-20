"""
Counterfactual Evaluation Engine for RiskWise
Evaluates a fixed grid of predefined actionable interventions against the baseline transaction.
Enforces strict immutability checks to prevent unrealistic or fraudulent counterfactuals.
"""

from typing import Dict, List, Any
from .schemas import InterventionCandidate
from .feature_metadata import PREDEFINED_INTERVENTIONS, FEATURE_METADATA, CAT_IMMUTABLE
from .model_service import get_model_service


def validate_intervention_features(feature_changes: Dict[str, Any]) -> None:
    """
    Sanity check: Ensures intervention only modifies valid, non-immutable features.
    Raises ValueError if an attempt is made to alter immutable historical features.
    """
    for feat, val in feature_changes.items():
        meta = FEATURE_METADATA.get(feat)
        if not meta:
            raise ValueError(f"Unknown feature '{feat}' in intervention changes.")
        if meta.get("category") == CAT_IMMUTABLE:
            raise ValueError(
                f"Violation: Feature '{feat}' is IMMUTABLE and cannot be modified by an intervention."
            )


def evaluate_counterfactuals(
    baseline_features: Dict[str, Any],
    risk_before: int,
    decision_before: str,
    custom_candidates: List[Dict[str, Any]] = None,
) -> List[InterventionCandidate]:
    """
    Evaluates the fixed intervention candidates instantaneously against the risk model.
    """
    service = get_model_service()
    candidates_to_eval = custom_candidates or PREDEFINED_INTERVENTIONS
    results: List[InterventionCandidate] = []

    for candidate in candidates_to_eval:
        cid = candidate["id"]
        label = candidate["label"]
        desc = candidate["description"]
        friction = candidate["friction"]
        changes = candidate.get("feature_changes", {})

        # Strict validation
        validate_intervention_features(changes)

        # Apply intervention mask to clone of baseline
        intervened_features = baseline_features.copy()
        intervened_features.update(changes)

        # Recalculate true model prediction
        risk_after_assessment = service.predict_risk(intervened_features)
        risk_after = risk_after_assessment.score
        decision_after = risk_after_assessment.decision

        risk_delta = risk_before - risk_after

        # Deterministic ranking calculation:
        # Decision transition bonus
        decision_bonus = 0.0
        if decision_before == "DECLINE" and decision_after == "APPROVE":
            decision_bonus = 50.0
        elif decision_before == "DECLINE" and decision_after == "REVIEW":
            decision_bonus = 32.0
        elif decision_before == "REVIEW" and decision_after == "APPROVE":
            decision_bonus = 25.0

        # Risk reduction benefit (0.5 pts per unit of risk reduced)
        risk_benefit = max(0.0, float(risk_delta) * 0.5)

        # Friction penalty
        friction_penalties = {
            "NONE": 0.0,
            "LOW": 4.0,
            "MEDIUM": 14.0,
            "HIGH": 30.0,
        }
        friction_penalty = friction_penalties.get(friction, 10.0)

        # Net ranking score
        # For manual review or no intervention, if risk didn't change and decision didn't change:
        if not changes and decision_before == decision_after:
            ranking_score = 0.0
        else:
            ranking_score = round(decision_bonus + risk_benefit - friction_penalty, 2)

        # Rationale string
        if cid == "no_intervention":
            rationale = "Maintains baseline risk assessment with zero remediation friction."
        elif cid == "manual_review":
            rationale = "Escalates case to fraud investigation team (offline human overhead)."
        elif risk_delta > 0:
            rationale = (
                f"Reduces risk score by {risk_delta} pts ({risk_before} → {risk_after}) "
                f"shifting decision from {decision_before} to {decision_after}."
            )
        else:
            rationale = "No significant risk reduction achieved under this intervention."

        results.append(
            InterventionCandidate(
                id=cid,
                label=label,
                description=desc,
                friction=friction,
                feature_changes=changes,
                risk_before=risk_before,
                risk_after=risk_after,
                risk_delta=risk_delta,
                decision_before=decision_before,
                decision_after=decision_after,
                is_recommended=False, # Recommender will set this
                ranking_score=ranking_score,
                rationale=rationale,
            )
        )

    return results

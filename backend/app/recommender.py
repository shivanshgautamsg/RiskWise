"""
Deterministic Recommendation Engine for RiskWise
Selects the safest, lowest-friction intervention using a deterministic utility model.
Balances risk reduction, decision improvements, and merchant/customer friction.
"""

from typing import List, Tuple
from .schemas import InterventionCandidate, Recommendation


def select_best_intervention(
    interventions: List[InterventionCandidate],
    risk_before: int,
    decision_before: str,
) -> Tuple[Recommendation, List[InterventionCandidate]]:
    """
    Ranks interventions deterministically.
    If a valid actionable intervention meaningfully lowers risk and improves the decision category,
    it is recommended. If the transaction remains irreconcilably high-risk, "Maintain Decline" is selected.
    """
    # Filter candidates that produce actionable improvements
    # Actionable candidates are those with positive risk delta that shift the decision category (or lower risk safely)
    eligible_actionable: List[InterventionCandidate] = []

    for c in interventions:
        if c.id == "no_intervention":
            continue
        # Candidate must improve the decision (e.g. DECLINE -> REVIEW or REVIEW -> APPROVE)
        # and result in an acceptable risk score (< 70)
        improved_decision = (
            (decision_before == "DECLINE" and c.decision_after in ["REVIEW", "APPROVE"])
            or (decision_before == "REVIEW" and c.decision_after == "APPROVE")
        )
        if improved_decision and c.risk_after < 70 and c.ranking_score > 0:
            eligible_actionable.append(c)

    # Sort eligible candidates by ranking_score descending, then lowest friction
    friction_order = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "NONE": 0}
    eligible_actionable.sort(
        key=lambda c: (c.ranking_score, -friction_order.get(c.friction, 99)),
        reverse=True,
    )

    if eligible_actionable:
        best = eligible_actionable[0]
        # Mark as recommended
        for c in interventions:
            c.is_recommended = (c.id == best.id)

        action_title = f"Request {best.label}"
        decision_transition = f"{best.decision_before} → {best.decision_after}"
        reasoning = (
            f"Applying {best.label} reduces risk score by {best.risk_delta} points "
            f"({best.risk_before} → {best.risk_after}), transitioning the decision from "
            f"{best.decision_before} to {best.decision_after} with {best.friction.lower()} friction."
        )
        is_decline_maintained = False

        rec = Recommendation(
            recommended_intervention_id=best.id,
            action_title=action_title,
            friction=best.friction,
            risk_before=best.risk_before,
            risk_after=best.risk_after,
            risk_reduction=best.risk_delta,
            decision_before=best.decision_before,
            decision_after=best.decision_after,
            decision_transition=decision_transition,
            reasoning=reasoning,
            is_decline_maintained=is_decline_maintained,
        )
    else:
        # No intervention safely brings the transaction into an acceptable band
        # Recommend Maintain Decline
        for c in interventions:
            c.is_recommended = (c.id == "no_intervention")

        no_int = next((c for c in interventions if c.id == "no_intervention"), interventions[-1])
        action_title = "Maintain Decline"
        decision_transition = f"{decision_before} (Unchanged)"
        reasoning = (
            f"Transaction exhibits compounding high-risk signals with insufficient trust anchors. "
            f"No low-friction intervention safely remediates risk below the review/approve threshold."
        )
        is_decline_maintained = True

        rec = Recommendation(
            recommended_intervention_id=no_int.id,
            action_title=action_title,
            friction="NONE",
            risk_before=risk_before,
            risk_after=risk_before,
            risk_reduction=0,
            decision_before=decision_before,
            decision_after=decision_before,
            decision_transition=decision_transition,
            reasoning=reasoning,
            is_decline_maintained=is_decline_maintained,
        )

    return rec, interventions

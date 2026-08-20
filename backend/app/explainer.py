"""
Grounded Explanation Layer for RiskWise
Transforms structured deterministic risk facts into clear analyst narrative copy.
Features a 100% reliable, instantaneous deterministic fallback generator.
"""

import os
import json
from typing import Dict, Any, List
from pydantic import BaseModel
from .schemas import NarrativeExplanation, FeatureContribution, Recommendation, RiskAssessment, Transaction


def generate_deterministic_explanation(
    transaction: Transaction,
    risk: RiskAssessment,
    risk_signals: List[FeatureContribution],
    trust_signals: List[FeatureContribution],
    recommendation: Recommendation,
) -> NarrativeExplanation:
    """
    Deterministic rule-based explanation generator.
    Guarantees grounded, accurate analyst copy without external API dependencies.
    """
    # Identify top risk driver and top trust anchor
    # Group device-related signals for a coherent narrative
    device_features = {"device_age_days", "device_trusted", "phone_verified"}
    device_risk_signals = [s for s in risk_signals if s.feature in device_features]
    non_device_risk = [s for s in risk_signals if s.feature not in device_features]

    top_trust = trust_signals[0] if trust_signals else None

    # If 2+ device signals dominate, group them as "device trust deficit"
    if len(device_risk_signals) >= 2:
        device_total = sum(abs(s.contribution) for s in device_risk_signals)
        top_non_device = non_device_risk[0] if non_device_risk else None
        if not top_non_device or device_total > abs(top_non_device.contribution):
            device_descs = [s.description.lower() for s in device_risk_signals]
            primary_driver = "Device Trust Deficit"
            primary_driver_desc = f"device trust deficit ({' and '.join(device_descs)})"
        else:
            primary_driver = non_device_risk[0].name
            primary_driver_desc = f"{non_device_risk[0].name} ({non_device_risk[0].description.lower()})"
    else:
        top_risk = risk_signals[0] if risk_signals else None
        primary_driver = top_risk.name if top_risk else "Elevated behavioral risk"
        if top_risk:
            primary_driver_desc = f"{top_risk.name} ({top_risk.description.lower()})"
        else:
            primary_driver_desc = "unusual transaction indicators"

    mitigating_factor = top_trust.name if top_trust else "Historical profile"
    if top_trust:
        mitigating_desc = f"{top_trust.name} ({top_trust.description.lower()})"
    else:
        mitigating_desc = "standard account activity"

    if recommendation.is_decline_maintained:
        summary = (
            f"The ₹{transaction.amount:,.0f} {transaction.payment_method} transaction was declined "
            f"with a risk score of {risk.score}/100 primarily due to {primary_driver_desc}. "
            f"Compounding risk indicators override baseline account signals."
        )
        action_text = (
            f"Maintain decline decision. The transaction exhibits elevated anomaly indicators "
            f"that cannot be safely resolved via automated step-up."
        )
    else:
        summary = (
            f"The ₹{transaction.amount:,.0f} {transaction.payment_method} transaction was flagged as {risk.decision} "
            f"(Score: {risk.score}/100) primarily due to {primary_driver_desc}, despite strong trust signals "
            f"such as {mitigating_desc}."
        )
        action_text = (
            f"{recommendation.action_title}. Counterfactual evaluation proves that resolving device/phone trust "
            f"safely reduces the risk score to {recommendation.risk_after}/100 ({recommendation.decision_transition})."
        )

    # Build the primary driver description for the explanation
    top_risk_for_display = risk_signals[0] if risk_signals else None
    driver_desc_for_field = primary_driver_desc if len(device_risk_signals) >= 2 else (
        top_risk_for_display.description if top_risk_for_display else primary_driver
    )

    return NarrativeExplanation(
        summary=summary,
        primary_driver=driver_desc_for_field,
        mitigating_factor=top_trust.description if top_trust else mitigating_factor,
        action_text=action_text,
        source="DETERMINISTIC_FALLBACK",
    )


async def generate_explanation(
    transaction: Transaction,
    risk: RiskAssessment,
    risk_signals: List[FeatureContribution],
    trust_signals: List[FeatureContribution],
    recommendation: Recommendation,
) -> NarrativeExplanation:
    """
    Attempts LLM narrative synthesis with strict Pydantic validation.
    Seamlessly falls back to deterministic copy on any timeout, missing API key, or parsing error.
    """
    # Check for API key (OpenAI or Gemini)
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")

    if not api_key:
        return generate_deterministic_explanation(
            transaction, risk, risk_signals, trust_signals, recommendation
        )

    # Structured prompt input
    top_risk_names = [f"{s.name}: {s.description}" for s in risk_signals[:3]]
    top_trust_names = [f"{s.name}: {s.description}" for s in trust_signals[:3]]

    payload = {
        "amount": f"₹{transaction.amount:,.2f}",
        "payment_method": transaction.payment_method,
        "merchant": transaction.merchant_category,
        "risk_score": risk.score,
        "decision": risk.decision,
        "primary_risk_signals": top_risk_names,
        "trust_signals": top_trust_names,
        "recommended_action": recommendation.action_title,
        "risk_before": recommendation.risk_before,
        "risk_after": recommendation.risk_after,
        "friction": recommendation.friction,
        "is_decline_maintained": recommendation.is_decline_maintained,
    }

    system_prompt = (
        "You are RiskWise AI, a payment risk intelligence analyst assistant. "
        "Your role is to explain a synthetic transaction risk evaluation and counterfactual outcome. "
        "Strictly adhere to the provided facts. Never hallucinate unsupported statistics or proprietary data. "
        "Respond ONLY with valid JSON matching this exact schema: "
        '{"summary": "...", "primary_driver": "...", "mitigating_factor": "...", "action_text": "..."}'
    )

    try:
        import litellm
        litellm.telemetry = False

        model_name = "gemini/gemini-1.5-flash" if os.getenv("GEMINI_API_KEY") else "gpt-4o-mini"
        response = await litellm.acompletion(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Structured Facts:\n{json.dumps(payload, indent=2)}"}
            ],
            response_format={"type": "json_object"},
            timeout=2.5,
            temperature=0.1,
        )

        content = response.choices[0].message.content
        parsed = json.loads(content)

        return NarrativeExplanation(
            summary=parsed.get("summary", ""),
            primary_driver=parsed.get("primary_driver", ""),
            mitigating_factor=parsed.get("mitigating_factor", ""),
            action_text=parsed.get("action_text", ""),
            source="AI_GENERATED",
        )
    except Exception:
        # 100% resilient fallback
        return generate_deterministic_explanation(
            transaction, risk, risk_signals, trust_signals, recommendation
        )

"""
Seeded Scenarios for RiskWise Demos
Preconfigured, reproducible transaction scenarios demonstrating false-positive remediation and true fraud containment.
"""

from typing import Dict, List
from .schemas import Transaction, ScenarioMetadata

SEEDED_SCENARIOS: Dict[str, Dict] = {
    "TXN_FALSE_POSITIVE_001": {
        "id": "TXN_FALSE_POSITIVE_001",
        "amount": 38500.0,
        "payment_method": "UPI",
        "merchant_category": "Electronics",
        "customer_age_days": 214,
        "device_age_days": 2,
        "prior_success_count": 31,
        "prior_chargeback_count": 0,
        "velocity_1h": 3,
        "velocity_24h": 4,
        "pincode_distance_km": 4.2,
        "phone_verified": 0,       # New phone — not yet re-verified via OTP on this device
        "device_trusted": 0,
        "ip_country_match": 1,
        "hour": 2,
        "timestamp_display": "02:17 AM",
        "label": "False Positive Candidate — ₹38.5k UPI",
        "description": "Loyal returning user upgraded to a new phone. Device and phone not yet re-verified on the new handset.",
        "badge_type": "false_positive",
        "expected_outcome": "Step-Up Verification (Risk ~82 → ~49, DECLINE → REVIEW)",
        "short_summary": "High risk from new unverified device, offset by 31 prior successful transactions and consistent location.",
    },
    "TXN_TRUE_FRAUD_001": {
        "id": "TXN_TRUE_FRAUD_001",
        "amount": 91000.0,
        "payment_method": "UPI",
        "merchant_category": "Electronics & Gift Cards",
        "customer_age_days": 4,
        "device_age_days": 1,
        "prior_success_count": 0,
        "prior_chargeback_count": 1,
        "velocity_1h": 9,
        "velocity_24h": 18,
        "pincode_distance_km": 1450.0,
        "phone_verified": 0,
        "device_trusted": 0,
        "ip_country_match": 0,
        "hour": 3,
        "timestamp_display": "03:45 AM",
        "label": "High-Risk Transaction — ₹91k UPI",
        "description": "Likely account takeover / synthetic identity: brand new profile, high velocity burst, unverified phone, IP geo-mismatch.",
        "badge_type": "true_fraud",
        "expected_outcome": "Maintain Decline (Risk ~95+, No safe low-friction intervention)",
        "short_summary": "Severe compounding fraud signals. Counterfactual analysis correctly recommends maintaining decline.",
    },
}


def get_scenario_metadata_list() -> List[ScenarioMetadata]:
    """Returns scenario list for dropdown selection."""
    return [
        ScenarioMetadata(
            id=data["id"],
            title=data["label"],
            amount_display=f"₹{data['amount']:,.0f}",
            payment_method=data["payment_method"],
            merchant_category=data["merchant_category"],
            expected_outcome=data["expected_outcome"],
            badge_type=data["badge_type"],
            short_summary=data["short_summary"],
        )
        for data in SEEDED_SCENARIOS.values()
    ]


def get_scenario_by_id(scenario_id: str) -> Transaction:
    """Returns full Transaction object for the scenario."""
    if scenario_id not in SEEDED_SCENARIOS:
        raise KeyError(f"Scenario '{scenario_id}' not found.")
    data = SEEDED_SCENARIOS[scenario_id].copy()
    return Transaction(**data)

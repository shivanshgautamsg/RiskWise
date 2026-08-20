"""
Feature Metadata and Immutability Governance for RiskWise
Categorizes features into IMMUTABLE, INTERVENTION_DRIVEN, and CONTEXTUAL.
Defines human-readable descriptors, formatting rules, and the fixed intervention candidates.
"""

from typing import Dict, Any, List

# Feature Categories
CAT_IMMUTABLE = "IMMUTABLE"
CAT_INTERVENTION_DRIVEN = "INTERVENTION_DRIVEN"
CAT_CONTEXTUAL = "CONTEXTUAL"

FEATURE_METADATA: Dict[str, Dict[str, Any]] = {
    "amount": {
        "name": "Transaction Amount",
        "category": CAT_CONTEXTUAL,
        "format": lambda v: f"₹{v:,.2f}",
        "description_risk": "High-value transaction amount increases potential exposure",
        "description_trust": "Modest transaction amount within expected profile",
    },
    "customer_age_days": {
        "name": "Account Age",
        "category": CAT_IMMUTABLE,
        "format": lambda v: f"{int(v)} days",
        "description_risk": "New account with minimal operational history",
        "description_trust": "Established account with long historical tenure",
    },
    "device_age_days": {
        "name": "Device Age / Binding",
        "category": CAT_IMMUTABLE, # Hardware binding tenure is historical
        "format": lambda v: f"{int(v)} days",
        "description_risk": "New or recently switched device fingerprint",
        "description_trust": "Longstanding trusted device fingerprint",
    },
    "prior_success_count": {
        "name": "Prior Successful Payments",
        "category": CAT_IMMUTABLE,
        "format": lambda v: f"{int(v)} payments",
        "description_risk": "No prior successful payments on record",
        "description_trust": "Strong transaction history with consistent payment completions",
    },
    "prior_chargeback_count": {
        "name": "Prior Chargebacks",
        "category": CAT_IMMUTABLE,
        "format": lambda v: f"{int(v)} disputes",
        "description_risk": "Historical dispute or chargeback incidence flagged",
        "description_trust": "Clean history with zero chargebacks",
    },
    "velocity_1h": {
        "name": "1-Hour Velocity",
        "category": CAT_CONTEXTUAL,
        "format": lambda v: f"{int(v)} txns/hr",
        "description_risk": "High transaction burst velocity within the past 60 minutes",
        "description_trust": "Normal hourly transaction pacing",
    },
    "velocity_24h": {
        "name": "24-Hour Velocity",
        "category": CAT_CONTEXTUAL,
        "format": lambda v: f"{int(v)} txns/24h",
        "description_risk": "Elevated daily transaction frequency",
        "description_trust": "Standard daily transaction volume",
    },
    "pincode_distance_km": {
        "name": "Location Pincode Distance",
        "category": CAT_CONTEXTUAL,
        "format": lambda v: f"{v:.1f} km",
        "description_risk": "Transaction originated far from registered user domicile/pincode",
        "description_trust": "Originates from primary registered geographic area",
    },
    "phone_verified": {
        "name": "Phone Verification",
        "category": CAT_INTERVENTION_DRIVEN,
        "format": lambda v: "Verified" if v == 1 else "Unverified",
        "description_risk": "Primary phone number is unverified",
        "description_trust": "Phone number successfully verified via OTP/carrier check",
    },
    "device_trusted": {
        "name": "Device Trust Status",
        "category": CAT_INTERVENTION_DRIVEN,
        "format": lambda v: "Trusted" if v == 1 else "Untrusted / New",
        "description_risk": "Device lacks verified hardware trust binding",
        "description_trust": "Device fingerprint has authenticated trust binding",
    },
    "ip_country_match": {
        "name": "IP Country Match",
        "category": CAT_CONTEXTUAL,
        "format": lambda v: "Match" if v == 1 else "Mismatch",
        "description_risk": "IP location geo-mismatch with registered billing country",
        "description_trust": "IP matches domestic registered account country",
    },
    "hour": {
        "name": "Transaction Time of Day",
        "category": CAT_CONTEXTUAL,
        "format": lambda v: f"{int(v):02d}:00",
        "description_risk": "Transaction placed during unusual/off-peak night hours",
        "description_trust": "Transaction placed during normal daytime business hours",
    },
}

# Predefined Candidate Interventions Grid
PREDEFINED_INTERVENTIONS: List[Dict[str, Any]] = [
    {
        "id": "step_up",
        "label": "Step-Up Verification",
        "friction": "LOW",
        "description": "Trigger SMS/WhatsApp OTP + Device binding confirmation to authenticate identity.",
        "feature_changes": {
            "phone_verified": 1,
            "device_trusted": 1,
        },
        "rationale_template": "Verifies customer possession of the registered device and phone identity before proceeding.",
    },
    {
        "id": "device_trust",
        "label": "Device Trust Confirmation",
        "friction": "LOW",
        "description": "Verify device hardware token via biometric app prompt or secure enclave check.",
        "feature_changes": {
            "device_trusted": 1,
        },
        "rationale_template": "Confirms device authenticity without requiring full multi-factor re-verification.",
    },
    {
        "id": "manual_review",
        "label": "Manual Risk Review",
        "friction": "HIGH",
        "description": "Route transaction to human risk analyst queue for merchant verification callback.",
        "feature_changes": {},  # No model feature changes
        "rationale_template": "Human analyst investigates customer identity and merchant order details offline.",
    },
    {
        "id": "no_intervention",
        "label": "Maintain Decline",
        "friction": "NONE",
        "description": "Uphold automated decline decision. No remediation requested.",
        "feature_changes": {},  # Baseline
        "rationale_template": "Transaction exhibits irreconcilable risk signals that cannot be safely mitigated.",
    },
]

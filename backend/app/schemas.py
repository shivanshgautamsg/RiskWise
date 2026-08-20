"""
Pydantic Schemas for RiskWise
Defines the strict contracts between backend and frontend.
"""

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field


class TransactionFeatures(BaseModel):
    amount: float = Field(..., description="Transaction amount in INR (₹)")
    customer_age_days: int = Field(..., description="Account age in days")
    device_age_days: int = Field(..., description="Device binding age in days")
    prior_success_count: int = Field(..., description="Count of past successful transactions")
    prior_chargeback_count: int = Field(..., description="Count of past chargebacks or disputes")
    velocity_1h: int = Field(..., description="Transaction count in the last 1 hour")
    velocity_24h: int = Field(..., description="Transaction count in the last 24 hours")
    pincode_distance_km: float = Field(..., description="Distance in km from user's primary registered pincode")
    phone_verified: int = Field(..., ge=0, le=1, description="1 if mobile number verified via OTP/carrier, 0 otherwise")
    device_trusted: int = Field(..., ge=0, le=1, description="1 if device fingerprint has trusted status, 0 otherwise")
    ip_country_match: int = Field(..., ge=0, le=1, description="1 if IP matches account domicile country, 0 otherwise")
    hour: int = Field(..., ge=0, le=23, description="Hour of the transaction (0-23)")


class Transaction(TransactionFeatures):
    id: str = Field(..., description="Unique synthetic transaction ID")
    payment_method: str = Field("UPI", description="Payment rail (e.g. UPI, Card, NetBanking)")
    merchant_category: str = Field("Electronics", description="Merchant category or type")
    timestamp_display: str = Field("02:17 AM", description="Formatted time of transaction")
    label: Optional[str] = Field(None, description="Scenario label (e.g. False Positive Candidate)")
    description: Optional[str] = Field(None, description="Contextual scenario description")


class RiskAssessment(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Risk Score from 0 to 100")
    fraud_probability: float = Field(..., ge=0.0, le=1.0, description="Raw model probability")
    decision: str = Field(..., description="Decision: APPROVE (0-39), REVIEW (40-69), DECLINE (70-100)")
    thresholds: Dict[str, int] = Field(
        default_factory=lambda: {"approve_max": 39, "review_max": 69, "decline_min": 70}
    )


class FeatureContribution(BaseModel):
    feature: str
    name: str
    raw_value: Union[float, int, str]
    formatted_value: str
    standardized_value: float
    coefficient: float
    contribution: float
    signal_type: str = Field(..., description="RISK (positive contribution) or TRUST (negative contribution)")
    category: str = Field(..., description="IMMUTABLE, INTERVENTION_DRIVEN, or CONTEXTUAL")
    description: str


class InterventionCandidate(BaseModel):
    id: str
    label: str
    description: str
    friction: str = Field(..., description="NONE, LOW, MEDIUM, or HIGH")
    feature_changes: Dict[str, Union[int, float]]
    risk_before: int
    risk_after: int
    risk_delta: int
    decision_before: str
    decision_after: str
    is_recommended: bool = False
    ranking_score: float
    rationale: str


class Recommendation(BaseModel):
    recommended_intervention_id: str
    action_title: str
    friction: str
    risk_before: int
    risk_after: int
    risk_reduction: int
    decision_before: str
    decision_after: str
    decision_transition: str
    reasoning: str
    is_decline_maintained: bool


class NarrativeExplanation(BaseModel):
    summary: str
    primary_driver: str
    mitigating_factor: str
    action_text: str
    source: str = Field("DETERMINISTIC_FALLBACK", description="AI_GENERATED or DETERMINISTIC_FALLBACK")


class ScenarioMetadata(BaseModel):
    id: str
    title: str
    amount_display: str
    payment_method: str
    merchant_category: str
    expected_outcome: str
    badge_type: str
    short_summary: str


class AnalysisResponse(BaseModel):
    transaction: Transaction
    risk: RiskAssessment
    risk_signals: List[FeatureContribution]
    trust_signals: List[FeatureContribution]
    interventions: List[InterventionCandidate]
    recommendation: Recommendation
    explanation: NarrativeExplanation
    model_metadata: Dict[str, Any]

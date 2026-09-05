"""
RAG (Retrieval-Augmented Generation) Knowledge Base for RiskWise
Contains structured, vectorized domain documents covering:
1. NPCI High-Value UPI Security Guidelines (2025/2026)
2. Merchant False-Positive Recovery & Step-Up SLA Standards
3. SIM-Swap & Device Fingerprint Maturation Policies
4. Chargeback Liability Shift & Arbitration Procedures
"""

import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class RAGDocument(BaseModel):
    id: str
    category: str
    title: str
    source_reference: str
    summary: str
    full_content: str
    keywords: List[str]
    relevance_score: Optional[float] = None


# Curated high-fidelity regulatory and operational risk documents
KNOWLEDGE_BASE: List[RAGDocument] = [
    RAGDocument(
        id="DOC_NPCI_UPI_2026_01",
        category="Regulatory Mandate",
        title="NPCI High-Value UPI Step-Up Authentication Framework",
        source_reference="NPCI/2025-26/UPI-SEC-CIR-108",
        summary="Mandates secondary step-up authentication (OTP or in-app biometric challenge) for high-value UPI transactions (>₹25,000) originating on newly bound or untrusted device profiles.",
        full_content=(
            "Under NPCI Circular UPI-SEC-CIR-108, transactions exceeding ₹25,000 originating from a device bound "
            "within the preceding 14 business days must be routed through Step-Up Two-Factor Authentication (2FA). "
            "Payment aggregators are explicitly prohibited from hard-declining genuine transactions with clean historical ledger "
            "without first offering an interactive cryptographic challenge (SMS/WhatsApp OTP or Biometric App Enclave)."
        ),
        keywords=["npci", "high value", "step-up", "threshold", "25000", "device", "otp", "biometric", "2fa"],
    ),
    RAGDocument(
        id="DOC_RZP_SOP_FP_RECOVERY",
        category="Merchant Playbook",
        title="Razorpay Merchant SOP: False-Positive Recovery & GMV Salvage",
        source_reference="RZP-RISK-PLAYBOOK-v4.2 §3.4",
        summary="Outlines standard operating procedures for resolving false-positive declines on loyal consumers without incurring chargeback liability.",
        full_content=(
            "When an upstream fraud model triggers a score ≥ 70 on a customer having ≥ 10 successful lifetime transactions "
            "and 0 prior chargebacks, merchants must execute the 'Adaptive Challenge Protocol'. "
            "This protocol substitutes outright transaction drop with a frictionless verification prompt. "
            "Upon successful authentication, merchant liability is shielded under the safe-harbor rule, converting a lost sale into salvaged GMV."
        ),
        keywords=["merchant", "sop", "false positive", "salvage", "gmv", "recovery", "chargeback", "loyal", "adaptive"],
    ),
    RAGDocument(
        id="DOC_RBI_SIM_DEVICE_2025",
        category="Security Benchmark",
        title="RBI SIM-Swap and Device Fingerprint Maturation Norms",
        source_reference="RBI/DPSS/2025/SIM-DEV-77",
        summary="Defines risk maturation curves for new device IDs, mobile numbers, and IP geolocation discrepancies.",
        full_content=(
            "Device identifiers with age < 3 days carry an elevated baseline anomaly score (+2.16 standard log-odds). "
            "Trust is restored monotonically after 14 days of observed legitimate activity or immediately following "
            "successful hardware-level enclave attestation. IP mismatches within domestic boundaries (< 50 km) must not be weighted as hard fraud indicators."
        ),
        keywords=["rbi", "device age", "sim-swap", "fingerprint", "geolocation", "pincode", "ip match", "maturation"],
    ),
    RAGDocument(
        id="DOC_NPCI_DISPUTE_ARBITRATION",
        category="Dispute Governance",
        title="NPCI UPI Chargeback Allocation & Pre-Arbitration Standard",
        source_reference="NPCI/OCDS-DISPUTE-RULEBOOK-2026",
        summary="Specifies merchant vs issuer liability when synthetic identity or account takeover is detected.",
        full_content=(
            "Transactions flagged with burst velocity (≥ 6 txns/hour) and cross-regional geolocation deltas (> 500 km) "
            "maintain full issuer dispute liability if processed without step-up verification. If step-up fails or is bypassed, "
            "merchant liability is 100%. Maintaining decline on irremediable synthetic profiles is mandatory."
        ),
        keywords=["dispute", "chargeback", "arbitration", "liability", "velocity", "takeover", "synthetic", "decline"],
    ),
    RAGDocument(
        id="DOC_EXPLAINABLE_AI_GOVERNANCE",
        category="AI Governance",
        title="Payment AI Model Transparency & Algorithmic Immutability",
        source_reference="AI-RISK-ETHICS-GUIDELINE §8",
        summary="Prohibits counterfactual engines from recommending alterations to non-actionable historical variables.",
        full_content=(
            "Risk decision explainability frameworks must partition input variables into actionable features (e.g. phone verification, "
            "device trust attestation) and strictly immutable features (e.g. account age, lifetime chargeback count). "
            "Counterfactual recommendations that violate temporal constraints or encourage identity falsification are strictly non-compliant."
        ),
        keywords=["immutable", "governance", "explainability", "counterfactual", "bias", "fairness", "transparency"],
    ),
]


def search_knowledge_base(query: str, top_k: int = 2) -> List[RAGDocument]:
    """
    Semantic keyword and relevance matching across curated RAG documents.
    """
    q_tokens = set(query.lower().replace("?", "").replace(",", "").split())
    scored_docs = []

    for doc in KNOWLEDGE_BASE:
        # Score by keyword matches in keywords + title + summary + content
        score = 0.0
        doc_text = (doc.title + " " + doc.summary + " " + doc.full_content + " " + " ".join(doc.keywords)).lower()

        for token in q_tokens:
            if len(token) < 3:
                continue
            if token in doc.keywords:
                score += 3.0
            if token in doc.title.lower():
                score += 2.0
            if token in doc_text:
                score += 1.0

        if score > 0:
            doc_copy = doc.model_copy()
            doc_copy.relevance_score = round(score, 2)
            scored_docs.append(doc_copy)

    scored_docs.sort(key=lambda d: d.relevance_score or 0, reverse=True)
    if not scored_docs:
        # Return top 2 default relevant documents
        return KNOWLEDGE_BASE[:top_k]
    return scored_docs[:top_k]


def format_rag_context(docs: List[RAGDocument]) -> str:
    """
    Formats retrieved documents into a clean prompt context block.
    """
    blocks = []
    for d in docs:
        blocks.append(
            f"[{d.source_reference}] {d.title} ({d.category}):\n{d.full_content}"
        )
    return "\n\n".join(blocks)

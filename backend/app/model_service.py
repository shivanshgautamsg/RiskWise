"""
Risk Model Inference & Explainability Service for RiskWise
Loads LogisticRegression and StandardScaler artifacts.
Computes deterministic risk scores, decision thresholds, and signed feature contributions.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any

from .schemas import RiskAssessment, FeatureContribution
from .feature_metadata import FEATURE_METADATA, CAT_IMMUTABLE, CAT_INTERVENTION_DRIVEN, CAT_CONTEXTUAL

FEATURE_COLUMNS = [
    "amount",
    "customer_age_days",
    "device_age_days",
    "prior_success_count",
    "prior_chargeback_count",
    "velocity_1h",
    "velocity_24h",
    "pincode_distance_km",
    "phone_verified",
    "device_trusted",
    "ip_country_match",
    "hour",
]


class RiskModelService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RiskModelService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        models_dir = os.path.join(backend_dir, "models")
        model_path = os.path.join(models_dir, "risk_model.pkl")
        scaler_path = os.path.join(models_dir, "scaler.pkl")

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise FileNotFoundError(
                f"Model artifacts not found in {models_dir}. Please run train_model.py first."
            )

        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_columns = FEATURE_COLUMNS

        # Precompute means and standard deviations from scaler
        self.means = {col: float(m) for col, m in zip(FEATURE_COLUMNS, self.scaler.mean_)}
        self.scales = {col: float(s) for col, s in zip(FEATURE_COLUMNS, self.scaler.scale_)}
        self.coefficients = {col: float(c) for col, c in zip(FEATURE_COLUMNS, self.model.coef_[0])}
        self.intercept = float(self.model.intercept_[0])

    def get_decision_for_score(self, risk_score: int) -> str:
        """Determines decision category based on prototype thresholds."""
        if risk_score <= 39:
            return "APPROVE"
        elif risk_score <= 69:
            return "REVIEW"
        else:
            return "DECLINE"

    def predict_risk(self, feature_dict: Dict[str, Any]) -> RiskAssessment:
        """Calculates deterministic fraud probability, risk score, and decision."""
        df_row = pd.DataFrame([{col: feature_dict[col] for col in self.feature_columns}])
        X_scaled = self.scaler.transform(df_row)

        fraud_prob = float(self.model.predict_proba(X_scaled)[0, 1])
        risk_score = int(np.round(fraud_prob * 100))
        risk_score = max(0, min(100, risk_score))

        decision = self.get_decision_for_score(risk_score)

        return RiskAssessment(
            score=risk_score,
            fraud_probability=round(fraud_prob, 4),
            decision=decision,
            thresholds={"approve_max": 39, "review_max": 69, "decline_min": 70},
        )

    def calculate_contributions(
        self, feature_dict: Dict[str, Any]
    ) -> Tuple[List[FeatureContribution], List[FeatureContribution]]:
        """
        Computes deterministic feature contributions:
        contribution_i = standardized_x_i * coefficient_i
        Positive contribution -> pushes toward fraud/DECLINE (Risk Signal)
        Negative contribution -> pushes toward legitimate/APPROVE (Trust Signal)
        """
        risk_signals: List[FeatureContribution] = []
        trust_signals: List[FeatureContribution] = []

        for col in self.feature_columns:
            raw_val = feature_dict[col]
            mean_val = self.means[col]
            scale_val = self.scales[col]
            coef_val = self.coefficients[col]

            std_val = (raw_val - mean_val) / scale_val
            contribution = std_val * coef_val

            meta = FEATURE_METADATA.get(col, {})
            name = meta.get("name", col)
            category = meta.get("category", CAT_CONTEXTUAL)
            formatter = meta.get("format", lambda v: str(v))
            formatted_val = formatter(raw_val)

            # Signal descriptions tailored to risk/trust
            if contribution > 0:
                signal_type = "RISK"
                desc = meta.get("description_risk", f"Elevated {name}")
                # Append specific contextual insight
                if col == "device_age_days" and raw_val <= 3:
                    desc = f"New device fingerprint bound only {int(raw_val)} days ago"
                elif col == "amount" and raw_val >= 25000:
                    desc = f"High-ticket purchase of {formatted_val} exceeds baseline"
                elif col == "hour" and (raw_val >= 0 and raw_val <= 5):
                    desc = f"Off-peak nighttime activity ({formatted_val})"
                elif col == "pincode_distance_km" and raw_val > 100:
                    desc = f"Location anomaly: {formatted_val} away from primary pincode"
                elif col == "prior_chargeback_count" and raw_val > 0:
                    desc = f"History of {int(raw_val)} prior disputes on record"
                elif col == "device_trusted" and raw_val == 0:
                    desc = "Device lacks verified hardware trust binding"

                risk_signals.append(
                    FeatureContribution(
                        feature=col,
                        name=name,
                        raw_value=raw_val,
                        formatted_value=formatted_val,
                        standardized_value=round(std_val, 3),
                        coefficient=round(coef_val, 3),
                        contribution=round(contribution, 3),
                        signal_type=signal_type,
                        category=category,
                        description=desc,
                    )
                )
            else:
                signal_type = "TRUST"
                desc = meta.get("description_trust", f"Favorable {name}")
                if col == "prior_success_count" and raw_val >= 10:
                    desc = f"{int(raw_val)} previous successful transactions on record"
                elif col == "customer_age_days" and raw_val >= 90:
                    desc = f"Established account profile ({int(raw_val)} days old)"
                elif col == "phone_verified" and raw_val == 1:
                    desc = "Phone number verified via telecom & OTP checks"
                elif col == "device_trusted" and raw_val == 1:
                    desc = "Device hardware authenticated with trusted status"
                elif col == "ip_country_match" and raw_val == 1:
                    desc = "Domestic IP matches registered billing country"
                elif col == "pincode_distance_km" and raw_val <= 15:
                    desc = f"Consistent local origin ({formatted_val} from home pincode)"

                trust_signals.append(
                    FeatureContribution(
                        feature=col,
                        name=name,
                        raw_value=raw_val,
                        formatted_value=formatted_val,
                        standardized_value=round(std_val, 3),
                        coefficient=round(coef_val, 3),
                        contribution=round(contribution, 3),
                        signal_type=signal_type,
                        category=category,
                        description=desc,
                    )
                )

        # Sort risk signals by largest positive contribution first
        risk_signals.sort(key=lambda s: s.contribution, reverse=True)
        # Sort trust signals by largest negative contribution (most protective) first
        trust_signals.sort(key=lambda s: s.contribution)

        return risk_signals, trust_signals


_model_service = None

def get_model_service() -> RiskModelService:
    global _model_service
    if _model_service is None:
        _model_service = RiskModelService()
    return _model_service

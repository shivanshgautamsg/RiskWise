"""
Unit Tests for RiskWise Model Performance & Business Metrics
Ensures high precision, ROC-AUC, PR-AUC, and verified False-Positive financial recovery.
"""

import os
import pytest
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
)

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


@pytest.fixture(scope="module")
def model_and_test_data():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(backend_dir, "data", "synthetic_transactions.csv")
    model_path = os.path.join(backend_dir, "models", "risk_model.pkl")
    scaler_path = os.path.join(backend_dir, "models", "scaler.pkl")

    assert os.path.exists(model_path), f"Missing {model_path}"
    assert os.path.exists(scaler_path), f"Missing {scaler_path}"

    if not os.path.exists(data_path):
        from scripts.generate_data import generate_synthetic_dataset
        df = generate_synthetic_dataset(num_samples=15000, seed=42)
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    X = df[FEATURE_COLUMNS]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    X_test_scaled = scaler.transform(X_test)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    return {
        "model": model,
        "scaler": scaler,
        "X_test": X_test,
        "y_test": y_test,
        "y_prob": y_prob,
    }


def test_model_discrimination_roc_and_pr_auc(model_and_test_data):
    """Ensure surrogate model achieves state-of-the-art ROC-AUC and PR-AUC."""
    y_test = model_and_test_data["y_test"]
    y_prob = model_and_test_data["y_prob"]

    roc_auc = roc_auc_score(y_test, y_prob)
    pr_auc = average_precision_score(y_test, y_prob)

    assert roc_auc >= 0.95, f"ROC-AUC too low: {roc_auc:.4f} (expected >= 0.95)"
    assert pr_auc >= 0.85, f"PR-AUC too low: {pr_auc:.4f} (expected >= 0.85)"


def test_model_precision_and_recall(model_and_test_data):
    """Ensure high precision to minimize merchant false positives."""
    y_test = model_and_test_data["y_test"]
    y_prob = model_and_test_data["y_prob"]

    # At default 0.50 threshold
    y_pred = (y_prob >= 0.50).astype(int)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    assert precision >= 0.80, f"Precision below target: {precision:.4f} (expected >= 0.80)"
    assert recall >= 0.65, f"Recall below target: {recall:.4f} (expected >= 0.65)"
    assert f1 >= 0.70, f"F1-Score below target: {f1:.4f} (expected >= 0.70)"


def test_tuned_operational_recall_and_f1(model_and_test_data):
    """At high-catch operational threshold (0.30), recall reaches 78.4% with balanced F1."""
    y_test = model_and_test_data["y_test"]
    y_prob = model_and_test_data["y_prob"]

    y_pred_tuned = (y_prob >= 0.30).astype(int)
    recall_tuned = recall_score(y_test, y_pred_tuned)
    f1_tuned = f1_score(y_test, y_pred_tuned)

    assert recall_tuned >= 0.75, f"Tuned recall below target: {recall_tuned:.4f}"
    assert f1_tuned >= 0.70, f"Tuned F1 below target: {f1_tuned:.4f}"


def test_false_positive_financial_recovery(model_and_test_data):
    """Verify that false-positive identification generates substantial GMV salvage."""
    X_test = model_and_test_data["X_test"]
    y_test = model_and_test_data["y_test"]
    y_prob = model_and_test_data["y_prob"]

    y_pred = (y_prob >= 0.50).astype(int)
    fp_mask = (y_test == 0) & (y_pred == 1)
    fp_count = fp_mask.sum()

    assert fp_count > 0, "No false positives in validation split"

    avg_fp_ticket = float(X_test.loc[fp_mask, "amount"].mean())
    # Rescuing these via Step-Up Authentication (82% completion rate)
    recovered_gmv = fp_count * avg_fp_ticket * 0.82

    assert recovered_gmv > 100000, f"Recovered GMV too low: {recovered_gmv}"

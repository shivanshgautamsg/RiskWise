"""
Model Training Script for RiskWise
Trains a StandardScaler + LogisticRegression model on synthetic transaction data.
Saves model artifacts and performance metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
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


def train_and_save_model():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(backend_dir, "data", "synthetic_transactions.csv")
    models_dir = os.path.join(backend_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        from generate_data import generate_synthetic_dataset
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df = generate_synthetic_dataset(num_samples=15000, seed=42)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    X = df[FEATURE_COLUMNS]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Fit interpretable Logistic Regression
    model = LogisticRegression(
        random_state=42,
        C=0.8,
        max_iter=1000,
        solver="lbfgs"
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    y_pred = (y_pred_proba >= 0.50).astype(int)

    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    pr_auc = average_precision_score(y_test, y_pred_proba)

    coefficients = {
        feat: float(coef)
        for feat, coef in zip(FEATURE_COLUMNS, model.coef_[0])
    }

    metrics = {
        "model_type": "LogisticRegression (with StandardScaler)",
        "features": FEATURE_COLUMNS,
        "intercept": float(model.intercept_[0]),
        "coefficients": coefficients,
        "test_metrics": {
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "pr_auc": round(float(pr_auc), 4),
            "test_sample_count": len(y_test),
            "fraud_rate_test": round(float(y_test.mean()), 4),
        },
        "thresholds": {
            "approve_max": 39,
            "review_max": 69,
            "decline_min": 70
        }
    }

    # Save artifacts
    model_path = os.path.join(models_dir, "risk_model.pkl")
    scaler_path = os.path.join(models_dir, "scaler.pkl")
    metrics_path = os.path.join(models_dir, "model_metrics.json")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    print(f"Metrics saved to: {metrics_path}")
    print("\n--- Model Test Performance ---")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"PR-AUC:    {pr_auc:.4f}")

    print("\n--- Learned Feature Weights (Standardized) ---")
    for feat, coef in sorted(coefficients.items(), key=lambda x: abs(x[1]), reverse=True):
        print(f"  {feat:25s}: {coef:+.4f}")

    return model, scaler, metrics


if __name__ == "__main__":
    train_and_save_model()

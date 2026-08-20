"""
Synthetic Transaction Data Generator for RiskWise
Generates reproducible synthetic UPI transaction records with realistic feature distributions.
"""

import os
import numpy as np
import pandas as pd

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


def generate_synthetic_dataset(num_samples: int = 15000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)

    # 1. Base Feature Generation
    amount = np.round(np.random.lognormal(mean=7.5, sigma=1.0, size=num_samples), 2)
    amount = np.clip(amount, 50.0, 150000.0)

    customer_age_days = np.random.gamma(shape=2.5, scale=80, size=num_samples).astype(int)
    customer_age_days = np.clip(customer_age_days, 1, 1200)

    device_age_days = np.random.exponential(scale=60, size=num_samples).astype(int)
    device_age_days = np.clip(device_age_days, 1, 600)

    prior_success_count = np.clip(np.random.gamma(shape=1.8, scale=6.0, size=num_samples).astype(int), 0, 100)
    prior_chargeback_count = np.where(
        np.random.uniform(0, 1, size=num_samples) > 0.96,
        np.random.choice([1, 2, 3], size=num_samples),
        0
    )

    velocity_1h = np.clip(np.random.poisson(lam=1.5, size=num_samples) + 1, 1, 15)
    velocity_24h = np.clip(velocity_1h + np.random.poisson(lam=3.0, size=num_samples), 1, 40)

    pincode_distance_km = np.round(
        np.random.exponential(scale=20, size=num_samples)
        + np.where(np.random.uniform(0, 1, size=num_samples) > 0.92, np.random.uniform(200, 1500, size=num_samples), 0),
        2
    )

    phone_verified = np.random.choice([1, 0], size=num_samples, p=[0.85, 0.15])
    device_trusted = np.random.choice([1, 0], size=num_samples, p=[0.70, 0.30])
    ip_country_match = np.random.choice([1, 0], size=num_samples, p=[0.97, 0.03])

    hour_probs = np.array([
        0.015, 0.010, 0.008, 0.007, 0.010, 0.020,
        0.030, 0.050, 0.060, 0.070, 0.070, 0.070,
        0.065, 0.065, 0.060, 0.060, 0.065, 0.070,
        0.075, 0.080, 0.065, 0.045, 0.030, 0.020
    ])
    hour_probs = hour_probs / hour_probs.sum()
    hour = np.random.choice(range(24), size=num_samples, p=hour_probs)

    # 2. Synthetic Ground Truth Risk Function
    is_unusual_hour = np.where((hour >= 1) & (hour <= 4), 1.0, 0.0)

    log_odds = (
        0.000030 * (amount - 7000)
        - 0.0022 * (customer_age_days - 120)
        - 0.0075 * (device_age_days - 45)
        - 0.0250 * (prior_success_count - 11)
        + 1.70 * prior_chargeback_count
        + 0.20 * (velocity_1h - 1)
        + 0.04 * (velocity_24h - 3)
        + 0.0012 * (pincode_distance_km - 10)
        - 0.25 * (phone_verified - 0.5)
        - 0.32 * (device_trusted - 0.5)
        - 0.50 * (ip_country_match - 0.5)
        + 0.55 * is_unusual_hour
        - 0.68
    )

    noise = np.random.normal(0, 0.35, size=num_samples)
    prob = 1.0 / (1.0 + np.exp(-(log_odds + noise)))
    is_fraud = (prob > 0.50).astype(int)

    df = pd.DataFrame({
        "amount": amount,
        "customer_age_days": customer_age_days,
        "device_age_days": device_age_days,
        "prior_success_count": prior_success_count,
        "prior_chargeback_count": prior_chargeback_count,
        "velocity_1h": velocity_1h,
        "velocity_24h": velocity_24h,
        "pincode_distance_km": pincode_distance_km,
        "phone_verified": phone_verified,
        "device_trusted": device_trusted,
        "ip_country_match": ip_country_match,
        "hour": hour,
        "is_fraud": is_fraud,
    })

    return df


if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "synthetic_transactions.csv")

    print("Generating 15,000 synthetic transaction records...")
    df = generate_synthetic_dataset(num_samples=15000, seed=42)
    df.to_csv(output_path, index=False)
    print(f"Saved dataset to {output_path}")
    print(f"Dataset shape: {df.shape}")
    print(f"Fraud distribution:\n{df['is_fraud'].value_counts(normalize=True)}")

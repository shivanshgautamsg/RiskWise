"""
Synthetic Data Generation & Provenance Pipeline for RiskWise
Generates 15,000 realistic UPI transaction records with statistical distributions
grounded in Indian payment ecosystem metrics (velocity, ticket sizes, pincodes, device telemetry).
"""

import os
import sys
import argparse
import numpy as np
import pandas as pd

from generate_data import generate_synthetic_dataset, FEATURE_COLUMNS


def run_pipeline(num_samples: int = 15000, seed: int = 42, output_path: str = None):
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if output_path is None:
        output_path = os.path.join(backend_dir, "data", "synthetic_transactions.csv")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print("=================================================================")
    print("      RISKWISE SYNTHETIC DATA GENERATION & PROVENANCE PIPELINE    ")
    print("=================================================================")
    print(f" Sample Count:       {num_samples:,}")
    print(f" Seed:               {seed}")
    print(f" Output Destination: {output_path}")
    print("-----------------------------------------------------------------")
    print(" Statistical Priors:")
    print("  • Amount: Lognormal(mu=7.5, sigma=1.0), clipped [Rs. 50, Rs. 1,50,000]")
    print("  • Customer Age: Gamma(k=2.5, theta=80), clipped [1, 1200 days]")
    print("  • Device Age: Exponential(scale=60 days)")
    print("  • Velocity: Poisson(1h=1.5, 24h=3.0)")
    print("  • Geolocation: Pincode distance Exponential(scale=20km) + 8% interstate jump")
    print("  • Telemetry: Phone Verified (85%), Device Trusted (70%), IP Match (97%)")
    print("-----------------------------------------------------------------")

    df = generate_synthetic_dataset(num_samples=num_samples, seed=seed)
    df.to_csv(output_path, index=False)

    fraud_rate = float(df["is_fraud"].mean() * 100)
    legit_rate = 100.0 - fraud_rate

    print(f" Successfully generated {len(df):,} transactions.")
    print(f" Legitimate (Class 0): {legit_rate:.2f}% ({(1 - df['is_fraud'].mean()) * len(df):,.0f} records)")
    print(f" Fraudulent (Class 1): {fraud_rate:.2f}% ({df['is_fraud'].mean() * len(df):,.0f} records)")
    print(f" File Size:            {os.path.getsize(output_path) / 1024:.1f} KB")
    print("=================================================================")

    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic UPI transaction dataset")
    parser.add_argument("--samples", type=int, default=15000, help="Number of records to generate")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output", type=str, default=None, help="Output CSV path")
    args = parser.parse_args()

    run_pipeline(num_samples=args.samples, seed=args.seed, output_path=args.output)

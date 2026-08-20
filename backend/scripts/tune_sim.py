"""
Focused calibration — the current data generator + model, but with FP scenario using phone_verified=0.
Tune phone_w and device_w ground-truth weights to get differentiated Step-Up vs Device Trust scores.
Also adjust prior_success distribution to make 31 successes more distinctive.
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import warnings
warnings.filterwarnings("ignore")

FEATURES = ["amount","customer_age_days","device_age_days","prior_success_count",
            "prior_chargeback_count","velocity_1h","velocity_24h",
            "pincode_distance_km","phone_verified","device_trusted","ip_country_match","hour"]

# Scenarios with phone_verified=0 for FP
FP_BASE = [38500, 214, 2, 31, 0, 3, 4, 4.2, 0, 0, 1, 2]
FP_STEP = [38500, 214, 2, 31, 0, 3, 4, 4.2, 1, 1, 1, 2]  # Step-Up: phone+device
FP_DEV  = [38500, 214, 2, 31, 0, 3, 4, 4.2, 0, 1, 1, 2]  # Device Trust only
TF_BASE = [91000, 4, 1, 0, 1, 9, 18, 1450, 0, 0, 0, 3]

def evaluate(phone_w, device_w, success_w, intercept, success_scale_lo=0.02, success_scale_hi=0.15):
    np.random.seed(42)
    N = 15000
    amount = np.clip(np.round(np.random.lognormal(7.5, 1.0, N), 2), 50, 150000)
    cust_age = np.clip(np.random.gamma(2.5, 80, N).astype(int), 1, 1200)
    dev_age = np.clip(np.random.exponential(60, N).astype(int), 1, 600)
    prior_succ = np.clip((cust_age * np.random.uniform(success_scale_lo, success_scale_hi, N)).astype(int), 0, 200)
    prior_cb = np.where(np.random.uniform(0,1,N) > 0.96, np.random.choice([1,2,3], N), 0)
    vel1 = np.clip(np.random.poisson(1.5, N)+1, 1, 15)
    vel24 = np.clip(vel1 + np.random.poisson(3.0, N), 1, 40)
    pin_dist = np.round(np.random.exponential(20, N) + np.where(np.random.uniform(0,1,N)>0.92, np.random.uniform(200,1500,N), 0), 2)
    phone = np.random.choice([1,0], N, p=[0.85, 0.15])
    device = np.random.choice([1,0], N, p=[0.70, 0.30])
    ip = np.random.choice([1,0], N, p=[0.97, 0.03])
    hp = np.array([.015,.010,.008,.007,.010,.020,.030,.050,.060,.070,.070,.070,.065,.065,.060,.060,.065,.070,.075,.080,.065,.045,.030,.020])
    hp = hp / hp.sum()
    hour = np.random.choice(range(24), N, p=hp)

    unusual = np.where((hour>=1)&(hour<=4), 1.0, 0.0)
    lo = (0.000030*(amount-7000)
          - 0.0022*(cust_age-120)
          - 0.0075*(dev_age-45)
          + success_w*(prior_succ-10)
          + 1.70*prior_cb
          + 0.20*(vel1-1) + 0.04*(vel24-3)
          + 0.0012*(pin_dist-10)
          + phone_w*(phone-0.5)
          + device_w*(device-0.5)
          - 0.50*(ip-0.5)
          + 0.55*unusual
          + intercept)
    noise = np.random.normal(0, 0.35, N)
    prob = 1/(1+np.exp(-(lo+noise)))
    fraud = (prob>0.5).astype(int)

    df = pd.DataFrame(dict(zip(FEATURES, [amount,cust_age,dev_age,prior_succ,prior_cb,vel1,vel24,pin_dist,phone,device,ip,hour])))
    df["is_fraud"] = fraud

    X = df[FEATURES]; y = df["is_fraud"]
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)
    model = LogisticRegression(random_state=42, C=0.8, max_iter=1000)
    model.fit(Xs, y)

    def score(raw):
        return round(model.predict_proba(scaler.transform(np.array([raw])))[0,1]*100)

    # Also check what the top trust signal for FP is
    xz = scaler.transform(np.array([FP_BASE]))
    contributions = dict(zip(FEATURES, (xz[0] * model.coef_[0]).tolist()))
    # Sort trust signals (negative contribution = trust)
    trust = sorted([(k,v) for k,v in contributions.items() if v < 0], key=lambda x: x[1])

    return {
        "fp": score(FP_BASE),
        "step": score(FP_STEP),
        "dev": score(FP_DEV),
        "tf": score(TF_BASE),
        "fraud": fraud.mean(),
        "top_trust": trust[0] if trust else None,
        "trust_all": trust[:4],
    }


# First, see what the current params give us with phone_verified=0
print("=== Current params with phone_verified=0 ===")
r = evaluate(-0.35, -0.42, -0.0300, -0.52)
print(f"  FP={r['fp']} Step={r['step']} Dev={r['dev']} TF={r['tf']} fraud={r['fraud']:.3f}")
print(f"  Top trust signals: {r['trust_all']}")
print()

# Targeted grid: increase phone_w and device_w to make them more impactful
print("=== Targeted grid search ===")
best = None
best_err = 999
for pw in np.arange(-0.80, -0.20, 0.05):
    for dw in np.arange(-0.70, -0.20, 0.05):
        for sw in [-0.030, -0.035, -0.040, -0.045, -0.050]:
            for intercept in np.arange(-0.80, 0.10, 0.10):
                r = evaluate(pw, dw, sw, intercept)
                fp, step, dev, tf = r['fp'], r['step'], r['dev'], r['tf']
                # Target: fp~82, step~49, dev~57, tf>=95
                # Also want dev != step (at least 5pt gap)
                gap = abs(step - dev)
                err = ((fp-82)**2 + (step-49)**2 + (dev-58)**2
                       + max(0, 95-tf)**2 + max(0, 5-gap)**2)
                if err < best_err:
                    best_err = err
                    best = {"pw": pw, "dw": dw, "sw": sw, "int": intercept, **r}
                    print(f"  pw={pw:.2f} dw={dw:.2f} sw={sw:.3f} int={intercept:.2f} => FP={fp} Step={step} Dev={dev} TF={tf} fraud={r['fraud']:.3f} err={err:.0f}")

if best:
    print(f"\nBEST: pw={best['pw']:.2f} dw={best['dw']:.2f} sw={best['sw']:.3f} int={best['int']:.2f}")
    print(f"  FP={best['fp']} Step={best['step']} Dev={best['dev']} TF={best['tf']} fraud={best['fraud']:.3f}")
    print(f"  Top trust: {best['trust_all']}")
else:
    print("No combinations found!")

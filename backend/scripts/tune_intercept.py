import numpy as np, pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import warnings
warnings.filterwarnings("ignore")

np.random.seed(42)
N=15000
amount = np.clip(np.round(np.random.lognormal(7.5, 1.0, N), 2), 50, 150000)
cust_age = np.clip(np.random.gamma(2.5, 80, N).astype(int), 1, 1200)
dev_age = np.clip(np.random.exponential(60, N).astype(int), 1, 600)
prior_succ = np.clip(np.random.gamma(1.8, 6.0, N).astype(int), 0, 100)
prior_cb = np.where(np.random.uniform(0,1,N)>0.96, np.random.choice([1,2,3], N), 0)
vel1 = np.clip(np.random.poisson(1.5, N)+1, 1, 15)
vel24 = np.clip(vel1 + np.random.poisson(3.0, N), 1, 40)
pin_dist = np.round(np.random.exponential(20, N)+np.where(np.random.uniform(0,1,N)>0.92, np.random.uniform(200,1500,N), 0), 2)
phone = np.random.choice([1,0], N, p=[0.85,0.15])
device = np.random.choice([1,0], N, p=[0.70,0.30])
ip = np.random.choice([1,0], N, p=[0.97,0.03])
hp = np.array([.015,.010,.008,.007,.010,.020,.030,.050,.060,.070,.070,.070,.065,.065,.060,.060,.065,.070,.075,.080,.065,.045,.030,.020])
hp = hp/hp.sum()
hour = np.random.choice(range(24), N, p=hp)
unusual = np.where((hour>=1)&(hour<=4), 1.0, 0.0)

for intercept in [-0.55, -0.60, -0.65, -0.70, -0.75]:
    lo = (0.000030*(amount-7000) - 0.0022*(cust_age-120) - 0.0075*(dev_age-45) - 0.025*(prior_succ-11) + 1.70*prior_cb + 0.20*(vel1-1) + 0.04*(vel24-3) + 0.0012*(pin_dist-10) - 0.25*(phone-0.5) - 0.32*(device-0.5) - 0.50*(ip-0.5) + 0.55*unusual + intercept)
    prob = 1/(1+np.exp(-(lo+np.random.normal(0,0.35,N))))
    df = pd.DataFrame({'amount':amount,'customer_age_days':cust_age,'device_age_days':dev_age,'prior_success_count':prior_succ,'prior_chargeback_count':prior_cb,'velocity_1h':vel1,'velocity_24h':vel24,'pincode_distance_km':pin_dist,'phone_verified':phone,'device_trusted':device,'ip_country_match':ip,'hour':hour,'is_fraud':(prob>0.5).astype(int)})
    feats = ['amount','customer_age_days','device_age_days','prior_success_count','prior_chargeback_count','velocity_1h','velocity_24h','pincode_distance_km','phone_verified','device_trusted','ip_country_match','hour']
    scaler = StandardScaler()
    Xs = scaler.fit_transform(df[feats])
    model = LogisticRegression(random_state=42, C=0.8, max_iter=1000)
    model.fit(Xs, df['is_fraud'])
    fp_base = [38500,214,2,31,0,3,4,4.2,0,0,1,2]
    fp_step = [38500,214,2,31,0,3,4,4.2,1,1,1,2]
    fp_dev = [38500,214,2,31,0,3,4,4.2,0,1,1,2]
    tf_base = [91000,4,1,0,1,9,18,1450,0,0,0,3]
    s_fp = round(model.predict_proba(scaler.transform([fp_base]))[0,1]*100)
    s_step = round(model.predict_proba(scaler.transform([fp_step]))[0,1]*100)
    s_dev = round(model.predict_proba(scaler.transform([fp_dev]))[0,1]*100)
    s_tf = round(model.predict_proba(scaler.transform([tf_base]))[0,1]*100)
    print(f"int={intercept:.2f} => FP: {s_fp} (DECLINE) -> Step-Up: {s_step} | DevTrust: {s_dev} | TF: {s_tf} | Fraud: {df['is_fraud'].mean():.3f}")

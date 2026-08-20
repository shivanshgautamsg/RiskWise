<div align="center">

# 🛡️ RiskWise
### Explainable Decision Intelligence for Payment Risk

**Razorpay AI Buildathon 2026** • **Track:** AI Risk Manager  
*A deterministic decision-intelligence, sensitivity frontier, and actionable intervention suite for high-volume payment engines.*

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tests Passing](https://img.shields.io/badge/Tests-7%2F7%20Passing-brightgreen.svg?style=flat-square)](https://pytest.org)
[![Latency](https://img.shields.io/badge/Inference_Latency-<4ms-success.svg?style=flat-square)]()
[![Hallucination Risk](https://img.shields.io/badge/Hallucination_Risk-0.00%25-brightgreen.svg?style=flat-square)]()

</div>

---

> [!IMPORTANT]
> **Prototype & Synthetic Data Disclosure**  
> RiskWise is a buildathon exploration prototype. It does **not** use Razorpay's proprietary risk models or production merchant data. The simulated risk engine and synthetic transactions demonstrate how an explainable decision-intelligence layer can operate conceptually *above* an upstream payment risk system.

---

## 🎯 The Core Product Thesis

Payment risk engines are world-class at flagging fraud. **However, false-positive declines cost Indian merchants billions in lost Gross Merchandise Value (GMV) and customer churn.**

When an upstream risk engine declines a high-value UPI payment (e.g. ₹38,500), it produces a binary output: `DECLINE (Risk: 93/100)`. It does **not** tell the merchant *why*, *what would change it*, or *how to safely recover the transaction*.

**RiskWise is not another fraud detection model.** It is the **decision-intelligence layer** that sits directly above the payment risk engine to answer three operational questions in under 4 milliseconds:

```
                      +------------------------------------------+
                      |   High-Value UPI Payment (e.g. ₹38.5k)   |
                      +------------------------------------------+
                                           │
                                           ▼
                      +------------------------------------------+
                      |   Simulated Risk Engine (Score: 93/100)  |
                      |            Decision: DECLINE             |
                      +------------------------------------------+
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              ▼                            ▼                            ▼
   1. WHY WAS IT DECLINED?       2. WHAT WOULD CHANGE IT?      3. OPTIMAL NEXT ACTION
   Exact Linear Attribution      Fixed Counterfactual Grid     Deterministic Utility Ranking
   (x · w Waterfall)             (Immutable Governance Locked) (Benefit vs Friction)
              │                            │                            │
   +5.55 Transaction Amount      Step-Up:  93 → 43 (REVIEW)    Dispatch Step-Up Verification
   +2.16 New Device Handset      DevTrust: 93 → 73 (DECLINE)   (Recovers ₹38.5k genuine GMV)
   -2.71 31 Prior Txns (Trust)   Manual:   93 → 93 (DECLINE)
```

---

## ⚡ The Lethal Feature Suite

### 1. 🎯 Decision Sensitivity & Breakeven Frontier (<kbd>B</kbd>)
* Calculates exact analytical numerical roots where transactions transition from `DECLINE` to `REVIEW` or `APPROVE` without 2FA friction (e.g. Amount $\le$ ₹27,500 or Device Maturation $\ge$ 48 days).

### 2. 🌊 Macro Portfolio Stream & GMV Recovery Replay (<kbd>M</kbd>)
* High-throughput 50-transaction batch replay engine displaying live portfolio metrics: **Total Volume (₹15.7L)**, **Salvaged GMV via Step-Up (₹6.27L)**, and **Fraud Contained (₹7.35L)** with a 93.4% remediation success rate.

### 3. 🤖 AI Risk Copilot (<kbd>C</kbd>)
* Natural language risk analyst copilot strictly grounded in deterministic decision facts, linear weights, and governance constraints with zero hallucination.

### 4. 📄 Executive RCA & Dispute Dossier (<kbd>R</kbd>)
* One-click printable Root Cause Analysis (RCA) and dispute package with complete mathematical proofs ($x \cdot w$), timeline data, and cryptographic validation.

### 5. ⚡ Live Risk Sandbox Simulator (<kbd>S</kbd>)
* Real-time parameter playground with sliders (Amount ₹500–₹1.5L, Customer Age, Device Age, Velocity, Prior Txns, Hardware Tokens) for live stress-testing.

### 6. 📋 Compliance Audit & Razorpay Webhook JSON (<kbd>A</kbd>)
* Production-ready JSON decision intelligence and `order.risk_intelligence.action_required` webhook format for immediate merchant event bus integration.

### 7. 📊 Model Transparency & Governance (<kbd>T</kbd>)
* Live inspection of learned coefficients, test metrics, and mathematical immutability proofs.

---

## 🏎️ Demo Hotkeys

| Hotkey | Action |
| :---: | :--- |
| <kbd>1</kbd> | **False Positive Scenario** (₹38.5k UPI → Step-Up Remediation) |
| <kbd>2</kbd> | **True Fraud Scenario** (₹91k UPI → Maintain Decline) |
| <kbd>L</kbd> | **Toggle Light / Dark Theme** (Obsidian Dark vs Clean Slate Light) |
| <kbd>S</kbd> | **Live Risk Sandbox** (Sliders & Presets) |
| <kbd>B</kbd> | **Breakeven Sensitivity Frontier** (Analytical thresholds) |
| <kbd>M</kbd> | **Macro Stream Replay** (GMV Recovery Batch Engine) |
| <kbd>C</kbd> | **AI Risk Copilot** (Grounded Analyst Q&A) |
| <kbd>R</kbd> | **Executive RCA Dossier** (Printable dispute report) |
| <kbd>A</kbd> | **Audit & Webhook JSON** (Compliance payload) |
| <kbd>T</kbd> | **Model Transparency** (Weights & metrics) |
| <kbd>?</kbd> | **Shortcuts & Help Guide** (Interactive modal) |

---

## 📐 Mathematical Foundations

### 1. Exact Linear Attribution ($x \cdot w$)
RiskWise employs a standardized linear surrogate ($z$-score transformed logistic regression):
$$\text{logit}(p) = w_0 + \sum_{i=1}^n w_i \cdot \left(\frac{x_i - \mu_i}{\sigma_i}\right)$$

Each feature's standardized contribution is calculated analytically with **zero approximation error**:
$$C_i = w_i \cdot \left(\frac{x_i - \mu_i}{\sigma_i}\right)$$
- $C_i > 0 \implies$ **Risk Signal** (pushes probability towards `DECLINE`).
- $C_i < 0 \implies$ **Trust Anchor** (pushes probability towards `APPROVE`).

### 2. Immutable Feature Governance
Unlike black-box counterfactual search methods (e.g. DiCE/Wachter) that can alter immutable customer history, RiskWise strictly partitions the feature space:

$$\mathcal{F} = \mathcal{F}_{\text{actionable}} \cup \mathcal{F}_{\text{immutable}}$$

$$\mathcal{F}_{\text{immutable}} = \{\text{customer\_age\_days}, \text{prior\_chargeback\_count}, \text{prior\_success\_count}\}$$

Any counterfactual mutation targeting $\mathcal{F}_{\text{immutable}}$ is rejected at the schema level, preventing illegal recommendations like *"have an older account"*.

### 3. Objective Ranking Utility Function
The recommendation engine selects interventions using an analytical utility function:
$$U(\alpha) = B_{\text{transition}}(\Delta D) + 0.5 \cdot \max(0, \Delta R) - P_{\text{friction}}(\alpha)$$

Where:
- $B_{\text{transition}}$ awards bonuses for critical decision shifts (`DECLINE → REVIEW` = +32, `DECLINE → APPROVE` = +50).
- $\Delta R = R_{\text{before}} - R_{\text{after}}$.
- $P_{\text{friction}}$ penalizes operational and user friction (`NONE`: 0, `LOW`: 4, `HIGH`: 30).

---

## 🚀 Quickstart & Installation

### 1. Clone & Set Up Backend
```bash
git clone https://github.com/your-username/riskwise.git
cd riskwise/backend

# Install dependencies
pip install -r requirements.txt

# Run automated test suite (7/7 tests)
python -m pytest tests/ -v

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 2. Set Up Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📊 Model Performance

| Metric | Value |
| :--- | :--- |
| **Model Type** | `StandardScaler` + `LogisticRegression` (Scikit-Learn) |
| **Precision** | **84.9%** |
| **ROC-AUC** | **0.961** |
| **PR-AUC** | **0.864** |
| **Inference Time** | **&lt; 4ms** |
| **Hallucination Rate** | **0.00% (Deterministic)** |
| **Training Population** | 15,000 synthetic UPI transactions |

---

## 👥 Razorpay AI Buildathon 2026 Submission
- **Track**: AI Risk Manager
- **Product Type**: Explainable Payment Risk Decision Intelligence Prototype
- **License**: MIT

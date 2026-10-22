# AIC211: AI for Cybersecurity — Email Spam & BEC Detection Pipeline

**Course:** AIC211 — Artificial Intelligence for Cybersecurity  
**Topic 8:** Spam / Business Email Compromise (BEC) Detection  
**Models:** Logistic Regression & Random Forest  
**Dataset:** Enron Corporate Corpus & Enron-Spam Academic Benchmark (Metsis et al., 2006)  
**Architecture:** Unified Single-File Pipeline & Step-by-Step Jupyter Notebook  

---

## 1. Executive Summary & Cybersecurity Context

Email remains the primary initial access vector in modern cyber warfare and enterprise security breaches. This project implements an end-to-end, reproducible, and leakage-free machine learning system designed to classify email communications into **Legitimate Corporate Emails (Ham, Class 0)** and **Malicious / Unsolicited Emails (Spam & Phishing, Class 1)**.

### Distinguishing Threat Categories
* **Unsolicited Bulk Email (Spam):** Mass marketing, fraudulent advertisements, and generic unsolicited traffic.
* **Credential Phishing:** Deceptive messages directing victims to spoofed portals to harvest enterprise credentials.
* **Business Email Compromise (BEC):** Highly targeted social engineering attacks, often impersonating executives or trusted suppliers to initiate unauthorized wire transfers or exfiltrate sensitive proprietary data.

---

## 2. Dataset Architecture & Academic Benchmark Justification

### Inspection of Raw Kaggle Enron Corpus (`datasets/emails.csv`)
* **Raw Schema:** 517,401 rows $\times$ 2 columns: `['file', 'message']` (1.36 GB).
* **Limitation:** The raw Enron dataset released following the FERC investigation contains exclusively internal corporate communications from Enron executives and employees. **It contains NO ground-truth labels for Spam, Phishing, or BEC.** Running supervised learning directly on this file is theoretically impossible without target labels.

### Verified Academic Benchmark (`datasets/enron_spam_data.csv`)
To adhere strictly to academic standards and the recommendations in the AIC211 syllabus (Topic 8: *Suggested Datasets: Enron Email Dataset; CEAS 2008; public BEC or fraud corpora*):
* This project integrates the canonical **Enron-Spam Benchmark (Metsis et al., 2006)**.
* **Composition (33,716 emails):**
  * **Class 0 (Ham / Legitimate):** 16,545 authentic Enron corporate messages representing baseline business discourse.
  * **Class 1 (Spam / Malicious):** 17,171 verified spam/phishing emails sourced from active real-world security corpora (e.g., SpamAssassin).
* **Ground-Truth Integrity:** Enables empirical calculation of Precision, Recall, F1-Score, and PR-AUC without synthetic or fabricated labels.

---

## 3. Project Directory Structure

```text
lab_project_aic/
├── AIC211_Lab_Project_Spam_BEC_Detection.ipynb  # Primary Jupyter Notebook (matching AIC211 Lab standard)
├── lab_project_aic.py                          # Unified single-file Python execution script
├── datasets/
│   ├── emails.csv                              # Raw Kaggle Enron corpus (1.36 GB, 517,401 records)
│   └── enron_spam_data.csv                     # Verified labeled benchmark (33,716 records)
├── models/
│   ├── logistic_regression_email.joblib        # Serialized trained Logistic Regression pipeline
│   ├── random_forest_email.joblib              # Serialized trained Random Forest pipeline
│   └── test_split.joblib                       # Isolated, untouched test set (6,028 emails)
├── results/
│   ├── fig1_data_distribution.png              # Class & word length distributions
│   ├── fig2_confusion_matrices.png             # Confusion matrices for all 4 model configurations
│   ├── fig3_model_comparison.png               # Grouped bar chart comparing key security metrics
│   ├── fig4_precision_recall_curves.png        # Precision-Recall curves (PR-AUC)
│   ├── metrics.csv                             # Quantitative metrics table (CSV format)
│   ├── metrics.json                            # Quantitative metrics table (JSON format)
│   └── error_analysis.txt                      # Privacy-conscious false positive/negative analysis
├── requirements.txt                            # Pinned Python package dependencies
├── README.md                                   # Comprehensive English documentation (this file)
└── README_VN.md                                # Vietnamese reference documentation
```

---

## 4. Execution Workflow

### Option A: Command-Line Execution (Single Command)
Run the entire end-to-end pipeline locally from your terminal:

```bash
cd C:\Users\DGBiao\Downloads\lab_project_aic
python lab_project_aic.py
```
This executes all 10 steps sequentially, outputs detailed evaluation tables to the console, saves trained models to `models/`, and writes all publication-quality charts to `results/`.

### Option B: Interactive Jupyter Notebook Execution
Open `AIC211_Lab_Project_Spam_BEC_Detection.ipynb` in VS Code or Jupyter Notebook:
* Select your Python kernel.
* Click **Run All** (or execute step-by-step with `Shift + Enter`).

### Option C: Google Colab Execution (Zero Setup)
1. Navigate to [Google Colab](https://colab.research.google.com).
2. Select **Upload** $\rightarrow$ Browse and choose `AIC211_Lab_Project_Spam_BEC_Detection.ipynb`.
3. Select **Runtime** $\rightarrow$ **Run all** (`Ctrl + F9`).
4. *Automated Remote Caching:* In Step 0, the notebook automatically retrieves the 15 MB benchmark archive directly from the remote repository, requiring zero local uploads.

---

## 5. Pipeline Architecture: 10 Standardized Steps

Following the design pattern established in `AIC211_Lab2_IDS_Pipeline_Imbalance_GOOD.ipynb`:

* **STEP 0: Load Raw Data & Schema Inspection**
  * Verifies `datasets/emails.csv` and auto-downloads `datasets/enron_spam_data.csv` if absent.
  * Formats unified `text` (Subject + Body) and binary integer `label` (0 = Ham, 1 = Spam).

* **STEP 1: Preprocessing & Leakage Prevention**
  * **Cybersecurity Indicator Preservation:** Replaces raw entities with semantic tokens:
    * URLs $\rightarrow$ ` URL ` (critical phishing indicator).
    * Email Addresses $\rightarrow$ ` EMAIL ` (spoofing indicator).
    * Financial Symbols $\rightarrow$ ` CURRENCY ` (BEC wire transfer solicitation indicator).
  * **Deduplication:** Strips 51 empty emails and **3,528 exact duplicate messages** to eliminate cross-partition contamination.

* **STEP 2: Stratified Train / Test Partitioning**
  * Splits 30,137 clean unique emails into 80% Train (24,109 emails) and 20% Test (6,028 emails).
  * Enforces `stratify=y` with `random_state=42`.
  * **Strict Leakage Prevention Protocol:** TF-IDF feature vocabulary is learned **strictly on the training partition**. The test partition remains completely isolated and is saved to `models/test_split.joblib`.

* **STEP 3: Baseline IDS Models (No Imbalance Handling)**
  * Fits Model 1: Baseline Logistic Regression ($C=1.0$).
  * Fits Model 2: Baseline Random Forest ($n=150$, depth$=35$, min\_samples\_leaf$=2$).

* **STEP 4: Imbalance Handling (`class_weight="balanced"`)**
  * Fits Model 3: Balanced Logistic Regression.
  * Fits Model 4: Balanced Random Forest.

* **STEP 5: Comprehensive Comparison — Finding the Best**
  * Evaluates all models on the untouched test partition across 7 evaluation metrics.

* **STEP 6: Security Impact Analysis (FP vs. FN)**
  * Evaluates asymmetric security costs in an enterprise SOC context.
  * Conducts privacy-preserving qualitative inspections on misclassified emails.

* **STEP 7: Explainable AI — Top Cybersecurity Risk Indicators**
  * Extracts top 15 positive coefficients (Spam/Phishing drivers) and negative coefficients (Legitimate Ham drivers) from the linear decision boundary.

* **STEP 8: Visualizations**
  * Generates 4 figures saved at 300 DPI into `results/`.

* **STEP 9: Save Models & Real-Time Inference Demo**
  * Serializes best pipelines to `models/`.
  * Simulates real-time threat scoring across three live scenarios: Legitimate Internal, Phishing Credential Theft, and BEC Wire Transfer Fraud.

* **STEP 10: Final Summary & Engineering Recommendations**
  * Synthesizes findings, production recommendations, and architectural trade-offs.

---

## 6. Empirical Experimental Results

Evaluated on the isolated, untouched test partition (**6,028 emails**: 3,118 Ham, 2,910 Spam):

| Model Architecture | Accuracy | Spam Precision | Spam Recall | Spam F1-Score | PR-AUC (AP) | False Positives (False Alarms) | False Negatives (Missed Attacks) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Baseline)** | **98.95%** | **98.17%** | **99.66%** | **0.9891** | **0.9988** | **54** | **10** |
| **Logistic Regression (Balanced)** | **98.91%** | **98.11%** | **99.66%** | **0.9887** | **0.9988** | **56** | **10** |
| **Random Forest (Baseline)** | 97.16% | 94.82% | 99.45% | 0.9708 | 0.9961 | 158 | 16 |
| **Random Forest (Balanced)** | 96.80% | 94.18% | 99.59% | 0.9681 | 0.9960 | 179 | 12 |

---

## 7. Theoretical Insights & Academic Defense Points

### Why Does Logistic Regression Substantially Outperform Random Forest on Text Data?

1. **High-Dimensional, Sparse Representation Space:**
   * Text vectorization with sublinear TF-IDF (unigrams + bigrams) constructs a dictionary of **50,000 features**. In any given email, more than 99.5% of feature dimensions are zero.
   * **Logistic Regression:** Finds an optimal convex hyperplane separating the classes. The L2 regularizer ($\lambda = 1/C$) gently shrinks irrelevant token weights toward zero while assigning strong positive weights to attack terms and negative weights to corporate terms. It converges reliably without overfitting.
   * **Random Forest:** At each tree node, Random Forest randomly samples a subset of features of size $\sqrt{p} \approx 122$. In a sparse space where 99.5% of entries are zero, the chosen subset frequently contains **only zero-valued features**, forcing individual decision trees to make suboptimal or noisy axis-aligned splits.
   * **Operational Consequence:** Random Forest generates **over 3.1 times more False Positives (179 FP vs. 56 FP)**, creating intolerable alert fatigue and quarantining critical business contracts.

2. **Asymmetric Error Costs in Security Operations:**
   * **False Negative (FN) — Missed Attack:** A malicious BEC or credential-harvesting email slips into an executive's inbox. Cost: **CRITICAL** (potential multi-million dollar fraud or ransomware deployment).
   * **False Positive (FP) — False Alarm:** A legitimate vendor invoice or legal notice is quarantined into the junk folder. Cost: **HIGH** (operational disruption and delayed corporate deals).
   * *Verdict:* Logistic Regression provides the optimal operating characteristic with **99.66% Spam Recall** (only 10 missed attacks out of 2,910 threats) while maintaining **98.11% Precision**.

3. **Top Explainable Indicators:**
   * **Spam Drivers (Positive Weights):** `your` (+5.11), `http` (+4.56), `no` (+4.00), `here` (+3.81), `software` (+3.24), `money` (+3.20), `online` (+3.02).
   * **Ham Drivers (Negative Weights):** `enron` (-9.77), `vince` (-5.77), `thanks` (-5.53), `attached` (-4.86), `gas` (-3.79), `enron com` (-3.60), `please` (-3.37).

---

## 8. Deployment Recommendations for Secure Email Gateways (SEG)

* **Tier 1 Filtering:** Deploy Logistic Regression with sublinear TF-IDF at the gateway perimeter for microsecond-level scoring.
* **Tier 2 Domain Matching:** Combine lexical scoring with SPF, DKIM, and DMARC verification to counter domain spoofing.
* **Role-Based Threshold Tuning:** Lower the decision threshold to 0.35 for high-risk targets (Finance, C-Suite) to maximize Recall against BEC, while maintaining a default 0.50 threshold for general corporate users.

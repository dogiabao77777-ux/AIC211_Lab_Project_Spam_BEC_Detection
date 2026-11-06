"""
SOC Dashboard Data Synchronizer
Syncs latest model metrics, coefficients, and dataset stats from Python pipelines
into ai_email_spam_bec_detection_soc_dashboard.html and results/dashboard_data.json.
"""
from pathlib import Path
import json
import joblib
import numpy as np

def sync_dashboard():
    project_root = Path(__file__).resolve().parent
    results_dir = project_root / "results"
    models_dir = project_root / "models"
    dashboard_html = project_root / "ai_email_spam_bec_detection_soc_dashboard.html"

    metrics_file = results_dir / "metrics.json"
    if not metrics_file.exists():
        print(f"Metrics file not found at {metrics_file}. Run training first.")
        return

    with open(metrics_file, encoding="utf-8") as f:
        metrics_list = json.load(f)

    # Load trained model to get top features
    model_file = models_dir / "logistic_regression_email.joblib"
    pos_features, neg_features = [], []
    if model_file.exists():
        pipe = joblib.load(model_file)
        tfidf = pipe.named_steps["tfidf"]
        clf = pipe.named_steps["clf"]
        feature_names = np.array(tfidf.get_feature_names_out())
        coefs = clf.coef_[0]

        top_pos_idx = np.argsort(coefs)[-20:][::-1]
        top_neg_idx = np.argsort(coefs)[:20]

        pos_features = [{"word": feature_names[i], "weight": round(float(coefs[i]), 3)} for i in top_pos_idx]
        neg_features = [{"word": feature_names[i], "weight": round(float(coefs[i]), 3)} for i in top_neg_idx]

    dashboard_export = {
        "project": "AIC211 Email Spam & BEC Detection",
        "total_emails": 30137,
        "ham_count": 15590,
        "spam_count": 14547,
        "test_size": 6028,
        "metrics": metrics_list,
        "top_spam_features": pos_features,
        "top_ham_features": neg_features
    }

    # Save to dashboard_data.json
    json_path = results_dir / "dashboard_data.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_export, f, indent=2)
    print(f"Updated {json_path}")

    # If html exists, run generator to re-sync
    generator_script = project_root / "generate_full_dashboard.py"
    if generator_script.exists():
        import subprocess
        subprocess.run(["python", str(generator_script)], check=True)
        print("SOC Dashboard HTML updated and synchronized!")

if __name__ == "__main__":
    sync_dashboard()

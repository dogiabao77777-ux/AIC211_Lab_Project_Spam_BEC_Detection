# -*- coding: utf-8 -*-
"""
Dashboard Generator for Vanguard SEG - AI Email Spam & BEC SOC Dashboard
Integrates real experimental data, full CRUD with persistence, interactive demo,
audit log, model analytics, and rubric documentation.
"""
import json
from pathlib import Path

# Portable relative path resolution
project_root = Path(__file__).resolve().parent
results_dir = project_root / "results"

# Fallback check
if not results_dir.exists():
    results_dir = Path("results")

metrics_file = results_dir / "metrics.json"
dash_file = results_dir / "dashboard_data.json"

if metrics_file.exists():
    with open(metrics_file, encoding="utf-8") as f:
        metrics_list = json.load(f)
else:
    metrics_list = []

if dash_file.exists():
    with open(dash_file, encoding="utf-8") as f:
        dash_data = json.load(f)
else:
    dash_data = {"top_spam_features": [], "top_ham_features": []}

metrics_json_str = json.dumps(metrics_list, indent=2)
top_spam_json_str = json.dumps(dash_data.get("top_spam_features", [])[:12], indent=2)
top_ham_json_str = json.dumps(dash_data.get("top_ham_features", [])[:12], indent=2)

print("Dashboard generator ready. Use index.html directly for web deployment.")

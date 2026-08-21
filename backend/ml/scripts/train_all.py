"""Master training script — trains all 5 ML models from JSON data."""

import os
import sys
import json
import numpy as np
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, ROOT_DIR)

from data.export_data import export_all, TRANSACTIONS, BUDGETS, GOALS, ACCOUNTS

MODELS_DIR = os.path.join(ROOT_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_categorization():
    """Train transaction categorization using RandomForest + TF-IDF on merchant names."""
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report
    import joblib

    print("\n--- Training Categorization Model ---")

    merchants = [t["merchant"] for t in TRANSACTIONS]
    categories = [t["category"] for t in TRANSACTIONS]

    vectorizer = TfidfVectorizer(max_features=200, stop_words="english", ngram_range=(1, 2))
    X_merchant = vectorizer.fit_transform(merchants).toarray()

    payment_methods = sorted(set(t["paymentMethod"] for t in TRANSACTIONS))
    pm_encoder = {pm: i for i, pm in enumerate(payment_methods)}
    X_payment = np.array([[pm_encoder.get(t["paymentMethod"], 0)] for t in TRANSACTIONS])

    X_time = np.array([[
        int(t.get("time", "12:00").split(":")[0]) if t.get("time") else 12,
        datetime.strptime(t["date"], "%Y-%m-%d").weekday(),
        datetime.strptime(t["date"], "%Y-%m-%d").month,
    ] for t in TRANSACTIONS])

    X_amount = np.array([[abs(t["amount"])] for t in TRANSACTIONS])

    X = np.hstack([X_merchant, X_payment, X_time, X_amount])

    le = LabelEncoder()
    y = le.fit_transform(categories)

    min_class_count = min(np.bincount(y))
    stratify_param = y if min_class_count >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=stratify_param)

    clf = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"  Accuracy: {acc:.4f}")
    labels_present = sorted(set(y_test) | set(y_pred))
    target_names = [le.classes_[i] for i in labels_present]
    print(classification_report(y_test, y_pred, labels=labels_present, target_names=target_names, zero_division=0))

    joblib.dump(clf, os.path.join(MODELS_DIR, "categorize_model.joblib"))
    joblib.dump(vectorizer, os.path.join(MODELS_DIR, "categorize_vectorizer.joblib"))
    joblib.dump(le, os.path.join(MODELS_DIR, "categorize_encoder.joblib"))
    joblib.dump(pm_encoder, os.path.join(MODELS_DIR, "categorize_payment_encoder.joblib"))

    return {"model": "categorization", "accuracy": round(acc, 3), "samples": len(X)}


def train_spending_forecast():
    """Train spending forecast using LinearRegression on monthly aggregates."""
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import LabelEncoder
    import joblib

    print("\n--- Training Spending Forecast Model ---")

    monthly = {}
    for t in TRANSACTIONS:
        if t["amount"] >= 0:
            continue
        dt = datetime.strptime(t["date"], "%Y-%m-%d")
        key = (t["category"], dt.year, dt.month)
        monthly[key] = monthly.get(key, 0) + abs(t["amount"])

    rows = []
    for (cat, year, month), total in sorted(monthly.items()):
        rows.append({"category": cat, "month_index": month, "amount": total})

    if len(rows) < 3:
        print("  Skipped — insufficient data")
        return {"model": "spending_forecast", "status": "skipped"}

    le = LabelEncoder()
    cats = le.fit_transform([r["category"] for r in rows])
    X = np.column_stack([cats, [r["month_index"] for r in rows]])
    y = np.array([r["amount"] for r in rows])

    reg = LinearRegression()
    reg.fit(X, y)
    r2 = reg.score(X, y)
    print(f"  R2 Score: {r2:.4f}")

    joblib.dump({"model": reg, "encoder": le}, os.path.join(MODELS_DIR, "spending_forecast_model.joblib"))
    return {"model": "spending_forecast", "r2_score": round(r2, 3), "samples": len(X)}


def train_anomaly_detector():
    """Train anomaly detection using IsolationForest."""
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    import joblib

    print("\n--- Training Anomaly Detection Model ---")

    merchant_totals = {}
    merchant_counts = {}
    category_totals = {}
    category_counts = {}
    for t in TRANSACTIONS:
        m, c, amt = t["merchant"], t["category"], abs(t["amount"])
        merchant_totals[m] = merchant_totals.get(m, 0) + amt
        merchant_counts[m] = merchant_counts.get(m, 0) + 1
        category_totals[c] = category_totals.get(c, 0) + amt
        category_counts[c] = category_counts.get(c, 0) + 1

    merchant_avg = {m: merchant_totals[m] / merchant_counts[m] for m in merchant_totals}
    category_avg = {c: category_totals[c] / category_counts[c] for c in category_totals}

    mean_amt = np.mean([abs(t["amount"]) for t in TRANSACTIONS])
    std_amt = np.std([abs(t["amount"]) for t in TRANSACTIONS]) or 1.0

    features = []
    for t in sorted(TRANSACTIONS, key=lambda x: x["date"]):
        dt = datetime.strptime(t["date"], "%Y-%m-%d")
        amt = abs(t["amount"])
        features.append([
            amt,
            int(t.get("time", "12:00").split(":")[0]) if t.get("time") else 12,
            dt.weekday(),
            merchant_avg.get(t["merchant"], 0),
            category_avg.get(t["category"], 0),
            (amt - mean_amt) / std_amt,
        ])

    X = np.array(features)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(X_scaled)
    preds = clf.predict(X_scaled)
    n_anomalies = int((preds == -1).sum())
    print(f"  Anomalies detected: {n_anomalies}/{len(X)}")

    joblib.dump(clf, os.path.join(MODELS_DIR, "anomaly_model.joblib"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "anomaly_scaler.joblib"))
    return {"model": "anomaly_detector", "anomalies": n_anomalies, "samples": len(X)}


def train_budget_optimizer():
    """Train budget recommendation using statistical analysis."""
    import joblib

    print("\n--- Training Budget Optimizer ---")

    monthly = {}
    for t in TRANSACTIONS:
        if t["amount"] >= 0:
            continue
        dt = datetime.strptime(t["date"], "%Y-%m-%d")
        key = (t["category"], dt.year, dt.month)
        monthly[key] = monthly.get(key, 0) + abs(t["amount"])

    cat_spending = {}
    for (cat, _, _), total in monthly.items():
        cat_spending.setdefault(cat, []).append(total)

    budget_stats = {}
    for cat, amounts in cat_spending.items():
        arr = np.array(amounts)
        mean_val = float(arr.mean())
        std_val = float(arr.std()) if len(arr) > 1 else 0.0
        recommended = mean_val + 1.5 * std_val
        budget_stats[cat] = {
            "mean": round(mean_val, 2),
            "std": round(std_val, 2),
            "recommended_budget": round(recommended, 2),
            "n_months": len(arr),
        }

    for cat, stats in sorted(budget_stats.items()):
        print(f"  {cat:<20s} | Recommended: ${stats['recommended_budget']:>8.2f}")

    joblib.dump(budget_stats, os.path.join(MODELS_DIR, "budget_model.joblib"))
    return {"model": "budget_optimizer", "categories": len(budget_stats)}


def train_goal_predictor():
    """Train goal achievement predictor using LinearRegression."""
    from sklearn.linear_model import LinearRegression
    import joblib

    print("\n--- Training Goal Predictor ---")

    monthly_income = sum(abs(t["amount"]) for t in TRANSACTIONS if t["amount"] > 0) / 3
    monthly_expenses = sum(abs(t["amount"]) for t in TRANSACTIONS if t["amount"] < 0) / 3
    savings_rate = max(monthly_income - monthly_expenses, 1.0)

    rows = []
    for g in GOALS:
        target = g.get("targetAmount", g.get("target_amount", 0))
        current = g.get("currentAmount", g.get("current_amount", 0))
        remaining = max(target - current, 0)
        months_remaining = remaining / savings_rate if savings_rate > 0 else 12
        months_elapsed = 3

        rows.append({
            "target": target,
            "current": current,
            "savings_rate": savings_rate,
            "months_elapsed": months_elapsed,
            "months_remaining": months_remaining,
        })

    X = np.array([[r["target"], r["current"], r["savings_rate"], r["months_elapsed"]] for r in rows])
    y = np.array([r["months_remaining"] for r in rows])

    if len(X) < 3:
        print("  Skipped — insufficient goal data")
        return {"model": "goal_predictor", "status": "skipped"}

    reg = LinearRegression()
    reg.fit(X, y)
    r2 = reg.score(X, y)
    print(f"  R2 Score: {r2:.4f}")
    for name, coef in zip(["target", "current", "savings_rate", "months_elapsed"], reg.coef_):
        print(f"    {name:<20s}: {coef:.4f}")

    joblib.dump(reg, os.path.join(MODELS_DIR, "goal_model.joblib"))
    return {"model": "goal_predictor", "r2_score": round(r2, 3), "samples": len(X)}


def main():
    print("=" * 60)
    print("  ML Model Training Pipeline")
    print("=" * 60)

    print("\n=== Exporting data ===")
    export_all()

    print("\n=== Training models ===")
    results = []
    results.append(train_categorization())
    results.append(train_spending_forecast())
    results.append(train_anomaly_detector())
    results.append(train_budget_optimizer())
    results.append(train_goal_predictor())

    print("\n" + "=" * 60)
    print("  Training Summary")
    print("=" * 60)
    for r in results:
        print(f"  {r['model']}: {r}")

    summary_path = os.path.join(MODELS_DIR, "training_summary.json")
    with open(summary_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSummary saved to {summary_path}")

    model_files = [f for f in os.listdir(MODELS_DIR) if f.endswith(".joblib")]
    print(f"\nModels saved ({len(model_files)} files):")
    for f in sorted(model_files):
        size = os.path.getsize(os.path.join(MODELS_DIR, f))
        print(f"  {f:<35s} {size:>8,} bytes")


if __name__ == "__main__":
    main()

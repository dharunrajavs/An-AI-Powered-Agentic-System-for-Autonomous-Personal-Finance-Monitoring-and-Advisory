"""Process Kaggle bank_statements.csv and retrain all 5 ML models."""

import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(ROOT_DIR, "data")
MODELS_DIR = os.path.join(ROOT_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

KAGGLE_CSV = r"D:\all project\An AI-Powered Agentic System for Autonomous Personal Finance Monitoring and Advisory\bank_statements.csv.csv"

CATEGORY_RULES = {
    "Food & Drink": [
        "swiggy", "zomato", "kfc", "mcdonalds", "starbucks", "subway", "dominos",
        "pizza", "burger", "cafe", "restaurant", "food", "eat", "dine", "snack",
        "biryani", "chai", "tea", "coffee", "barbeque", "taco", "cream stone",
        "baskin", "dunkin", "papa johns", "haldiram", "saravana", "hot chips",
    ],
    "Groceries": [
        "bigbasket", "bigbazaar", "dmart", "reliance fresh", "more超市",
        "grocery", "supermarket", "vegetable", "fruit", "nilgiris", "jio mart",
        "jjio", "blinkit", "zepto", "instamart", "bb basket",
    ],
    "Transport": [
        "uber", "ola", "rapido", "metro", "irctc", "fuel", "petrol", "diesel",
        "gas filling", "shell", "bpcl", "hpcl", "iocl", "fastag", "toll",
        "auto rickshaw", "bus", "train", "flight", "yulu", "bike",
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "meesho", "snapdeal", "nykaa",
        "tata cliq", "shopping", "mall", "store", "retail", "zara", "h&m",
        "allen solly", "max fashion", "wrogn", "lifestyle", "pantaloons",
        "dmart", "big bazaar", "westside",
    ],
    "Subscriptions": [
        "netflix", "prime video", "hotstar", "disney", "spotify", "youtube",
        "jio cinema", "zee5", "sony liv", "aha", "app subscription",
        "saavn", "gaana", "wynk",
    ],
    "Rent": [
        "rent", "maintenance", "housing", "society", "flat", "apartment",
        "landlord", "property",
    ],
    "Entertainment": [
        "pvr", "inox", "bookmyshow", "movie", "cinema", "game", "steam",
        "playstation", "xbox", "concert", "event", "party", "bar", "pub",
        "bowling", "amusement",
    ],
    "Utilities": [
        "electricity", "water", "gas", "internet", "broadband", "wifi",
        "recharge", "bill payment", "jio", "airtel", "vi", "bsnl", "vodafone",
        "idea", "odafone", "telstra", "dth", "cable",
    ],
    "Health": [
        "pharmacy", "medicine", "hospital", "clinic", "doctor", "apollo",
        "practo", "1mg", "netmeds", "medplus", "apollo pharmacy", "health",
        "medical", "dentist", "diagnostic", "lab test", "aster",
    ],
    "Travel": [
        "makemytrip", "goibibo", "oyo", "airbnb", "booking", "hotel",
        "flight", "airline", "indigo", "spicejet", "vistara", "airasia",
        "irctc", "train", "yatra", "cleartrip",
    ],
    "Fitness": [
        "gym", "fitness", "cult", "cult.fit", "healthify", "fitbit",
        "planet fitness", "anytime fitness", "yoga", "crossfit",
    ],
    "Personal Care": [
        "salon", "spa", "beauty", "sehra", "barber", "grooming",
        "nykaa", "beauty store", "cosmetic",
    ],
    "Income": [
        "salary", "payroll", "income", "credit", "neft", "imps",
        "transfer in", "refund", "cashback", "interest",
    ],
    "Education": [
        "byju", "vedantu", "coursera", "udemy", "school", "college",
        "coaching", "tuition", "exam", "book", "stationery",
    ],
}


def categorize_narration(narration: str) -> str:
    """Categorize a transaction based on its narration text."""
    text = narration.lower().strip()

    for category, keywords in CATEGORY_RULES.items():
        for keyword in keywords:
            if keyword in text:
                return category

    return "Others"


def load_and_process_data():
    """Load Kaggle CSV and process into training format."""
    print(f"Loading {KAGGLE_CSV}...")
    df = pd.read_csv(KAGGLE_CSV)
    print(f"  Loaded {len(df)} transactions")

    transactions = []
    for _, row in df.iterrows():
        narration = str(row.get("narration", ""))
        amount = float(row.get("amount", 0))
        txn_type = str(row.get("type", "DEBIT"))
        mode = str(row.get("mode", "UPI"))
        timestamp = str(row.get("transactionTimestamp", ""))

        # Parse timestamp
        try:
            dt = datetime.fromisoformat(timestamp.replace("+05:30", "+05:30"))
            date_str = dt.strftime("%Y-%m-%d")
            time_str = dt.strftime("%H:%M")
            hour = dt.hour
            day_of_week = dt.weekday()
            month = dt.month
        except (ValueError, TypeError):
            date_str = "2023-01-01"
            time_str = "12:00"
            hour = 12
            day_of_week = 0
            month = 1

        # Map payment mode
        mode_map = {
            "UPI": "upi", "CARD": "card", "ATM": "atm",
            "CASH": "cash", "OTHERS": "netbanking",
        }
        payment_method = mode_map.get(mode.upper(), "unknown")

        # Categorize
        category = categorize_narration(narration)

        # Extract merchant from narration
        merchant = narration.split("/")[0].strip() if "/" in narration else narration.strip()
        if not merchant or merchant == "nan":
            merchant = "Unknown"

        # Signed amount
        signed_amount = amount if txn_type == "CREDIT" else -amount

        transactions.append({
            "id": f"txn_{len(transactions)+1:04d}",
            "date": date_str,
            "time": time_str,
            "amount": signed_amount,
            "category": category,
            "merchant": merchant,
            "account": "Bank Account",
            "paymentMethod": payment_method,
            "flagged": False,
            "source": "kaggle",
            "hour": hour,
            "day_of_week": day_of_week,
            "month": month,
            "abs_amount": abs(amount),
            "narration": narration,
        })

    return transactions


def train_categorization(transactions):
    """Train transaction categorization using RandomForest + TF-IDF."""
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.preprocessing import LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report
    import joblib

    print("\n--- Training Categorization Model (985 transactions) ---")

    narrations = [t["narration"] for t in transactions]
    categories = [t["category"] for t in transactions]

    # TF-IDF on narration text
    vectorizer = TfidfVectorizer(max_features=500, stop_words="english", ngram_range=(1, 2))
    X_text = vectorizer.fit_transform(narrations).toarray()

    # Payment method encoding
    payment_methods = sorted(set(t["paymentMethod"] for t in transactions))
    pm_encoder = {pm: i for i, pm in enumerate(payment_methods)}
    X_payment = np.array([[pm_encoder.get(t["paymentMethod"], 0)] for t in transactions])

    # Time features
    X_time = np.array([[
        t.get("hour", 12),
        t.get("day_of_week", 0),
        t.get("month", 1),
    ] for t in transactions])

    # Amount
    X_amount = np.array([[abs(t["amount"])] for t in transactions])

    X = np.hstack([X_text, X_payment, X_time, X_amount])

    le = LabelEncoder()
    y = le.fit_transform(categories)

    min_class_count = min(np.bincount(y))
    stratify_param = y if min_class_count >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify_param
    )

    clf = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)
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

    return {"model": "categorization", "accuracy": round(acc, 4), "samples": len(transactions)}


def train_spending_forecast(transactions):
    """Train spending forecast using LinearRegression on monthly aggregates."""
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import LabelEncoder
    import joblib

    print("\n--- Training Spending Forecast Model ---")

    monthly = {}
    for t in transactions:
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
    print(f"  Samples: {len(X)}")

    joblib.dump({"model": reg, "encoder": le}, os.path.join(MODELS_DIR, "spending_forecast_model.joblib"))
    return {"model": "spending_forecast", "r2_score": round(r2, 4), "samples": len(X)}


def train_anomaly_detector(transactions):
    """Train anomaly detection using IsolationForest."""
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    import joblib

    print("\n--- Training Anomaly Detection Model ---")

    merchant_totals = {}
    merchant_counts = {}
    category_totals = {}
    category_counts = {}
    for t in transactions:
        m, c, amt = t["merchant"], t["category"], abs(t["amount"])
        merchant_totals[m] = merchant_totals.get(m, 0) + amt
        merchant_counts[m] = merchant_counts.get(m, 0) + 1
        category_totals[c] = category_totals.get(c, 0) + amt
        category_counts[c] = category_counts.get(c, 0) + 1

    merchant_avg = {m: merchant_totals[m] / merchant_counts[m] for m in merchant_totals}
    category_avg = {c: category_totals[c] / category_counts[c] for c in category_totals}

    mean_amt = np.mean([abs(t["amount"]) for t in transactions])
    std_amt = np.std([abs(t["amount"]) for t in transactions]) or 1.0

    features = []
    for t in sorted(transactions, key=lambda x: x["date"]):
        amt = abs(t["amount"])
        features.append([
            amt,
            t.get("hour", 12),
            t.get("day_of_week", 0),
            merchant_avg.get(t["merchant"], 0),
            category_avg.get(t["category"], 0),
            (amt - mean_amt) / std_amt,
        ])

    X = np.array(features)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = IsolationForest(contamination=0.05, random_state=42)
    clf.fit(X_scaled)
    preds = clf.predict(X_scaled)
    n_anomalies = int((preds == -1).sum())
    print(f"  Anomalies detected: {n_anomalies}/{len(X)} ({n_anomalies/len(X)*100:.1f}%)")

    joblib.dump(clf, os.path.join(MODELS_DIR, "anomaly_model.joblib"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "anomaly_scaler.joblib"))
    return {"model": "anomaly_detector", "anomalies": n_anomalies, "samples": len(X)}


def train_budget_optimizer(transactions):
    """Train budget recommendation using statistical analysis."""
    import joblib

    print("\n--- Training Budget Optimizer ---")

    monthly = {}
    for t in transactions:
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
        print(f"  {cat:<20s} | Recommended: Rs.{stats['recommended_budget']:>10.2f} | Months: {stats['n_months']}")

    joblib.dump(budget_stats, os.path.join(MODELS_DIR, "budget_model.joblib"))
    return {"model": "budget_optimizer", "categories": len(budget_stats)}


def train_goal_predictor(transactions):
    """Train goal achievement predictor using LinearRegression."""
    from sklearn.linear_model import LinearRegression
    import joblib

    print("\n--- Training Goal Predictor ---")

    monthly_income = sum(abs(t["amount"]) for t in transactions if t["amount"] > 0)
    months = len(set(datetime.strptime(t["date"], "%Y-%m-%d").strftime("%Y-%m") for t in transactions))
    monthly_income_avg = monthly_income / max(months, 1)

    monthly_expenses = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)
    monthly_expenses_avg = monthly_expenses / max(months, 1)

    savings_rate = max(monthly_income_avg - monthly_expenses_avg, 1.0)

    # Generate synthetic goals based on real spending patterns
    goals = [
        {"target": 100000, "current": 65000, "rate": savings_rate, "elapsed": months},
        {"target": 50000, "current": 20000, "rate": savings_rate, "elapsed": months},
        {"target": 200000, "current": 80000, "rate": savings_rate, "elapsed": months},
        {"target": 30000, "current": 25000, "rate": savings_rate, "elapsed": months},
        {"target": 150000, "current": 50000, "rate": savings_rate, "elapsed": months},
    ]

    # Add more training data by varying savings rates
    for multiplier in [0.5, 0.75, 1.0, 1.25, 1.5]:
        for g in goals[:3]:
            remaining = max(g["target"] - g["current"], 0)
            months_remaining = remaining / (savings_rate * multiplier) if savings_rate * multiplier > 0 else 12
            goals.append({
                "target": g["target"],
                "current": g["current"],
                "rate": savings_rate * multiplier,
                "elapsed": months,
                "months_remaining": months_remaining,
            })

    X = np.array([[g["target"], g["current"], g["rate"], g["elapsed"]] for g in goals])
    y = np.array([g.get("months_remaining", (g["target"] - g["current"]) / g["rate"]) for g in goals])

    reg = LinearRegression()
    reg.fit(X, y)
    r2 = reg.score(X, y)
    print(f"  R2 Score: {r2:.4f}")
    print(f"  Monthly Income: Rs.{monthly_income_avg:,.2f}")
    print(f"  Monthly Expenses: Rs.{monthly_expenses_avg:,.2f}")
    print(f"  Savings Rate: Rs.{savings_rate:,.2f}/month")
    for name, coef in zip(["target", "current", "savings_rate", "months_elapsed"], reg.coef_):
        print(f"    {name:<20s}: {coef:.6f}")

    joblib.dump(reg, os.path.join(MODELS_DIR, "goal_model.joblib"))
    return {"model": "goal_predictor", "r2_score": round(r2, 4), "samples": len(X)}


def main():
    print("=" * 60)
    print("  ML Retraining with Kaggle Data (985 transactions)")
    print("=" * 60)

    transactions = load_and_process_data()

    # Show category distribution
    from collections import Counter
    cat_counts = Counter(t["category"] for t in transactions)
    print("\nCategory Distribution:")
    for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat:<20s}: {count:>4d} ({count/len(transactions)*100:.1f}%)")

    # Save processed data
    processed_path = os.path.join(DATA_DIR, "processed_transactions.json")
    with open(processed_path, "w") as f:
        json.dump(transactions, f, indent=2)
    print(f"\nProcessed data saved to {processed_path}")

    # Train all models
    results = []
    results.append(train_categorization(transactions))
    results.append(train_spending_forecast(transactions))
    results.append(train_anomaly_detector(transactions))
    results.append(train_budget_optimizer(transactions))
    results.append(train_goal_predictor(transactions))

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

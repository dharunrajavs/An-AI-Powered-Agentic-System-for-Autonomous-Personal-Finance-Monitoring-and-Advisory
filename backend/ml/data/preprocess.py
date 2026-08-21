"""Feature engineering for ML models."""

from datetime import datetime
from collections import Counter
import numpy as np


def _parse_date(date_str):
    return datetime.strptime(date_str, "%Y-%m-%d")


def _parse_time(time_str):
    if not time_str:
        return 12
    return int(time_str.split(":")[0])


def prepare_categorization_features(transactions):
    """Extract features for transaction categorization model.

    Returns list of dicts with numeric features suitable for ML.
    """
    merchant_counter = Counter(t["merchant"] for t in transactions)
    payment_methods = sorted(set(t["paymentMethod"] for t in transactions))
    pm_index = {pm: i for i, pm in enumerate(payment_methods)}

    categories_seen = set()
    features = []
    for txn in transactions:
        dt = _parse_date(txn["date"])
        merchant = txn["merchant"]
        recurring_merchants = {"Netflix", "Spotify", "Apple", "Acme Corp Payroll", "Parkview Rentals LLC", "Planet Fitness"}
        features.append({
            "merchant_lower": hash(merchant.lower()) % 10000,
            "abs_amount": abs(txn["amount"]),
            "hour": _parse_time(txn.get("time")),
            "day_of_week": dt.weekday(),
            "month": dt.month,
            "payment_method_encoded": pm_index.get(txn["paymentMethod"], 0),
            "is_recurring": int(merchant in recurring_merchants),
            "merchant_frequency": merchant_counter[merchant],
        })
    return features


def prepare_spending_features(transactions):
    """Aggregate monthly spending per category.

    Returns dict: {category: {month: total_amount}}.
    """
    monthly = {}
    for txn in transactions:
        if txn["amount"] >= 0:
            continue
        dt = _parse_date(txn["date"])
        key = (txn["category"], dt.year, dt.month)
        monthly[key] = monthly.get(key, 0) + abs(txn["amount"])

    result = {}
    for (cat, year, month), total in monthly.items():
        if cat not in result:
            result[cat] = {}
        result[cat][f"{year}-{month:02d}"] = round(total, 2)
    return result


def prepare_anomaly_features(transactions):
    """Extract features for anomaly detection model.

    Returns list of dicts with numeric features suitable for ML.
    """
    merchant_totals = {}
    merchant_counts = {}
    category_totals = {}
    category_counts = {}
    for txn in transactions:
        m = txn["merchant"]
        c = txn["category"]
        amt = abs(txn["amount"])
        merchant_totals[m] = merchant_totals.get(m, 0) + amt
        merchant_counts[m] = merchant_counts.get(m, 0) + 1
        category_totals[c] = category_totals.get(c, 0) + amt
        category_counts[c] = category_counts.get(c, 0) + 1

    merchant_avg = {m: merchant_totals[m] / merchant_counts[m] for m in merchant_totals}
    category_avg = {c: category_totals[c] / category_counts[c] for c in category_totals}

    last_seen = {}
    features = []
    for txn in sorted(transactions, key=lambda t: t["date"]):
        dt = _parse_date(txn["date"])
        m = txn["merchant"]
        c = txn["category"]
        amt = abs(txn["amount"])
        last = last_seen.get(m)
        days_since = (dt - last).days if last else 999
        last_seen[m] = dt
        features.append({
            "abs_amount": amt,
            "hour": _parse_time(txn.get("time")),
            "day_of_week": dt.weekday(),
            "merchant_avg_amount": round(merchant_avg[m], 2),
            "category_avg_amount": round(category_avg[c], 2),
            "days_since_last_similar": days_since,
        })
    return features

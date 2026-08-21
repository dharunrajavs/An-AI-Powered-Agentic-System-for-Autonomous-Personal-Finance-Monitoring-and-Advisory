import os
import glob
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def _load_transactions(data_dir: str) -> pd.DataFrame:
    """Load all CSV transaction files from data_dir."""
    csv_files = glob.glob(os.path.join(data_dir, "**", "*.csv"), recursive=True)
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {data_dir}")

    frames = []
    for f in csv_files:
        df = pd.read_csv(f)
        frames.append(df)

    data = pd.concat(frames, ignore_index=True)

    required_cols = {"abs_amount"}
    missing = required_cols - set(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    data["abs_amount"] = pd.to_numeric(data["abs_amount"], errors="coerce").fillna(0.0)

    return data


def _extract_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "timestamp" in df.columns:
        ts = pd.to_datetime(df["timestamp"], errors="coerce")
        df["hour"] = ts.dt.hour.fillna(0).astype(int)
        df["day_of_week"] = ts.dt.dayofweek.fillna(0).astype(int)
    else:
        df["hour"] = 0
        df["day_of_week"] = 0
    return df


def _compute_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer features for anomaly detection."""
    data = df.copy()

    # Merchant frequency
    if "merchant" in data.columns:
        merchant_freq = data["merchant"].value_counts(normalize=True)
        data["merchant_frequency"] = data["merchant"].map(merchant_freq).fillna(0.0)
    else:
        data["merchant_frequency"] = 0.0

    # Amount z-score
    mean_amt = data["abs_amount"].mean()
    std_amt = data["abs_amount"].std()
    if std_amt > 0:
        data["amount_zscore"] = (data["abs_amount"] - mean_amt) / std_amt
    else:
        data["amount_zscore"] = 0.0

    # Category deviation
    if "category" in data.columns:
        cat_mean = data.groupby("category")["abs_amount"].transform("mean")
        cat_std = data.groupby("category")["abs_amount"].transform("std").fillna(1.0)
        cat_std = cat_std.replace(0, 1.0)
        data["category_deviation"] = (data["abs_amount"] - cat_mean) / cat_std
    else:
        data["category_deviation"] = 0.0

    return data


def train_anomaly_model(data_dir: str, output_dir: str) -> dict:
    """Train an anomaly detection model and save artifacts.

    Args:
        data_dir: Directory containing transaction CSV files.
        output_dir: Directory to save model artifacts.

    Returns:
        Dictionary with training info.
    """
    os.makedirs(output_dir, exist_ok=True)

    data = _load_transactions(data_dir)
    data = _extract_time_features(data)
    data = _compute_features(data)

    feature_cols = [
        "abs_amount", "hour", "day_of_week",
        "merchant_frequency", "amount_zscore", "category_deviation",
    ]
    X = data[feature_cols].values

    if len(X) < 20:
        raise ValueError(f"Not enough data ({len(X)} rows) for anomaly detection training.")

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest
    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        max_samples="auto",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_scaled)

    # Training statistics
    predictions = model.predict(X_scaled)
    n_anomalies = int(np.sum(predictions == -1))
    anomaly_rate = n_anomalies / len(predictions)

    scores = model.decision_function(X_scaled)
    print(f"Anomaly Detection Model Training Complete:")
    print(f"  Total samples:    {len(X)}")
    print(f"  Anomalies found:  {n_anomalies} ({anomaly_rate:.2%})")
    print(f"  Score mean:       {scores.mean():.4f}")
    print(f"  Score std:        {scores.std():.4f}")

    # Save artifacts
    model_path = os.path.join(output_dir, "anomaly_model.joblib")
    scaler_path = os.path.join(output_dir, "anomaly_scaler.joblib")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"\nArtifacts saved to {output_dir}")

    return {
        "n_samples": len(X),
        "n_anomalies": n_anomalies,
        "anomaly_rate": anomaly_rate,
        "score_mean": float(scores.mean()),
        "model_path": model_path,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train anomaly detection model")
    parser.add_argument("--data-dir", required=True, help="Directory with transaction CSVs")
    parser.add_argument("--output-dir", default="./artifacts/anomaly", help="Output directory")
    args = parser.parse_args()

    metrics = train_anomaly_model(args.data_dir, args.output_dir)
    print(f"\nFinal metrics: {metrics}")

import os
import glob
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


CATEGORIES = [
    "Food & Drink", "Groceries", "Transport", "Subscriptions", "Rent",
    "Shopping", "Entertainment", "Utilities", "Health", "Travel",
    "Fitness", "Personal Care", "Income",
]


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

    required_cols = {"merchant", "abs_amount", "category"}
    missing = required_cols - set(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    for col in ("hour", "day_of_week", "month"):
        if col not in data.columns:
            data[col] = 0

    if "payment_method" not in data.columns:
        data["payment_method"] = "unknown"

    data["merchant"] = data["merchant"].fillna("unknown")
    data["abs_amount"] = pd.to_numeric(data["abs_amount"], errors="coerce").fillna(0.0)

    return data


def _extract_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "timestamp" in df.columns:
        ts = pd.to_datetime(df["timestamp"], errors="coerce")
        df["hour"] = ts.dt.hour.fillna(0).astype(int)
        df["day_of_week"] = ts.dt.dayofweek.fillna(0).astype(int)
        df["month"] = ts.dt.month.fillna(1).astype(int)
    return df


def train_categorization_model(data_dir: str, output_dir: str) -> dict:
    """Train a transaction categorization model and save artifacts.

    Args:
        data_dir: Directory containing transaction CSV files.
        output_dir: Directory to save model artifacts.

    Returns:
        Dictionary with training metrics.
    """
    os.makedirs(output_dir, exist_ok=True)

    data = _load_transactions(data_dir)
    data = _extract_time_features(data)

    # Filter to known categories
    data = data[data["category"].isin(CATEGORIES)].copy()
    if len(data) < 10:
        raise ValueError(f"Not enough data ({len(data)} rows) for training. Need at least 10.")

    # TF-IDF on merchant names
    vectorizer = TfidfVectorizer(max_features=500, stop_words="english", ngram_range=(1, 2))
    merchant_features = vectorizer.fit_transform(data["merchant"].astype(str))

    # Label encode payment_method
    payment_encoder = LabelEncoder()
    payment_encoded = payment_encoder.fit_transform(data["payment_method"].astype(str))

    # Numeric features
    numeric_features = data[["abs_amount", "hour", "day_of_week", "month"]].values
    payment_col = payment_encoded.reshape(-1, 1)

    # Combine all features
    X = np.hstack([
        merchant_features.toarray(),
        numeric_features,
        payment_col,
    ])

    # Encode target
    target_encoder = LabelEncoder()
    y = target_encoder.fit_transform(data["category"])

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train model
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=20,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(
        y_test, y_pred,
        target_names=target_encoder.classes_,
        zero_division=0,
    )

    print(f"Categorization Model Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(report)

    # Save artifacts
    model_path = os.path.join(output_dir, "categorize_model.joblib")
    vectorizer_path = os.path.join(output_dir, "categorize_vectorizer.joblib")
    encoder_path = os.path.join(output_dir, "categorize_encoder.joblib")
    payment_encoder_path = os.path.join(output_dir, "categorize_payment_encoder.joblib")

    joblib.dump(clf, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(target_encoder, encoder_path)
    joblib.dump(payment_encoder, payment_encoder_path)

    print(f"\nArtifacts saved to {output_dir}")

    return {
        "accuracy": accuracy,
        "n_samples": len(data),
        "n_features": X.shape[1],
        "model_path": model_path,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train transaction categorization model")
    parser.add_argument("--data-dir", required=True, help="Directory with transaction CSVs")
    parser.add_argument("--output-dir", default="./artifacts/categorize", help="Output directory")
    args = parser.parse_args()

    metrics = train_categorization_model(args.data_dir, args.output_dir)
    print(f"\nFinal metrics: {metrics}")

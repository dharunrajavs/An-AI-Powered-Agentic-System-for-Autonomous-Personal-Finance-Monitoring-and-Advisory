import os
import glob
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import OneHotEncoder


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

    if "category" not in data.columns or "abs_amount" not in data.columns:
        raise ValueError("Transactions must contain 'category' and 'abs_amount' columns")

    data["abs_amount"] = pd.to_numeric(data["abs_amount"], errors="coerce").fillna(0.0)

    if "timestamp" not in data.columns and "month" not in data.columns:
        data["month"] = 1

    return data


def _build_monthly_features(df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate transactions into monthly spending per category."""
    data = df.copy()

    if "timestamp" in data.columns:
        ts = pd.to_datetime(data["timestamp"], errors="coerce")
        data["month"] = ts.dt.to_period("M")

    monthly = (
        data.groupby(["month", "category"])
        .agg(
            total_spending=("abs_amount", "sum"),
            transaction_count=("abs_amount", "count"),
        )
        .reset_index()
    )

    # Historical average spending per category
    cat_avg = (
        data.groupby("category")["abs_amount"]
        .mean()
        .reset_index()
        .rename(columns={"abs_amount": "historical_avg"})
    )
    monthly = monthly.merge(cat_avg, on="category", how="left")
    monthly["historical_avg"] = monthly["historical_avg"].fillna(0.0)

    # Month index for numeric encoding
    month_map = {m: i for i, m in enumerate(sorted(monthly["month"].unique()))}
    monthly["month_index"] = monthly["month"].map(month_map).fillna(0).astype(int)

    return monthly


def train_spending_model(data_dir: str, output_dir: str) -> dict:
    """Train a spending forecast model and save artifacts.

    Args:
        data_dir: Directory containing transaction CSV files.
        output_dir: Directory to save model artifacts.

    Returns:
        Dictionary with training metrics.
    """
    os.makedirs(output_dir, exist_ok=True)

    raw_data = _load_transactions(data_dir)
    monthly = _build_monthly_features(raw_data)

    if len(monthly) < 10:
        raise ValueError(f"Not enough monthly data ({len(monthly)} rows) for training.")

    # One-hot encode category
    ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    cat_encoded = ohe.fit_transform(monthly[["category"]])

    # Feature matrix
    X = np.hstack([
        monthly[["month_index", "historical_avg", "transaction_count"]].values,
        cat_encoded,
    ])

    y = monthly["total_spending"].values

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Spending Forecast Model Metrics:")
    print(f"  MSE:  {mse:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  MAE:  {mae:.4f}")
    print(f"  R²:   {r2:.4f}")

    # Save artifacts
    model_path = os.path.join(output_dir, "spending_model.joblib")
    ohe_path = os.path.join(output_dir, "spending_ohe.joblib")

    joblib.dump({"model": model, "ohe": ohe}, model_path)

    print(f"\nArtifacts saved to {output_dir}")

    return {
        "mse": mse,
        "rmse": rmse,
        "mae": mae,
        "r2": r2,
        "n_samples": len(monthly),
        "model_path": model_path,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train spending forecast model")
    parser.add_argument("--data-dir", required=True, help="Directory with transaction CSVs")
    parser.add_argument("--output-dir", default="./artifacts/spending", help="Output directory")
    args = parser.parse_args()

    metrics = train_spending_model(args.data_dir, args.output_dir)
    print(f"\nFinal metrics: {metrics}")

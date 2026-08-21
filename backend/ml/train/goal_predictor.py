import os
import glob
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


def _load_goals(data_dir: str) -> pd.DataFrame:
    """Load goal-related CSV files from data_dir."""
    csv_files = glob.glob(os.path.join(data_dir, "**", "*.csv"), recursive=True)
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {data_dir}")

    frames = []
    for f in csv_files:
        df = pd.read_csv(f)
        frames.append(df)

    data = pd.concat(frames, ignore_index=True)

    # Check for goal-related columns
    goal_cols = {"target_amount", "current_amount", "monthly_savings_rate", "months_elapsed"}
    has_goal_cols = goal_cols.issubset(set(data.columns))

    if not has_goal_cols:
        # Attempt to compute from available columns
        if "target_amount" in data.columns and "current_amount" in data.columns:
            if "monthly_savings_rate" not in data.columns:
                data["monthly_savings_rate"] = 0.0
            if "months_elapsed" not in data.columns:
                data["months_elapsed"] = 0
        else:
            # Generate synthetic goal data from transactions for demonstration
            data = _generate_synthetic_goals(data)

    # Ensure numeric columns
    for col in ["target_amount", "current_amount", "monthly_savings_rate", "months_elapsed"]:
        if col in data.columns:
            data[col] = pd.to_numeric(data[col], errors="coerce").fillna(0.0)

    # Compute target: months_remaining
    if "months_remaining" not in data.columns:
        data["months_remaining"] = _compute_months_remaining(data)

    return data


def _generate_synthetic_goals(transactions: pd.DataFrame) -> pd.DataFrame:
    """Generate synthetic goal data from transaction summaries."""
    if "abs_amount" not in transactions.columns:
        raise ValueError("Transactions must contain 'abs_amount' column for goal generation")

    goals = []
    if "category" in transactions.columns:
        categories = transactions["category"].unique()
    else:
        categories = ["savings"]

    for cat in categories:
        if "category" in transactions.columns:
            cat_data = transactions[transactions["category"] == cat]
        else:
            cat_data = transactions

        if len(cat_data) == 0:
            continue

        total_saved = cat_data["abs_amount"].sum()
        monthly_avg = cat_data["abs_amount"].mean() * 30  # rough monthly estimate

        target = total_saved * np.random.uniform(1.2, 2.0)
        current = total_saved * np.random.uniform(0.3, 0.8)
        monthly_rate = max(monthly_avg, 1.0)
        months_elapsed = max(len(cat_data) // 30, 1)

        goals.append({
            "target_amount": target,
            "current_amount": current,
            "monthly_savings_rate": monthly_rate,
            "months_elapsed": months_elapsed,
            "category": cat,
        })

    if not goals:
        goals.append({
            "target_amount": 1000.0,
            "current_amount": 200.0,
            "monthly_savings_rate": 100.0,
            "months_elapsed": 2,
            "category": "savings",
        })

    return pd.DataFrame(goals)


def _compute_months_remaining(data: pd.DataFrame) -> pd.Series:
    """Compute months remaining to reach goal."""
    remaining = data["target_amount"] - data["current_amount"]
    rate = data["monthly_savings_rate"].replace(0, np.nan)
    months = remaining / rate
    months = months.fillna(12.0)  # default fallback
    months = months.clip(lower=0, upper=60)  # cap at 5 years
    return months


def train_goal_model(data_dir: str, output_dir: str) -> dict:
    """Train a goal achievement predictor model and save artifacts.

    Args:
        data_dir: Directory containing goal/transaction CSV files.
        output_dir: Directory to save model artifacts.

    Returns:
        Dictionary with training metrics.
    """
    os.makedirs(output_dir, exist_ok=True)

    data = _load_goals(data_dir)

    if len(data) < 5:
        raise ValueError(f"Not enough data ({len(data)} rows) for goal prediction training.")

    feature_cols = ["target_amount", "current_amount", "monthly_savings_rate", "months_elapsed"]
    X = data[feature_cols].values
    y = data["months_remaining"].values

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

    print(f"Goal Predictor Model Metrics:")
    print(f"  MSE:  {mse:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  MAE:  {mae:.4f}")
    print(f"  R²:   {r2:.4f}")
    print(f"  Feature importances:")
    for name, coef in zip(feature_cols, model.coef_):
        print(f"    {name:<25s}: {coef:.4f}")
    print(f"    {'intercept':<25s}: {model.intercept_:.4f}")

    # Save artifacts
    model_path = os.path.join(output_dir, "goal_model.joblib")
    joblib.dump(model, model_path)

    print(f"\nArtifacts saved to {output_dir}")

    return {
        "mse": mse,
        "rmse": rmse,
        "mae": mae,
        "r2": r2,
        "n_samples": len(data),
        "model_path": model_path,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train goal achievement predictor")
    parser.add_argument("--data-dir", required=True, help="Directory with goal/transaction CSVs")
    parser.add_argument("--output-dir", default="./artifacts/goal", help="Output directory")
    args = parser.parse_args()

    metrics = train_goal_model(args.data_dir, args.output_dir)
    print(f"\nFinal metrics: {metrics}")

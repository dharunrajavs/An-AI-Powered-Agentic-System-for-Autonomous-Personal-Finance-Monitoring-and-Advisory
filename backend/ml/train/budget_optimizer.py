import os
import glob
import numpy as np
import pandas as pd
import joblib


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

    required_cols = {"abs_amount", "category"}
    missing = required_cols - set(data.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    data["abs_amount"] = pd.to_numeric(data["abs_amount"], errors="coerce").fillna(0.0)

    return data


def train_budget_model(data_dir: str, output_dir: str) -> dict:
    """Train a budget recommendation model using statistical analysis.

    Computes recommended budget per category as: mean + 1.5 * std
    This allows some flexibility while preventing extreme overspending.

    Args:
        data_dir: Directory containing transaction CSV files.
        output_dir: Directory to save model artifacts.

    Returns:
        Dictionary with budget recommendations per category.
    """
    os.makedirs(output_dir, exist_ok=True)

    data = _load_transactions(data_dir)

    # Monthly aggregation per category
    if "timestamp" in data.columns:
        ts = pd.to_datetime(data["timestamp"], errors="coerce")
        data["month"] = ts.dt.to_period("M")

        monthly = (
            data.groupby(["month", "category"])["abs_amount"]
            .sum()
            .reset_index()
        )
    else:
        monthly = data[["category", "abs_amount"]].copy()
        monthly["month"] = "all"

    # Statistical analysis per category
    budget_stats = {}
    for cat in monthly["category"].unique():
        cat_spending = monthly.loc[monthly["category"] == cat, "abs_amount"]
        if len(cat_spending) == 0:
            continue

        mean_val = cat_spending.mean()
        std_val = cat_spending.std()
        if np.isnan(std_val):
            std_val = 0.0

        p25 = cat_spending.quantile(0.25)
        p50 = cat_spending.quantile(0.50)
        p75 = cat_spending.quantile(0.75)

        # Recommended budget: mean + 1.5 * std (allows flexibility)
        recommended = mean_val + 1.5 * std_val

        # Minimum budget: at least 25th percentile
        recommended = max(recommended, p25)

        budget_stats[cat] = {
            "mean": float(mean_val),
            "std": float(std_val),
            "p25": float(p25),
            "p50": float(p50),
            "p75": float(p75),
            "recommended_budget": float(recommended),
            "n_months": len(cat_spending),
        }

    print("Budget Recommendations per Category:")
    print("-" * 60)
    for cat, stats in sorted(budget_stats.items()):
        print(
            f"  {cat:<20s} | "
            f"Mean: {stats['mean']:>8.2f} | "
            f"Std: {stats['std']:>8.2f} | "
            f"Recommended: {stats['recommended_budget']:>8.2f} | "
            f"Months: {stats['n_months']}"
        )

    # Save model (budget stats as a dictionary)
    model_path = os.path.join(output_dir, "budget_model.joblib")
    joblib.dump(budget_stats, model_path)

    print(f"\nArtifacts saved to {output_dir}")

    return {
        "n_categories": len(budget_stats),
        "categories": list(budget_stats.keys()),
        "model_path": model_path,
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train budget recommendation model")
    parser.add_argument("--data-dir", required=True, help="Directory with transaction CSVs")
    parser.add_argument("--output-dir", default="./artifacts/budget", help="Output directory")
    args = parser.parse_args()

    metrics = train_budget_model(args.data_dir, args.output_dir)
    print(f"\nFinal metrics: {metrics}")

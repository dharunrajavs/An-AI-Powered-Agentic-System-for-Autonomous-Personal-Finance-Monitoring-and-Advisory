import os
from datetime import datetime, timedelta
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    BudgetRecommendationRequest,
    BudgetRecommendationResponse,
    BudgetRecommendationItem,
    CategoryPredictionRequest,
    CategoryPredictionResponse,
    GoalPredictionRequest,
    GoalPredictionResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
    SpendingForecastRequest,
    SpendingForecastResponse,
    SpendingForecastItem,
)

app = FastAPI(title="Personal Finance ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
loaded_models: dict[str, object] = {}


def load_model(filename: str):
    path = MODELS_DIR / filename
    if not path.exists():
        return None
    return joblib.load(path)


@app.on_event("startup")
def load_all_models():
    model_files = {
        "category": {
            "model": "categorize_model.joblib",
            "vectorizer": "categorize_vectorizer.joblib",
            "encoder": "categorize_encoder.joblib",
            "payment_encoder": "categorize_payment_encoder.joblib",
        },
        "spending": "spending_forecast_model.joblib",
        "anomaly": {
            "model": "anomaly_model.joblib",
            "scaler": "anomaly_scaler.joblib",
        },
        "budget": "budget_model.joblib",
        "goal": "goal_model.joblib",
    }

    for key, files in model_files.items():
        if isinstance(files, dict):
            assets = {}
            for asset_key, filename in files.items():
                assets[asset_key] = load_model(filename)
            loaded_models[key] = assets
        else:
            model = load_model(files)
            loaded_models[key] = {"model": model}

    loaded_count = sum(1 for v in loaded_models.values() if v.get("model") is not None)
    print(f"Loaded {loaded_count}/{len(model_files)} models")


@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": len(loaded_models)}


@app.get("/models")
def list_models():
    result = {}
    for name, info in loaded_models.items():
        has_model = info.get("model") is not None
        result[name] = {
            "loaded": has_model,
            "type": type(info.get("model")).__name__ if has_model else None,
        }
    return result


@app.post("/predict/category", response_model=CategoryPredictionResponse)
def predict_category(req: CategoryPredictionRequest):
    info = loaded_models.get("category")
    if not info or not info.get("model"):
        raise HTTPException(status_code=503, detail="Category model not loaded")

    try:
        model = info["model"]
        vectorizer = info["vectorizer"]
        encoder = info["encoder"]
        payment_encoder = info["payment_encoder"]

        merchant_vec = vectorizer.transform([req.merchant]).toarray()

        pm = req.payment_method.lower()
        pm_classes = list(payment_encoder.classes_) if hasattr(payment_encoder, "classes_") else []
        pm_idx = pm_classes.index(pm) if pm in pm_classes else 0
        pm_encoded = np.array([[pm_idx]])

        hour = 12
        if req.time:
            try:
                hour = int(req.time.split(":")[0])
            except (ValueError, IndexError):
                hour = 12

        day_of_week = 0
        month = 1
        if req.date:
            try:
                dt = datetime.strptime(req.date, "%Y-%m-%d")
                day_of_week = dt.weekday()
                month = dt.month
            except ValueError:
                pass

        numeric = np.array([[req.amount, hour, day_of_week, month]])
        X = np.hstack([merchant_vec, pm_encoded, numeric])

        probs = model.predict_proba(X)[0]
        pred_idx = int(np.argmax(probs))
        classes = list(encoder.classes_)
        all_probs = {classes[i]: round(float(probs[i]), 4) for i in range(len(classes))}

        return CategoryPredictionResponse(
            category=classes[pred_idx],
            confidence=round(float(probs[pred_idx]), 4),
            all_probabilities=all_probs,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/spending", response_model=SpendingForecastResponse)
def forecast_spending(req: SpendingForecastRequest):
    info = loaded_models.get("spending")
    if not info or not info.get("model"):
        raise HTTPException(status_code=503, detail="Spending forecast model not loaded")

    try:
        data = info["model"]
        model = data["model"]
        encoder = data["encoder"]

        all_categories = list(encoder.classes_)
        forecasts = []
        for cat in all_categories:
            if req.category and cat.lower() != req.category.lower():
                continue

            cat_idx = list(encoder.classes_).index(cat)
            X = np.array([[cat_idx, req.months_ahead]])
            predicted = float(model.predict(X)[0])
            forecasts.append(SpendingForecastItem(
                category=cat,
                predicted_amount=round(max(0.0, predicted), 2),
                confidence=0.75,
            ))

        return SpendingForecastResponse(forecasts=forecasts)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect/anomaly", response_model=AnomalyDetectionResponse)
def detect_anomaly(req: AnomalyDetectionRequest):
    info = loaded_models.get("anomaly")
    if not info or not info.get("model"):
        raise HTTPException(status_code=503, detail="Anomaly detection model not loaded")

    try:
        model = info["model"]
        scaler = info["scaler"]

        hour = 12
        if req.time:
            try:
                hour = int(req.time.split(":")[0])
            except (ValueError, IndexError):
                hour = 12

        day_of_week = 0
        if req.date:
            try:
                day_of_week = datetime.strptime(req.date, "%Y-%m-%d").weekday()
            except ValueError:
                pass

        features = np.array([[
            req.amount,
            hour,
            day_of_week,
            0,
            0,
            0,
        ]])
        features_scaled = scaler.transform(features)

        prediction = model.predict(features_scaled)[0]
        is_anomaly = bool(prediction == -1)

        try:
            score = float(model.decision_function(features_scaled)[0])
            anomaly_score = round(abs(score), 4)
        except AttributeError:
            anomaly_score = round(min(req.amount / 10000.0, 1.0), 4)

        risk_level = "low"
        if anomaly_score > 0.7:
            risk_level = "high"
        elif anomaly_score > 0.3:
            risk_level = "medium"

        return AnomalyDetectionResponse(
            is_anomaly=is_anomaly,
            anomaly_score=anomaly_score,
            risk_level=risk_level,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend/budget", response_model=BudgetRecommendationResponse)
def recommend_budget(req: BudgetRecommendationRequest):
    info = loaded_models.get("budget")
    if not info or not info.get("model"):
        raise HTTPException(status_code=503, detail="Budget model not loaded")

    try:
        budget_stats = info["model"]
        recommendations = []

        for cat, stats in budget_stats.items():
            recommended = stats["recommended_budget"]
            current = stats["mean"]
            utilization = round((current / recommended * 100), 1) if recommended > 0 else 0.0

            recommendations.append(BudgetRecommendationItem(
                category=cat,
                recommended_limit=round(recommended, 2),
                current_spending=round(current, 2),
                utilization_pct=utilization,
            ))

        recommendations.sort(key=lambda x: x.recommended_limit, reverse=True)
        return BudgetRecommendationResponse(recommendations=recommendations)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/goal", response_model=GoalPredictionResponse)
def predict_goal(req: GoalPredictionRequest):
    info = loaded_models.get("goal")
    if not info or not info.get("model"):
        raise HTTPException(status_code=503, detail="Goal model not loaded")

    try:
        model = info["model"]
        remaining = max(0.0, req.target_amount - req.current_amount)

        if req.monthly_savings <= 0:
            return GoalPredictionResponse(
                predicted_months=float("inf"),
                predicted_date="never",
                on_track=False,
            )

        features = np.array([[
            req.target_amount,
            req.current_amount,
            req.monthly_savings,
            3,
        ]])
        predicted_months = float(model.predict(features)[0])
        predicted_months = max(0.0, predicted_months)

        predicted_date = (datetime.now() + timedelta(days=int(predicted_months * 30))).strftime("%Y-%m-%d")
        on_track = predicted_months <= 12

        return GoalPredictionResponse(
            predicted_months=round(predicted_months, 1),
            predicted_date=predicted_date,
            on_track=on_track,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

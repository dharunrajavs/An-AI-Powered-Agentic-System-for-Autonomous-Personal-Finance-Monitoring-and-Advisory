from pydantic import BaseModel, Field
from typing import Optional


class CategoryPredictionRequest(BaseModel):
    merchant: str
    amount: float
    payment_method: str
    time: Optional[str] = None
    date: Optional[str] = None


class CategoryPredictionResponse(BaseModel):
    category: str
    confidence: float
    all_probabilities: dict


class SpendingForecastRequest(BaseModel):
    months_ahead: int = 1
    category: Optional[str] = None


class SpendingForecastItem(BaseModel):
    category: str
    predicted_amount: float
    confidence: float


class SpendingForecastResponse(BaseModel):
    forecasts: list[SpendingForecastItem]


class AnomalyDetectionRequest(BaseModel):
    merchant: str
    amount: float
    payment_method: str
    date: str
    time: Optional[str] = None


class AnomalyDetectionResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    risk_level: str


class BudgetRecommendationRequest(BaseModel):
    monthly_income: Optional[float] = None


class BudgetRecommendationItem(BaseModel):
    category: str
    recommended_limit: float
    current_spending: float
    utilization_pct: float


class BudgetRecommendationResponse(BaseModel):
    recommendations: list[BudgetRecommendationItem]


class GoalPredictionRequest(BaseModel):
    target_amount: float
    current_amount: float
    monthly_savings: float


class GoalPredictionResponse(BaseModel):
    predicted_months: float
    predicted_date: str
    on_track: bool

const ML_API_URL = process.env.EXPO_PUBLIC_ML_API_URL ?? 'http://localhost:8000';

interface CategoryPrediction {
  category: string;
  confidence: number;
  all_probabilities: Record<string, number>;
}

interface SpendingForecast {
  category: string;
  predicted_amount: number;
  confidence: number;
}

interface AnomalyResult {
  is_anomaly: boolean;
  anomaly_score: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface BudgetRecommendation {
  category: string;
  recommended_limit: number;
  current_spending: number;
  utilization_pct: number;
}

interface GoalPrediction {
  predicted_months: number;
  predicted_date: string;
  on_track: boolean;
}

async function mlFetch<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${ML_API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ML API error (${response.status}): ${error}`);
  }

  return response.json();
}

export async function predictCategory(
  merchant: string,
  amount: number,
  paymentMethod: string,
  date?: string,
  time?: string,
): Promise<CategoryPrediction> {
  return mlFetch<CategoryPrediction>('/predict/category', {
    merchant,
    amount: Math.abs(amount),
    payment_method: paymentMethod,
    date,
    time,
  });
}

export async function forecastSpending(
  monthsAhead: number = 1,
  category?: string,
): Promise<SpendingForecast[]> {
  const res = await mlFetch<{ forecasts: SpendingForecast[] }>('/predict/spending', {
    months_ahead: monthsAhead,
    category,
  });
  return res.forecasts;
}

export async function detectAnomaly(
  merchant: string,
  amount: number,
  paymentMethod: string,
  date: string,
  time?: string,
): Promise<AnomalyResult> {
  return mlFetch<AnomalyResult>('/detect/anomaly', {
    merchant,
    amount: Math.abs(amount),
    payment_method: paymentMethod,
    date,
    time,
  });
}

export async function getBudgetRecommendations(
  monthlyIncome?: number,
): Promise<BudgetRecommendation[]> {
  const res = await mlFetch<{ recommendations: BudgetRecommendation[] }>(
    '/recommend/budget',
    { monthly_income: monthlyIncome },
  );
  return res.recommendations;
}

export async function predictGoal(
  targetAmount: number,
  currentAmount: number,
  monthlySavings: number,
): Promise<GoalPrediction> {
  return mlFetch<GoalPrediction>('/predict/goal', {
    target_amount: targetAmount,
    current_amount: currentAmount,
    monthly_savings: monthlySavings,
  });
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${ML_API_URL}/health`);
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

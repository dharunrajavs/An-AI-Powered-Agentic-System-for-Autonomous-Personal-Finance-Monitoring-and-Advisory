export interface FireInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlySavings: number;
  monthlyExpenses: number;
  expectedReturns: number; // annual % (e.g. 12 for 12%)
  inflationRate: number; // annual % (e.g. 6 for 6%)
  withdrawalRate: number; // annual % (e.g. 4 for 4%)
}

export interface FireResults {
  yearsToRetirement: number;
  corpusNeeded: number; // amount needed at retirement (in today's value)
  corpusNeededInflated: number; // amount needed adjusted for inflation
  projectedCorpus: number; // what you'll actually have
  monthlyInvestmentNeeded: number; // what you need to save monthly to hit target
  isOnTrack: boolean;
  shortfall: number; // how much more you need (positive = gap, negative = surplus)
}

function futureValue(monthly: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return monthly * months;
  return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function futureValueLumpSum(present: number, annualRate: number, years: number): number {
  return present * Math.pow(1 + annualRate / 100, years);
}

function presentValue(future: number, annualRate: number, years: number): number {
  return future / Math.pow(1 + annualRate / 100, years);
}

export function calculateFire(inputs: FireInputs): FireResults {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlySavings,
    monthlyExpenses,
    expectedReturns,
    inflationRate,
    withdrawalRate,
  } = inputs;

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const monthsToRetirement = yearsToRetirement * 12;

  // Corpus needed in today's money: yearly expenses / withdrawal rate
  const yearlyExpenses = monthlyExpenses * 12;
  const corpusNeeded = yearlyExpenses / (withdrawalRate / 100);

  // Inflate the corpus needed to retirement date
  const corpusNeededInflated = futureValueLumpSum(corpusNeeded, inflationRate, yearsToRetirement);

  // Project current savings growth
  const savingsGrowth = futureValueLumpSum(currentSavings, expectedReturns, yearsToRetirement);

  // Project monthly investments
  const investmentGrowth = futureValue(monthlySavings, expectedReturns, monthsToRetirement);

  const projectedCorpus = savingsGrowth + investmentGrowth;

  const isOnTrack = projectedCorpus >= corpusNeededInflated;
  const shortfall = Math.max(0, corpusNeededInflated - projectedCorpus);

  // Calculate monthly investment needed to hit target
  const neededFromMonthly = Math.max(0, corpusNeededInflated - savingsGrowth);
  let monthlyInvestmentNeeded: number;
  if (yearsToRetirement > 0 && neededFromMonthly > 0) {
    const monthlyRate = expectedReturns / 12 / 100;
    if (monthlyRate === 0) {
      monthlyInvestmentNeeded = neededFromMonthly / monthsToRetirement;
    } else {
      monthlyInvestmentNeeded =
        neededFromMonthly / ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);
    }
  } else {
    monthlyInvestmentNeeded = 0;
  }

  return {
    yearsToRetirement,
    corpusNeeded: Math.round(corpusNeeded),
    corpusNeededInflated: Math.round(corpusNeededInflated),
    projectedCorpus: Math.round(projectedCorpus),
    monthlyInvestmentNeeded: Math.round(monthlyInvestmentNeeded),
    isOnTrack,
    shortfall: Math.round(shortfall),
  };
}

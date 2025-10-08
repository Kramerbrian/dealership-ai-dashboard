// Market configuration for DealershipAI
export const MARKET_QUERIES: Record<string, string[]> = {
  'Naples, FL': [
    'best Honda dealer in Naples Florida',
    'where to buy Toyota in Naples',
    'most trustworthy car dealership Naples FL',
    'Honda CR-V inventory Naples',
    'car dealerships with best service Naples',
    'trade in value Naples FL',
    'certified pre-owned vehicles Naples',
    'new Honda Accord price Naples',
    'Honda service center Naples',
    'car financing Naples FL',
    'used car dealer Naples',
    'Honda lease deals Naples',
    'car warranty Naples Florida',
    'auto repair Naples FL',
    'car inspection Naples'
  ],
  'Fort Myers, FL': [
    'best car dealer Fort Myers',
    'Toyota dealership near Fort Myers',
    'Honda dealer Fort Myers FL',
    'car dealerships Fort Myers',
    'new car prices Fort Myers',
    'used cars Fort Myers FL',
    'car service Fort Myers',
    'auto financing Fort Myers',
    'car lease Fort Myers',
    'Toyota service Fort Myers'
  ],
  'Miami, FL': [
    'best car dealership Miami',
    'Honda dealer Miami FL',
    'Toyota dealership Miami',
    'luxury car dealer Miami',
    'used cars Miami Florida',
    'car financing Miami',
    'auto service Miami',
    'car lease Miami FL'
  ],
  'Tampa, FL': [
    'car dealerships Tampa',
    'Honda dealer Tampa FL',
    'Toyota Tampa Florida',
    'used cars Tampa',
    'car service Tampa',
    'auto financing Tampa FL'
  ],
  'Orlando, FL': [
    'best car dealer Orlando',
    'Honda Orlando Florida',
    'Toyota dealership Orlando',
    'car dealerships Orlando FL',
    'used cars Orlando',
    'auto service Orlando'
  ]
};

export const COMPETITOR_MATRIX: Record<string, string[]> = {
  'Naples, FL': [
    'Naples Honda',
    'Germain Toyota',
    'Mazda of Naples',
    'Coconut Point Ford',
    'Marco Island Chrysler'
  ],
  'Fort Myers, FL': [
    'Germain Toyota Fort Myers',
    'Honda of Fort Myers',
    'Cape Coral Ford',
    'Fort Myers Mitsubishi',
    'Lee County Honda'
  ]
};

export const MARKET_DEMOGRAPHICS: Record<string, {
  population: number;
  median_income: number;
  car_ownership_rate: number;
  market_competitiveness: 'high' | 'medium' | 'low';
}> = {
  'Naples, FL': {
    population: 22000,
    median_income: 75000,
    car_ownership_rate: 0.92,
    market_competitiveness: 'high'
  },
  'Fort Myers, FL': {
    population: 87000,
    median_income: 55000,
    car_ownership_rate: 0.88,
    market_competitiveness: 'high'
  },
  'Miami, FL': {
    population: 470000,
    median_income: 45000,
    car_ownership_rate: 0.85,
    market_competitiveness: 'high'
  },
  'Tampa, FL': {
    population: 400000,
    median_income: 50000,
    car_ownership_rate: 0.87,
    market_competitiveness: 'high'
  },
  'Orlando, FL': {
    population: 300000,
    median_income: 48000,
    car_ownership_rate: 0.86,
    market_competitiveness: 'high'
  }
};
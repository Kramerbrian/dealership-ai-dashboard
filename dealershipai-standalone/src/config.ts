/**
 * DealershipAI Configuration
 * Market queries and API costs
 */

import { MarketQueries } from './core/types';

export const MARKET_QUERIES: MarketQueries = {
  'Naples, FL': [
    'best Honda dealer in Naples Florida',
    'where to buy Toyota in Naples',
    'trustworthy car dealership Naples',
    'Honda CR-V inventory Naples FL',
    'car dealerships best service Naples',
    'trade in value Naples dealership',
    'certified pre-owned Naples',
    'new Honda Accord price Naples',
    'BMW dealer Naples reviews',
    'Ford F-150 Naples inventory',
    'Chevrolet dealer Naples FL',
    'Nissan Altima Naples price',
    'Hyundai dealer Naples service',
    'Kia dealer Naples financing',
    'Mazda dealer Naples reviews',
    'Subaru dealer Naples inventory',
    'Volkswagen dealer Naples FL',
    'Audi dealer Naples service',
    'Mercedes dealer Naples reviews',
    'Lexus dealer Naples inventory',
    'Infiniti dealer Naples FL',
    'Acura dealer Naples service',
    'Genesis dealer Naples reviews',
    'Lincoln dealer Naples inventory',
    'Cadillac dealer Naples FL',
    'Buick dealer Naples service',
    'GMC dealer Naples reviews',
    'Ram dealer Naples inventory',
    'Jeep dealer Naples FL',
    'Chrysler dealer Naples service',
    'Dodge dealer Naples reviews',
    'used cars Naples FL',
    'car financing Naples',
    'auto loan Naples',
    'car insurance Naples',
    'vehicle inspection Naples',
    'car registration Naples',
    'DMV services Naples',
    'auto repair Naples',
    'car maintenance Naples'
  ],
  'Fort Myers, FL': [
    'best car dealer Fort Myers',
    'Toyota dealership near Fort Myers',
    'Honda dealer Fort Myers FL',
    'BMW dealer Fort Myers reviews',
    'Ford dealer Fort Myers inventory',
    'Chevrolet dealer Fort Myers FL',
    'Nissan dealer Fort Myers service',
    'Hyundai dealer Fort Myers reviews',
    'Kia dealer Fort Myers inventory',
    'Mazda dealer Fort Myers FL',
    'Subaru dealer Fort Myers service',
    'Volkswagen dealer Fort Myers reviews',
    'Audi dealer Fort Myers inventory',
    'Mercedes dealer Fort Myers FL',
    'Lexus dealer Fort Myers service',
    'Infiniti dealer Fort Myers reviews',
    'Acura dealer Fort Myers inventory',
    'Genesis dealer Fort Myers FL',
    'Lincoln dealer Fort Myers service',
    'Cadillac dealer Fort Myers reviews',
    'Buick dealer Fort Myers inventory',
    'GMC dealer Fort Myers FL',
    'Ram dealer Fort Myers service',
    'Jeep dealer Fort Myers reviews',
    'Chrysler dealer Fort Myers inventory',
    'Dodge dealer Fort Myers FL',
    'used cars Fort Myers FL',
    'car financing Fort Myers',
    'auto loan Fort Myers',
    'car insurance Fort Myers',
    'vehicle inspection Fort Myers',
    'car registration Fort Myers',
    'DMV services Fort Myers',
    'auto repair Fort Myers',
    'car maintenance Fort Myers',
    'best car dealership Fort Myers',
    'trusted auto dealer Fort Myers',
    'reliable car dealer Fort Myers',
    'affordable cars Fort Myers',
    'luxury cars Fort Myers'
  ]
};

export const API_COSTS = {
  tier1_monthly: 6.00,
  tier2_monthly: 15.00,
  tier3_monthly: 60.00
};

export const SCORING_WEIGHTS = {
  seo: 0.30,
  aeo: 0.35,
  geo: 0.35
};

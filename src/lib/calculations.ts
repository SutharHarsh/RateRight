import {
  type CalculationInput,
  calculateAccurateRate,
  type RateResult,
} from './accurateRateCalculation';

export type RateCalculationInput = CalculationInput;
export type RateCalculationResult = RateResult;

export async function calculateRate(
  input: RateCalculationInput
): Promise<RateCalculationResult> {
  return calculateAccurateRate(input);
}

export function getPositionLabel(
  position: 'below_average' | 'average' | 'above_average' | 'top_tier'
): string {
  switch (position) {
    case 'below_average':
      return 'Below Average';
    case 'average':
      return 'Average Range';
    case 'above_average':
      return 'Above Average';
    case 'top_tier':
      return 'Top Tier';
  }
}

export function getPositionColor(
  position: 'below_average' | 'average' | 'above_average' | 'top_tier'
): string {
  switch (position) {
    case 'below_average':
      return 'text-red-600';
    case 'average':
      return 'text-blue-600';
    case 'above_average':
      return 'text-green-600';
    case 'top_tier':
      return 'text-purple-600';
  }
}

import commissionsData from '../data/commissions.json';
import tattoosData from '../data/tattoos.json';

export type PricingTier = {
  tier: number;
  name: string;
  summary: string;
  exampleTitle: string;
  exampleImage: string;
  price: string;
  detail: string;
  complexity: string;
  background: string;
  revisions: string;
  turnaround: string;
  bestFor: string;
};

export type PricingPageData = {
  intro: string;
  tiers: PricingTier[];
  footer: string;
};

export const COMPARISON_ROWS: { key: keyof PricingTier; label: string }[] = [
  { key: 'price', label: 'Price' },
  { key: 'detail', label: 'Detail' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'background', label: 'Background' },
  { key: 'revisions', label: 'Revisions' },
  { key: 'turnaround', label: 'Turnaround' },
  { key: 'bestFor', label: 'Best for' },
];

export function getCommissionsPricing(): PricingPageData {
  return commissionsData;
}

export function getTattoosPricing(): PricingPageData {
  return tattoosData;
}

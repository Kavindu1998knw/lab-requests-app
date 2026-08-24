// GSMB Social Security Contribution Levy (2.56%) + Value Added Tax (18%)
// Total Multiplier = 1 + 0.0256 + ((1 + 0.0256) * 0.18) = 1.210208
export const TAX_MULTIPLIER = 1.210208;

export const calculateTaxTotal = (baseFee) => {
  const num = Number(baseFee);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Number((num * TAX_MULTIPLIER).toFixed(2));
};

export const CATEGORY_PREFIXES = {
  Quartz: 'QTZ',
  Dolomite: 'DOL',
  Water: 'WAT',
  General: 'GEN',
  Project: 'PRO',
};

export const getCategoryPrefix = (analysisType) => {
  return CATEGORY_PREFIXES[analysisType] || 'GEN';
};

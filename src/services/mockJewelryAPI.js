// Mock Jewelry Insurance API

const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateQuoteId = () => {
  return 'LJI-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
};

// Calculate premium for a single item
const calculateItemPremium = (item) => {
  const value = item?.value || 1000;

  // Base rate: 1-2% of jewelry value annually
  const itemTypeRates = {
    'Engagement Ring': 0.015,
    'Wedding Ring': 0.014,
    'Necklace': 0.016,
    'Bracelet': 0.016,
    'Earrings': 0.015,
    'Watch': 0.018,
    'Other': 0.017
  };

  let annualRate = itemTypeRates[item?.type] || 0.015;

  // Calculate annual premium for this item
  const annualPremium = value * annualRate;

  return annualPremium;
};

// Calculate total base premium for all items
const calculateBasePremium = (userData) => {
  const items = userData.jewelry?.items || [];

  let totalAnnualPremium = 0;

  items.forEach(item => {
    if (item?.value && item?.type) {
      totalAnnualPremium += calculateItemPremium(item);
    }
  });

  // Multi-item discount (5% off for 2+ items)
  if (items.length >= 2) {
    totalAnnualPremium *= 0.95;
  }

  // Convert to monthly
  const monthlyPremium = totalAnnualPremium / 12;

  return Math.round(monthlyPremium);
};

// Calculate coverage adjustments based on type
const calculateCoverageAdjustment = (coverageType) => {
  const adjustments = {
    'Comprehensive (Theft, Loss, Damage)': 1.0,
    'Theft Only': 0.6,
    'Loss and Theft': 0.8
  };
  return adjustments[coverageType] || 1.0;
};

// Calculate deductible discount
const calculateDeductibleDiscount = (deductible) => {
  const deductibleValue = typeof deductible === 'string'
    ? parseInt(deductible.replace(/[\$,]/g, ''))
    : deductible;

  const discounts = {
    0: 0,
    250: -5,
    500: -10,
    1000: -15
  };
  return discounts[deductibleValue] || 0;
};

// Generate jewelry insurance quote
export const generateQuote = async (userData) => {
  await simulateDelay(2000);

  console.log('Generating jewelry insurance quote with data:', userData);

  const items = userData.jewelry?.items || [];
  const totalValue = items.reduce((sum, item) => sum + (item?.value || 0), 0);

  // Calculate premiums
  const basePremium = calculateBasePremium(userData);
  const totalMonthly = Math.max(15, basePremium); // Minimum $15/month

  return {
    quoteId: generateQuoteId(),
    monthlyPremium: totalMonthly,
    annualPremium: Math.round(totalMonthly * 12 * 0.9), // 10% discount for annual payment
    items: items.filter(item => item?.type && item?.value),
    totalValue: totalValue,
    ownerInfo: {
      zipCode: userData.owner?.zipCode
    },
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    effectiveDate: new Date(),
    coverageBreakdown: {
      baseMonthly: basePremium,
      multiItemDiscount: items.length >= 2 ? '5%' : 'N/A'
    }
  };
};

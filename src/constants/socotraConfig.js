/**
 * Socotra Product Configuration Constants
 * These values must match the Socotra product configuration exactly.
 * Any mismatch will cause validation errors.
 */

// ============================================================
// JEWELRY TYPES (from PhysicalJewelry/config.json)
// ============================================================
export const JEWELRY_TYPES = [
  'Engagement Ring',
  'Wedding Set',
  'Ladies Wedding Ring',
  'Ladies Watch',
  'Ladies Necklace/Chain',
  'Ladies Pendant',
  'Ladies Bracelet',
  'Other Ladies Ring',
  'Loose Stone (must be in setting process)',
  'Mens Wedding Ring',
  'Mens Watch',
  'Mens Bracelet',
  'Mens Pendant',
  'Mens Necklace/Chain',
  'Other Mens Ring',
  'Pair of Earrings',
  'Single Earring',
  'Brooch',
  'Other'
];

// ============================================================
// DEDUCTIBLE OPTIONS (from PhysicalJewelry/config.json)
// ============================================================
export const DEDUCTIBLE_OPTIONS = [
  '$0',
  '$25',
  '$50',
  '$100',
  '$250',
  '$500',
  '$1,000',
  '$2,500',
  '$5,000',
  '$10,000',
  '$25,000'
];

// ============================================================
// ALARM SYSTEM OPTIONS (from PhysicalJewelry/config.json)
// ============================================================
export const ALARM_SYSTEM_OPTIONS = [
  'None',
  'Local Alarm',
  'Alarm Alerting Police',
  'Central Station Alarm'
];

// ============================================================
// SAFE TYPE OPTIONS (from PhysicalJewelry/config.json)
// ============================================================
export const SAFE_TYPE_OPTIONS = [
  'None',
  'Home Safe',
  'Safety Deposit Box / Vault'
];

// ============================================================
// GRADING REPORT OPTIONS (from PhysicalJewelry/config.json)
// ============================================================
export const GRADING_REPORT_OPTIONS = [
  'AGS',
  'IGI',
  'GIA',
  'GSI',
  'Forevermark',
  'Tiffany',
  'Other'
];

// ============================================================
// WHO WEARS JEWELRY OPTIONS (from PhysicalJewelry/config.json)
// ============================================================
export const WHO_WEARS_JEWELRY_OPTIONS = [
  'Self',
  'Other'
];

// ============================================================
// YES/NO OPTIONS
// ============================================================
export const YES_NO_OPTIONS = ['No', 'Yes'];

// ============================================================
// SALES CHANNEL OPTIONS (from Jewelry/config.json)
// ============================================================
export const SALES_CHANNEL_OPTIONS = [
  'Direct',
  'Jeweler',
  'Agent',
  'Progressive'
];

// ============================================================
// OCCUPATION OPTIONS (from Jewelry/config.json)
// ============================================================
export const OCCUPATION_OPTIONS = [
  'Active Military',
  'Finance / Consulting / Professional Services',
  'Healthcare / Medicine',
  'Technology / Science / Engineering',
  'Athlete / Entertainer',
  'Retired',
  'Student',
  'Other'
];

// ============================================================
// HOME OWNERSHIP OPTIONS (from Jewelry/config.json)
// ============================================================
export const HOME_OWNERSHIP_OPTIONS = [
  'Own',
  'Rent',
  'Other'
];

// ============================================================
// DOCUMENT TYPE OPTIONS (from Appraisal dataType)
// ============================================================
export const DOCUMENT_TYPE_OPTIONS = [
  'Appraisal',
  'Receipt'
];

// ============================================================
// US STATES (full names as required by Socotra)
// Must match the States constraint table
// ============================================================
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida',
  'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
  'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin',
  'Wyoming'
];

// ============================================================
// DEFAULT VALUES
// ============================================================
export const DEFAULTS = {
  deductible: '$0',
  alarmSystem: 'None',
  safeType: 'None',
  hasGradingReport: 'No',
  whoWearsJewelry: 'Self',
  salesChannel: 'Direct',
  criminalConvictions: 'No',
  previousExperienceLossDamaged: 'No',
  previousDenial: 'No',
  documentType: 'Appraisal',
  country: 'US'
};

// ============================================================
// VALIDATION RULES (from ValidationPluginImpl.java)
// ============================================================
export const VALIDATION_RULES = {
  minAppraisalValue: 500,      // Minimum total appraisal value
  maxAppraisalValue: 1000000,  // Maximum per item (for direct quote)
  minPremium: 50,              // Minimum premium
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a jewelry type is valid
 */
export function isValidJewelryType(type) {
  return JEWELRY_TYPES.includes(type);
}

/**
 * Check if a deductible is valid
 */
export function isValidDeductible(deductible) {
  return DEDUCTIBLE_OPTIONS.includes(deductible);
}

/**
 * Check if a state is valid
 */
export function isValidState(state) {
  return US_STATES.includes(state);
}

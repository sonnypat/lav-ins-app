// ZIP code to state mapping
// Using the first 3 digits of ZIP codes to determine state

const zipRanges = [
  { min: 350, max: 369, state: 'AL' },
  { min: 995, max: 999, state: 'AK' },
  { min: 850, max: 865, state: 'AZ' },
  { min: 716, max: 729, state: 'AR' },
  { min: 900, max: 961, state: 'CA' },
  { min: 800, max: 816, state: 'CO' },
  { min: 60, max: 69, state: 'CT' },
  { min: 197, max: 199, state: 'DE' },
  { min: 320, max: 349, state: 'FL' },
  { min: 300, max: 319, state: 'GA' },
  { min: 967, max: 968, state: 'HI' },
  { min: 832, max: 838, state: 'ID' },
  { min: 600, max: 629, state: 'IL' },
  { min: 460, max: 479, state: 'IN' },
  { min: 500, max: 528, state: 'IA' },
  { min: 660, max: 679, state: 'KS' },
  { min: 400, max: 427, state: 'KY' },
  { min: 700, max: 714, state: 'LA' },
  { min: 39, max: 49, state: 'ME' },
  { min: 206, max: 219, state: 'MD' },
  { min: 10, max: 27, state: 'MA' },
  { min: 480, max: 499, state: 'MI' },
  { min: 550, max: 567, state: 'MN' },
  { min: 386, max: 397, state: 'MS' },
  { min: 630, max: 658, state: 'MO' },
  { min: 590, max: 599, state: 'MT' },
  { min: 680, max: 693, state: 'NE' },
  { min: 889, max: 898, state: 'NV' },
  { min: 30, max: 38, state: 'NH' },
  { min: 70, max: 89, state: 'NJ' },
  { min: 870, max: 884, state: 'NM' },
  { min: 100, max: 149, state: 'NY' },
  { min: 270, max: 289, state: 'NC' },
  { min: 580, max: 588, state: 'ND' },
  { min: 430, max: 458, state: 'OH' },
  { min: 730, max: 749, state: 'OK' },
  { min: 970, max: 979, state: 'OR' },
  { min: 150, max: 196, state: 'PA' },
  { min: 28, max: 29, state: 'RI' },
  { min: 290, max: 299, state: 'SC' },
  { min: 570, max: 577, state: 'SD' },
  { min: 370, max: 385, state: 'TN' },
  { min: 750, max: 799, state: 'TX' },
  { min: 840, max: 847, state: 'UT' },
  { min: 50, max: 59, state: 'VT' },
  { min: 220, max: 246, state: 'VA' },
  { min: 980, max: 994, state: 'WA' },
  { min: 247, max: 268, state: 'WV' },
  { min: 530, max: 549, state: 'WI' },
  { min: 820, max: 831, state: 'WY' },
];

/**
 * Get state abbreviation from ZIP code
 * @param {string} zipCode - 5-digit ZIP code
 * @returns {string|null} - Two-letter state abbreviation or null if not found
 */
export function getStateFromZip(zipCode) {
  if (!zipCode) return null;

  // Extract first 3 digits
  const zip3 = parseInt(zipCode.substring(0, 3), 10);

  if (isNaN(zip3)) return null;

  // Find matching state
  for (const range of zipRanges) {
    if (zip3 >= range.min && zip3 <= range.max) {
      return range.state;
    }
  }

  return null;
}

// State abbreviation to full name mapping
const STATE_NAMES = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
};

/**
 * Convert state abbreviation to full state name
 * @param {string} stateAbbr - Two-letter state abbreviation (e.g., 'WA', 'NY')
 * @returns {string|null} - Full state name or null if not found
 */
export function getStateName(stateAbbr) {
  if (!stateAbbr) return null;
  const upperAbbr = stateAbbr.toUpperCase();
  return STATE_NAMES[upperAbbr] || null;
}

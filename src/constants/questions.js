// Jewelry Insurance Quote Questions
import { JEWELRY_TYPES } from './socotraConfig';

// Set to true to enable test mode with auto-filled values
export const TEST_MODE = false;

// Re-export JEWELRY_TYPES for backwards compatibility
export { JEWELRY_TYPES };

export const TEST_DATA = {
  owner: {
    zipCode: '10001',
    street: '123 Main Street',
    city: 'New York'
  },
  jewelry: {
    hasMultipleItems: 'No',
    items: [
      {
        type: 'Engagement Ring',
        value: 15000
      }
    ]
  }
};

export const QUESTIONS = [
  // Welcome Message
  {
    id: 'welcome',
    type: 'bot_message',
    message: "Welcome! Get a personalized jewelry insurance quote in under a minute. Let's protect what matters most.",
    skipInput: true
  },

  // Zip Code
  {
    id: 'zip_code',
    type: 'question',
    question: "What's your zip code?",
    field: 'owner.zipCode',
    inputType: 'text',
    validator: 'zipCode',
    testValue: TEST_DATA.owner.zipCode
  },

  // Multiple Items Question
  {
    id: 'has_multiple_items',
    type: 'question',
    question: "Do you have multiple jewelry items to insure?",
    field: 'jewelry.hasMultipleItems',
    inputType: 'select',
    options: ['Yes', 'No'],
    testValue: TEST_DATA.jewelry.hasMultipleItems
  },

  // Single Item Flow
  {
    id: 'single_item_type',
    type: 'question',
    question: "What type of jewelry would you like to insure?",
    field: 'jewelry.items.0.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'No',
    testValue: TEST_DATA.jewelry.items[0].type
  },
  {
    id: 'single_item_value',
    type: 'question',
    question: "What's the estimated or appraised value of this item?",
    field: 'jewelry.items.0.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'No',
    testValue: TEST_DATA.jewelry.items[0].value
  },

  // Multiple Items Flow - Item 1
  {
    id: 'multi_item_1_type',
    type: 'question',
    question: "Great! Let's start with your first item. What type of jewelry is it?",
    field: 'jewelry.items.0.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'Yes',
    testValue: TEST_DATA.jewelry.items[0].type
  },
  {
    id: 'multi_item_1_value',
    type: 'question',
    question: "What's the estimated or appraised value of this item?",
    field: 'jewelry.items.0.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'Yes',
    testValue: TEST_DATA.jewelry.items[0].value
  },
  // Ask about more items after item 1
  {
    id: 'has_more_items_1',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter1',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'Yes',
    testValue: 'Yes'
  },

  // Multiple Items Flow - Item 2
  {
    id: 'multi_item_2_type',
    type: 'question',
    question: "What type of jewelry is your second item?",
    field: 'jewelry.items.1.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter1 === 'Yes',
    testValue: 'Ladies Necklace/Chain'
  },
  {
    id: 'multi_item_2_value',
    type: 'question',
    question: "What's the value of this second item?",
    field: 'jewelry.items.1.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter1 === 'Yes',
    testValue: 8000
  },
  // Ask about more items after item 2
  {
    id: 'has_more_items_2',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter2',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter1 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 3
  {
    id: 'multi_item_3_type',
    type: 'question',
    question: "What type of jewelry is your third item?",
    field: 'jewelry.items.2.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter2 === 'Yes',
    testValue: 'Ladies Bracelet'
  },
  {
    id: 'multi_item_3_value',
    type: 'question',
    question: "What's the value of this third item?",
    field: 'jewelry.items.2.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter2 === 'Yes',
    testValue: 5000
  },
  // Ask about more items after item 3
  {
    id: 'has_more_items_3',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter3',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter2 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 4
  {
    id: 'multi_item_4_type',
    type: 'question',
    question: "What type of jewelry is your fourth item?",
    field: 'jewelry.items.3.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter3 === 'Yes',
    testValue: 'Mens Watch'
  },
  {
    id: 'multi_item_4_value',
    type: 'question',
    question: "What's the value of this fourth item?",
    field: 'jewelry.items.3.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter3 === 'Yes',
    testValue: 3000
  },
  // Ask about more items after item 4
  {
    id: 'has_more_items_4',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter4',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter3 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 5
  {
    id: 'multi_item_5_type',
    type: 'question',
    question: "What type of jewelry is your fifth item?",
    field: 'jewelry.items.4.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter4 === 'Yes',
    testValue: 'Pair of Earrings'
  },
  {
    id: 'multi_item_5_value',
    type: 'question',
    question: "What's the value of this fifth item?",
    field: 'jewelry.items.4.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter4 === 'Yes',
    testValue: 2000
  },
  // Ask about more items after item 5
  {
    id: 'has_more_items_5',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter5',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter4 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 6
  {
    id: 'multi_item_6_type',
    type: 'question',
    question: "What type of jewelry is your sixth item?",
    field: 'jewelry.items.5.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter5 === 'Yes',
    testValue: 'Brooch'
  },
  {
    id: 'multi_item_6_value',
    type: 'question',
    question: "What's the value of this sixth item?",
    field: 'jewelry.items.5.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter5 === 'Yes',
    testValue: 1500
  },
  // Ask about more items after item 6
  {
    id: 'has_more_items_6',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter6',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter5 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 7
  {
    id: 'multi_item_7_type',
    type: 'question',
    question: "What type of jewelry is your seventh item?",
    field: 'jewelry.items.6.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter6 === 'Yes',
    testValue: 'Other'
  },
  {
    id: 'multi_item_7_value',
    type: 'question',
    question: "What's the value of this seventh item?",
    field: 'jewelry.items.6.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter6 === 'Yes',
    testValue: 1000
  },
  // Ask about more items after item 7
  {
    id: 'has_more_items_7',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter7',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter6 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 8
  {
    id: 'multi_item_8_type',
    type: 'question',
    question: "What type of jewelry is your eighth item?",
    field: 'jewelry.items.7.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter7 === 'Yes',
    testValue: 'Other'
  },
  {
    id: 'multi_item_8_value',
    type: 'question',
    question: "What's the value of this eighth item?",
    field: 'jewelry.items.7.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter7 === 'Yes',
    testValue: 1000
  },
  // Ask about more items after item 8
  {
    id: 'has_more_items_8',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter8',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter7 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 9
  {
    id: 'multi_item_9_type',
    type: 'question',
    question: "What type of jewelry is your ninth item?",
    field: 'jewelry.items.8.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter8 === 'Yes',
    testValue: 'Other'
  },
  {
    id: 'multi_item_9_value',
    type: 'question',
    question: "What's the value of this ninth item?",
    field: 'jewelry.items.8.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter8 === 'Yes',
    testValue: 1000
  },
  // Ask about more items after item 9
  {
    id: 'has_more_items_9',
    type: 'question',
    question: "Do you have another item to insure?",
    field: 'jewelry.addMoreAfter9',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.addMoreAfter8 === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 10 (last one)
  {
    id: 'multi_item_10_type',
    type: 'question',
    question: "What type of jewelry is your tenth item?",
    field: 'jewelry.items.9.type',
    inputType: 'select',
    options: JEWELRY_TYPES,
    condition: (userData) => userData.jewelry?.addMoreAfter9 === 'Yes',
    testValue: 'Other'
  },
  {
    id: 'multi_item_10_value',
    type: 'question',
    question: "What's the value of this tenth item?",
    field: 'jewelry.items.9.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.addMoreAfter9 === 'Yes',
    testValue: 1000
  },
  // Message for reaching max items
  {
    id: 'max_items_reached',
    type: 'bot_message',
    message: "Great! You've added 10 items. Let's continue with the rest of your quote.",
    condition: (userData) => userData.jewelry?.addMoreAfter9 === 'Yes',
    skipInput: true
  },

  // Optional Image Upload
  {
    id: 'image_upload',
    type: 'question',
    question: "Would you like to add photos of your jewelry?",
    field: 'jewelry.images',
    inputType: 'image_upload',
    testValue: null
  },

  // Coverage Tier Selection
  {
    id: 'coverage_tier',
    type: 'question',
    question: "Choose your coverage level",
    field: 'coverage.tier',
    inputType: 'coverage_comparison',
    testValue: 'premium'
  },

  // Contact Information
  {
    id: 'owner_first_name',
    type: 'question',
    question: "Great! Now I need a few details to create your quote. What's your first name?",
    field: 'owner.firstName',
    inputType: 'text',
    validator: 'name',
    testValue: 'John'
  },
  {
    id: 'owner_last_name',
    type: 'question',
    question: "And your last name?",
    field: 'owner.lastName',
    inputType: 'text',
    validator: 'name',
    testValue: 'Doe'
  },
  {
    id: 'owner_email',
    type: 'question',
    question: "What's your email address?",
    field: 'owner.email',
    inputType: 'text',
    validator: 'email',
    testValue: 'john.doe@example.com'
  },
  {
    id: 'owner_phone',
    type: 'question',
    question: "And your phone number?",
    field: 'owner.phone',
    inputType: 'text',
    validator: 'phone',
    testValue: '555-123-4567'
  },

  // Address Information
  {
    id: 'owner_street',
    type: 'question',
    question: "What's your street address?",
    field: 'owner.street',
    inputType: 'text',
    validator: 'required',
    testValue: '123 Main Street'
  },
  {
    id: 'owner_city',
    type: 'question',
    question: "What city do you live in?",
    field: 'owner.city',
    inputType: 'text',
    validator: 'required',
    // Skip this question if city was already determined from ZIP code lookup
    condition: (userData) => !userData.owner?.city,
    testValue: 'New York'
  },

  // Summary
  {
    id: 'summary',
    type: 'bot_message',
    message: (userData) => {
      const items = userData.jewelry?.items || [];
      const totalValue = items.reduce((sum, item) => sum + (item?.value || 0), 0);
      const itemsList = items
        .filter(item => item?.type && item?.value)
        .map((item, index) => `${index + 1}. ${item.type} - $${item.value.toLocaleString()}`)
        .join('\n');

      const tierName = userData.coverage?.tier || 'Premium';
      const tierCapitalized = tierName.charAt(0).toUpperCase() + tierName.slice(1);

      const location = userData.owner?.city 
        ? `${userData.owner.city}, ${userData.owner?.state} ${userData.owner?.zipCode}`
        : `${userData.owner?.state}, ${userData.owner?.zipCode}`;
      return `Perfect! Here's what we'll be insuring:\n\n📍 **Location:** ${location}\n💎 **Items:**\n${itemsList}\n\n💰 **Total Value:** $${totalValue.toLocaleString()}\n🛡️ **Coverage:** ${tierCapitalized}\n\nGenerating your personalized quote...`;
    },
    triggerQuote: true
  }
];

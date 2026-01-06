// Jewelry Insurance Quote Questions

// Set to true to enable test mode with auto-filled values
export const TEST_MODE = false;

export const TEST_DATA = {
  owner: {
    zipCode: '10001'
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
    options: [
      'Engagement Ring',
      'Wedding Ring',
      'Necklace',
      'Bracelet',
      'Earrings',
      'Watch',
      'Other'
    ],
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
    options: [
      'Engagement Ring',
      'Wedding Ring',
      'Necklace',
      'Bracelet',
      'Earrings',
      'Watch',
      'Other'
    ],
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

  // Multiple Items Flow - Item 2
  {
    id: 'multi_item_2_type',
    type: 'question',
    question: "Now for your second item. What type of jewelry is it?",
    field: 'jewelry.items.1.type',
    inputType: 'select',
    options: [
      'Engagement Ring',
      'Wedding Ring',
      'Necklace',
      'Bracelet',
      'Earrings',
      'Watch',
      'Other'
    ],
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'Yes',
    testValue: 'Necklace'
  },
  {
    id: 'multi_item_2_value',
    type: 'question',
    question: "What's the value of this second item?",
    field: 'jewelry.items.1.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'Yes',
    testValue: 8000
  },

  // Ask about additional items
  {
    id: 'has_more_items',
    type: 'question',
    question: "Do you have any additional items to insure?",
    field: 'jewelry.hasMoreItems',
    inputType: 'select',
    options: ['Yes', 'No'],
    condition: (userData) => userData.jewelry?.hasMultipleItems === 'Yes',
    testValue: 'No'
  },

  // Multiple Items Flow - Item 3
  {
    id: 'multi_item_3_type',
    type: 'question',
    question: "What type is your third item?",
    field: 'jewelry.items.2.type',
    inputType: 'select',
    options: [
      'Engagement Ring',
      'Wedding Ring',
      'Necklace',
      'Bracelet',
      'Earrings',
      'Watch',
      'Other'
    ],
    condition: (userData) => userData.jewelry?.hasMoreItems === 'Yes',
    testValue: 'Bracelet'
  },
  {
    id: 'multi_item_3_value',
    type: 'question',
    question: "What's the value of this third item?",
    field: 'jewelry.items.2.value',
    inputType: 'number',
    validator: 'jewelryValue',
    condition: (userData) => userData.jewelry?.hasMoreItems === 'Yes',
    testValue: 5000
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

      return `Perfect! Here's what we'll be insuring:\n\n📍 **Location:** ${userData.owner?.state}, ${userData.owner?.zipCode}\n💎 **Items:**\n${itemsList}\n\n💰 **Total Value:** $${totalValue.toLocaleString()}\n🛡️ **Coverage:** ${tierCapitalized}\n\nGenerating your personalized quote...`;
    },
    triggerQuote: true
  }
];

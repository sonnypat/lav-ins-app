/**
 * Test script to verify the complete quote generation flow
 * Run with: node test-quote-flow.js
 */

import 'dotenv/config';

const SOCOTRA_CONFIG = {
  apiUrl: process.env.VITE_SOCOTRA_API_URL,
  accessToken: process.env.VITE_SOCOTRA_PAT,
  tenantLocator: process.env.VITE_SOCOTRA_TENANT_LOCATOR,
  productName: process.env.VITE_SOCOTRA_PRODUCT_NAME,
};

async function makeRequest(endpoint, method = 'GET', data = null) {
  const url = `${SOCOTRA_CONFIG.apiUrl}/policy/${SOCOTRA_CONFIG.tenantLocator}${endpoint}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${SOCOTRA_CONFIG.accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  console.log(`[Socotra] ${method} ${endpoint}`);

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API request failed: ${error.message || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[Socotra] Error on ${method} ${endpoint}:`, error);
    throw error;
  }
}

async function findOrCreateAccount(userData) {
  try {
    console.log('[Socotra] Finding or creating account...');

    // Step 1: Search for existing account by email
    console.log('[Socotra] Searching for existing account by email:', userData.owner.email);
    try {
      const searchParams = new URLSearchParams({
        email: userData.owner.email,
      });

      const accounts = await makeRequest(`/accounts?${searchParams.toString()}`, 'GET');

      if (accounts && accounts.length > 0) {
        console.log(`[Socotra] ✅ Found existing account: ${accounts[0].locator}`);
        console.log(`[Socotra] Account belongs to: ${accounts[0].data?.firstName} ${accounts[0].data?.lastName}`);
        return accounts[0];
      }

      console.log('[Socotra] No existing account found, will create new one...');
    } catch (searchError) {
      console.log('[Socotra] ⚠️ Error searching for account:', searchError.message);
      console.log('[Socotra] Will attempt to create new account...');
    }

    // Step 2: Create new account if not found
    const accountData = {
      type: 'ConsumerAccount',
      delinquencyPlanName: 'Standard',
      data: {
        firstName: userData.owner.firstName,
        lastName: userData.owner.lastName,
        emailAddress: userData.owner.email,
        phoneNumber: userData.owner.phone,
        stripeCustomerId: 'placeholder', // Required field - will be updated when payment is collected
        stripeKey: 'placeholder', // Required field - will be updated when payment is collected
        autopay: 'No', // Default to No autopay
      }
    };

    const account = await makeRequest('/accounts', 'POST', accountData);
    console.log('[Socotra] ✅ Account created:', account.locator);

    // Validate the account
    console.log('[Socotra] Validating account...');
    const validatedAccount = await makeRequest(`/accounts/${account.locator}/validate`, 'PATCH', {});
    console.log('[Socotra] Validation response:', JSON.stringify(validatedAccount, null, 2));
    console.log('[Socotra] ✅ Account validated');

    // Give Socotra a moment to process the validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fetch the updated account to ensure we have the latest state
    const updatedAccount = await makeRequest(`/accounts/${account.locator}`, 'GET');
    console.log('[Socotra] Account state:', updatedAccount.state);

    return updatedAccount;
  } catch (error) {
    console.error('[Socotra] Error in findOrCreateAccount:', error);
    throw error;
  }
}

async function generateJewelryQuote(userData) {
  try {
    console.log('[Socotra] Starting quote generation...');
    console.log('[Socotra] User data:', JSON.stringify(userData, null, 2));

    // Step 1: Create or find account
    const account = await findOrCreateAccount(userData);

    // Step 2: Build quote request
    const elements = userData.jewelry.items.map((item, index) => ({
      type: 'PhysicalJewelry',
      data: {
        jewelryType: item.type,
        deductible: '$0',
        appraisal: {
          appraisalValue: item.value,
          appraisalDate: new Date().toISOString().split('T')[0],
          documentType: 'Appraisal'
        },
        jewelryDescription: item.description || `${item.type}`,
        alarmSystem: 'None',
        hasGradingReport: 'No',
        whoWearsJewelry: 'Self',
        safeType: 'None',
      },
    }));

    const quoteRequest = {
      productName: SOCOTRA_CONFIG.productName,
      startTime: new Date().toISOString(),
      delinquencyPlanName: 'Standard',
      accountLocator: account.locator,
      elements: elements,
      data: {
        policyAddress: {
          line1: '',
          city: '',
          state: userData.owner.state,
          postalCode: userData.owner.zipCode || '',
          country: 'US'
        },
        salesChannel: 'Direct',
        criminalConvictions: 'No',
        previousExperienceLossDamaged: 'No',
        previousDenial: 'No',
      },
    };

    console.log('[Socotra] Quote request:', JSON.stringify(quoteRequest, null, 2));

    // Step 3: Create quote
    console.log('[Socotra] Creating quote...');
    const quote = await makeRequest('/quotes', 'POST', quoteRequest);
    console.log('[Socotra] ✅ Quote created:', quote.locator);

    // Step 4: Validate quote
    console.log('[Socotra] Validating quote...');
    await makeRequest(`/quotes/${quote.locator}/validate`, 'PATCH', {});
    console.log('[Socotra] ✅ Quote validated');

    // Step 5: Price quote
    console.log('[Socotra] Pricing quote...');
    await makeRequest(`/quotes/${quote.locator}/price`, 'PATCH', {});
    console.log('[Socotra] ✅ Quote priced');

    // Step 6: Get pricing data
    console.log('[Socotra] Fetching pricing data...');
    let pricingData = null;
    try {
      pricingData = await makeRequest(`/quotes/${quote.locator}/price`, 'GET');
      console.log('[Socotra] ✅ Pricing data retrieved');
      console.log('[Socotra] Pricing:', JSON.stringify(pricingData, null, 2));
    } catch (error) {
      console.log('[Socotra] ⚠️ Could not fetch pricing:', error.message);
    }

    // Step 7: Underwrite quote
    console.log('[Socotra] Underwriting quote...');
    await makeRequest(`/quotes/${quote.locator}/underwrite`, 'PATCH', {});
    console.log('[Socotra] ✅ Quote underwritten');

    // Step 8: Get full quote details
    console.log('[Socotra] Fetching complete quote...');
    const fullQuote = await makeRequest(`/quotes/${quote.locator}`, 'GET');
    console.log('[Socotra] ✅ Full quote retrieved');

    // Step 9: Transform to frontend format
    let totalPremium = 0;
    if (pricingData?.items && Array.isArray(pricingData.items)) {
      totalPremium = pricingData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    } else if (pricingData?.totalPremium) {
      totalPremium = pricingData.totalPremium;
    } else if (fullQuote.pricing?.totalPremium) {
      totalPremium = fullQuote.pricing.totalPremium;
    }

    const monthlyPremium = totalPremium > 0 ? Math.ceil(totalPremium / 12) : 0;
    const annualPremium = totalPremium;

    const result = {
      success: true,
      quoteId: fullQuote.locator,
      quoteLocator: fullQuote.locator,
      monthlyPremium: monthlyPremium,
      annualPremium: annualPremium,
      coverageDetails: {
        tier: userData.coverage?.tier || 'standard',
        items: userData.jewelry.items,
        totalValue: userData.jewelry.items.reduce((sum, item) => sum + item.value, 0),
      },
      ownerInfo: {
        name: `${userData.owner.firstName} ${userData.owner.lastName}`,
        email: userData.owner.email,
        phone: userData.owner.phone,
        state: userData.owner.state,
      },
      effectiveDate: new Date(fullQuote.startTimestamp || Date.now()),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      socotraData: {
        accountLocator: fullQuote.accountLocator,
        quoteLocator: fullQuote.locator,
        pricing: pricingData,
      },
    };

    console.log('[Socotra] ✅ Quote generation complete!');
    return result;

  } catch (error) {
    console.error('[Socotra] Quote generation failed:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error,
    };
  }
}

const testUserData = {
  owner: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    state: 'NY',
    zipCode: '10001'
  },
  jewelry: {
    items: [
      {
        type: 'Engagement Ring',
        value: 15000,
        description: 'Diamond engagement ring'
      },
      {
        type: 'Necklace',
        value: 8000,
        description: 'Gold necklace with pendant'
      }
    ]
  },
  coverage: {
    tier: 'premium'
  }
};

async function testQuoteFlow() {
  console.log('🧪 Testing Complete Quote Generation Flow\n');
  console.log('Test Data:');
  console.log(JSON.stringify(testUserData, null, 2));
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    const result = await generateJewelryQuote(testUserData);

    console.log('\n' + '='.repeat(60));
    console.log('📊 QUOTE RESULT:');
    console.log('='.repeat(60) + '\n');

    if (result.success) {
      console.log('✅ Quote generated successfully!\n');
      console.log(`Quote ID: ${result.quoteId}`);
      console.log(`Monthly Premium: $${result.monthlyPremium}`);
      console.log(`Annual Premium: $${result.annualPremium}`);
      console.log(`Total Coverage: $${result.coverageDetails.totalValue.toLocaleString()}`);
      console.log(`Owner: ${result.ownerInfo.name}`);
      console.log(`Email: ${result.ownerInfo.email}`);
      console.log(`State: ${result.ownerInfo.state}`);
      console.log(`\nItems covered:`);
      result.coverageDetails.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.type} - $${item.value.toLocaleString()}`);
      });

      console.log('\n✨ Full Quote Data:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Quote generation failed!');
      console.log(`Error: ${result.error}`);
      console.log('Details:', result.details);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('Stack:', error.stack);
  }
}

testQuoteFlow();

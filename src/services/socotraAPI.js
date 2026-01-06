/**
 * Socotra API Service for Jewelry Insurance
 * Handles authentication and API calls to Socotra platform
 */

const SOCOTRA_CONFIG = {
  apiUrl: import.meta.env.VITE_SOCOTRA_API_URL?.trim(),
  accessToken: import.meta.env.VITE_SOCOTRA_PAT?.trim(),
  tenantLocator: import.meta.env.VITE_SOCOTRA_TENANT_LOCATOR?.trim(),
  productName: import.meta.env.VITE_SOCOTRA_PRODUCT_NAME?.trim(),
};

// Validate configuration on load
console.log('[Socotra] Configuration loaded:');
console.log('[Socotra] API URL:', SOCOTRA_CONFIG.apiUrl);
console.log('[Socotra] Tenant Locator:', SOCOTRA_CONFIG.tenantLocator);
console.log('[Socotra] Product Name:', SOCOTRA_CONFIG.productName);
console.log('[Socotra] Has Access Token:', !!SOCOTRA_CONFIG.accessToken);

if (!SOCOTRA_CONFIG.apiUrl || !SOCOTRA_CONFIG.accessToken || !SOCOTRA_CONFIG.tenantLocator) {
  console.error('[Socotra] ❌ Missing required configuration! Check your .env file.');
  console.error('[Socotra] Required env vars: VITE_SOCOTRA_API_URL, VITE_SOCOTRA_PAT, VITE_SOCOTRA_TENANT_LOCATOR');
}

/**
 * Make authenticated API request to Socotra
 * Uses proxy in production, direct calls in development
 */
async function makeRequest(endpoint, method = 'GET', data = null) {
  const isDevelopment = import.meta.env.DEV;

  console.log(`[Socotra] ${method} ${endpoint} (${isDevelopment ? 'development' : 'production'})`);
  if (data) {
    console.log(`[Socotra] Request body:`, JSON.stringify(data, null, 2));
  }

  try {
    let response;

    if (isDevelopment) {
      // In development: make direct API calls (CORS may be an issue, but we have the env vars)
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

      console.log(`[Socotra] Direct request to: ${url}`);
      response = await fetch(url, options);
    } else {
      // In production: use serverless proxy
      const proxyUrl = '/api/socotra-proxy';
      response = await fetch(proxyUrl, {
        method: 'POST', // Always POST to proxy
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          method,
          data,
        }),
      });
    }

    console.log(`[Socotra] Response status:`, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Socotra] Error response:`, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || response.statusText };
      }
      throw new Error(`API request failed (${response.status}): ${error.message || error.error || response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`[Socotra] Response data:`, JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error(`[Socotra] Error on ${method} ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Find existing account or create new one
 */
async function findOrCreateAccount(userData) {
  try {
    console.log('[Socotra] Finding or creating account...');

    // Step 1: Search for existing account by email using /accounts/list
    console.log('[Socotra] Searching for existing account by email:', userData.owner.email);
    try {
      const accountsList = await makeRequest('/accounts/list', 'GET');

      if (accountsList && Array.isArray(accountsList)) {
        // Find account by email
        const existingAccount = accountsList.find(
          acc => acc.data?.emailAddress === userData.owner.email
        );

        if (existingAccount) {
          console.log(`[Socotra] ✅ Found existing account: ${existingAccount.locator}`);
          console.log(`[Socotra] Account belongs to: ${existingAccount.data?.firstName} ${existingAccount.data?.lastName}`);
          return existingAccount;
        }
      }

      console.log('[Socotra] No existing account found, will create new one...');
    } catch (searchError) {
      console.log('[Socotra] ⚠️ Error searching for account:', searchError.message);
      console.log('[Socotra] Will attempt to create new account...');
    }

    // Step 2: Create new account if not found
    console.log('[Socotra] Creating new account for:', userData.owner.email);
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

/**
 * Generate jewelry insurance quote
 */
export async function generateJewelryQuote(userData) {
  try {
    console.log('[Socotra] Starting quote generation...');
    console.log('[Socotra] User data:', JSON.stringify(userData, null, 2));

    // Step 1: Create or find account
    const account = await findOrCreateAccount(userData);

    // Step 2: Build quote request
    // Map the jewelry items to Socotra PhysicalJewelry exposures
    const elements = userData.jewelry.items.map((item, index) => ({
      type: 'PhysicalJewelry', // Matches the exposure type in config
      data: {
        jewelryType: item.type, // e.g., "Engagement Ring", "Wedding Set", etc.
        deductible: '$0', // Default deductible, can be made configurable
        appraisal: {
          appraisalValue: item.value,
          appraisalDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
          documentType: 'Appraisal'
        },
        jewelryDescription: item.description || `${item.type}`,
        alarmSystem: 'None', // Default value
        hasGradingReport: 'No', // Default
        whoWearsJewelry: 'Self', // Default
        safeType: 'None', // Default
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
          line1: '', // You may want to collect this in your flow
          city: '',
          state: userData.owner.state,
          postalCode: userData.owner.zipCode || '',
          country: 'US'
        },
        salesChannel: 'Direct', // Default to Direct
        criminalConvictions: 'No', // Default
        previousExperienceLossDamaged: 'No', // Default
        previousDenial: 'No', // Default
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
    const result = transformQuoteResponse(fullQuote, userData, pricingData);

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

/**
 * Transform Socotra quote response to frontend format
 */
function transformQuoteResponse(socotraQuote, userData, pricingData = null) {
  // Extract premium from pricing data
  let totalPremium = 0;

  if (pricingData?.items && Array.isArray(pricingData.items)) {
    // Sum all charges (premium + taxes + fees)
    totalPremium = pricingData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    console.log('[Socotra] Premium from pricing items:', totalPremium);
  } else if (pricingData?.totalPremium) {
    totalPremium = pricingData.totalPremium;
  } else if (socotraQuote.pricing?.totalPremium) {
    totalPremium = socotraQuote.pricing.totalPremium;
  }

  const monthlyPremium = totalPremium > 0 ? Math.ceil(totalPremium / 12) : 0;
  const annualPremium = totalPremium;

  return {
    success: true,
    quoteId: socotraQuote.locator,
    quoteLocator: socotraQuote.locator,
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
    effectiveDate: new Date(socotraQuote.startTimestamp || Date.now()),
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    socotraData: {
      accountLocator: socotraQuote.accountLocator,
      quoteLocator: socotraQuote.locator,
      pricing: pricingData,
    },
  };
}

/**
 * Issue a quote (convert to policy)
 */
export async function issueQuote(quoteLocator) {
  try {
    console.log('[Socotra] Issuing quote:', quoteLocator);
    const policy = await makeRequest(`/quotes/${quoteLocator}/issue`, 'POST', {});
    console.log('[Socotra] ✅ Policy issued:', policy.locator);

    return {
      success: true,
      policyLocator: policy.locator,
      policy,
    };
  } catch (error) {
    console.error('[Socotra] Error issuing quote:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Legacy function for backwards compatibility
 */
export const saveQuote = async (quoteData) => {
  console.warn('[Socotra] saveQuote is deprecated, use generateJewelryQuote instead');
  return generateJewelryQuote(quoteData);
};

/**
 * Legacy function for backwards compatibility
 */
export const convertQuoteToPolicy = issueQuote;

export default {
  generateJewelryQuote,
  issueQuote,
  saveQuote,
  convertQuoteToPolicy,
};

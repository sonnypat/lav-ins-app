/**
 * Socotra API Service for Jewelry Insurance
 * Handles authentication and API calls to Socotra platform
 */
import { getStateName } from '../utils/zipToState';
import { DEFAULTS, isValidJewelryType } from '../constants/socotraConfig';

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
  console.log(`[Socotra] ${method} ${endpoint}`);
  if (data) {
    console.log(`[Socotra] Request body:`, JSON.stringify(data, null, 2));
  }

  try {
    // Always use the proxy to avoid CORS issues
    // Vite will proxy /api/socotra-proxy to localhost:3001 in development
    // In production, it uses the Vercel serverless function
    const proxyUrl = '/api/socotra-proxy';
    
    console.log(`[Socotra] Using proxy: ${proxyUrl}`);
    
    const requestBody = {
      endpoint,
      method,
      data,
    };
    
    console.log('[Socotra] Request payload:', JSON.stringify(requestBody, null, 2));
    
    let response;
    try {
      response = await fetch(proxyUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('[Socotra] ✅ Fetch completed, status:', response.status);
    } catch (fetchError) {
      console.error('[Socotra] ❌ Fetch failed:', fetchError);
      console.error('[Socotra] Error details:', {
        message: fetchError.message,
        name: fetchError.name,
        proxyUrl: proxyUrl,
      });
      
      // Provide helpful error message
      if (isDevelopment) {
        const errorMsg = `Network error: Could not reach local proxy at ${proxyUrl}. ` +
          `Please ensure the proxy server is running: node proxy-server.js`;
        throw new Error(errorMsg);
      } else {
        throw new Error(`Network error: Could not reach proxy at ${proxyUrl}`);
      }
    }

    console.log(`[Socotra] Response status:`, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Socotra] Error response (${response.status}):`, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || response.statusText };
      }
      
      // Provide more detailed error information
      const errorMessage = error.message || error.error || response.statusText;
      const errorDetails = error.details || error.validationErrors || error.errors || error;
      
      console.error(`[Socotra] Error details:`, JSON.stringify(errorDetails, null, 2));
      
      const fullErrorMessage = `API request failed (${response.status}): ${errorMessage}`;
      const apiError = new Error(fullErrorMessage);
      apiError.status = response.status;
      apiError.details = errorDetails;
      throw apiError;
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
    console.log('[Socotra] User data for account:', {
      firstName: userData.owner.firstName,
      lastName: userData.owner.lastName,
      email: userData.owner.email,
      phone: userData.owner.phone,
    });
    
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

    console.log('[Socotra] Account creation payload:', JSON.stringify(accountData, null, 2));
    
    let account;
    try {
      account = await makeRequest('/accounts', 'POST', accountData);
      console.log('[Socotra] ✅ Account created:', account.locator);
      console.log('[Socotra] Account response:', JSON.stringify(account, null, 2));
    } catch (accountError) {
      console.error('[Socotra] ❌ Account creation failed:', accountError);
      console.error('[Socotra] Account creation error details:', accountError.details || accountError);
      console.error('[Socotra] Account creation error message:', accountError.message);
      throw accountError;
    }

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
    const elements = userData.jewelry.items.map((item, index) => {
      // Validate jewelry type
      if (!isValidJewelryType(item.type)) {
        console.warn(`[Socotra] ⚠️ Invalid jewelry type "${item.type}", defaulting to "Other"`);
      }
      
      return {
        type: 'PhysicalJewelry', // Matches the exposure type in config
        data: {
          jewelryType: isValidJewelryType(item.type) ? item.type : 'Other',
          deductible: item.deductible || DEFAULTS.deductible,
          appraisal: {
            appraisalValue: item.value,
            appraisalDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
            documentType: DEFAULTS.documentType
          },
          jewelryDescription: item.description || `${item.type}`,
          alarmSystem: item.alarmSystem || DEFAULTS.alarmSystem,
          hasGradingReport: item.hasGradingReport || DEFAULTS.hasGradingReport,
          whoWearsJewelry: item.whoWearsJewelry || DEFAULTS.whoWearsJewelry,
          safeType: item.safeType || DEFAULTS.safeType,
        },
      };
    });

    // Convert state abbreviation to full state name for Socotra
    // Socotra expects full state names, not abbreviations
    const stateAbbr = userData.owner.state;
    const stateName = getStateName(stateAbbr) || stateAbbr; // Fallback to abbreviation if conversion fails
    
    console.log('[Socotra] State conversion:', { abbreviation: stateAbbr, fullName: stateName });
    console.log('[Socotra] Address data from userData:', {
      street: userData.owner.street,
      city: userData.owner.city,
      state: stateName,
      zipCode: userData.owner.zipCode
    });

    const quoteRequest = {
      productName: SOCOTRA_CONFIG.productName,
      startTime: new Date().toISOString(),
      delinquencyPlanName: 'Standard',
      accountLocator: account.locator,
      elements: elements,
      data: {
        policyAddress: {
          address: userData.owner.street || '',
          city: userData.owner.city || '',
          state: stateName, // Use full state name instead of abbreviation
          zipCode: userData.owner.zipCode || '',
          country: DEFAULTS.country
        },
        timezoneState: stateName, // Separate timezone state field (full state name)
        salesChannel: DEFAULTS.salesChannel,
        criminalConvictions: DEFAULTS.criminalConvictions,
        previousExperienceLossDamaged: DEFAULTS.previousExperienceLossDamaged,
        previousDenial: DEFAULTS.previousDenial,
      },
    };

    console.log('[Socotra] Quote request:', JSON.stringify(quoteRequest, null, 2));

    // Step 3: Create quote
    console.log('[Socotra] Creating quote...');
    const quote = await makeRequest('/quotes', 'POST', quoteRequest);
    console.log('[Socotra] ✅ Quote created:', quote.locator);

    // Give Socotra a moment to process the quote creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Validate quote
    console.log('[Socotra] Validating quote...');
    try {
      const validationResponse = await makeRequest(`/quotes/${quote.locator}/validate`, 'PATCH', {});
      console.log('[Socotra] ✅ Quote validated');
      console.log('[Socotra] Validation response:', JSON.stringify(validationResponse, null, 2));
      
      // Check if validation returned any errors or warnings
      if (validationResponse?.validationErrors && validationResponse.validationErrors.length > 0) {
        console.warn('[Socotra] ⚠️ Validation errors:', validationResponse.validationErrors);
      }
      if (validationResponse?.validationWarnings && validationResponse.validationWarnings.length > 0) {
        console.warn('[Socotra] ⚠️ Validation warnings:', validationResponse.validationWarnings);
      }
    } catch (validationError) {
      console.error('[Socotra] ❌ Quote validation failed:', validationError);
      // Log more details about the validation error
      if (validationError.message) {
        console.error('[Socotra] Validation error message:', validationError.message);
      }
      throw new Error(`Quote validation failed: ${validationError.message}`);
    }

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

  console.log('[Socotra] Extracting premium from pricingData:', JSON.stringify(pricingData, null, 2));

  if (pricingData?.items && Array.isArray(pricingData.items)) {
    // Sum all charges (premium + taxes + fees) - use rate if amount is not available
    totalPremium = pricingData.items.reduce((sum, item) => {
      const value = item.amount ?? item.rate ?? 0;
      return sum + (typeof value === 'number' ? value : parseFloat(value) || 0);
    }, 0);
    console.log('[Socotra] Premium from pricing items:', totalPremium);
  } else if (pricingData?.totalPremium) {
    totalPremium = pricingData.totalPremium;
    console.log('[Socotra] Premium from pricingData.totalPremium:', totalPremium);
  } else if (pricingData?.total) {
    totalPremium = pricingData.total;
    console.log('[Socotra] Premium from pricingData.total:', totalPremium);
  } else if (socotraQuote.pricing?.totalPremium) {
    totalPremium = socotraQuote.pricing.totalPremium;
    console.log('[Socotra] Premium from socotraQuote.pricing.totalPremium:', totalPremium);
  } else if (socotraQuote.pricing?.items) {
    // Try to extract from quote's pricing items
    totalPremium = socotraQuote.pricing.items.reduce((sum, item) => {
      const value = item.amount ?? item.rate ?? 0;
      return sum + (typeof value === 'number' ? value : parseFloat(value) || 0);
    }, 0);
    console.log('[Socotra] Premium from socotraQuote.pricing.items:', totalPremium);
  }

  // Round to 2 decimal places
  totalPremium = Math.round(totalPremium * 100) / 100;
  
  const monthlyPremium = totalPremium > 0 ? Math.ceil(totalPremium / 12) : 0;
  const annualPremium = Math.round(totalPremium);
  
  console.log('[Socotra] Final premium - Annual:', annualPremium, 'Monthly:', monthlyPremium);

  const items = userData.jewelry.items;
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);

  return {
    success: true,
    quoteId: socotraQuote.locator,
    quoteLocator: socotraQuote.locator,
    monthlyPremium: monthlyPremium,
    annualPremium: annualPremium,
    // Root level fields for UI components
    items: items,
    totalValue: totalValue,
    // Detailed coverage info
    coverageDetails: {
      tier: userData.coverage?.tier || 'standard',
      items: items,
      totalValue: totalValue,
    },
    ownerInfo: {
      name: `${userData.owner.firstName} ${userData.owner.lastName}`,
      email: userData.owner.email,
      phone: userData.owner.phone,
      state: userData.owner.state,
      zipCode: userData.owner.zipCode,
      city: userData.owner.city,
      street: userData.owner.street,
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

    // Step 1: Fetch the quote to check its current state
    console.log('[Socotra] Checking quote state before issuing...');
    const quote = await makeRequest(`/quotes/${quoteLocator}`, 'GET');
    console.log('[Socotra] Quote state:', quote.state);
    console.log('[Socotra] Quote data structure:', JSON.stringify(quote.data, null, 2));

    // Step 1.5: Check and fix state if it's an abbreviation
    // Socotra requires full state names, not abbreviations
    let needsStateUpdate = false;
    let updatedState = null;
    
    // Check various possible paths for the state field
    const currentState = quote.data?.policyAddress?.state || 
                        quote.policyAddress?.state ||
                        (quote.data && quote.data.policyAddress && quote.data.policyAddress.state);
    
    console.log('[Socotra] Current quote state value:', currentState);
    
    if (currentState) {
      const fullStateName = getStateName(currentState);
      console.log('[Socotra] State conversion check:', { 
        current: currentState, 
        isAbbreviation: currentState.length === 2,
        fullName: fullStateName 
      });
      
      // If current state is an abbreviation (2 letters) and we can convert it
      if (currentState && currentState.length === 2 && fullStateName && currentState !== fullStateName) {
        console.log(`[Socotra] ⚠️ Quote has state abbreviation "${currentState}", converting to "${fullStateName}"`);
        needsStateUpdate = true;
        updatedState = fullStateName;
      } else if (currentState && currentState.length === 2 && !fullStateName) {
        console.warn(`[Socotra] ⚠️ Quote has state abbreviation "${currentState}" but conversion failed`);
      } else if (currentState.length > 2) {
        console.log(`[Socotra] ✅ Quote state appears to be full name: "${currentState}"`);
      }
    } else {
      console.warn('[Socotra] ⚠️ Could not find state in quote data');
    }

    // Update quote if state needs to be fixed
    if (needsStateUpdate && updatedState) {
      try {
        console.log('[Socotra] Updating quote with full state name...');
        const updateData = {
          data: {
            policyAddress: {
              ...quote.data.policyAddress,
              state: updatedState
            }
          }
        };
        console.log('[Socotra] Update payload:', JSON.stringify(updateData, null, 2));
        await makeRequest(`/quotes/${quoteLocator}`, 'PATCH', updateData);
        console.log('[Socotra] ✅ Quote state updated to:', updatedState);
        
        // Fetch updated quote to verify
        const updatedQuoteResponse = await makeRequest(`/quotes/${quoteLocator}`, 'GET');
        const verifiedState = updatedQuoteResponse.data?.policyAddress?.state || 
                             updatedQuoteResponse.policyAddress?.state;
        console.log('[Socotra] Verified updated state:', verifiedState);
        
        // Update our quote object with the latest data
        Object.assign(quote, updatedQuoteResponse);
        
        // Re-validate the quote after updating
        console.log('[Socotra] Re-validating quote after state update...');
        try {
          await makeRequest(`/quotes/${quoteLocator}/validate`, 'PATCH', {});
          console.log('[Socotra] ✅ Quote re-validated after state update');
        } catch (validationError) {
          console.warn('[Socotra] ⚠️ Could not re-validate after update:', validationError.message);
        }
        
        // Give Socotra a moment to process the update and validation
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (updateError) {
        console.error('[Socotra] ⚠️ Failed to update quote state:', updateError);
        // Continue anyway - might still work
      }
    }

    // Step 2: Check if quote has validation errors
    if (quote.validationErrors && quote.validationErrors.length > 0) {
      console.error('[Socotra] ❌ Quote has validation errors:', quote.validationErrors);
      return {
        success: false,
        error: 'Quote has validation errors and cannot be issued',
        validationErrors: quote.validationErrors,
        details: quote,
      };
    }

    // Step 3: Ensure quote is in a valid state for issuing
    // Quotes typically need to be: validated, priced, and underwritten
    const validStates = ['underwritten', 'ready_to_issue', 'issued'];
    if (!validStates.includes(quote.state)) {
      console.warn(`[Socotra] ⚠️ Quote is in state "${quote.state}", attempting to prepare for issue...`);
      
      // Try to ensure quote is validated
      if (quote.state !== 'validated' && quote.state !== 'priced' && quote.state !== 'underwritten') {
        try {
          console.log('[Socotra] Re-validating quote...');
          await makeRequest(`/quotes/${quoteLocator}/validate`, 'PATCH', {});
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (validationError) {
          console.warn('[Socotra] ⚠️ Could not re-validate quote:', validationError.message);
        }
      }

      // Try to ensure quote is priced
      if (quote.state !== 'priced' && quote.state !== 'underwritten') {
        try {
          console.log('[Socotra] Re-pricing quote...');
          await makeRequest(`/quotes/${quoteLocator}/price`, 'PATCH', {});
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (pricingError) {
          console.warn('[Socotra] ⚠️ Could not re-price quote:', pricingError.message);
        }
      }

      // Try to ensure quote is underwritten
      if (quote.state !== 'underwritten') {
        try {
          console.log('[Socotra] Re-underwriting quote...');
          await makeRequest(`/quotes/${quoteLocator}/underwrite`, 'PATCH', {});
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (underwriteError) {
          console.warn('[Socotra] ⚠️ Could not re-underwrite quote:', underwriteError.message);
        }
      }

      // Fetch updated quote state
      const updatedQuote = await makeRequest(`/quotes/${quoteLocator}`, 'GET');
      console.log('[Socotra] Updated quote state:', updatedQuote.state);
      
      if (updatedQuote.validationErrors && updatedQuote.validationErrors.length > 0) {
        console.error('[Socotra] ❌ Quote still has validation errors:', updatedQuote.validationErrors);
        return {
          success: false,
          error: 'Quote has validation errors and cannot be issued',
          validationErrors: updatedQuote.validationErrors,
          details: updatedQuote,
        };
      }
    }

    // Step 4: Issue the quote
    console.log('[Socotra] Attempting to issue quote...');
    const policy = await makeRequest(`/quotes/${quoteLocator}/issue`, 'POST', {});
    console.log('[Socotra] ✅ Policy issued:', policy.locator);

    return {
      success: true,
      policyLocator: policy.locator,
      policy,
    };
  } catch (error) {
    console.error('[Socotra] ❌ Error issuing quote:', error);
    console.error('[Socotra] Error details:', error.details || error);
    
    // Extract validation errors from error response if available
    let validationErrors = null;
    if (error.details) {
      if (Array.isArray(error.details.validationErrors)) {
        validationErrors = error.details.validationErrors;
      } else if (error.details.errors) {
        validationErrors = error.details.errors;
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to issue quote',
      validationErrors: validationErrors,
      details: error.details || error,
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

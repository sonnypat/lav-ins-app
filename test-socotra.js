/**
 * Test script to verify Socotra API connection
 * Run with: node test-socotra.js
 */

import 'dotenv/config';

const SOCOTRA_CONFIG = {
  apiUrl: process.env.VITE_SOCOTRA_API_URL,
  accessToken: process.env.VITE_SOCOTRA_PAT,
  tenantLocator: process.env.VITE_SOCOTRA_TENANT_LOCATOR,
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

  console.log(`Making request: ${method} ${url}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`API request failed: ${error.message || response.statusText}`);
  }

  return response.json();
}

async function testConnection() {
  console.log('Testing Socotra API connection...\n');
  console.log('Configuration:');
  console.log('- API URL:', SOCOTRA_CONFIG.apiUrl);
  console.log('- Tenant Locator:', SOCOTRA_CONFIG.tenantLocator);
  console.log('- Access Token:', SOCOTRA_CONFIG.accessToken ? 'PRESENT' : 'MISSING');
  console.log('\n---\n');

  try {
    // Test 1: Try to fetch accounts (should work if auth is correct)
    console.log('Test 1: Fetching accounts...');
    try {
      const accounts = await makeRequest('/accounts?limit=1');
      console.log('✅ Successfully connected to Socotra!');
      console.log(`Found ${accounts.length || 0} account(s)`);
      if (accounts.length > 0) {
        console.log('Sample account:', JSON.stringify(accounts[0], null, 2));
      }
    } catch (error) {
      console.log('⚠️  Could not fetch accounts:', error.message);
    }

    console.log('\n---\n');

    // Test 2: Try to create a test account
    console.log('Test 2: Creating a test account...');
    try {
      const testAccount = {
        type: 'ConsumerAccount',
        region: 'US',
        delinquencyPlanName: 'Standard',
        data: {
          firstName: 'Test',
          lastName: 'User',
          tier: 'Gold'
        }
      };

      const newAccount = await makeRequest('/accounts', 'POST', testAccount);
      console.log('✅ Successfully created test account!');
      console.log('Account locator:', newAccount.locator);

      // Validate the account
      console.log('\nValidating account...');
      await makeRequest(`/accounts/${newAccount.locator}/validate`, 'PATCH', {});
      console.log('✅ Account validated!');

      return newAccount;
    } catch (error) {
      console.log('⚠️  Could not create test account:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

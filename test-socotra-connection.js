/**
 * Test script to verify Socotra API connection
 * Run with: node test-socotra-connection.js
 */

const SOCOTRA_CONFIG = {
  apiUrl: 'https://api-kernel-dev.socotra.com',
  accessToken: 'SOCP_01KE8QZYBJPN7M3029K9SVCDNB',
  tenantLocator: 'a873840d-8be2-4db9-b56b-f776a048e9d8',
  productName: 'Jewelry',
};

async function testConnection() {
  console.log('🔍 Testing Socotra API Connection...\n');

  // Test 1: Create Account
  console.log('Test 1: Creating test account...');
  try {
    const accountData = {
      type: 'ConsumerAccount',
      delinquencyPlanName: 'Standard',
      data: {
        firstName: 'Test',
        lastName: 'User',
        emailAddress: `test-${Date.now()}@example.com`,
        phoneNumber: '5555551234',
        stripeCustomerId: 'placeholder',
        stripeKey: 'placeholder',
        autopay: 'No',
      }
    };

    const response = await fetch(
      `${SOCOTRA_CONFIG.apiUrl}/policy/${SOCOTRA_CONFIG.tenantLocator}/accounts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SOCOTRA_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      }
    );

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      return;
    }

    const account = await response.json();
    console.log('✅ Account created:', account.locator);
    console.log('Account data:', JSON.stringify(account, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();

/**
 * Test quote creation directly
 */

const testData = {
  owner: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '5555551234',
    state: 'NY',
    zipCode: '10001'
  },
  jewelry: {
    items: [
      {
        type: 'Engagement Ring',
        value: 5000
      }
    ]
  },
  coverage: {
    tier: 'standard'
  }
};

async function testQuoteCreation() {
  console.log('Testing quote creation via proxy...\n');

  try {
    // Use the deployed proxy
    const response = await fetch('https://lav-ins-app.vercel.app/api/socotra-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/quotes',
        method: 'POST',
        data: {
          productName: 'Jewelry',
          startTime: new Date().toISOString(),
          delinquencyPlanName: 'Standard',
          accountLocator: '01KE921YY19TE35VVBJ82DS7MS', // Existing validated account
          elements: [{
            type: 'PhysicalJewelry',
            data: {
              jewelryType: 'Engagement Ring',
              deductible: '$0',
              appraisal: {
                appraisalValue: 5000,
                appraisalDate: new Date().toISOString().split('T')[0],
                documentType: 'Appraisal'
              },
              jewelryDescription: 'Engagement Ring',
              alarmSystem: 'None',
              hasGradingReport: 'No',
              whoWearsJewelry: 'Self',
              safeType: 'None',
            },
          }],
          data: {
            policyAddress: {
              line1: '',
              city: '',
              state: 'NY',
              postalCode: '10001',
              country: 'US'
            },
            salesChannel: 'Direct',
            criminalConvictions: 'No',
            previousExperienceLossDamaged: 'No',
            previousDenial: 'No',
          },
        }
      }),
    });

    console.log('Response status:', response.status);

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testQuoteCreation();

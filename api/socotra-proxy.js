/**
 * Vercel Serverless Function to proxy Socotra API requests
 * This bypasses CORS restrictions by making requests server-side
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const SOCOTRA_CONFIG = {
    apiUrl: process.env.VITE_SOCOTRA_API_URL,
    accessToken: process.env.VITE_SOCOTRA_PAT,
    tenantLocator: process.env.VITE_SOCOTRA_TENANT_LOCATOR,
  };

  // Get the endpoint and method from the request
  const { endpoint, method = 'GET', data } = req.body || {};

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  const url = `${SOCOTRA_CONFIG.apiUrl}/policy/${SOCOTRA_CONFIG.tenantLocator}${endpoint}`;

  console.log(`[Socotra Proxy] ${method} ${endpoint}`);

  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${SOCOTRA_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    console.log(`[Socotra Proxy] Response status: ${response.status}`);

    if (!response.ok) {
      return res.status(response.status).json({
        error: responseData.message || 'Socotra API request failed',
        details: responseData,
      });
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error('[Socotra Proxy] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

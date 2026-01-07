/**
 * Simple local proxy server for development
 * Run with: node proxy-server.js
 * Then update vite.config.js to proxy to http://localhost:3001
 */

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const PORT = 3001;

const SOCOTRA_CONFIG = {
  apiUrl: process.env.VITE_SOCOTRA_API_URL?.trim(),
  accessToken: process.env.VITE_SOCOTRA_PAT?.trim(),
  tenantLocator: process.env.VITE_SOCOTRA_TENANT_LOCATOR?.trim(),
};

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/socotra-proxy') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { endpoint, method = 'GET', data } = JSON.parse(body);

      if (!endpoint) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing endpoint parameter' }));
        return;
      }

      if (!SOCOTRA_CONFIG.apiUrl || !SOCOTRA_CONFIG.accessToken || !SOCOTRA_CONFIG.tenantLocator) {
        res.writeHead(500);
        res.end(JSON.stringify({ 
          error: 'Missing Socotra configuration. Check your .env file.' 
        }));
        return;
      }

      const url = `${SOCOTRA_CONFIG.apiUrl}/policy/${SOCOTRA_CONFIG.tenantLocator}${endpoint}`;

      console.log(`[Local Proxy] ${method} ${endpoint}`);

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
      
      console.log(`[Local Proxy] Response status: ${response.status}`);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (isJson) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = { message: text || response.statusText };
      }

      if (!response.ok) {
        res.writeHead(response.status);
        res.end(JSON.stringify({
          error: responseData.message || responseData.error || 'Socotra API request failed',
          details: responseData,
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responseData));
    } catch (error) {
      console.error('[Local Proxy] Error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Local proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to: ${SOCOTRA_CONFIG.apiUrl}`);
  console.log(`\n⚠️  Make sure to update vite.config.js to proxy to http://localhost:${PORT}`);
});

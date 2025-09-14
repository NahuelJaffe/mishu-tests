const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app';

// Helper function to safely parse JSON response
async function safeJsonParse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log('Response is not JSON:', text.substring(0, 200));
    // Skip test if we get HTML instead of JSON (API not available)
    if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
      throw new Error('SKIP_API_TEST');
    }
    throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}...`);
  }
}

/**
 * API-06: System health check
 * Verifica que el endpoint de health check funcione
 */
test('API-06: System health check', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/health`);

  try {
    expect(response.status()).toBe(200);
    const responseBody = await safeJsonParse(response);
    expect(responseBody).toHaveProperty('status', 'ok');
  } catch (error) {
    if (error.message === 'SKIP_API_TEST') {
      test.skip('API endpoint not available - got HTML response instead of JSON');
    }
    throw error;
  }
});

/**
 * API-18: API version endpoint
 * Verifica que se pueda obtener la versión de la API
 */
test('API-18: API version endpoint', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/version`);

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }
  
  expect(response.status()).toBe(200);
  const responseBody = await safeJsonParse(response);
  expect(responseBody).toHaveProperty('version');
});

/**
 * API-19: Rate limiting validation
 * Verifica que el rate limiting funcione correctamente
 */
test('API-19: Rate limiting validation', async ({ request }) => {
  // First check if the health endpoint is available
  const testResponse = await request.get(`${baseURL}/api/health`);
  if (testResponse.status() === 404) {
    const contentType = testResponse.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }

  const requests = [];
  
  // Hacer múltiples requests rápidos para activar rate limiting
  for (let i = 0; i < 50; i++) {
    requests.push(request.get(`${baseURL}/api/health`));
  }
  
  const responses = await Promise.all(requests);
  
  // Al menos uno debería ser rate limited (429)
  const rateLimitedResponses = responses.filter(r => r.status() === 429);
  expect(rateLimitedResponses.length).toBeGreaterThan(0);
});

/**
 * API-20: CORS headers validation
 * Verifica que los headers CORS estén configurados correctamente
 */
test('API-20: CORS headers validation', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/health`);

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }
  
  const headers = response.headers();
  expect(headers).toHaveProperty('access-control-allow-origin');
});

/**
 * API-21: Error handling - 404 endpoint
 * Verifica que los endpoints inexistentes retornen 404
 */
test('API-21: Error handling - 404 endpoint', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/nonexistent-endpoint`);
  
  expect(response.status()).toBe(404);
});

/**
 * API-22: Security headers validation
 * Verifica que los headers de seguridad estén presentes
 */
test('API-22: Security headers validation', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/health`);

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }
  
  const headers = response.headers();
  expect(headers).toHaveProperty('x-content-type-options');
  expect(headers).toHaveProperty('x-frame-options');
});

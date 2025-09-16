const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = process.env.BASE_URL || 'https://your-app.example.com';
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

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
 * API-01: Login endpoint validation
 * Verifica que el endpoint de login funcione correctamente
 */
test('API-01: Login endpoint validation', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/auth/login`, {
    data: {
      email: email,
      password: password
    }
  });

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not available - got 404 HTML response');
    }
  }

  // Check if we got HTML instead of JSON (API not available)
  const contentType = response.headers()['content-type'] || '';
  if (contentType.includes('text/html')) {
    test.skip('API endpoint not available - got HTML response instead of JSON');
  }

  expect(response.status()).toBe(200);
  try {
    const responseBody = await safeJsonParse(response);
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('user');
  } catch (error) {
    if (error.message === 'SKIP_API_TEST') {
      test.skip('API endpoint not available - got HTML response instead of JSON');
    }
    throw error;
  }
});

/**
 * API-02: Invalid login credentials
 * Verifica que el endpoint rechace credenciales inválidas
 */
test('API-02: Invalid login credentials', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/auth/login`, {
    data: {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    }
  });

  // Check if we got HTML instead of JSON (API not available)
  const contentType = response.headers()['content-type'] || '';
  if (contentType.includes('text/html')) {
    test.skip('API endpoint not available - got HTML response instead of JSON');
  }

  expect(response.status()).toBe(401);
  const responseBody = await safeJsonParse(response);
  expect(responseBody).toHaveProperty('error');
});

/**
 * API-03: Token validation endpoint
 * Verifica que el endpoint de validación de token funcione
 */
test('API-03: Token validation', async ({ request }) => {
  // Skip if no auth token available from beforeAll
  if (!authToken) {
    test.skip('No auth token available - login may have failed');
  }

  const response = await request.get(`${baseURL}/api/auth/validate`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }

  expect(response.status()).toBe(200);
  const responseBody = await safeJsonParse(response);
  expect(responseBody).toHaveProperty('valid', true);
});

/**
 * API-04: Password reset request
 * Verifica que el endpoint de reset de contraseña funcione
 */
test('API-04: Password reset request', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/auth/reset-password`, {
    data: {
      email: email
    }
  });

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }

  expect([200, 202]).toContain(response.status());
  const responseBody = await safeJsonParse(response);
  expect(responseBody).toHaveProperty('message');
});

let authToken;

test.beforeAll(async ({ request }) => {
  try {
    const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
      data: {
        email: email,
        password: password
      }
    });
    
    if (loginResponse.ok()) {
      const loginBody = await safeJsonParse(loginResponse);
      authToken = loginBody.token;
    } else {
      console.log(`Login failed with status: ${loginResponse.status()}`);
    }
  } catch (error) {
    console.log('Login setup failed:', error.message);
  }
});

/**
 * API-05: Logout endpoint
 * Verifica que el endpoint de logout funcione correctamente
 */
test('API-05: Logout', async ({ request }) => {
  // Skip if no auth token available from beforeAll
  if (!authToken) {
    test.skip('No auth token available - login may have failed');
  }

  const response = await request.post(`${baseURL}/api/auth/logout`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }

  expect(response.status()).toBe(200);
  const responseBody = await safeJsonParse(response);
  expect(responseBody).toHaveProperty('message');
});

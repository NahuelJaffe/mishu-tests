const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'https://mishu-web--pr67-faq-0n1j2wio.web.app';
const email = process.env.TEST_EMAIL || 'nahueljaffe+bugwpp@gmail.com';
const password = process.env.TEST_PASSWORD || 'Tonna2-wahwon-gupreq';

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

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('token');
  expect(responseBody).toHaveProperty('user');
});

/**
 * API-02: Invalid login credentials
 * Verifica que el endpoint rechace credenciales inválidas
 */
test('API-02: Invalid login credentials', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/auth/login`, {
    data: {
      email: 'invalid@email.com',
      password: 'wrongpassword'
    }
  });

  expect(response.status()).toBe(401);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('error');
});

/**
 * API-03: Token validation endpoint
 * Verifica que el endpoint de validación de token funcione
 */
test('API-03: Token validation endpoint', async ({ request }) => {
  // Primero hacer login para obtener token
  const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
    data: {
      email: email,
      password: password
    }
  });

  const loginBody = await loginResponse.json();
  const token = loginBody.token;

  // Validar el token
  const validateResponse = await request.get(`${baseURL}/api/auth/validate`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  expect(validateResponse.status()).toBe(200);
  const validateBody = await validateResponse.json();
  expect(validateBody).toHaveProperty('valid', true);
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

  // Puede ser 200 (éxito) o 202 (aceptado para procesamiento)
  expect([200, 202]).toContain(response.status());
});

/**
 * API-05: Logout endpoint
 * Verifica que el endpoint de logout funcione correctamente
 */
test('API-05: Logout endpoint', async ({ request }) => {
  // Primero hacer login
  const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
    data: {
      email: email,
      password: password
    }
  });

  const loginBody = await loginResponse.json();
  const token = loginBody.token;

  // Hacer logout
  const logoutResponse = await request.post(`${baseURL}/api/auth/logout`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  expect(logoutResponse.status()).toBe(200);
});

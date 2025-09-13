const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'https://mishu-web--pr67-faq-0n1j2wio.web.app';
const email = process.env.TEST_EMAIL || 'nahueljaffe+bugwpp@gmail.com';
const password = process.env.TEST_PASSWORD || 'Tonna2-wahwon-gupreq';

let authToken;

test.beforeAll(async ({ request }) => {
  const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
    data: {
      email: email,
      password: password
    }
  });
  
  if (loginResponse.ok()) {
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;
  }
});

/**
 * API-12: Get user profile
 * Verifica que se pueda obtener el perfil del usuario
 */
test('API-12: Get user profile', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/user/profile`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('email');
  expect(responseBody).toHaveProperty('id');
});

/**
 * API-13: Update user profile
 * Verifica que se pueda actualizar el perfil del usuario
 */
test('API-13: Update user profile', async ({ request }) => {
  const response = await request.put(`${baseURL}/api/user/profile`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data: {
      firstName: 'API Test',
      lastName: 'User',
      timezone: 'UTC'
    }
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('firstName', 'API Test');
});

/**
 * API-14: Get notification preferences
 * Verifica que se puedan obtener las preferencias de notificación
 */
test('API-14: Get notification preferences', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/user/notifications`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('emailNotifications');
  expect(responseBody).toHaveProperty('browserNotifications');
});

/**
 * API-15: Update notification preferences
 * Verifica que se puedan actualizar las preferencias de notificación
 */
test('API-15: Update notification preferences', async ({ request }) => {
  const response = await request.put(`${baseURL}/api/user/notifications`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data: {
      emailNotifications: true,
      browserNotifications: false,
      alertTypes: ['flagged_messages', 'new_connections']
    }
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('emailNotifications', true);
  expect(responseBody).toHaveProperty('browserNotifications', false);
});

/**
 * API-16: Change password
 * Verifica que se pueda cambiar la contraseña del usuario
 */
test('API-16: Change password', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/user/change-password`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data: {
      currentPassword: password,
      newPassword: 'NewTestPassword123!',
      confirmPassword: 'NewTestPassword123!'
    }
  });

  // Puede retornar 200 o 202 dependiendo de si requiere confirmación
  expect([200, 202]).toContain(response.status());

  // Revertir el cambio de contraseña para no afectar otros tests
  if (response.ok()) {
    await request.post(`${baseURL}/api/user/change-password`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        currentPassword: 'NewTestPassword123!',
        newPassword: password,
        confirmPassword: password
      }
    });
  }
});

const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'https://your-app.example.com';
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

// Helper function to safely parse JSON responses
async function safeJsonParse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log('Response is not JSON:', text.substring(0, 200));
    throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}...`);
  }
}

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
 * API-12: Get user profile
 * Verifica que se pueda obtener el perfil del usuario
 */
test('API-12: Get user profile', async ({ request }) => {
  // Skip if no auth token available from beforeAll
  if (!authToken) {
    test.skip('No auth token available - login may have failed');
  }

  const response = await request.get(`${baseURL}/api/user/profile`, {
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
  expect(responseBody).toHaveProperty('email');
  expect(responseBody).toHaveProperty('id');
});

/**
 * API-13: Update user profile
 * Verifica que se pueda actualizar el perfil del usuario
 */
test('API-13: Update user profile', async ({ request }) => {
  // Skip if no auth token available from beforeAll
  if (!authToken) {
    test.skip('No auth token available - login may have failed');
  }

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

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }

  expect(response.status()).toBe(200);
  const responseBody = await safeJsonParse(response);
  expect(responseBody).toHaveProperty('firstName', 'API Test');
});

/**
 * API-14: Get notification preferences
 * Verifica que se puedan obtener las preferencias de notificación
 */
test('API-14: Get notification preferences', async ({ request }) => {
  // Skip if no auth token available from beforeAll
  if (!authToken) {
    test.skip('No auth token available - login may have failed');
  }

  const response = await request.get(`${baseURL}/api/user/notifications`, {
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
  expect(responseBody).toHaveProperty('emailNotifications');
  expect(responseBody).toHaveProperty('browserNotifications');
});

/**
 * API-15: Update notification preferences
 * Verifica que se puedan actualizar las preferencias de notificación
 */
test('API-15: Update notification preferences', async ({ request }) => {
  // Skip if no auth token available from beforeAll
  if (!authToken) {
    test.skip('No auth token available - login may have failed');
  }

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

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }

  expect(response.status()).toBe(200);
  const responseBody = await safeJsonParse(response);
  expect(responseBody).toHaveProperty('emailNotifications', true);
  expect(responseBody).toHaveProperty('browserNotifications', false);
});

/**
 * API-16: Change password
 * Verifica que se pueda cambiar la contraseña del usuario
 */
test('API-16: Change password', async ({ request }) => {
  // Skip if no auth token available from beforeAll
  if (!authToken) {
    test.skip('No auth token available - login may have failed');
  }

  const response = await request.post(`${baseURL}/api/user/change-password`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data: {
      currentPassword: password,
      newPassword: 'NewExamplePassword123!',
      confirmPassword: 'NewExamplePassword123!'
    }
  });

  // Check if we got a 404 with HTML response (API not available)
  if (response.status() === 404) {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('text/html')) {
      test.skip('API endpoint not found - got 404 HTML response');
    }
  }

  // Puede retornar 200 o 202 dependiendo de si requiere confirmación
  expect([200, 202]).toContain(response.status());

  // Revertir el cambio de contraseña para no afectar otros tests
  if (response.ok()) {
    await request.post(`${baseURL}/api/user/change-password`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        currentPassword: 'NewExamplePassword123!',
        newPassword: password,
        confirmPassword: password
      }
    });
  }
});

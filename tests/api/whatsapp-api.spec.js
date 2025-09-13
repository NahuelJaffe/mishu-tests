const { test, expect } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'https://mishu-web--pr67-faq-0n1j2wio.web.app';
const email = process.env.TEST_EMAIL || 'nahueljaffe+bugwpp@gmail.com';
const password = process.env.TEST_PASSWORD || 'Tonna2-wahwon-gupreq';

let authToken;

test.beforeAll(async ({ request }) => {
  // Obtener token de autenticación para todos los tests
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
 * API-06: Get WhatsApp connections
 * Verifica que se puedan obtener las conexiones de WhatsApp
 */
test('API-06: Get WhatsApp connections', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/whatsapp/connections`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBeTruthy();
});

/**
 * API-07: Create new WhatsApp connection
 * Verifica que se pueda crear una nueva conexión de WhatsApp
 */
test('API-07: Create new WhatsApp connection', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/whatsapp/connections`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data: {
      name: 'Test Child Connection',
      description: 'API Test Connection'
    }
  });

  expect([200, 201]).toContain(response.status());
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('id');
  expect(responseBody).toHaveProperty('qrCode');
});

/**
 * API-08: Get QR code for connection
 * Verifica que se pueda obtener el código QR para una conexión
 */
test('API-08: Get QR code for connection', async ({ request }) => {
  // Primero crear una conexión
  const createResponse = await request.post(`${baseURL}/api/whatsapp/connections`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data: {
      name: 'QR Test Connection'
    }
  });

  if (createResponse.ok()) {
    const createBody = await createResponse.json();
    const connectionId = createBody.id;

    // Obtener el QR code
    const qrResponse = await request.get(`${baseURL}/api/whatsapp/connections/${connectionId}/qr`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(qrResponse.status()).toBe(200);
    const qrBody = await qrResponse.json();
    expect(qrBody).toHaveProperty('qrCode');
  }
});

/**
 * API-09: Get messages for connection
 * Verifica que se puedan obtener mensajes de una conexión
 */
test('API-09: Get messages for connection', async ({ request }) => {
  const response = await request.get(`${baseURL}/api/whatsapp/messages`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    params: {
      limit: 10,
      offset: 0
    }
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('messages');
  expect(Array.isArray(responseBody.messages)).toBeTruthy();
});

/**
 * API-10: Flag message as important
 * Verifica que se pueda marcar un mensaje como importante
 */
test('API-10: Flag message as important', async ({ request }) => {
  // Primero obtener mensajes
  const messagesResponse = await request.get(`${baseURL}/api/whatsapp/messages`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    params: { limit: 1 }
  });

  if (messagesResponse.ok()) {
    const messagesBody = await messagesResponse.json();
    if (messagesBody.messages && messagesBody.messages.length > 0) {
      const messageId = messagesBody.messages[0].id;

      const flagResponse = await request.post(`${baseURL}/api/whatsapp/messages/${messageId}/flag`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: {
          flagged: true,
          reason: 'API Test Flag'
        }
      });

      expect([200, 201]).toContain(flagResponse.status());
    }
  }
});

/**
 * API-11: Delete WhatsApp connection
 * Verifica que se pueda eliminar una conexión de WhatsApp
 */
test('API-11: Delete WhatsApp connection', async ({ request }) => {
  // Crear una conexión para eliminar
  const createResponse = await request.post(`${baseURL}/api/whatsapp/connections`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data: {
      name: 'Connection to Delete'
    }
  });

  if (createResponse.ok()) {
    const createBody = await createResponse.json();
    const connectionId = createBody.id;

    // Eliminar la conexión
    const deleteResponse = await request.delete(`${baseURL}/api/whatsapp/connections/${connectionId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect([200, 204]).toContain(deleteResponse.status());
  }
});

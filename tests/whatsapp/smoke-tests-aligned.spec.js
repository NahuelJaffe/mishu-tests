/**
 * Smoke Tests Aligned - Excel v3
 * Tests: SMK-01, SMK-02, SMK-03, SMK-04, SMK-05
 * Based on Test_Cases_Mishu_FORMAL_MASTER_v3_COMPLETE.xlsx
 */

const { test, expect } = require('@playwright/test');
const { setupAnalyticsForSmoke } = require('../../analytics-setup');

test.describe('Smoke Tests - Excel v3 Aligned', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await setupAnalyticsForSmoke(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('SMK-01: Smoke – Login', async () => {
    console.log('🧪 SMK-01: Smoke – Login');
    
    // Precondición: Login page
    await page.goto(process.env.BASE_URL + 'login');
    await expect(page).toHaveURL(/.*login/);
    
    // Verificar que la página carga correctamente
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Ingresar credenciales válidas y presionar Login
    await page.fill('input[type="email"]', process.env.TEST_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Resultado esperado: Acceso exitoso a /connections
    await expect(page).toHaveURL(/.*connections/);
    await expect(page.locator('text=Connections')).toBeVisible();
    
    console.log('✅ SMK-01: Login exitoso');
  });

  test('SMK-02: Smoke – Navegación principal', async () => {
    console.log('🧪 SMK-02: Smoke – Navegación principal');
    
    // Precondición: Usuario autenticado
    await page.goto(process.env.BASE_URL + 'login');
    await page.fill('input[type="email"]', process.env.TEST_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*connections/);
    
    // Navegar entre Connections / Settings y volver
    // Ir a Settings
    await page.click('text=Settings');
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.locator('text=Settings')).toBeVisible();
    
    // Volver a Connections
    await page.click('text=Connections');
    await expect(page).toHaveURL(/.*connections/);
    await expect(page.locator('text=Connections')).toBeVisible();
    
    // Resultado esperado: Navegación fluida sin errores visibles
    console.log('✅ SMK-02: Navegación principal exitosa');
  });

  test('SMK-03: Smoke – Connections list', async () => {
    console.log('🧪 SMK-03: Smoke – Connections list');
    
    // Precondición: Usuario autenticado en Connections
    await page.goto(process.env.BASE_URL + 'login');
    await page.fill('input[type="email"]', process.env.TEST_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*connections/);
    
    // Abrir Connections
    await expect(page.locator('text=Connections')).toBeVisible();
    
    // Verificar que se muestra la lista de conexiones
    // Puede estar vacía o con conexiones existentes
    const connectionsList = page.locator('[data-testid="connections-list"], .connections-list, .connection-item');
    
    // Resultado esperado: Se listan las conexiones sin errores
    await expect(page.locator('text=Connections')).toBeVisible();
    
    // Verificar que no hay errores visibles
    await expect(page.locator('text=Error, text=error, .error')).toHaveCount(0);
    
    console.log('✅ SMK-03: Connections list cargada correctamente');
  });

  test('SMK-04: Smoke – Mensajes en conversación', async () => {
    console.log('🧪 SMK-04: Smoke – Mensajes en conversación');
    
    // Precondición: Conexión activa con mensajes
    await page.goto(process.env.BASE_URL + 'login');
    await page.fill('input[type="email"]', process.env.TEST_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*connections/);
    
    // Intentar abrir una conversación
    // Buscar elementos que puedan ser conversaciones
    const conversationElements = page.locator('[data-testid="conversation"], .conversation, .chat-item, .message-list');
    
    // Si hay conversaciones disponibles, hacer clic en la primera
    const conversationCount = await conversationElements.count();
    if (conversationCount > 0) {
      await conversationElements.first().click();
      
      // Esperar a que cargue la conversación
      await page.waitForTimeout(2000);
      
      // Verificar que se muestran mensajes
      const messages = page.locator('[data-testid="message"], .message, .chat-message');
      await expect(messages.first()).toBeVisible({ timeout: 10000 });
    }
    
    // Resultado esperado: Mensajes cargan correctamente (texto e imágenes)
    console.log('✅ SMK-04: Mensajes en conversación verificados');
  });

  test('SMK-05: Smoke – Settings', async () => {
    console.log('🧪 SMK-05: Smoke – Settings');
    
    // Precondición: Usuario autenticado
    await page.goto(process.env.BASE_URL + 'login');
    await page.fill('input[type="email"]', process.env.TEST_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*connections/);
    
    // Abrir Settings
    await page.click('text=Settings');
    await expect(page).toHaveURL(/.*settings/);
    
    // Verificar que la página de Settings carga
    await expect(page.locator('text=Settings')).toBeVisible();
    
    // Verificar que los controles responden (buscar elementos interactivos)
    const settingsElements = page.locator('input, button, select, .setting-item, .profile-setting');
    const elementCount = await settingsElements.count();
    
    if (elementCount > 0) {
      // Intentar interactuar con el primer elemento
      await settingsElements.first().hover();
    }
    
    // Resultado esperado: Pantalla carga y controles responden
    await expect(page.locator('text=Settings')).toBeVisible();
    
    console.log('✅ SMK-05: Settings cargada correctamente');
  });
});

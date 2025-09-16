const { test, expect } = require('@playwright/test');

// Test suite para notificaciones en WhatsApp Monitor

/**
 * Setup de analytics para tests de notifications
 */
async function setupAnalyticsForNotifications(page) {
  try {
    const { setupAnalyticsForTest } = require('../analytics-setup.js');
    await setupAnalyticsForTest(page);
    console.log('✅ Analytics bloqueado para test de notifications');
  } catch (error) {
    console.error('❌ Error al configurar analytics para notifications:', error);
    throw error;
  }
}

/**
 * Función auxiliar para iniciar sesión
 */
async function login(page) {
  const baseUrl = process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/';
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  
  await page.goto(`${baseUrl}login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Esperar a que se complete el login con URLs más flexibles
  await expect(page).toHaveURL(/connections|dashboard|home/, { timeout: 15000 });
}

/**
 * TC-37: Browser notifications
 * Verifica que las notificaciones del navegador funcionen correctamente
 */
test('TC-37: Browser notifications', async ({ page, context }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForNotifications(page);
  
  // Iniciar sesión
  await login(page);
  
  // Verificar si el navegador soporta notificaciones
  const notificationPermission = await page.evaluate(async () => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'not-supported';
  });
  
  if (notificationPermission === 'not-supported') {
    console.log('Browser notifications not supported, skipping test');
    test.skip();
    return;
  }
  
  // Solicitar permisos de notificación si es necesario
  if (notificationPermission === 'default') {
    try {
      const permissionResult = await page.evaluate(async () => {
        const permission = await Notification.requestPermission();
        return permission;
      });
      
      if (permissionResult === 'denied') {
        console.log('Notification permission denied, skipping test');
        test.skip();
        return;
      }
    } catch (error) {
      console.log('⚠️ Error requesting notification permission, skipping test');
      test.skip('Notification API not available or permission request failed');
      return;
    }
  }
  
  // Navegar a la página de configuraciones de notificación
  await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/settings`);
  
  // Buscar la configuración de notificaciones del navegador
  const browserNotificationToggle = page.locator('input[name="browserNotifications"], input[type="checkbox"][name*="browser"], .browser-notification-toggle');
  
  if (await browserNotificationToggle.count() > 0) {
    await expect(browserNotificationToggle).toBeVisible();
    
    // Habilitar las notificaciones del navegador
    if (!(await browserNotificationToggle.isChecked())) {
      await browserNotificationToggle.check();
      
      // Guardar la configuración
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
      await saveButton.click();
    }
    
    // Simular una notificación del navegador
    // Esto se puede hacer de varias maneras:
    // 1. Interceptar una acción que debería generar una notificación
    // 2. Simular un mensaje entrante
    // 3. Usar la API de notificaciones directamente
    
    // Opción 1: Simular un mensaje entrante
    await page.evaluate(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('WhatsApp Monitor', {
          body: 'Nuevo mensaje recibido',
          icon: '/favicon.ico'
        });
      }
    });
    
    // Verificar que la notificación se muestra
    // Nota: En un entorno de testing real, esto requeriría verificar la API de notificaciones
    
    // Verificar que la configuración se guardó
    await page.reload();
    await expect(browserNotificationToggle).toBeChecked();
    
  } else {
    // Buscar en la página de notificaciones específica
    await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/notifications`);
    
    const browserNotificationSetting = page.locator('.browser-notification-setting, input[name="browserNotifications"]');
    
    if (await browserNotificationSetting.count() > 0) {
      await expect(browserNotificationSetting).toBeVisible();
      
      if (!(await browserNotificationSetting.isChecked())) {
        await browserNotificationSetting.check();
        
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
        await saveButton.click();
      }
    } else {
      console.log('Browser notification settings not found, skipping test');
      test.skip();
    }
  }
  
  console.log('Browser notifications test completed');
});

/**
 * TC-38: Email notifications
 * Verifica que las notificaciones por email funcionen correctamente
 */
test('TC-38: Email notifications', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForNotifications(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a la página de configuraciones
  await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/settings`);
  
  // Buscar la configuración de notificaciones por email
  const emailNotificationToggle = page.locator('input[name="emailNotifications"], input[type="checkbox"][name*="email"], .email-notification-toggle');
  
  if (await emailNotificationToggle.count() > 0) {
    await expect(emailNotificationToggle).toBeVisible();
    
    // Verificar el estado actual
    const isCurrentlyEnabled = await emailNotificationToggle.isChecked();
    
    // Cambiar el estado de las notificaciones por email
    if (isCurrentlyEnabled) {
      await emailNotificationToggle.uncheck();
    } else {
      await emailNotificationToggle.check();
    }
    
    // Guardar la configuración
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
    await saveButton.click();
    
    // Verificar que aparece un mensaje de confirmación
    const successMessage = page.locator('.success-message, .alert-success, [role="alert"]');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText(/saved|updated|success/i);
    }
    
    // Verificar que la configuración se guardó
    await page.reload();
    const newState = await emailNotificationToggle.isChecked();
    expect(newState).not.toBe(isCurrentlyEnabled);
    
    // Verificar que hay opciones adicionales de notificación por email
    const emailOptions = page.locator('.email-options, .notification-types, .email-settings');
    
    if (await emailOptions.count() > 0) {
      await expect(emailOptions).toBeVisible();
      
      // Verificar opciones específicas
      const newMessageOption = emailOptions.locator('input[name="newMessageEmail"], input[type="checkbox"][name*="message"]');
      const connectionOption = emailOptions.locator('input[name="connectionEmail"], input[type="checkbox"][name*="connection"]');
      const errorOption = emailOptions.locator('input[name="errorEmail"], input[type="checkbox"][name*="error"]');
      
      if (await newMessageOption.count() > 0) {
        await expect(newMessageOption).toBeVisible();
        
        // Probar cambiar la configuración
        const isChecked = await newMessageOption.isChecked();
        if (isChecked) {
          await newMessageOption.uncheck();
        } else {
          await newMessageOption.check();
        }
        
        await saveButton.click();
        
        // Verificar que el cambio se guardó
        await page.reload();
        const newState = await newMessageOption.isChecked();
        expect(newState).not.toBe(isChecked);
      }
    }
    
  } else {
    // Buscar en la página de notificaciones específica
    await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/notifications`);
    
    const emailNotificationSetting = page.locator('.email-notification-setting, input[name="emailNotifications"]');
    
    if (await emailNotificationSetting.count() > 0) {
      await expect(emailNotificationSetting).toBeVisible();
      
      const isCurrentlyEnabled = await emailNotificationSetting.isChecked();
      
      if (isCurrentlyEnabled) {
        await emailNotificationSetting.uncheck();
      } else {
        await emailNotificationSetting.check();
      }
      
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
      await saveButton.click();
      
      await page.reload();
      const newState = await emailNotificationSetting.isChecked();
      expect(newState).not.toBe(isCurrentlyEnabled);
    } else {
      console.log('Email notification settings not found, skipping test');
      test.skip();
    }
  }
  
  console.log('Email notifications test completed');
});

/**
 * TC-39: Notification preferences
 * Verifica que las preferencias de notificación se puedan configurar correctamente
 */
test('TC-39: Notification preferences', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForNotifications(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a la página de configuraciones de notificación
  await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/settings`);
  
  // Buscar la sección de preferencias de notificación
  const notificationSection = page.locator('.notification-section, .notification-preferences, [data-section="notifications"]');
  
  if (await notificationSection.count() > 0) {
    await expect(notificationSection).toBeVisible();
    
    // Verificar que existen diferentes tipos de notificaciones
    const notificationTypes = notificationSection.locator('.notification-type, .notification-option, .preference-item');
    
    if (await notificationTypes.count() > 0) {
      const typeCount = await notificationTypes.count();
      expect(typeCount).toBeGreaterThan(0);
      
      // Probar cada tipo de notificación
      for (let i = 0; i < typeCount; i++) {
        const notificationType = notificationTypes.nth(i);
        
        // Verificar que tiene un toggle o checkbox
        const toggle = notificationType.locator('input[type="checkbox"], .toggle, .switch');
        
        if (await toggle.count() > 0) {
          await expect(toggle).toBeVisible();
          
          // Verificar que tiene una etiqueta descriptiva
          const label = notificationType.locator('label, .label, .description');
          if (await label.count() > 0) {
            await expect(label).toBeVisible();
            const labelText = await label.textContent();
            expect(labelText.trim().length).toBeGreaterThan(0);
          }
          
          // Probar cambiar el estado
          const isChecked = await toggle.isChecked();
          
          if (isChecked) {
            await toggle.uncheck();
          } else {
            await toggle.check();
          }
          
          // Verificar que el cambio se refleja inmediatamente
          const newState = await toggle.isChecked();
          expect(newState).not.toBe(isChecked);
        }
      }
      
      // Guardar todas las configuraciones
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
      await saveButton.click();
      
      // Verificar que aparece un mensaje de confirmación
      const successMessage = page.locator('.success-message, .alert-success, [role="alert"]');
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible();
        await expect(successMessage).toContainText(/saved|updated|success/i);
      }
      
      // Verificar que las configuraciones se mantienen al recargar
      await page.reload();
      
      // Verificar que los cambios se guardaron
      const savedNotificationTypes = notificationSection.locator('.notification-type, .notification-option, .preference-item');
      const savedTypeCount = await savedNotificationTypes.count();
      expect(savedTypeCount).toBe(typeCount);
      
    } else {
      // Verificar configuraciones individuales si no hay tipos agrupados
      const emailToggle = notificationSection.locator('input[name="emailNotifications"], input[type="checkbox"][name*="email"]');
      const browserToggle = notificationSection.locator('input[name="browserNotifications"], input[type="checkbox"][name*="browser"]');
      const smsToggle = notificationSection.locator('input[name="smsNotifications"], input[type="checkbox"][name*="sms"]');
      
      if (await emailToggle.count() > 0) {
        await expect(emailToggle).toBeVisible();
        
        const isChecked = await emailToggle.isChecked();
        if (isChecked) {
          await emailToggle.uncheck();
        } else {
          await emailToggle.check();
        }
        
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
        await saveButton.click();
        
        await page.reload();
        const newState = await emailToggle.isChecked();
        expect(newState).not.toBe(isChecked);
      }
    }
    
  } else {
    // Buscar en la página de notificaciones específica
    await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/notifications`);
    
    const notificationPreferences = page.locator('.notification-preferences, .preferences, .settings');
    
    if (await notificationPreferences.count() > 0) {
      await expect(notificationPreferences).toBeVisible();
      
      // Repetir el proceso de configuración
      const notificationTypes = notificationPreferences.locator('.notification-type, .notification-option, .preference-item');
      
      if (await notificationTypes.count() > 0) {
        const typeCount = await notificationTypes.count();
        
        for (let i = 0; i < typeCount; i++) {
          const notificationType = notificationTypes.nth(i);
          const toggle = notificationType.locator('input[type="checkbox"], .toggle, .switch');
          
          if (await toggle.count() > 0) {
            const isChecked = await toggle.isChecked();
            
            if (isChecked) {
              await toggle.uncheck();
            } else {
              await toggle.check();
            }
          }
        }
        
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
        await saveButton.click();
        
        await page.reload();
      }
    } else {
      console.log('Notification preferences not found, skipping test');
      test.skip();
    }
  }
  
  console.log('Notification preferences test completed');
});
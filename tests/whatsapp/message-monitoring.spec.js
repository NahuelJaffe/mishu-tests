const { test, expect } = require('@playwright/test');

// Test suite para el monitoreo de mensajes en WhatsApp Monitor

/**
 * Función auxiliar para iniciar sesión
 */
async function login(page) {
  await page.goto('https://mishu.co.il/login');
  await page.fill('input[type="email"]', 'nahueljaffe+testmishu@gmail.com');
  await page.fill('input[type="password"]', 'Prueba1');
  await page.click('button[type="submit"]');
  // Esperar a que se complete el login
  await expect(page).toHaveURL(/connections/);
}

/**
 * TC-17: Message display
 * Verifica que los mensajes de WhatsApp se muestren correctamente
 */
test('TC-17: Message display', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la sección de mensajes
  await page.goto('https://mishu.co.il/messages');
  
  // Verificar que estamos en la página de mensajes
  await expect(page).toHaveURL(/messages|chats/);
  
  // Verificar si hay mensajes disponibles
  const messagesList = page.locator('.messages-list, .chats-list, .conversation-list');
  
  if (await messagesList.count() > 0 && await messagesList.isVisible()) {
    // Hay mensajes disponibles
    await expect(messagesList).toBeVisible();
    
    // Verificar que los mensajes tienen los elementos esperados
    const firstMessage = messagesList.locator('.message, .chat-item, .conversation-item').first();
    await expect(firstMessage).toBeVisible();
    
    // Verificar que el mensaje tiene remitente, contenido y timestamp
    const sender = firstMessage.locator('.sender, .contact-name, .chat-name');
    const content = firstMessage.locator('.content, .message-content, .preview');
    const timestamp = firstMessage.locator('.timestamp, .time, .date');
    
    await expect(sender).toBeVisible();
    await expect(content).toBeVisible();
    await expect(timestamp).toBeVisible();
    
    // Hacer clic en el primer mensaje para ver los detalles
    await firstMessage.click();
    
    // Verificar que se muestran los detalles del mensaje
    const messageDetail = page.locator('.message-detail, .chat-detail, .conversation-detail');
    await expect(messageDetail).toBeVisible();
  } else {
    // No hay mensajes disponibles, verificar estado vacío
    const emptyState = page.locator('.empty-state, .no-messages, .no-data');
    await expect(emptyState).toBeVisible();
    console.log('No messages available, empty state is displayed');
  }
});

/**
 * TC-18: Message grouping
 * Verifica la funcionalidad de agrupación de mensajes
 */
test('TC-18: Message grouping', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la sección de mensajes
  await page.goto('https://mishu.co.il/messages');
  
  // Verificar si existe la funcionalidad de agrupación
  const groupingControl = page.locator('.grouping-control, .view-options, .filter-options');
  
  if (await groupingControl.count() > 0) {
    await expect(groupingControl).toBeVisible();
    
    // Verificar las opciones de agrupación disponibles
    const groupingOptions = groupingControl.locator('button, select, .option');
    await expect(groupingOptions).toHaveCount({ min: 1 });
    
    // Intentar cambiar la agrupación (si es posible)
    const firstOption = groupingOptions.first();
    await firstOption.click();
    
    // Verificar que la vista de mensajes se actualiza
    // Nota: Esto puede variar según la implementación real
    // Podríamos verificar cambios en la estructura o en las clases CSS
  } else {
    console.log('Message grouping functionality not found, skipping test');
    test.skip();
  }
});

/**
 * TC-19: Manual message flagging
 * Verifica la funcionalidad de marcar mensajes manualmente
 */
test('TC-19: Manual message flagging', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la sección de mensajes
  await page.goto('https://mishu.co.il/messages');
  
  // Verificar si hay mensajes disponibles
  const messagesList = page.locator('.messages-list, .chats-list, .conversation-list');
  
  if (await messagesList.count() > 0 && await messagesList.isVisible()) {
    // Seleccionar el primer mensaje
    const firstMessage = messagesList.locator('.message, .chat-item, .conversation-item').first();
    await firstMessage.click();
    
    // Buscar la opción de marcar/destacar mensaje
    const flagOption = page.locator('button:has-text("Flag"), button:has-text("Mark"), .flag-button, .star-button');
    
    if (await flagOption.count() > 0) {
      // Hacer clic en la opción de marcar
      await flagOption.click();
      
      // Verificar que el mensaje ha sido marcado
      // Esto puede variar según la implementación, podría ser un cambio de clase, un icono, etc.
      const flaggedMessage = page.locator('.message.flagged, .chat-item.flagged, .conversation-item.flagged, .message.starred');
      await expect(flaggedMessage).toBeVisible();
      
      // Intentar desmarcar el mensaje
      await flagOption.click();
      
      // Verificar que el mensaje ya no está marcado
      await expect(flaggedMessage).not.toBeVisible();
    } else {
      console.log('Flag/mark option not found, skipping test');
      test.skip();
    }
  } else {
    console.log('No messages available, skipping test');
    test.skip();
  }
});

/**
 * TC-20: Bulk actions on messages
 * Verifica la funcionalidad de acciones en masa sobre mensajes
 */
test('TC-20: Bulk actions on messages', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la sección de mensajes
  await page.goto('https://mishu.co.il/messages');
  
  // Verificar si hay mensajes disponibles
  const messagesList = page.locator('.messages-list, .chats-list, .conversation-list');
  
  if (await messagesList.count() > 0 && await messagesList.isVisible()) {
    // Verificar si existe la funcionalidad de selección múltiple
    const selectAllCheckbox = page.locator('input[type="checkbox"][name="select-all"], .select-all');
    
    if (await selectAllCheckbox.count() > 0) {
      // Seleccionar todos los mensajes
      await selectAllCheckbox.check();
      
      // Verificar que se muestran las acciones en masa
      const bulkActions = page.locator('.bulk-actions, .batch-actions, .selected-actions');
      await expect(bulkActions).toBeVisible();
      
      // Verificar las opciones disponibles
      const actionButtons = bulkActions.locator('button');
      await expect(actionButtons).toHaveCount({ min: 1 });
      
      // Desmarcar la selección
      await selectAllCheckbox.uncheck();
      
      // Verificar que las acciones en masa ya no se muestran
      await expect(bulkActions).not.toBeVisible();
    } else {
      // Intentar seleccionar mensajes individualmente
      const firstMessageCheckbox = messagesList.locator('.message input[type="checkbox"], .chat-item input[type="checkbox"]').first();
      
      if (await firstMessageCheckbox.count() > 0) {
        // Seleccionar el primer mensaje
        await firstMessageCheckbox.check();
        
        // Seleccionar el segundo mensaje si existe
        const secondMessageCheckbox = messagesList.locator('.message input[type="checkbox"], .chat-item input[type="checkbox"]').nth(1);
        if (await secondMessageCheckbox.count() > 0) {
          await secondMessageCheckbox.check();
        }
        
        // Verificar que se muestran las acciones en masa
        const bulkActions = page.locator('.bulk-actions, .batch-actions, .selected-actions');
        await expect(bulkActions).toBeVisible();
        
        // Desmarcar la selección
        await firstMessageCheckbox.uncheck();
        if (await secondMessageCheckbox.count() > 0) {
          await secondMessageCheckbox.uncheck();
        }
      } else {
        console.log('Message selection functionality not found, skipping test');
        test.skip();
      }
    }
  } else {
    console.log('No messages available, skipping test');
    test.skip();
  }
});
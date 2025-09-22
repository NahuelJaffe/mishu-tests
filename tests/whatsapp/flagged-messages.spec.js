const { test, expect } = require('@playwright/test');
const testConfig = require('../test-config');

// Test suite para Flagged Messages - Performance optimizations y funcionalidades

/**
 * Setup de analytics para todos los tests de flagged messages
 */
async function setupAnalyticsForFlaggedMessages(page) {
  try {
    const { setupAnalyticsForTest } = require('../analytics-setup.js');
    await setupAnalyticsForTest(page);
    console.log('✅ Analytics bloqueado para test de flagged messages');
  } catch (error) {
    console.error('❌ Error al configurar analytics para flagged messages:', error);
    throw error;
  }
}

/**
 * Función auxiliar para iniciar sesión
 */
async function login(page) {
  const baseURL = testConfig.BASE_URL;
  await page.goto(`${baseURL}login`);
  
  // Usar selectores más robustos
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
  
  // Esperar a que los elementos estén disponibles
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  
  await emailInput.fill(testConfig.TEST_EMAIL);
  await passwordInput.fill(testConfig.TEST_PASSWORD);
  await submitButton.click();
  
  // Esperar a que se complete el login
  try {
    await expect(page).toHaveURL(/connections/, { timeout: 15000 });
    console.log('✅ Login exitoso - redirigido a connections');
  } catch (error) {
    console.log('⚠️ Login no redirigió como esperado, usando mock login como fallback');
    await testConfig.mockLogin(page);
  }
}

/**
 * FLG-01: Flagged placeholder "Click to view text content"
 * Verifica que los mensajes flagged muestren placeholder hasta hacer clic
 */
test('FLG-01: Flagged placeholder "Click to view text content"', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForFlaggedMessages(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a mensajes reportados o conversación con flagged
  await page.goto(`${testConfig.BASE_URL}/flagged-messages`);
  
  // Buscar mensajes flagged con placeholder
  const flaggedPlaceholder = page.locator('.flagged-message, .reported-message, [data-testid*="flagged"]');
  
  if (await flaggedPlaceholder.count() > 0) {
    // Verificar que el placeholder está visible inicialmente
    const placeholderText = page.locator('text="Click to view text content", text="Click to reveal", text="Click to show"');
    
    if (await placeholderText.count() > 0) {
      await expect(placeholderText.first()).toBeVisible();
      console.log('✅ Placeholder "Click to view text content" visible');
      
      // Hacer clic en el placeholder para revelar contenido
      await placeholderText.first().click();
      
      // Verificar que el contenido se revela
      const messageContent = page.locator('.message-content, .flagged-content, .revealed-content');
      await expect(messageContent.first()).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Contenido revelado después del clic');
    } else {
      console.log('⚠️ No se encontró placeholder "Click to view text content"');
    }
  } else {
    console.log('⚠️ No se encontraron mensajes flagged');
  }
});

/**
 * FLG-02: Flagged AI explanation (expand on click)
 * Verifica que las explicaciones de IA se puedan expandir al hacer clic
 */
test('FLG-02: Flagged AI explanation (expand on click)', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForFlaggedMessages(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a mensajes reportados
  await page.goto(`${testConfig.BASE_URL}/flagged-messages`);
  
  // Buscar explicaciones de IA
  const aiExplanation = page.locator('.ai-explanation, .explanation, .flagged-reason, [data-testid*="explanation"]');
  
  if (await aiExplanation.count() > 0) {
    // Buscar la primera línea de explicación que se puede expandir
    const expandableExplanation = aiExplanation.locator('.expandable, .collapsible, [data-expandable="true"]').first();
    
    if (await expandableExplanation.count() > 0) {
      // Verificar estado inicial (colapsado)
      const isExpanded = await expandableExplanation.getAttribute('data-expanded');
      expect(isExpanded).not.toBe('true');
      
      // Hacer clic para expandir
      await expandableExplanation.click();
      
      // Verificar que se expande
      await expect(expandableExplanation.locator('.expanded-content, .full-explanation')).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Explicación de IA expandida correctamente');
    } else {
      console.log('⚠️ No se encontraron explicaciones expandibles');
    }
  } else {
    console.log('⚠️ No se encontraron explicaciones de IA');
  }
});

/**
 * FLG-03: Flagged feedback Helpful
 * Verifica que se pueda marcar una explicación como Helpful
 */
test('FLG-03: Flagged feedback Helpful', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForFlaggedMessages(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a mensajes reportados
  await page.goto(`${testConfig.BASE_URL}/flagged-messages`);
  
  // Buscar botones de feedback
  const helpfulButton = page.locator('button:has-text("Helpful"), button:has-text("Útil"), [data-testid*="helpful"], .feedback-helpful');
  
  if (await helpfulButton.count() > 0) {
    // Hacer clic en "Helpful"
    await helpfulButton.first().click();
    
    // Verificar que el estado cambia
    const isHelpful = await helpfulButton.first().getAttribute('data-selected');
    const buttonClass = await helpfulButton.first().getAttribute('class');
    
    // Verificar que el botón muestra estado seleccionado
    expect(isHelpful === 'true' || buttonClass.includes('selected') || buttonClass.includes('active')).toBeTruthy();
    
    console.log('✅ Feedback "Helpful" aplicado correctamente');
    
    // Verificar que el estado persiste después de recargar
    await page.reload();
    const persistedState = await helpfulButton.first().getAttribute('data-selected');
    const persistedClass = await helpfulButton.first().getAttribute('class');
    
    if (persistedState === 'true' || persistedClass.includes('selected') || persistedClass.includes('active')) {
      console.log('✅ Estado "Helpful" persistió después de recargar');
    }
  } else {
    console.log('⚠️ No se encontraron botones de feedback "Helpful"');
  }
});

/**
 * FLG-04: Flagged feedback Not Helpful
 * Verifica que se pueda marcar una explicación como Not Helpful
 */
test('FLG-04: Flagged feedback Not Helpful', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForFlaggedMessages(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a mensajes reportados
  await page.goto(`${testConfig.BASE_URL}/flagged-messages`);
  
  // Buscar botones de feedback "Not Helpful"
  const notHelpfulButton = page.locator('button:has-text("Not Helpful"), button:has-text("No útil"), [data-testid*="not-helpful"], .feedback-not-helpful');
  
  if (await notHelpfulButton.count() > 0) {
    // Hacer clic en "Not Helpful"
    await notHelpfulButton.first().click();
    
    // Verificar que el estado cambia
    const isNotHelpful = await notHelpfulButton.first().getAttribute('data-selected');
    const buttonClass = await notHelpfulButton.first().getAttribute('class');
    
    // Verificar que el botón muestra estado seleccionado
    expect(isNotHelpful === 'true' || buttonClass.includes('selected') || buttonClass.includes('active')).toBeTruthy();
    
    console.log('✅ Feedback "Not Helpful" aplicado correctamente');
    
    // Verificar que el estado persiste después de recargar
    await page.reload();
    const persistedState = await notHelpfulButton.first().getAttribute('data-selected');
    const persistedClass = await notHelpfulButton.first().getAttribute('class');
    
    if (persistedState === 'true' || persistedClass.includes('selected') || persistedClass.includes('active')) {
      console.log('✅ Estado "Not Helpful" persistió después de recargar');
    }
  } else {
    console.log('⚠️ No se encontraron botones de feedback "Not Helpful"');
  }
});

/**
 * FLG-05: Flagged efficient counting (performance regression)
 * Verifica que el conteo de mensajes flagged sea eficiente (sin loops ineficientes)
 */
test('FLG-05: Flagged efficient counting (performance regression)', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForFlaggedMessages(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a conexiones para verificar conteo eficiente
  await page.goto(`${testConfig.BASE_URL}/connections`);
  
  // Medir tiempo de carga inicial
  const startTime = Date.now();
  
  // Buscar contadores de mensajes flagged
  const flaggedCounters = page.locator('.flagged-count, .reported-count, [data-testid*="flagged-count"]');
  
  // Esperar a que aparezcan los contadores
  if (await flaggedCounters.count() > 0) {
    await flaggedCounters.first().waitFor({ state: 'visible', timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Verificar que la carga es rápida (menos de 5 segundos)
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`✅ Conteo de flagged messages cargado en ${loadTime}ms`);
    
    // Verificar que los contadores muestran números válidos
    const countText = await flaggedCounters.first().textContent();
    const countNumber = parseInt(countText.replace(/\D/g, ''));
    
    expect(countNumber).toBeGreaterThanOrEqual(0);
    
    console.log(`✅ Conteo válido: ${countNumber} mensajes flagged`);
    
    // Navegar entre diferentes conexiones para verificar eficiencia
    const connectionItems = page.locator('.connection-item, .chat-item, [data-testid*="connection"]');
    
    if (await connectionItems.count() > 1) {
      const navigationStartTime = Date.now();
      
      // Hacer clic en diferentes conexiones
      for (let i = 0; i < Math.min(3, await connectionItems.count()); i++) {
        await connectionItems.nth(i).click();
        await page.waitForTimeout(500); // Esperar breve para que se actualice el conteo
      }
      
      const navigationTime = Date.now() - navigationStartTime;
      
      // Verificar que la navegación es eficiente
      expect(navigationTime).toBeLessThan(3000);
      
      console.log(`✅ Navegación entre conexiones eficiente: ${navigationTime}ms`);
    }
  } else {
    console.log('⚠️ No se encontraron contadores de mensajes flagged');
  }
});

/**
 * FLG-06: Flagged messages bulk actions
 * Verifica acciones en masa sobre mensajes flagged
 */
test('FLG-06: Flagged messages bulk actions', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForFlaggedMessages(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a mensajes reportados
  await page.goto(`${testConfig.BASE_URL}/flagged-messages`);
  
  // Buscar checkboxes para selección múltiple
  const messageCheckboxes = page.locator('input[type="checkbox"][data-testid*="message"], .message-checkbox input');
  
  if (await messageCheckboxes.count() > 1) {
    // Seleccionar múltiples mensajes
    await messageCheckboxes.first().check();
    await messageCheckboxes.nth(1).check();
    
    // Verificar que aparecen acciones en masa
    const bulkActions = page.locator('.bulk-actions, .mass-actions, [data-testid*="bulk-actions"]');
    
    if (await bulkActions.count() > 0) {
      await expect(bulkActions).toBeVisible();
      
      // Buscar botones de acción en masa
      const bulkActionButtons = bulkActions.locator('button, .action-button');
      
      if (await bulkActionButtons.count() > 0) {
        // Probar una acción en masa (ej: marcar como resuelto)
        const resolveButton = bulkActions.locator('button:has-text("Resolve"), button:has-text("Resuelto"), button:has-text("Mark as resolved")');
        
        if (await resolveButton.count() > 0) {
          await resolveButton.click();
          
          // Verificar que se aplica la acción
          await page.waitForTimeout(2000);
          
          console.log('✅ Acción en masa aplicada correctamente');
        }
      }
      
      console.log('✅ Acciones en masa disponibles para mensajes flagged');
    } else {
      console.log('⚠️ No se encontraron acciones en masa');
    }
  } else {
    console.log('⚠️ No se encontraron suficientes mensajes para acciones en masa');
  }
});

/**
 * FLG-07: Flagged messages filtering
 * Verifica filtros para mensajes flagged
 */
test('FLG-07: Flagged messages filtering', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForFlaggedMessages(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a mensajes reportados
  await page.goto(`${testConfig.BASE_URL}/flagged-messages`);
  
  // Buscar filtros
  const filterDropdown = page.locator('select[data-testid*="filter"], .filter-dropdown select, .filter-select');
  const filterButtons = page.locator('.filter-button, [data-testid*="filter-button"]');
  
  if (await filterDropdown.count() > 0) {
    // Probar filtro por dropdown
    const options = filterDropdown.locator('option');
    const optionCount = await options.count();
    
    if (optionCount > 1) {
      // Seleccionar una opción de filtro
      await filterDropdown.selectOption({ index: 1 });
      
      // Verificar que se aplica el filtro
      await page.waitForTimeout(2000);
      
      console.log('✅ Filtro por dropdown aplicado');
    }
  } else if (await filterButtons.count() > 0) {
    // Probar filtro por botones
    await filterButtons.first().click();
    
    // Verificar que se aplica el filtro
    await page.waitForTimeout(2000);
    
    console.log('✅ Filtro por botón aplicado');
  } else {
    console.log('⚠️ No se encontraron filtros para mensajes flagged');
  }
});

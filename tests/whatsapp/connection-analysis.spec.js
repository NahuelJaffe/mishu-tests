const { test, expect } = require('@playwright/test');

// Test suite completo para la página de conexiones de WhatsApp Monitor

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
 * Test completo de la página de conexiones
 * Explora todos los elementos disponibles y funcionalidades
 */
test('Análisis completo de la página de conexiones', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  console.log('=== ANÁLISIS COMPLETO DE LA PÁGINA DE CONEXIONES ===');
  console.log('URL actual:', page.url());
  
  // 1. Verificar estructura básica de la página
  console.log('\n1. ESTRUCTURA BÁSICA DE LA PÁGINA');
  
  // Verificar título de la página
  const pageTitle = await page.title();
  console.log('Título de la página:', pageTitle);
  
  // Verificar si hay un header o navbar
  const header = page.locator('header, .header, nav, .navbar, .top-bar');
  if (await header.count() > 0) {
    console.log('✅ Header/Navbar encontrado');
    const headerText = await header.first().textContent();
    console.log('Contenido del header:', headerText.substring(0, 100) + '...');
  } else {
    console.log('❌ No se encontró header/navbar');
  }
  
  // Verificar si hay un sidebar
  const sidebar = page.locator('aside, .sidebar, .side-nav, .navigation');
  if (await sidebar.count() > 0) {
    console.log('✅ Sidebar encontrado');
    const sidebarText = await sidebar.first().textContent();
    console.log('Contenido del sidebar:', sidebarText.substring(0, 100) + '...');
  } else {
    console.log('❌ No se encontró sidebar');
  }
  
  // Verificar contenido principal
  const mainContent = page.locator('main, .main-content, .content, .container, .page-content');
  if (await mainContent.count() > 0) {
    console.log('✅ Contenido principal encontrado');
  } else {
    console.log('❌ No se encontró contenido principal');
  }
  
  // 2. Buscar elementos relacionados con WhatsApp
  console.log('\n2. ELEMENTOS RELACIONADOS CON WHATSAPP');
  
  // Buscar texto relacionado con WhatsApp
  const whatsappText = page.locator('text=/whatsapp/i');
  const whatsappCount = await whatsappText.count();
  console.log(`Encontrados ${whatsappCount} elementos con texto "WhatsApp"`);
  
  if (whatsappCount > 0) {
    for (let i = 0; i < Math.min(whatsappCount, 5); i++) {
      const text = await whatsappText.nth(i).textContent();
      console.log(`- "${text.trim()}"`);
    }
  }
  
  // Buscar botones relacionados con WhatsApp
  const whatsappButtons = page.locator('button:has-text("WhatsApp"), a:has-text("WhatsApp"), [class*="whatsapp"], [id*="whatsapp"]');
  const buttonCount = await whatsappButtons.count();
  console.log(`Encontrados ${buttonCount} botones/enlaces relacionados con WhatsApp`);
  
  // 3. Buscar código QR
  console.log('\n3. BÚSQUEDA DE CÓDIGO QR');
  
  // Buscar imágenes que podrían ser códigos QR
  const images = page.locator('img');
  const imageCount = await images.count();
  console.log(`Total de imágenes en la página: ${imageCount}`);
  
  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i);
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt');
    const className = await img.getAttribute('class');
    
    console.log(`Imagen ${i + 1}:`);
    console.log(`  - src: ${src}`);
    console.log(`  - alt: ${alt}`);
    console.log(`  - class: ${className}`);
    
    // Verificar si podría ser un código QR
    if (src && (src.includes('qr') || src.includes('QR'))) {
      console.log('  ✅ ¡Posible código QR encontrado!');
    }
    if (alt && (alt.includes('qr') || alt.includes('QR') || alt.includes('code'))) {
      console.log('  ✅ ¡Posible código QR encontrado!');
    }
  }
  
  // Buscar canvas (usado para generar códigos QR dinámicamente)
  const canvas = page.locator('canvas');
  const canvasCount = await canvas.count();
  console.log(`Total de canvas en la página: ${canvasCount}`);
  
  if (canvasCount > 0) {
    console.log('✅ Canvas encontrado - posible código QR generado dinámicamente');
  }
  
  // 4. Buscar elementos de estado de conexión
  console.log('\n4. ELEMENTOS DE ESTADO DE CONEXIÓN');
  
  // Buscar texto relacionado con estado
  const statusText = page.locator('text=/connected|disconnected|status|state|active|inactive/i');
  const statusCount = await statusText.count();
  console.log(`Encontrados ${statusCount} elementos con texto de estado`);
  
  if (statusCount > 0) {
    for (let i = 0; i < Math.min(statusCount, 5); i++) {
      const text = await statusText.nth(i).textContent();
      console.log(`- "${text.trim()}"`);
    }
  }
  
  // Buscar indicadores visuales de estado
  const statusIndicators = page.locator('.status, .state, .indicator, .badge, [class*="status"], [class*="state"]');
  const indicatorCount = await statusIndicators.count();
  console.log(`Encontrados ${indicatorCount} indicadores de estado`);
  
  // 5. Buscar formularios y botones de acción
  console.log('\n5. FORMULARIOS Y BOTONES DE ACCIÓN');
  
  // Buscar formularios
  const forms = page.locator('form');
  const formCount = await forms.count();
  console.log(`Total de formularios: ${formCount}`);
  
  // Buscar botones
  const buttons = page.locator('button');
  const buttonTotalCount = await buttons.count();
  console.log(`Total de botones: ${buttonTotalCount}`);
  
  for (let i = 0; i < Math.min(buttonTotalCount, 10); i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    const className = await button.getAttribute('class');
    const type = await button.getAttribute('type');
    
    if (text && text.trim()) {
      console.log(`Botón ${i + 1}: "${text.trim()}" (${type || 'button'})`);
    }
  }
  
  // 6. Buscar elementos de navegación
  console.log('\n6. ELEMENTOS DE NAVEGACIÓN');
  
  // Buscar enlaces
  const links = page.locator('a');
  const linkCount = await links.count();
  console.log(`Total de enlaces: ${linkCount}`);
  
  for (let i = 0; i < Math.min(linkCount, 10); i++) {
    const link = links.nth(i);
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    
    if (text && text.trim()) {
      console.log(`Enlace ${i + 1}: "${text.trim()}" -> ${href}`);
    }
  }
  
  // 7. Buscar elementos de ayuda o instrucciones
  console.log('\n7. ELEMENTOS DE AYUDA E INSTRUCCIONES');
  
  const helpText = page.locator('text=/help|instruction|guide|tutorial|how to|scan|connect/i');
  const helpCount = await helpText.count();
  console.log(`Encontrados ${helpCount} elementos de ayuda`);
  
  if (helpCount > 0) {
    for (let i = 0; i < Math.min(helpCount, 5); i++) {
      const text = await helpText.nth(i).textContent();
      console.log(`- "${text.trim()}"`);
    }
  }
  
  // 8. Verificar responsividad básica
  console.log('\n8. VERIFICACIÓN DE RESPONSIVIDAD');
  
  // Obtener dimensiones de la ventana
  const viewport = page.viewportSize();
  console.log(`Tamaño de ventana: ${viewport.width}x${viewport.height}`);
  
  // Verificar si hay elementos que se ocultan en móvil
  const mobileHidden = page.locator('.hidden-mobile, .d-none-mobile, [class*="mobile-hidden"]');
  const mobileHiddenCount = await mobileHidden.count();
  console.log(`Elementos ocultos en móvil: ${mobileHiddenCount}`);
  
  // 9. Buscar elementos de configuración o settings
  console.log('\n9. ELEMENTOS DE CONFIGURACIÓN');
  
  const settingsElements = page.locator('text=/setting|config|preference|option/i');
  const settingsCount = await settingsElements.count();
  console.log(`Encontrados ${settingsCount} elementos de configuración`);
  
  // 10. Verificar elementos de error o mensajes
  console.log('\n10. ELEMENTOS DE ERROR O MENSAJES');
  
  const errorElements = page.locator('.error, .alert, .message, .notification, [class*="error"], [class*="alert"]');
  const errorCount = await errorElements.count();
  console.log(`Encontrados ${errorCount} elementos de error/mensaje`);
  
  if (errorCount > 0) {
    for (let i = 0; i < Math.min(errorCount, 3); i++) {
      const text = await errorElements.nth(i).textContent();
      console.log(`- "${text.trim()}"`);
    }
  }
  
  // 11. Resumen final
  console.log('\n=== RESUMEN FINAL ===');
  console.log(`✅ Página cargada correctamente: ${page.url()}`);
  console.log(`✅ Elementos WhatsApp encontrados: ${whatsappCount}`);
  console.log(`✅ Imágenes totales: ${imageCount}`);
  console.log(`✅ Canvas encontrados: ${canvasCount}`);
  console.log(`✅ Botones totales: ${buttonTotalCount}`);
  console.log(`✅ Enlaces totales: ${linkCount}`);
  console.log(`✅ Elementos de estado: ${statusCount}`);
  console.log(`✅ Elementos de ayuda: ${helpCount}`);
  
  // Verificar que la página es funcional
  expect(page.url()).toContain('connections');
  console.log('\n🎉 Test de análisis completo finalizado exitosamente');
});

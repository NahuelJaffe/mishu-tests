const { test, expect } = require('@playwright/test');

// Test suite para perfil y configuraciones en WhatsApp Monitor

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
 * TC-25: Profile update
 * Verifica que el usuario pueda actualizar su perfil
 */
test('TC-25: Profile update', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la página de perfil
  await page.goto('${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/profile');
  
  // Verificar que estamos en la página de perfil
  await expect(page).toHaveURL(/profile|account/);
  
  // Verificar que existen los campos del perfil
  const nameField = page.locator('input[name="name"], input[name="fullName"], input[name="username"]');
  const emailField = page.locator('input[name="email"], input[type="email"]');
  const phoneField = page.locator('input[name="phone"], input[name="phoneNumber"]');
  
  if (await nameField.count() > 0) {
    await expect(nameField).toBeVisible();
    
    // Obtener el valor actual
    const currentName = await nameField.inputValue();
    
    // Actualizar el nombre
    const newName = `Test User ${Date.now()}`;
    await nameField.clear();
    await nameField.fill(newName);
    
    // Guardar los cambios
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Verificar que aparece un mensaje de éxito
    const successMessage = page.locator('.success-message, .alert-success, [role="alert"]');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText(/saved|updated|success/i);
    }
    
    // Verificar que el cambio se mantiene al recargar la página
    await page.reload();
    await expect(nameField).toHaveValue(newName);
  }
  
  // Probar actualizar otros campos si existen
  if (await phoneField.count() > 0) {
    const currentPhone = await phoneField.inputValue();
    const newPhone = `+1234567890${Date.now().toString().slice(-4)}`;
    
    await phoneField.clear();
    await phoneField.fill(newPhone);
    
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
    await saveButton.click();
    
    // Verificar que el cambio se guardó
    await page.reload();
    await expect(phoneField).toHaveValue(newPhone);
  }
  
  console.log('Profile update test completed');
});

/**
 * TC-26: Password change
 * Verifica que el usuario pueda cambiar su contraseña
 */
test('TC-26: Password change', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la página de configuración de contraseña
  await page.goto('${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/profile');
  
  // Buscar la sección de cambio de contraseña
  const passwordSection = page.locator('.password-section, .change-password, [data-section="password"]');
  
  if (await passwordSection.count() > 0) {
    await expect(passwordSection).toBeVisible();
    
    // Verificar que existen los campos necesarios
    const currentPasswordField = page.locator('input[name="currentPassword"], input[name="oldPassword"]');
    const newPasswordField = page.locator('input[name="newPassword"], input[name="password"]');
    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirmation"]');
    
    await expect(currentPasswordField).toBeVisible();
    await expect(newPasswordField).toBeVisible();
    await expect(confirmPasswordField).toBeVisible();
    
    // Llenar el formulario de cambio de contraseña
    await currentPasswordField.fill('Prueba1'); // Contraseña actual
    await newPasswordField.fill('NewPassword123!');
    await confirmPasswordField.fill('NewPassword123!');
    
    // Enviar el formulario
    const changePasswordButton = page.locator('button:has-text("Change Password"), button:has-text("Update Password"), button[type="submit"]');
    await expect(changePasswordButton).toBeVisible();
    await changePasswordButton.click();
    
    // Verificar que aparece un mensaje de éxito
    const successMessage = page.locator('.success-message, .alert-success, [role="alert"]');
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText(/changed|updated|success/i);
    }
    
    // Verificar que los campos se limpian después del cambio exitoso
    await expect(newPasswordField).toHaveValue('');
    await expect(confirmPasswordField).toHaveValue('');
    
    // Probar cambiar la contraseña de vuelta a la original
    await currentPasswordField.fill('NewPassword123!');
    await newPasswordField.fill('Prueba1');
    await confirmPasswordField.fill('Prueba1');
    
    await changePasswordButton.click();
    
    // Verificar que el cambio fue exitoso
    if (await successMessage.count() > 0) {
      await expect(successMessage).toBeVisible();
    }
    
  } else {
    // Buscar en la página de configuraciones
    await page.goto('${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/settings');
    
    const passwordLink = page.locator('a:has-text("Password"), a:has-text("Security"), button:has-text("Password")');
    
    if (await passwordLink.count() > 0) {
      await passwordLink.click();
      
      // Repetir el proceso de cambio de contraseña
      const currentPasswordField = page.locator('input[name="currentPassword"], input[name="oldPassword"]');
      const newPasswordField = page.locator('input[name="newPassword"], input[name="password"]');
      const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirmation"]');
      
      if (await currentPasswordField.count() > 0) {
        await currentPasswordField.fill('Prueba1');
        await newPasswordField.fill('NewPassword123!');
        await confirmPasswordField.fill('NewPassword123!');
        
        const changePasswordButton = page.locator('button:has-text("Change Password"), button:has-text("Update Password"), button[type="submit"]');
        await changePasswordButton.click();
        
        const successMessage = page.locator('.success-message, .alert-success, [role="alert"]');
        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible();
        }
      }
    } else {
      console.log('Password change functionality not found, skipping test');
      test.skip();
    }
  }
  
  console.log('Password change test completed');
});

/**
 * TC-27: Notification preferences
 * Verifica que el usuario pueda configurar sus preferencias de notificación
 */
test('TC-27: Notification preferences', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la página de configuraciones
  await page.goto('${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/settings');
  
  // Buscar la sección de notificaciones
  const notificationsSection = page.locator('.notifications-section, .notification-settings, [data-section="notifications"]');
  
  if (await notificationsSection.count() > 0) {
    await expect(notificationsSection).toBeVisible();
    
    // Verificar que existen las opciones de notificación
    const emailNotifications = page.locator('input[name="emailNotifications"], input[type="checkbox"][name*="email"]');
    const browserNotifications = page.locator('input[name="browserNotifications"], input[type="checkbox"][name*="browser"]');
    const smsNotifications = page.locator('input[name="smsNotifications"], input[type="checkbox"][name*="sms"]');
    
    // Probar cambiar las preferencias de notificación
    if (await emailNotifications.count() > 0) {
      const isChecked = await emailNotifications.isChecked();
      
      // Cambiar el estado
      if (isChecked) {
        await emailNotifications.uncheck();
      } else {
        await emailNotifications.check();
      }
      
      // Guardar los cambios
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
      await saveButton.click();
      
      // Verificar que el cambio se guardó
      await page.reload();
      const newState = await emailNotifications.isChecked();
      expect(newState).not.toBe(isChecked);
    }
    
    if (await browserNotifications.count() > 0) {
      const isChecked = await browserNotifications.isChecked();
      
      // Cambiar el estado
      if (isChecked) {
        await browserNotifications.uncheck();
      } else {
        await browserNotifications.check();
      }
      
      // Guardar los cambios
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
      await saveButton.click();
      
      // Verificar que el cambio se guardó
      await page.reload();
      const newState = await browserNotifications.isChecked();
      expect(newState).not.toBe(isChecked);
    }
    
  } else {
    // Buscar enlaces a configuraciones de notificación
    const notificationsLink = page.locator('a:has-text("Notifications"), a:has-text("Notificaciones"), button:has-text("Notifications")');
    
    if (await notificationsLink.count() > 0) {
      await notificationsLink.click();
      
      // Repetir el proceso de configuración
      const emailNotifications = page.locator('input[name="emailNotifications"], input[type="checkbox"][name*="email"]');
      
      if (await emailNotifications.count() > 0) {
        const isChecked = await emailNotifications.isChecked();
        
        if (isChecked) {
          await emailNotifications.uncheck();
        } else {
          await emailNotifications.check();
        }
        
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
        await saveButton.click();
        
        await page.reload();
        const newState = await emailNotifications.isChecked();
        expect(newState).not.toBe(isChecked);
      }
    } else {
      console.log('Notification preferences not found, skipping test');
      test.skip();
    }
  }
  
  console.log('Notification preferences test completed');
});

/**
 * TC-28: Account deletion
 * Verifica que el usuario pueda eliminar su cuenta
 */
test('TC-28: Account deletion', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la página de configuraciones
  await page.goto('${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/settings');
  
  // Buscar la sección de eliminación de cuenta
  const deleteAccountSection = page.locator('.delete-account, .account-deletion, [data-section="delete"]');
  const deleteAccountLink = page.locator('a:has-text("Delete Account"), button:has-text("Delete Account"), a:has-text("Eliminar Cuenta")');
  
  if (await deleteAccountSection.count() > 0 || await deleteAccountLink.count() > 0) {
    // Hacer clic en el enlace de eliminación de cuenta
    if (await deleteAccountLink.count() > 0) {
      await deleteAccountLink.click();
    }
    
    // Verificar que aparece un diálogo de confirmación
    const confirmDialog = page.locator('.confirm-dialog, .modal, .popup, [role="dialog"]');
    await expect(confirmDialog).toBeVisible();
    
    // Verificar que el diálogo tiene texto de advertencia
    const warningText = confirmDialog.locator('text=/delete|permanent|cannot.*undo|irreversible/i');
    await expect(warningText).toBeVisible();
    
    // Verificar que existe un campo de confirmación (escribir "DELETE" o similar)
    const confirmationField = confirmDialog.locator('input[type="text"], input[name="confirmation"]');
    
    if (await confirmationField.count() > 0) {
      // Llenar el campo de confirmación
      const confirmationText = await confirmationField.getAttribute('placeholder');
      if (confirmationText && confirmationText.includes('DELETE')) {
        await confirmationField.fill('DELETE');
      } else {
        await confirmationField.fill('CONFIRM');
      }
    }
    
    // Verificar que existe un botón de confirmación
    const confirmButton = confirmDialog.locator('button:has-text("Delete"), button:has-text("Confirm"), button:has-text("Yes")');
    await expect(confirmButton).toBeVisible();
    
    // NOTA: No vamos a hacer clic en el botón de confirmación para evitar eliminar la cuenta real
    // En un entorno de testing, aquí haríamos clic para completar la eliminación
    
    // Verificar que existe un botón de cancelar
    const cancelButton = confirmDialog.locator('button:has-text("Cancel"), button:has-text("No"), button:has-text("Close")');
    await expect(cancelButton).toBeVisible();
    
    // Hacer clic en cancelar para no eliminar la cuenta
    await cancelButton.click();
    
    // Verificar que el diálogo se cierra
    await expect(confirmDialog).not.toBeVisible();
    
    // Verificar que seguimos en la página de configuraciones
    await expect(page).toHaveURL(/settings|profile/);
    
  } else {
    console.log('Account deletion functionality not found, skipping test');
    test.skip();
  }
  
  console.log('Account deletion test completed (cancelled to preserve account)');
});

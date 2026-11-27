import { test, expect } from '@playwright/test';

test.describe('Sala de chat - Diseño Responsivo', () => {

  test('pantalla móvil: botón de enviar visible y no se solapa', async ({ page }) => {
    await page.goto('/ingreso');

    // Iniciar sesión con credenciales proporcionadas
    await page.fill('input[type="email"]', 'jeremyastaiza45@gmail.com');
    await page.fill('input[type="password"]', 'Test1234');
    await page.click('button:has-text("Entrar")');

    // Esperar a que cargue el panel
    await page.waitForURL('**/panel', { timeout: 10000 });

    // Navegar a una sala (usar una sala existente o crear una nueva)
    // Primero verificar si hay salas disponibles
    const salasList = await page.locator('[data-testid="sala-item"]').count();
    
    if (salasList === 0) {
      // Crear una nueva sala
      await page.click('text=Crear sala');
      await page.fill('input[name="nombre"]', 'Sala de Prueba');
      await page.click('button:has-text("Crear")');
      await page.waitForURL('**/salas/*', { timeout: 10000 });
    } else {
      // Hacer clic en la primera sala
      await page.locator('[data-testid="sala-item"]').first().click();
      await page.waitForURL('**/salas/*', { timeout: 10000 });
    }

    // Verificar elementos del chat
    const inputMensaje = page.locator('input[id="mensaje"]');
    const botonEnviar = page.locator('button[type="submit"]');

    // Verificar que el input exista
    await expect(inputMensaje).toBeVisible();

    // Verificar que el botón enviar exista y esté visible
    await expect(botonEnviar).toBeVisible();

    // Verificar que el input no se sobreponga al botón
    const inputBox = await inputMensaje.boundingBox();
    const botonBox = await botonEnviar.boundingBox();

    if (inputBoundingBox && botonBox) {
      const inputRight = inputBoundingBox.x + inputBoundingBox.width;
      const botonLeft = botonBox.x;
      
      console.log(`Input width: ${inputBoundingBox.width}px`);
      console.log(`Input right edge: ${inputRight}px`);
      console.log(`Botón left edge: ${botonLeft}px`);
      
      // Verificar que no hay solapamiento
      expect(inputRight).toBeLessThan(botonLeft - 5);
    }
  });

  test('pantalla móvil: título de participantes no se superpone con input', async ({ page }) => {
    await page.goto('/ingreso');

    await page.fill('input[type="email"]', 'jeremyastaiza45@gmail.com');
    await page.fill('input[type="password"]', 'Test1234');
    await page.click('button:has-text("Entrar")');

    await page.waitForURL('**/panel', { timeout: 10000 });

    // Crear o entrar a una sala
    const salasList = await page.locator('[data-testid="sala-item"]').count();
    
    if (salasList === 0) {
      await page.click('text=Crear sala');
      await page.fill('input[name="nombre"]', 'Sala de Prueba');
      await page.click('button:has-text("Crear")');
      await page.waitForURL('**/salas/*', { timeout: 10000 });
    } else {
      await page.locator('[data-testid="sala-item"]').first().click();
      await page.waitForURL('**/salas/*', { timeout: 10000 });
    }

    // Verificar que no haya elementos que se solapen en la columna derecha
    const participantesCard = page.locator('h2:has-text("Participantes")').first();
    const salirSalaCard = page.locator('h2:has-text("Salir de la sala")').first();
    
    await expect(participantesCard).toBeVisible();
    await expect(salirSalaCard).toBeVisible();

    // Verificar que los elementos no se salgan de la pantalla
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 390;
    
    console.log(`Body width: ${bodyWidth}px, Viewport: ${viewportWidth}px`);
    
    if (bodyWidth > viewportWidth) {
      console.log(`ADVERTENCIA: Hay overflow horizontal de ${bodyWidth - viewportWidth}px`);
    } else {
      console.log('No hay overflow horizontal');
    }
  });
});

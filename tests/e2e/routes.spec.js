// @ts-check
import { test, expect } from '@playwright/test';

let app = 'http://localhost:3000';

test('main page has the right title', async ({ page }) => {
  await page.goto(app);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SOS2526-23 - Home/);
});

// Ejecuta esta limpieza antes de CADA test en este archivo
test.beforeEach(async ({ request }) => {
  // Llamamos directamente al backend para vaciar la colección en NeDB.
  // Ajusta la URL base si la tienes configurada globalmente en playwright.config.js
  const response = await request.delete('http://localhost:3000/api/v1/global-ads-performance');
  
  // Opcional: Asegurarnos de que el borrado fue exitoso antes de iniciar el test
  expect(response.ok()).toBeTruthy();
});

// lo hacemos de esta forma porque el link de DAV abre una nueva ventana, y el test se ejecuta en la ventana original,
// por lo que no encuentra el título de la nueva ventana.
// Con este código, esperamos a que se abra la nueva ventana y luego evaluamos el título.
test('global-ads-performance page show some global ads', async ({ page }) => {
   await page.goto(app);
   
   const popupPromise = page.waitForEvent('popup');
   await page.getByRole('link', { name: 'DAV' }).click();
   const newPage = await popupPromise;
   
   await expect(newPage).toHaveTitle(/Global Ads List/);

   // 1. Manejar el evento del diálogo nativo (confirm) automáticamente
   newPage.on('dialog', async dialog => {
       await dialog.accept();
   });

   // 2. Hacer clic en el botón para repoblar la base de datos
   await newPage.getByRole('button', { name: /Cargar Datos Iniciales/i }).click();

   // 3. Ahora sí, esperamos a que la tabla se haya llenado
   await expect(newPage.getByTestId('GlobalAd-row').first()).toBeVisible();

   const GlobalAdRows = await newPage.getByTestId('GlobalAd-row').count();
   expect(GlobalAdRows).toBeGreaterThan(0);
});
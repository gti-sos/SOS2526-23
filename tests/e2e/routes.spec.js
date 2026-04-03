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

test('global-ads-performance user can insert and delete an ad from the UI', async ({ page }) => {
   await page.goto(app);
   
   const popupPromise = page.waitForEvent('popup');
   await page.getByRole('link', { name: 'DAV' }).click();
   const newPage = await popupPromise;
   
   await expect(newPage).toHaveTitle(/Global Ads List/);

   // FIX: Asegurar que la asincronía inicial (onMount) ha terminado 
   // esperando a que se renderice el estado de "tabla vacía".
   await expect(newPage.getByText(/No hay datos disponibles/i)).toBeVisible();

   // 1. Rellenar los campos de texto usando sus placeholders
   await newPage.getByPlaceholder('Region').fill('TestRegion E2E');
   await newPage.getByPlaceholder('YYYY-MM-DD').fill('2026-10-10');
   await newPage.getByPlaceholder('Plataforma').fill('Twitch');
   await newPage.getByPlaceholder('Industria').fill('Gaming');
   
   // 2. Rellenar los campos numéricos
   const numberInputs = newPage.locator('input[type="number"]');
   await numberInputs.nth(0).fill('5000'); // Impresiones
   await numberInputs.nth(1).fill('450');  // Clicks
   await numberInputs.nth(2).fill('120');  // Gasto
   await numberInputs.nth(3).fill('25');   // Conversiones
   await numberInputs.nth(4).fill('800');  // Ingresos

   // FIX Opcional pero recomendado: Esperar a que la petición POST termine exitosamente al hacer clic
   const [postResponse] = await Promise.all([
       newPage.waitForResponse(res => res.url().includes('/api/v1/global-ads-performance') && res.request().method() === 'POST'),
       newPage.getByRole('button', { name: 'Insertar' }).click()
   ]);
   expect(postResponse.ok()).toBeTruthy();

   // 4. Validar que la nueva fila aparece en la tabla
   const newRow = newPage.locator('tr[data-testid="GlobalAd-row"]', { hasText: 'TestRegion E2E' });
   await expect(newRow).toBeVisible();

   // 5. Ejecutar la acción de Eliminar
   await newRow.getByRole('button', { name: 'Eliminar' }).click();

   // 6. Validar que la fila desaparece del DOM
   await expect(newRow).not.toBeVisible();
});

test('global-ads-performance user can delete all ads from the UI', async ({ page }) => {
   await page.goto(app);
   
   const popupPromise = page.waitForEvent('popup');
   await page.getByRole('link', { name: 'DAV' }).click();
   const newPage = await popupPromise;
   
   await expect(newPage).toHaveTitle(/Global Ads List/);

   // 1. Configurar el listener para aceptar CUALQUIER diálogo nativo (confirm).
   newPage.on('dialog', async dialog => {
       await dialog.accept();
   });

   // Esperar a que el onMount inicial termine y la UI se estabilice 
   // antes de hacer clics que cambien el estado de la base de datos.
   await expect(
       newPage.getByText(/No hay datos disponibles/i).or(newPage.getByTestId('GlobalAd-row').first())
   ).toBeVisible();

   // 2. Cargar datos para asegurarnos de que la tabla tiene elementos que podamos borrar
   await newPage.getByRole('button', { name: /Cargar Datos Iniciales/i }).click();
   await expect(newPage.getByTestId('GlobalAd-row').first()).toBeVisible();

   // 3. Ejecutar la acción de Borrar Todo
   await newPage.getByRole('button', { name: /Borrar Todo/i }).click();

   // 4. Validar que el mensaje de tabla vacía aparece en el DOM
   await expect(newPage.getByText(/No hay datos disponibles/i)).toBeVisible();

   // 5. Validar estrictamente que ya no existen filas de datos renderizadas
   const GlobalAdRows = await newPage.getByTestId('GlobalAd-row').count();
   expect(GlobalAdRows).toBe(0);
});
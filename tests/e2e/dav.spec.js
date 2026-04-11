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
   await newPage.getByPlaceholder('Plataforma', { exact: true }).first().fill('Twitch');
   await newPage.getByPlaceholder('Industria', { exact: true }).first().fill('Gaming');
   
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

// Ejecuta esta limpieza antes de CADA test en este archivo
test.beforeEach(async ({ request }) => {
  // Llamamos directamente al backend para vaciar la colección en NeDB.
  // Ajusta la URL base si la tienes configurada globalmente en playwright.config.js
  const response = await request.delete('http://localhost:3000/api/v1/global-ads-performance');
  
  // Opcional: Asegurarnos de que el borrado fue exitoso antes de iniciar el test
  expect(response.ok()).toBeTruthy();
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

// Ejecuta esta limpieza antes de CADA test en este archivo
test.beforeEach(async ({ request }) => {
  // Llamamos directamente al backend para vaciar la colección en NeDB.
  // Ajusta la URL base si la tienes configurada globalmente en playwright.config.js
  const response = await request.delete('http://localhost:3000/api/v1/global-ads-performance');
  
  // Opcional: Asegurarnos de que el borrado fue exitoso antes de iniciar el test
  expect(response.ok()).toBeTruthy();
});

test('global-ads-performance user can edit an ad in a separate view', async ({ page }) => {
   await page.goto(app);
   
   const popupPromise = page.waitForEvent('popup');
   await page.getByRole('link', { name: 'DAV' }).click();
   const newPage = await popupPromise;
   
   await expect(newPage).toHaveTitle(/Global Ads List/);

   newPage.on('dialog', async dialog => {
       await dialog.accept();
   });

   // 1. Asegurar estado inicial de la vista principal
   await expect(
       newPage.getByText(/No hay datos disponibles/i).or(newPage.getByTestId('GlobalAd-row').first())
   ).toBeVisible();

   // 2. Insertar un recurso específico que utilizaremos para editar
   await newPage.getByPlaceholder('Region').fill('RegionAEditar');
   await newPage.getByPlaceholder('YYYY-MM-DD').fill('2026-12-12');
   await newPage.getByPlaceholder('Plataforma', { exact: true }).first().fill('PlataformaOriginal');
   await newPage.getByPlaceholder('Industria', { exact: true }).first().fill('Gaming');
   
   const mainNumberInputs = newPage.locator('input[type="number"]');
   await mainNumberInputs.nth(0).fill('10'); 
   await mainNumberInputs.nth(1).fill('10');  
   await mainNumberInputs.nth(2).fill('10');  
   await mainNumberInputs.nth(3).fill('10');   
   await mainNumberInputs.nth(4).fill('10');  

   await newPage.getByRole('button', { name: 'Insertar' }).click();

   // 3. Localizar la nueva fila y hacer clic en el enlace de la región para ir a la vista de edición
   const targetRow = newPage.locator('tr[data-testid="GlobalAd-row"]', { hasText: 'RegionAEditar' });
   await expect(targetRow).toBeVisible();
   await targetRow.getByRole('link', { name: 'RegionAEditar' }).click();

   // 4. Esperar a que cargue la vista dinámica
   await expect(newPage.getByRole('heading', { name: 'Edición de Anuncio' })).toBeVisible();

   // 5. FIX CRÍTICO: Esperar a que el GET del onMount termine de traer los datos y rellene los inputs.
   // Como los inputs de texto no tienen placeholders únicos en esta vista, los seleccionamos por índice.
   // El índice 2 corresponde a la Plataforma. Validamos que tenga el texto original antes de sobrescribirlo.
   const textInputs = newPage.locator('input[type="text"]');
   await expect(textInputs.nth(2)).toHaveValue('PlataformaOriginal');

   // 6. Modificar el campo Plataforma
   await textInputs.nth(2).fill('PlataformaActualizada');

   // 7. Hacer clic en Actualizar y esperar a que la petición PUT finalice con éxito
   const [putResponse] = await Promise.all([
       newPage.waitForResponse(res => res.url().includes('/api/v1/global-ads-performance') && res.request().method() === 'PUT'),
       newPage.getByRole('button', { name: 'Actualizar' }).click()
   ]);
   expect(putResponse.ok()).toBeTruthy();

   // 8. Validar el mensaje de éxito en la UI (Tu código lanza 200 o 201)
   await expect(newPage.getByText(/Estado de la operación: 20/)).toBeVisible(); 

   // 9. Volver al listado principal
   await newPage.getByRole('link', { name: '⬅ Volver al listado' }).click();
   
   // 10. Verificar que el cambio se refleja en la tabla (la fila existe y ahora contiene "PlataformaActualizada")
   const updatedRow = newPage.locator('tr[data-testid="GlobalAd-row"]', { hasText: 'RegionAEditar' });
   await expect(updatedRow).toBeVisible();
   await expect(updatedRow).toContainText('PlataformaActualizada');
});

// Ejecuta esta limpieza antes de CADA test en este archivo
test.beforeEach(async ({ request }) => {
  // Llamamos directamente al backend para vaciar la colección en NeDB.
  // Ajusta la URL base si la tienes configurada globalmente en playwright.config.js
  const response = await request.delete('http://localhost:3000/api/v1/global-ads-performance');
  
  // Opcional: Asegurarnos de que el borrado fue exitoso antes de iniciar el test
  expect(response.ok()).toBeTruthy();
});

test('Filter data using the search panel', async ({ page }) => {
   await page.goto(app);
   
   const popupPromise = page.waitForEvent('popup');
   await page.getByRole('link', { name: 'DAV' }).click();
   const newPage = await popupPromise;
   
   await expect(newPage).toHaveTitle(/Global Ads List/);

  await newPage.getByRole('button', { name: 'Cargar Datos Iniciales' }).click();
  
  await newPage.getByPlaceholder('Región').fill('Europe');

  await newPage.getByRole('button', { name: 'Buscar' }).click();

  const infoMessage = newPage.locator('.info-message');
  await expect(infoMessage).toContainText(/200/i);
});


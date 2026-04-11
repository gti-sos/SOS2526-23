// @ts-check
import { test, expect } from '@playwright/test';

let app = 'http://localhost:3000';

test('main page has the right title', async ({ page }) => {
  await page.goto(app);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SOS2526-23 - Home/);
});

test('Load initial data and display it in the table', async ({ page }) => {
  await page.goto(app + '/MRR');
  
  await page.getByRole('button', { name: 'Cargar los datos originales' }).click();
  
  // El mensaje puede ser de éxito o advertir que ya existen datos
  const infoMessage = page.locator('.info-message');
  await expect(infoMessage).toContainText(/Datos cargados con éxito|Ya existen datos/);
  
  // Verificamos que la tabla contiene al menos un registro de datos
  const dataRows = page.locator('.data-row');
  await expect(dataRows.count()).resolves.toBeGreaterThan(0);
});

test('New online sales successfully', async ({ page }) => {
  await page.goto(app + '/MRR');

  // Rellenar campos de texto usando los placeholders
  await page.getByPlaceholder('newRegion').fill('Europa');
  await page.getByPlaceholder('newDate').fill('2024-04-05');
  await page.getByPlaceholder('newCategory').fill('Electronics');
  await page.getByPlaceholder('newProduct').fill('PlayStation 6');
  const numberInputs = page.locator('.input-row input[type="number"]');
  await numberInputs.nth(0).fill('5');    // Cantidad
  await numberInputs.nth(1).fill('499');  // Precio
  await numberInputs.nth(2).fill('2495'); // Total
  await page.getByPlaceholder('newPaymentMethod').fill('Credit Card');
  
  await page.getByRole('button', { name: 'Insertar' }).click();
  
  const infoMessage = page.locator('.info-message');
  await expect(infoMessage).toContainText('Dato creado con Europa y 2024-04-05');
});

test('Delete a specific sale from the table', async ({ page }) => {
  await page.goto(app + '/MRR');

  await page.getByRole('button', { name: 'Cargar los datos originales' }).click();
  
  const dataRows = page.locator('.data-row');
  await expect(dataRows.first()).toBeVisible();

  await dataRows.first().getByRole('button', { name: 'Eliminar' }).click();
  
  const infoMessage = page.locator('.info-message');
  await expect(infoMessage).toContainText('ha sido eliminado');
});

test('Delete all data when clicking the main delete button', async ({ page }) => {
  await page.goto(app + '/MRR');

  await page.getByRole('button', { name: 'Eliminar todos los datos' }).click();
  
  const infoMessage = page.locator('.info-message');
  await expect(infoMessage).toContainText('Datos eliminados.');
  
  const dataRows = page.locator('.data-row');
  await expect(dataRows).toHaveCount(0);
});

test('Filter data using the search panel', async ({ page }) => {
  await page.goto(app + '/MRR');

  await page.getByRole('button', { name: 'Cargar los datos originales' }).click();
  
  await page.getByPlaceholder('Región').fill('Europe');

  await page.getByRole('button', { name: 'Buscar' }).click();

  const infoMessage = page.locator('.info-message');
  await expect(infoMessage).toContainText(/Búsqueda completada/i);
});

test('Update a online sale successfully', async ({ page }) => {
  await page.goto(app + '/MRR');

  await page.getByRole('button', { name: 'Cargar los datos originales' }).click();
  
  const firstRow = page.locator('.data-row').first();
  await expect(firstRow).toBeVisible();

  await firstRow.getByRole('button', { name: 'Actualizar' }).click();

  await expect(page).toHaveURL(/.*\/MRR\/.+\/.+/);

  const textInputs = page.locator('.input-row input[type="text"]');
  const numberInputs = page.locator('.input-row input[type="number"]');

  await textInputs.nth(2).fill('Electronics ');
  await textInputs.nth(3).fill('PlayStation 5 Pro');
  await numberInputs.nth(0).fill('10');
  await numberInputs.nth(1).fill('799');
  await numberInputs.nth(2).fill('7990');
  await textInputs.nth(4).fill('Paypal');

  await page.getByRole('button', { name: 'Actualizar' }).click();

  const infoMessage = page.locator('.info-message');
  await expect(infoMessage).toContainText('¡Dato actualizado con éxito!');
});
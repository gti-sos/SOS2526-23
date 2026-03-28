// @ts-check
import { test, expect } from '@playwright/test';

let app = 'http://localhost:3000';

test('main page has the right title', async ({ page }) => {
  await page.goto(app);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SOS2526-23 - Home/);
});


// lo hacemos de esta forma porque el link de DAV abre una nueva ventana, y el test se ejecuta en la ventana original,
// por lo que no encuentra el título de la nueva ventana.
// Con este código, esperamos a que se abra la nueva ventana y luego evaluamos el título.
test('global-ads-performance page show some global ads', async ({ page }) => {
  await page.goto(app);
  
  // Capturamos la promesa de la nueva ventana emergente
  const popupPromise = page.waitForEvent('popup');
  
  await page.getByRole('link', { name: 'DAV' }).click();
  
  // Asignamos la nueva ventana a una constante
  const newPage = await popupPromise;
  
  // Evaluamos el título estrictamente sobre la nueva ventana
  await expect(newPage).toHaveTitle(/Global Ads List/);
});
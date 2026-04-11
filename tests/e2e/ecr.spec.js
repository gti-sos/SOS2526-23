// @ts-check
import { test, expect } from '@playwright/test';

let app = 'http://localhost:5173';
let token = '';

test.beforeAll(async ({ request }) => {
    const response = await request.post('http://127.0.0.1:3000/api/v1/login', {
        data: { username: 'admin', password: 'password123' } 
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    token = body.token;
});

test.beforeEach(async ({ request }) => {
    // Limpieza de base de datos antes de cada test
    const response = await request.delete('http://127.0.0.1:3000/api/v1/daily-global-stock-market-indicators', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    // Si la base de datos ya está vacía, el API podría devolver 204 o 200, ambos están bien
    expect(response.status()).toBeLessThan(400); 
}); 

/** @param {import('@playwright/test').Page} page */
async function login(page) {
    // 1. Esperamos a que la página cargue algo reconocible (el login o el título de la tabla)
    // Usamos un selector que cubra ambos casos para no perder tiempo
    await page.waitForFunction(() => {
        return document.body.innerText.includes('Acceso Restringido') || 
               document.body.innerText.includes('Indicadores Diarios');
    }, { timeout: 15000 });

    const loginBox = page.locator('div', { hasText: 'Acceso Restringido' }).first();
    
    // 2. Si el login está visible, logueamos
    if (await loginBox.isVisible()) {
        console.log("Detectada pantalla de login. Iniciando sesión...");
        // Forzamos el foco en los inputs del login específicamente
        await loginBox.locator('input').nth(0).fill('admin');
        await loginBox.locator('input').nth(1).fill('password123');
        await loginBox.getByRole('button', { name: 'Entrar' }).click();
        
        // Esperamos a que el login desaparezca
        await loginBox.waitFor({ state: 'hidden', timeout: 10000 });
    } else {
        console.log("Sesión ya activa, saltando login.");
    }

    // 3. PASO CRÍTICO: Esperamos a que el botón "Cargar" sea realmente interactuable
    // A veces Svelte tarda un segundo en montar el botón en el DOM
    const btnCargar = page.getByRole('button', { name: /Cargar/i }).first();
    await btnCargar.waitFor({ state: 'visible', timeout: 15000 });
}

test('ECR page user can load initial data', async ({ page }) => {
    await page.goto(app);
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'ECR' }).click();
    const newPage = await popupPromise;

    // AÑADE ESTA LÍNEA: Espera a que la URL del popup sea estable
    await newPage.waitForLoadState('domcontentloaded');

    await login(newPage);
    
    // El resto del test sigue igual...
    newPage.on('dialog', async dialog => await dialog.accept());
    await newPage.getByRole('button', { name: /Cargar/i }).first().click();
    await expect(newPage.locator('tr').nth(1)).toBeVisible({ timeout: 10000 });
});

test('ECR page user can insert and delete a specific record', async ({ page }) => {
    await page.goto(app);
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'ECR' }).click();
    const newPage = await popupPromise;

    await login(newPage);

    newPage.on('dialog', async dialog => await dialog.accept());

    await newPage.getByPlaceholder('Fecha').last().fill('2026-05-05');
    await newPage.getByPlaceholder('Región').last().fill('RegionTestE2E');
    await newPage.getByPlaceholder('Nombre del Índice').last().fill('IndexTest');
    await newPage.getByPlaceholder('Apertura').last().fill('100.0');
    await newPage.getByPlaceholder('Máximo').last().fill('110.0');
    await newPage.getByPlaceholder('Mínimo').last().fill('90.0');
    await newPage.getByPlaceholder('Cierre').last().fill('105.0');
    await newPage.getByPlaceholder('Volumen').last().fill('1000');
    await newPage.getByPlaceholder('Cambio').last().fill('5.0'); 
    
    await newPage.getByRole('button', { name: /Guardar|Añadir/i }).first().click();

    const newRow = newPage.locator('tr', { hasText: 'RegionTestE2E' }).first();
    await expect(newRow).toBeVisible({ timeout: 10000 });

    await newRow.getByRole('button', { name: /Eliminar|Borrar/i }).click();
    await expect(newRow).not.toBeVisible();
});

test('ECR page user can delete all records', async ({ page }) => {
    await page.goto(app);
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'ECR' }).click();
    const newPage = await popupPromise;

    await login(newPage);

    newPage.on('dialog', async dialog => await dialog.accept());

    await newPage.getByRole('button', { name: /Cargar/i }).first().click();
    await expect(newPage.locator('tr').nth(1)).toBeVisible({ timeout: 10000 });

    await newPage.getByRole('button', { name: /Borrar todos/i }).first().click();
    await newPage.waitForTimeout(1500); 
    
    const rows = await newPage.locator('tbody tr').count();
    expect(rows).toBe(0);
});

test('ECR page user can edit a record', async ({ page }) => {
    await page.goto(app);
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'ECR' }).click();
    
    // Aquí es donde definimos 'newPage'
    const newPage = await popupPromise; 

    await newPage.waitForLoadState('domcontentloaded');
    await login(newPage);

    // Ahora sí funcionarán todas estas líneas:
    newPage.on('dialog', async dialog => await dialog.accept());
    await newPage.getByRole('button', { name: /Cargar/i }).first().click();
    
    // Esperamos a que la tabla tenga datos
    await expect(newPage.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
    
    const editLink = newPage.getByRole('link', { name: /Editar/i }).first();
    await expect(editLink).toBeVisible({ timeout: 15000 });
    await editLink.click();
    
    // Verificamos que hemos navegado a la página de edición
    await expect(newPage).toHaveURL(/.*\/edit\/.*/);
});
// @ts-check
import { test, expect } from '@playwright/test';

// Usamos 127.0.0.1 para evitar el error ECONNREFUSED en GitHub Actions
let app = 'http://127.0.0.1:3000';

// Limpieza de base de datos antes de cada test de Emilio
test.beforeEach(async ({ request }) => {
    const response = await request.delete('http://127.0.0.1:3000/api/v1/daily-global-stock-market-indicators');
    expect(response.ok()).toBeTruthy();
});

test('ECR page user can load initial data', async ({ page }) => {
    await page.goto(app);
    
    // ATENCIÓN: Asumo que en la página principal el enlace a la API de Emilio dice "ECR".
    // Si dice el nombre completo de la API, cámbialo en la línea de abajo.
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'ECR' }).click();
    const newPage = await popupPromise;

    // Aceptamos los diálogos nativos por si acaso
    newPage.on('dialog', async dialog => await dialog.accept());

    // Clic en cargar datos
    await newPage.getByRole('button', { name: /Cargar datos iniciales/i }).click();

    // Comprobamos que al menos una fila se ha renderizado en la tabla
    await expect(newPage.locator('tbody tr').first()).toBeVisible();

    const rows = await newPage.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
});

test('ECR page user can insert and delete a specific record', async ({ page }) => {
    await page.goto(app);
    
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'ECR' }).click();
    const newPage = await popupPromise;

    newPage.on('dialog', async dialog => await dialog.accept());

    // Esperar a que salga el mensaje de tabla vacía
    await expect(newPage.getByText('No hay datos en el sistema.')).toBeVisible();

    // 1. Rellenar formulario (usando los placeholders exactos del código Svelte)
    await newPage.getByPlaceholder('Fecha (Ej. 2024-01-01)').fill('2026-05-05');
    await newPage.getByPlaceholder('Región').fill('RegionTestE2E');
    await newPage.getByPlaceholder('Nombre del Índice').fill('IndexTest');
    await newPage.getByPlaceholder('Apertura').fill('100.5');
    await newPage.getByPlaceholder('Máximo').fill('110.0');
    await newPage.getByPlaceholder('Mínimo').fill('90.0');
    await newPage.getByPlaceholder('Cierre').fill('105.0');
    await newPage.getByPlaceholder('Volumen').fill('5000');
    await newPage.getByPlaceholder('Cambio Diario (%)').fill('4.5');

    // 2. Guardar dato
    await newPage.getByRole('button', { name: 'Guardar dato' }).click();

    // 3. Comprobar que aparece el mensaje de éxito y la fila en la tabla
    await expect(newPage.getByText('¡Dato del mercado añadido correctamente!')).toBeVisible();
    const newRow = newPage.locator('tbody tr', { hasText: 'RegionTestE2E' });
    await expect(newRow).toBeVisible();

    // 4. Borrar ese dato en concreto
    await newRow.getByRole('button', { name: 'Eliminar' }).click();

    // 5. Comprobar que desaparece
    await expect(newRow).not.toBeVisible();
});

test('ECR page user can delete all records', async ({ page }) => {
    await page.goto(app);
    
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'ECR' }).click();
    const newPage = await popupPromise;

    // Configurar para que SIEMPRE acepte el confirm() del navegador (necesario para el botón rojo)
    newPage.on('dialog', async dialog => await dialog.accept());

    // 1. Cargar datos para tener algo que borrar
    await newPage.getByRole('button', { name: /Cargar datos iniciales/i }).click();
    await expect(newPage.locator('tbody tr').first()).toBeVisible();

    // 2. Pulsar botón rojo de borrar todos
    await newPage.getByRole('button', { name: '¡Borrar todos los registros!' }).click();

    // 3. Verificar que aparece el texto de tabla vacía y no hay filas
    await expect(newPage.getByText('No hay datos en el sistema.')).toBeVisible();
    
    const rows = await newPage.locator('tbody tr').count();
    expect(rows).toBe(0);
});
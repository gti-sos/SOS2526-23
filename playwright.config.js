// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Importante: No ejecutar tests en paralelo para evitar colisiones en la base de datos */
  fullyParallel: false,
  
  /* Si dejas un test.only por error, el CI fallará (buena práctica) */
  forbidOnly: !!process.env.CI,
  
  /* Reintentos en caso de fallo (útil para navegadores inestables como Webkit) */
  retries: process.env.CI ? 2 : 1,

  /* MODIFICACIÓN CRÍTICA: Forzamos 1 worker siempre. 
     Esto garantiza que los tests se ejecuten uno tras otro (secuencialmente)
     evitando que se pisen los datos en dailyIndicators.db
  */
  workers: 1,

  /* Reportero en HTML */
  reporter: 'html',

  /* Configuración global de los tests */
  use: {
    /* Tiempo máximo de espera para acciones como click() o fill() */
    actionTimeout: 10000,
    /* Recoger trazas en el primer reintento de un test fallido */
    trace: 'on-first-retry',
    /* Tiempo máximo de espera para navegación */
    navigationTimeout: 30000,
  },

  /* Configuración por navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
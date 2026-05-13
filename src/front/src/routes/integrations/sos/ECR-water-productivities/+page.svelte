<script>
  import { onMount } from 'svelte';

  const API_BASE = 'https://sos2526-17.onrender.com/api/v1/water-productivities';

  let datos    = $state([]);
  let cargando = $state(true);
  let error    = $state('');
  let canvas   = $state(null);
  let chartInstance = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.Chart) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  $effect(() => {
    if (!canvas || datos.length === 0) return;

    const top10 = [...datos]
      .filter(d => d.country && d.waterProductivity)
      .sort((a, b) => b.waterProductivity - a.waterProductivity)
      .slice(0, 10);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new window.Chart(canvas, {
      type: 'polarArea',
      data: {
        labels: top10.map(d => d.country),
        datasets: [{
          label: 'Productividad (USD/m³)',
          data: top10.map(d => d.waterProductivity),
          backgroundColor: [
            'rgba(54,162,235,0.7)', 'rgba(255,99,132,0.7)',
            'rgba(75,192,192,0.7)', 'rgba(255,206,86,0.7)',
            'rgba(153,102,255,0.7)', 'rgba(255,159,64,0.7)',
            'rgba(75,192,75,0.7)',  'rgba(255,159,255,0.7)',
            'rgba(54,162,235,0.4)', 'rgba(255,99,132,0.4)',
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });

    return () => { if (chartInstance) { chartInstance.destroy(); chartInstance = null; } };
  });

  onMount(async () => {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js');

      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let json = await res.json();

      if (Array.isArray(json) && json.length === 0) {
        await fetch(`${API_BASE}/loadInitialData`);
        const res2 = await fetch(API_BASE);
        json = await res2.json();
      }
      datos = Array.isArray(json) ? json : [];
    } catch (e) {
      error = 'Error al conectar con la API: ' + e.message;
    } finally {
      cargando = false;
    }
  });
</script>

<main>
  <h2>💧 Productividad del Agua por País</h2>
  <p class="sub">Integración con API sos2526-17</p>

  {#if cargando}
    <div class="msg">⌛ Cargando datos y recursos...</div>
  {:else if error}
    <div class="msg error">❌ {error}</div>
  {:else if datos.length === 0}
    <div class="msg">⚠️ No hay datos disponibles.</div>
  {:else}
    <div class="chart-box">
      <canvas bind:this={canvas}></canvas>
    </div>

    <details>
      <summary>Ver todos los datos recibidos ({datos.length} registros)</summary>
      <div class="tabla-wrapper">
        <table>
          <thead>
            <tr>
              <th>País</th>
              <th>Código</th>
              <th>Año</th>
              <th>Productividad hídrica</th>
              <th>Estrés hídrico</th>
              <th>Agua dulce anual</th>
            </tr>
          </thead>
          <tbody>
            {#each datos as d}
              <tr>
                <td>{d.country}</td>
                <td>{d.countryCode}</td>
                <td>{d.year}</td>
                <td>{d.waterProductivity}</td>
                <td>{d.waterStress}</td>
                <td>{d.annualFreshwater}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </details>
  {/if}
</main>

<style>
  main { font-family: system-ui, sans-serif; padding: 2rem; max-width: 900px; margin: 0 auto; }
  h2 { color: #1a5c8a; margin-bottom: 0.2rem; }
  .sub { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
  .chart-box { height: 500px; background: #fff; border-radius: 12px; padding: 1rem; border: 1px solid #eee; }
  .msg { padding: 2rem; background: #f8f9fa; border-radius: 10px; text-align: center; color: #555; }
  .error { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }

  details { margin-top: 2rem; background: #fafafa; padding: 1rem; border-radius: 8px; }
  summary { cursor: pointer; font-weight: 600; color: #4a5568; }

  .tabla-wrapper { overflow-x: auto; margin-top: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { background: #2d3748; color: #edf2f7; padding: 0.5rem 0.75rem; text-align: left; }
  td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #e2e8f0; color: #2d3748; }
  tr:hover td { background: #f7fafc; }
</style>
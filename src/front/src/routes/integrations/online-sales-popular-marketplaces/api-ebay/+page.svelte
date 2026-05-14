<script>
    import { onMount } from 'svelte';
    import 'c3/c3.css';

    let ebayTrends = [];
    let loading = true;
    
    // Productos fijos para mostrar tendencias de mercado rápidas
    const productsToWatch = ["iPhone 15", "Samsung Galaxy S24", "PlayStation 5"];

    onMount(async () => {
        try {
            const results = [];
            for (const name of productsToWatch) {
                const res = await fetch("/api/v1/online-sales-popular-marketplaces/ebay-trends", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keywords: name })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    results.push({ name, ...data });
                }
                // Pausa corta para evitar el error 429 de saturación
                await new Promise(r => setTimeout(r, 1000));
            }
            ebayTrends = results;
            loading = false;
            setTimeout(renderCharts, 100);
        } catch (e) { console.error(e); }
    });

    async function renderCharts() {
        const c3 = (await import('c3')).default;
        ebayTrends.forEach((item, i) => {
            c3.generate({
                bindto: `#ebay-chart-${i}`,
                data: {
                    columns: [
                        ['Precio Mín', item.min_price],
                        ['Precio Med', item.average_price],
                        ['Precio Máx', item.max_price]
                    ],
                    type: 'bar'
                },
                size: { height: 200 }
            });
        });
    }
</script>

<main>
    <h2>Tendencias Actuales en eBay</h2>
    {#if loading}
        <p>Cargando datos de mercado externo...</p>
    {:else}
        <div class="grid">
            {#each ebayTrends as item, i}
                <div class="card">
                    <h3>{item.name}</h3>
                    <div id="ebay-chart-{i}"></div>
                    <p><strong>Promedio Mercado:</strong> {item.average_price}€</p>
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px; }
    .card { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 1px solid #ddd; }
</style>
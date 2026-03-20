<script>
    // @ts-ignore
    let sales = $state([]);

    import { dev } from '$app/environment';

    let API = '/api/v1/online-sales-popular-marketplaces';

    if (dev){
        API = 'http://localhost:3000' + API;
    }

    let isInitialLoad = true;

    async function getSales(){
        const url = isInitialLoad 
            ? `${API}/loadInitialData` 
            : API;

        const res = await fetch(url, {
            method: "GET"
        });
        const data = await res.json();
        sales = data;
        isInitialLoad = false;
    }
</script>

<p> Online Sales </p>

<ul>
{#each sales as sale (sale.region + sale.date + sale.product_name)}
    <li>{sale.region} - {sale.date} - {sale.product_name}</li>
{/each}
</ul>

<button onclick={getSales}> Refresh </button>
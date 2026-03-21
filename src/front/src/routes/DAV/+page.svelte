<script>
    import {dev} from '$app/environment';
    import {onMount } from 'svelte';    
    
    let API = "/api/v1/global-ads-performance";

    // @ts-ignore
    let global_ad= $state([]);
    let resultStatusCode = $state(0);
    let newRegion = $state("newRegion");
    let newDate = $state("newDate");
    let newPlatform = $state("newPlatform");
    let newIndustry = $state("newIndustry");
    let newImpressions = $state(0);
    let newClicks = $state(0);
    let newAdSpend = $state(0);
    let newConversions = $state(0);
    let newRevenue = $state(0);

    if (dev)
        API = "http://localhost:3000"+API;
    
    async function getData() {
        const res = await fetch(API,{
            method: 'GET'
        }); 
        const data = await res.json();
        global_ad = data;
    }


    //FUNCION DELETE

/** @param {{region: string, date: string}} ad */
async function deleteAd(ad) {
    const url = `${API}?region=${encodeURIComponent(ad.region)}&date=${encodeURIComponent(ad.date)}`;
    
    try {
        const res = await fetch(url, { method: 'DELETE' });
        resultStatusCode = res.status;

        if (res.ok) {
            // "Filtramos" el array: dejamos todos los que NO coincidan con el que borramos
            global_ad = global_ad.filter(item => 
                !(item.region === ad.region && item.date === ad.date)
            );
        } else {
            alert("No se pudo eliminar el recurso del servidor.");
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
}


async function insertAd() {
    let newAd= {
            region: newRegion,
            date: newDate,
            platform: newPlatform,
            industry: newIndustry,
            impressions: newImpressions,
            clicks: newClicks,
            ad_spend: newAdSpend,
            conversions: newConversions,
            revenue: newRevenue
        };

    const res = await fetch(API,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAd)
        });

        resultStatusCode = await res.status;

        if(resultStatusCode==201)
            getData();
}

    onMount(async () => {
        getData();
    });

</script>

<p>GLOBAL ADS PERFORMANCE</p>
{#if global_ad.length === 0}
    <p>Cargando datos o la lista está vacía...</p>
{:else}
    <table>
        <thead>
            <tr>
                <th>Region</th>
                <th>Fecha</th>
                <th>Plataforma</th>
                <th>Industria</th>
                <th>Impresiones</th>
                <th>Clicks</th>
                <th>Gasto en Anuncios</th>
                <th>Conversiones</th>
                <th>Ingresos</th>
                <th>Acciones</th>
                </tr>


        </thead>
        <tbody>
            <tr>
                <td><input bind:value={newRegion} placeholder="Region"></td>
                <td><input bind:value={newDate} placeholder="Fecha"></td>
                <td><input bind:value={newPlatform} placeholder="Plataforma"></td>
                <td><input bind:value={newIndustry} placeholder="Industria"></td>
                <td><input bind:value={newImpressions} placeholder="Impresiones" type="number"></td>
                <td><input bind:value={newClicks} placeholder="Clicks" type="number"></td>
                <td><input bind:value={newAdSpend} placeholder="Gasto en Anuncios" type="number"></td>
                <td><input bind:value={newConversions} placeholder="Conversiones" type="number"></td>
                <td><input bind:value={newRevenue} placeholder="Ingresos" type="number"></td>
                <td><button onclick={insertAd}>Insertar</button></td>
            </tr>
            {#each global_ad as ad, i (i)}
                <tr>
                    <td><a href="DAV/{ad.region}/{ad.date}">{ad.region}</a></td>
                    <td>{ad.date}</td>
                    <td>{ad.platform}</td>
                    <td>{ad.industry}</td>
                    <td>{ad.impressions}</td>
                    <td>{ad.clicks}</td>
                    <td>{ad.ad_spend}</td>
                    <td>{ad.conversions}</td>
                    <td>{ad.revenue}</td>
                    <td><button onclick={() => deleteAd(ad)}>Eliminar</button></td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

{#if resultStatusCode !=0}
    <h5>Status Code operation result: {resultStatusCode}</h5>
{/if}
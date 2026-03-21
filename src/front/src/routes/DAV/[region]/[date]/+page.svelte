<script>

    import { page } from '$app/state';
    import {dev} from '$app/environment';
    import {onMount } from 'svelte';    
    
    let region = page.params.region;
    let date = page.params.date;

    let API = "/api/v1/global-ads-performance";

    let resultStatusCode = $state(0);
    let updatedRegion = $state("newRegion");
    let updatedDate = $state("newDate");
    let updatedPlatform = $state("newPlatform");
    let updatedIndustry = $state("newIndustry");
    let updatedImpressions = $state(0);
    let updatedClicks = $state(0);
    let updatedAdSpend = $state(0);
    let updatedConversions = $state(0);
    let updatedRevenue = $state(0);

    if (dev)
        API = "http://localhost:3000"+API;
    

        //FUNCION GET
    async function getData() {
        const res = await fetch(API+"/"+region+"/"+date,{
            method: 'GET'
        });
        const data = await res.json();
        updatedRegion = data.region;
        updatedDate = data.date;
        updatedPlatform = data.platform;
        updatedIndustry = data.industry;
        updatedImpressions = data.impressions;
        updatedClicks = data.clicks;
        updatedAdSpend = data.ad_spend;
        updatedConversions = data.conversions;
        updatedRevenue = data.revenue;
    }


    //FUNCION PUT

    async function updateAd() {
        let newAd= {
                region: updatedRegion,
                date: updatedDate,
                platform: updatedPlatform,
                industry: updatedIndustry,
                impressions: updatedImpressions,
                clicks: updatedClicks,
                ad_spend: updatedAdSpend,
                conversions: updatedConversions,
                revenue: updatedRevenue
            };

        const res = await fetch(API+"/"+region+"/"+date,{
            method: 'PUT',
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

<p>Detalle de Anuncios para la Región: {region}</p>

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
                <td><input bind:value={updatedRegion}></td>
                <td><input bind:value={updatedDate}></td>
                <td><input bind:value={updatedPlatform}></td>
                <td><input bind:value={updatedIndustry}></td>
                <td><input bind:value={updatedImpressions}></td>
                <td><input bind:value={updatedClicks}></td>
                <td><input bind:value={updatedAdSpend}></td>
                <td><input bind:value={updatedConversions}></td>
                <td><input bind:value={updatedRevenue}></td>
                <td><button onclick={updateAd}>Actualizar</button></td>
            </tr>
        </tbody>
    </table>

{#if resultStatusCode !=0}
    <h5>Status Code operation result: {resultStatusCode}</h5>
{/if}

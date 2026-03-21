<script>
    // @ts-ignore
    let global_ad= $state([]);

    import {dev} from '$app/environment';
    import {onMount } from 'svelte';
    
    let API = "/api/v1/global-ads-performance";

    if (dev)
        API = "http://localhost:3000"+API;
    
    async function getData() {
        const res = await fetch(API,{
            method: 'GET'
        }); 
        const data = await res.json();
        global_ad = data;
    }


async function deleteAd(ad) {
    // Construimos la URL con los parámetros necesarios
    const url = `${API}?region=${encodeURIComponent(ad.region)}&date=${encodeURIComponent(ad.date)}`;
    const res = await fetch(url, {
        method: 'DELETE'
    });
    if (res.ok) {
        const data = await res.json();
        global_ad = data;
    } else {
        console.error('Failed to delete ad');
    }
}

    onMount(async () => {
        getData();
    });

</script>

<p>GLOBAL ADS PERFORMANCE</p>

<table>
    <thead>
        <tr>
            <th>Region</th>
            <th>Date</th>
            <th>Platform</th>
            <th>Industry</th>
            <th>Impression</th>
            <th>Click</th>
            <th>Ad_Spend</th>
            <th>Conversion</th>
            <th>Revenue</th>
            <th>Action</th>
        </tr>
    </thead>

    <tbody>
        {#each global_ad as ad (ad.region)}
            <tr>
                <td>{ad.region}</td>
                <td>{ad.date}</td>
                <td>{ad.platform}</td>
                <td>{ad.industry}</td>
                <td>{ad.impressions}</td>
                <td>{ad.clicks}</td>
                <td>{ad.ad_spend}</td>
                <td>{ad.conversions}</td>
                <td>{ad.revenue}</td>
                <td><button onclick={() => deleteAd(ad)}>Delete</button></td>
            </tr>
        {/each}
    </tbody>
</table>





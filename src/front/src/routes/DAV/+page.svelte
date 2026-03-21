<script>
    let global_ad= $state([]);

    async function getData() {
        const res = await fetch('/http://localhost:3000/DAV/',{
            method: 'GET'
        }); 
        const data = await res.json();
        global_ad = data;
    }

</script>

<p>GLOBAL ADS PERFORMANCE</p>
{global_ad}

<button onclick={getData}>Refresh Data</button>
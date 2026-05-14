<script>
    import { onMount } from 'svelte';
    import 'c3/c3.css';

    let salesData = [];
    let birthData = [];

    // Diccionario para mapear países a continentes
    const countryToContinent = {
        "Venezuela": "South America",
        "Cyprus": "Europe",
        "Latvia": "Europe",
        "Slovenia": "Europe",
        "Liberia": "Africa",
        "Zambia": "Africa",
        "Ethiopia": "Africa",
        "Mauritania": "Africa",
        "Mongolia": "Asia",
        "Ukraine": "Europe",
        "Saint Barthelemy": "North America"
    };

    onMount(async () => {
        try {
            // 1. CARGA DE TUS DATOS (Online Sales)
            let resSales = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces");
            if (resSales.status === 200) {
                let data = await resSales.json(); 
                if (data.length === 0) {
                    const resLoad = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces/loadInitialData");
                    if (resLoad.ok) { 
                        await new Promise(r => setTimeout(r, 1000)); 
                        const resFinal = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces"); 
                        salesData = await resFinal.json();
                    }
                } else {
                    salesData = data;
                }
            }
            
            // 2. CARGA DE DATOS DE LA NUEVA API (Natalidad - Grupo 12)
            const resBirth = await fetch("https://sos2526-12.onrender.com/api/v2/birth-death-growth-rates");
            if (resBirth.ok) {
                birthData = await resBirth.json();
            }

            // 3. PROCESAMIENTO DE DATOS: Agrupación por continente
            let statsByContinent = {};

            // Procesar tus ventas por continente
            salesData.forEach(item => {
                let continent = item.region;
                if (!statsByContinent[continent]) {
                    statsByContinent[continent] = { sales: 0, birth: 0 };
                }
                statsByContinent[continent].sales += parseFloat(item.total || 0);
            });

            // Procesar natalidad por continente
            birthData.forEach(item => {
                let continent = countryToContinent[item.country_name] || "Otros";
                if (!statsByContinent[continent]) {
                    statsByContinent[continent] = { sales: 0, birth: 0 };
                }
                // Usamos crude_birth_rate según tus datos de ejemplo
                statsByContinent[continent].birth += parseFloat(item.crude_birth_rate || 0);
            });

            // Preparar arrays finales para la gráfica
            let continentLabels = Object.keys(statsByContinent);
            let finalSalesValues = continentLabels.map(c => statsByContinent[c].sales);
            let finalBirthValues = continentLabels.map(c => statsByContinent[c].birth);

            // 4. IMPORTACIÓN DINÁMICA DE C3 [cite: 13]
            const c3 = (await import('c3')).default;

            if (document.getElementById('chart-area-container')) {
                c3.generate({
                    bindto: '#chart-area-container',
                    data: {
                        columns: [
                            ['Mis Ventas (€)', ...finalSalesValues],
                            ['Tasa de Natalidad Sumada', ...finalBirthValues]
                        ],
                        type: 'area-spline',
                        axes: {
                            'Mis Ventas (€)': 'y',
                            'Tasa de Natalidad Sumada': 'y2'
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            categories: continentLabels,
                            label: { text: 'Continentes', position: 'outer-center' }
                        },
                        y: {
                            label: { text: 'Ventas Totales (€)', position: 'outer-middle' }
                        },
                        y2: {
                            show: true,
                            label: { text: 'Suma Tasas Natalidad', position: 'outer-middle' }
                        }
                    },
                    grid: {
                        y: { show: true }
                    }
                });
            }

        } catch (error) {
            console.error("Error en la integración v2:", error);
        }
    });
</script>

<main>
    <div class="container">
        <h2>Análisis Agrupado por Continente</h2>
        <p>Suma de ventas y tasas de natalidad según la región geográfica.</p>
        
        <div id="chart-area-container"></div>
    </div>
</main>

<style>
    .container {
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    #chart-area-container {
        width: 100%;
        min-height: 500px; 
        margin-top: 30px;
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    h2, p {
        text-align: center;
    }
</style>
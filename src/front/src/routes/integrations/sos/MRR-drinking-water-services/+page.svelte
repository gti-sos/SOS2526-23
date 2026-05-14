<script>
    import { onMount } from 'svelte';
    // Importamos los estilos aquí
    import 'c3/c3.css';

    let salesData = [];
    let waterData = [];

    onMount(async () => {
        try {
            // 1. CARGA DE TUS DATOS (Online Sales)
            let resSales = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces");
            if (resSales.status === 200) {
                let data = await resSales.json(); 
                
                // 2. SI LOS DATOS ESTÁN VACÍOS 
                if (data.length === 0) {
                    console.log("API vacía, solicitando carga de datos iniciales..."); 
                    const resLoad = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces/loadInitialData");
                    if (resLoad.ok) { 
                        const resFinal = await fetch("https://sos2526-23.onrender.com/api/v1/online-sales-popular-marketplaces"); 
                        salesData = await resFinal.json(); 
                    }
                } else {
                    // 3. SI YA HABÍA DATOS, LOS ASIGNAMOS 
                    salesData = data; 
                }
            }
            
            // 2. CARGA DE DATOS DEL COMPAÑERO (Agua)
            const resWater = await fetch("https://sos2526-27.onrender.com/api/v1/drinking-water-services");
            if (resWater.ok) {
                waterData = await resWater.json();
            }

            // 3. Procesar datos asegurando que son números
            console.log(salesData.length);
            let totalSales = salesData.reduce((acc, item) => {
                // Convertimos a Float por si viene como texto
                return acc + parseFloat(item.total || 0); 
            }, 0);

            let limitedWaterData = waterData.slice(0, 11);
            let totalWater = limitedWaterData.reduce((acc, item) => {
                return acc + parseFloat(item.wat_bas_pop_residence_urban || 0);
            }, 0);

            // LOG DE CONTROL: Mira si los números tienen sentido en la consola
            console.log("Suma Ventas:", totalSales, "Suma Agua:", totalWater);

            // 4. Importación dinámica de C3 para evitar "window is not defined" [cite: 2]
            const c3 = (await import('c3')).default;

            if (document.getElementById('chart-container')) {
                c3.generate({
                    bindto: '#chart-container',
                    data: {
                        columns: [
                            ['Mis Ventas (€)', totalSales],
                            ['Población Agua (Urbana)', totalWater]
                        ],
                        type: 'bar',
                        axes: {
                            'Mis Ventas (€)': 'y',        // Eje izquierdo para tus datos
                            'Población Agua (Urbana)': 'y2' // Eje derecho para el compañero
                        }
                    },
                    axis: {
                        y: {
                            label: { text: 'Euros (€)', position: 'outer-middle' }
                        },
                        y2: {
                            show: true, // ¡CRÍTICO! Activa el segundo eje
                            label: { text: 'Nº Habitantes', position: 'outer-middle' }
                        }
                    },
                    bar: {
                        width: { ratio: 0.5 } 
                    },
                    grid: {
                        y: { show: true }
                    }
                });
            }

        } catch (error) {
            console.error("Error en la integración:", error);
        }
    });
</script>

<main>
    <h2>Integración con Grupo 27 (C3.js + Donut)</h2>
    
    <div id="chart-container"></div>
</main>

<style>
    #chart-container {
        width: 100%;
        min-height: 450px; /* Importante dar altura para que sea visible */
        margin-top: 20px;
    }
    
    h2 {
        text-align: center;
        font-family: sans-serif;
    }
</style>
<script>
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';
    import { Button } from '@sveltestrap/sveltestrap';
    import { SvelteURLSearchParams } from 'svelte/reactivity';

    let API = '/api/v1/online-sales-popular-marketplaces';
    if (dev){
        API = '' + API;
    }

    // @ts-ignore
    let sales = $state([]);
    let resultStatusCode = $state(0);
    let informationText = $state("");

    let newRegion = $state("");
    let newDate = $state("");
    let newCategory = $state("");
    let newProduct = $state("");
    let newQuantity = $state(0);
    let newPrice = $state(0);
    let newTotal = $state(0);
    let newPaymentMethod = $state("");

    let searchRegion = $state("");
    let searchDateFrom = $state("");
    let searchDateTo = $state("");
    let searchCategory = $state("");
    let searchProduct = $state("");
    let searchMinQuantity = $state("");
    let searchMaxQuantity = $state("");
    let searchMinPrice = $state("");
    let searchMaxPrice = $state("");
    let searchMinTotal = $state("");
    let searchMaxTotal = $state("");
    let searchPayment = $state("");
    let searchLimit = $state("");
    let searchOffset = $state("");

    async function loadInitialData() {
        await deleteAll();
        informationText = "";
        const res = await fetch(API + "/loadInitialData", {
            method: "GET"
        });

        resultStatusCode = await res.status;
        if (resultStatusCode == 200){
            await getSales();
            informationText = "¡Datos cargados con éxito!"
        } else if (resultStatusCode == 409){
            informationText = "¡Ya existen datos!";
        } else {
            informationText = `Error inesperado`;
        }

    }

    async function getSales(esBusqueda = false){

        let queryParams = new SvelteURLSearchParams();

        // Solo añadimos los parámetros si el usuario ha escrito algo en ellos
        if (searchRegion) queryParams.append("region", searchRegion);
        if (searchDateFrom) queryParams.append("from", searchDateFrom);
        if (searchDateTo) queryParams.append("to", searchDateTo);
        if (searchCategory) queryParams.append("product_category", searchCategory);
        if (searchProduct) queryParams.append("product_name", searchProduct);
        if (searchMinQuantity) queryParams.append("min_quantity_sold", searchMinQuantity);
        if (searchMaxQuantity) queryParams.append("max_quantity_sold", searchMaxQuantity);
        if (searchMinPrice) queryParams.append("min_unit_price", searchMinPrice);
        if (searchMaxPrice) queryParams.append("max_unit_price", searchMaxPrice);
        if (searchMinTotal) queryParams.append("min_total", searchMinTotal);
        if (searchMaxTotal) queryParams.append("max_total", searchMaxTotal);
        if (searchPayment) queryParams.append("payment_method", searchPayment);
        if (searchLimit) queryParams.append("limit", searchLimit);
        if (searchOffset) queryParams.append("offset", searchOffset);

        const queryString = queryParams.toString();
        
        const url = API + (queryString ? `?${queryString}` : "");

        const res = await fetch(url, { method: "GET" });
        if (res.ok) {
            sales = await res.json();
            if (esBusqueda) {
                informationText = `Búsqueda completada. Se encontraron ${sales.length} resultados.`;
            }
        } else {
            informationText = "Error al realizar la búsqueda.";
        }
    }

    async function deleteAll(){
        informationText = "";
        const res = await fetch(API, {
            method: "DELETE"
        });
        resultStatusCode = await res.status;
        if (resultStatusCode == 200){
            await getSales();
            informationText = "Datos eliminados.";
        }
    }

    async function insertSale(){
        informationText = "";
        let missingFields = [];

        if (!newRegion) missingFields.push("Región"); 
        if (!newDate) missingFields.push("Fecha"); 
        if (!newCategory) missingFields.push("Categoría"); 
        if (!newProduct) missingFields.push("Producto"); 
        if (newQuantity <= 0) missingFields.push("Cantidad"); 
        if (newPrice <= 0) missingFields.push("Precio"); 
        if (newTotal <= 0) missingFields.push("Total"); 
        if (!newPaymentMethod) missingFields.push("Método de pago"); 


        let newSale = {
            region: newRegion,
            date: newDate,
            product_category: newCategory,
            product_name: newProduct,
            quantity_sold: newQuantity,
            unit_price: newPrice,
            total: newTotal,
            payment_method: newPaymentMethod
        };

        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newSale)
        });

        resultStatusCode = await res.status;
        if (resultStatusCode == 201){
            getSales();
            informationText = `Dato creado con ${newRegion} y ${newDate}.`;
        } else if (resultStatusCode == 409){
            informationText = "Ya existe un dato con esa misma región y fecha al que se quiere añadir.";
        } else if (resultStatusCode == 400){
            informationText = `Faltan los siguientes campos por rellenar: ${missingFields.join(", ")}.`;        
        } else {
            informationText = `Error inesperado`;
        }
    }

    // @ts-ignore
    async function deleteSale(regionName, dateN){
        informationText = "";
        const res = await fetch(API + "/" + regionName + "/" + dateN, {
            method: "DELETE"
        });

        resultStatusCode = await res.status;
        if (resultStatusCode == 200){
            await getSales();
            informationText = `El dato con ${regionName} y ${dateN} como region y fecha, respectivamente, ha sido eliminado.`
        }

    }
   
    // @ts-ignore
    async function goToUpdate(regionName, dateN) {
        informationText = ""; 
        const res = await fetch(API + "/" + regionName + "/" + dateN, {
            method: "GET" 
        });

        resultStatusCode = await res.status;
        if (resultStatusCode == 200) {
            window.location.href = `MRR/${regionName}/${dateN}`;
        } else if (resultStatusCode === 404) {
            informationText = `Error: No se puede actualizar porque el registro de ${regionName} en ${dateN} no existe.`;
        } else {
            informationText = `Error inesperado al verificar el recurso`;
        }
    }

    function clearSearch() {
        searchRegion = ""; searchDateFrom = ""; searchDateTo = "";
        searchCategory = ""; searchProduct = ""; searchMinQuantity = "";
        searchMaxQuantity = ""; searchMinPrice = ""; searchMaxPrice = "";
        searchMinTotal = ""; searchMaxTotal = ""; searchPayment = "";
        searchLimit = ""; searchOffset = "";
        getSales(); 
    }

    onMount(async () => {
        getSales(); 
        const mensajePendiente = sessionStorage.getItem('mensajeError');
        if (mensajePendiente) {
            informationText = mensajePendiente;
            sessionStorage.removeItem('mensajeError');
        }
    });

</script>

<svelte:head>
    <title>Online Sales List</title>
    <meta name="description" content="Ventas online en marcas populares en el proyecto SOS2526-23"/>
</svelte:head> 

<div class="sales-dashboard">
    <div class="dashboard-header">
        <h1>Online Sales</h1>
        <div class="main-actions">
            <Button color="primary" onclick={loadInitialData}>Cargar los datos originales</Button>
            <Button color="danger" onclick={deleteAll}>Eliminar todos los datos</Button>
        </div>
    </div>

    {#if informationText != ""}
        <div class="info-panel">
            <div class="info-message">
                <strong>Información:</strong> {informationText}
            </div>
        </div>
    {/if}

    <div class="search-panel">
        <h4>Filtros de Búsqueda</h4>
        <div class="search-grid">
            <input type="text" placeholder="Región" bind:value={searchRegion}>
            
            <div><small>Fecha Desde</small><input type="date" bind:value={searchDateFrom}></div>
            <div><small>Fecha Hasta</small><input type="date" bind:value={searchDateTo}></div>
            
            <input type="text" placeholder="Categoría" bind:value={searchCategory}>
            <input type="text" placeholder="Producto" bind:value={searchProduct}>
            <input type="number" placeholder="Cant. Mínima" bind:value={searchMinQuantity}>
            <input type="number" placeholder="Cant. Máxima" bind:value={searchMaxQuantity}>
            <input type="number" placeholder="Precio Mín." bind:value={searchMinPrice}>
            <input type="number" placeholder="Precio Máx." bind:value={searchMaxPrice}>
            <input type="number" placeholder="Total Mín." bind:value={searchMinTotal}>
            <input type="number" placeholder="Total Máx." bind:value={searchMaxTotal}>
            <input type="text" placeholder= "Método de Pago" bind:value={searchPayment}>
            <input type="number" placeholder="Límite (Paginación)" bind:value={searchLimit}>
            <input type="number" placeholder="Offset (Paginación)" bind:value={searchOffset}>
        </div>
        <div class="search-actions">
            <Button color="primary" onclick={() => getSales(true)}>Buscar</Button>
            <Button color="secondary" outline onclick={clearSearch}>Limpiar Filtros</Button>
        </div>
    </div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Región</th>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                    <th>Método de pago</th>
                    <th class="text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr class="input-row">
                    <td><input type="text" bind:value={newRegion} placeholder="newRegion"></td>
                    <td><input type="text" bind:value={newDate} placeholder="newDate"></td>
                    <td><input type="text" bind:value={newCategory} placeholder="newCategory"></td>
                    <td><input type="text" bind:value={newProduct} placeholder="newProduct"></td>
                    <td><input type="number" bind:value={newQuantity}></td>
                    <td><input type="number" bind:value={newPrice}></td>
                    <td><input type="number" bind:value={newTotal}></td>
                    <td><input type="text" bind:value={newPaymentMethod} placeholder="newPaymentMethod"></td>
                    <td class="text-center">
                        <Button color="success" size="sm" onclick={insertSale}>Insertar</Button>
                    </td>
                </tr>

                {#each sales as sale (sale.region + sale.date)}
                    <tr class="data-row">
                        <td>{sale.region}</td>
                        <td>{sale.date}</td>
                        <td>{sale.product_category}</td>
                        <td>{sale.product_name}</td>
                        <td>{sale.quantity_sold}</td>
                        <td>${sale.unit_price}</td>
                        <td class="total-cell">${sale.total}</td>
                        <td>{sale.payment_method}</td>
                        <td class="action-buttons">
                            <Button color="danger" outline size="sm" onclick={() => deleteSale(sale.region, sale.date)}>Eliminar</Button>
                            <Button color="info" outline size="sm" onclick={() => goToUpdate(sale.region, sale.date)}>Actualizar</Button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>



<style>
    /* Contenedor Principal */
    .sales-dashboard {
        max-width: 1550px;
        margin: 2rem auto;
        padding: 0 20px;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #333;
    }

    /* Cabecera */
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f2f5;
    }

    h1 {
        margin: 0;
        color: #2c3e50;
        font-weight: 700;
    }

    .main-actions {
        display: flex;
        gap: 10px;
    }

    /* Panel de Información Mejorado */
    .info-panel {
        background-color: #f8faff;
        border-left: 5px solid #2196F3;
        border-radius: 4px;
        padding: 15px 20px;
        margin-bottom: 25px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .status-badge.success { color: #2e7d32; }
    .status-badge.error { color: #d32f2f; }
    
    .info-message {
        font-size: 0.95rem;
        color: #444;
    }

    /* Contenedor de la Tabla */
    .table-container {
        overflow-x: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Diseño de la Tabla */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        white-space: nowrap;
    }

    .data-table thead {
        background-color: #f8f9fa;
        border-bottom: 2px solid #dee2e6;
    }

    .data-table th {
        padding: 15px 12px;
        text-align: left;
        color: #495057;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .data-table td {
        padding: 12px;
        vertical-align: middle;
        border-bottom: 1px solid #e9ecef;
    }

    .data-row:hover {
        background-color: #f8f9fa;
        transition: background-color 0.2s ease;
    }

    /* Fila de Inputs */
    .input-row {
        background-color: #f1f4f8;
    }

    .input-row input {
        width: 100%;
        min-width: 100px;
        padding: 8px 10px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 0.9rem;
        transition: border-color 0.15s ease-in-out;
        box-sizing: border-box;
    }

    .input-row input:focus {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }

    /* Celdas especiales */
    .total-cell {
        font-weight: 700;
        color: #2c3e50;
    }

    .text-center {
        text-align: center !important;
    }

    .action-buttons {
        display: flex;
        gap: 5px;
        justify-content: center;
    }

    /* Panel de Búsqueda */
    .search-panel {
        background-color: white;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
    }

    .search-panel h4 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #2c3e50;
        font-size: 1.1rem;
    }

    .search-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 15px;
        align-items: end; 
    }

    .search-grid input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 0.9rem;
        box-sizing: border-box;
    }

    .search-grid small {
        display: block;
        color: #6c757d;
        margin-bottom: 2px;
    }

    .search-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
</style>

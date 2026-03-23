<script>
    import { page } from '$app/state';

    let regionName = page.params.region;
    let dateN = page.params.date;

    import { dev } from '$app/environment';
    import { onMount } from 'svelte';
    import { Button } from '@sveltestrap/sveltestrap';

    let API = '/api/v1/online-sales-popular-marketplaces';
    if (dev){
        API = 'http://localhost:3000' + API;
    }

    // @ts-ignore
    let sale = $state({});
    let resultStatusCode = $state(0);
    let informationText = $state("");

    let newRegion = $state("newRegion");
    let newDate = $state("newDate");
    let newCategory = $state("newCategory");
    let newProduct = $state("newProduct");
    let newQuantity = $state(0);
    let newPrice = $state(0);
    let newTotal = $state(0);
    let newPaymentMethod = $state("newPaymentMethod");

    async function getSale(){
        const res = await fetch(API + "/" + regionName + "/" + dateN, {
            method: "GET"
        });
        const sale = await res.json();
        newRegion = sale.region;
        newDate = sale.date;
        newCategory = sale.product_category;
        newProduct = sale.product_name;
        newQuantity = sale.quantity_sold;
        newPrice = sale.unit_price;
        newTotal = sale.total;
        newPaymentMethod = sale.payment_method;
    }

    async function updateSale(){
        informationText = "";
        let updatedSale = {
            region: newRegion,
            date: newDate,
            product_category: newCategory,
            product_name: newProduct,
            quantity_sold: newQuantity,
            unit_price: newPrice,
            total: newTotal,
            payment_method: newPaymentMethod
        };
        const res = await fetch(API  + "/" + regionName + "/" + dateN, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedSale)
        });
        resultStatusCode = await res.status;
        if (resultStatusCode == 200){
            getSale();
            informationText = "¡Dato actualizado con éxito!";
        } else if (resultStatusCode == 400){
            const data = await res.json();
            if (data.message.includes("falte algún elemento")) {
                informationText = "No puedes dejar campos vacíos en el formulario.";
            } else if (data.message.includes("No coincide")) {
                informationText = "La región o fecha del formulario no coinciden con el recurso que intentas editar.";
            } else {
                informationText = "Error 400: Petición incorrecta.";
            }       
        } else {
            informationText = `Error inesperado: ${resultStatusCode}`;
        }
    }

    onMount(() => {
        getSale();
    });
</script>

<div class="sales-dashboard">
    <div class="dashboard-header">
        <div>
            <h1>Sale Details</h1>
            <h3 class="subtitle">{regionName} &rarr; {dateN}</h3>
        </div>
        
        <div class="header-actions">
            <Button href="/MRR" color="secondary" outline>
                &larr; Volver a la lista
            </Button>
        </div>
    </div>

    <div class="info-panel">
        {#if informationText != ""}
            <div class="info-message">
                <strong>Información:</strong> {informationText}
            </div>
        {/if}
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
                    <td><input type="text" bind:value={newRegion}></td>
                    <td><input type="text" bind:value={newDate}></td>
                    <td><input type="text" bind:value={newCategory}></td>
                    <td><input type="text" bind:value={newProduct}></td>
                    <td><input type="number" bind:value={newQuantity}></td>
                    <td><input type="number" bind:value={newPrice}></td>
                    <td><input type="number" bind:value={newTotal}></td>
                    <td><input type="text" bind:value={newPaymentMethod}></td>
                    <td class="text-center">
                        <Button color="primary" onclick={updateSale}> Actualizar </Button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<style>
    /* Contenedor Principal */
    .sales-dashboard {
        max-width: 1400px;
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

    .subtitle {
        color: #6c757d;
        margin: 5px 0 0 0;
        font-size: 1.2rem;
        font-weight: 500;
    }

    /* Panel de Información */
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

    .text-center {
        text-align: center !important;
    }
</style>
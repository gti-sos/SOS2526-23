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

<h1> Sale Details </h1>

<h3> {regionName} &rarr; {dateN} </h3>

<div style="padding: 10px; margin-top: 10px; background-color: #e7f3ff; border-left: 5px solid #2196F3;">
    {#if resultStatusCode != 0}
        <strong> Status Code of Operation: </strong> {resultStatusCode}
    {/if}

    {#if informationText != ""}
    <strong>Información:</strong> {informationText}
    {/if}
</div>

<table>
    <thead>
        <tr>
            <th> Región </th>
            <th> Fecha </th>
            <th> Categoría </th>
            <th> Producto </th>
            <th> Cantidad </th>
            <th> Precio </th>
            <th> Total </th>
            <th> Método de pago </th>
            <th>  </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input type="text" bind:value={newRegion}></td>
            <td><input type="text" bind:value={newDate}></td>
            <td><input type="text" bind:value={newCategory}></td>
            <td><input type="text" bind:value={newProduct}></td>
            <td><input type="number" bind:value={newQuantity}></td>
            <td><input type="number" bind:value={newPrice}></td>
            <td><input type="number" bind:value={newTotal}></td>
            <td><input type="text" bind:value={newPaymentMethod}></td>
            <td><Button onclick={updateSale}> Actualizar </Button></td>
        </tr>
    </tbody>
</table>




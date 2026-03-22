<script>
    import { dev } from '$app/environment';
    import { Button } from '@sveltestrap/sveltestrap';

    let API = '/api/v1/online-sales-popular-marketplaces';
    if (dev){
        API = 'http://localhost:3000' + API;
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

    async function loadInitialData() {
        informationText = "";
        const res = await fetch(API + "/loadInitialData", {
            method: "GET"
        });

        resultStatusCode = await res.status;
        if (resultStatusCode == 200){
            getSales();
            informationText = "¡Datos cargados con éxito!"
        } else if (resultStatusCode == 409){
            informationText = "¡Ya existen datos!";
        } else {
            informationText = `Error inesperado: ${resultStatusCode}`;
        }

    }

    async function getSales(){
        const res = await fetch(API, {
            method: "GET"
        });
        const data = await res.json();
        sales = data;
    }

    async function deleteAll(){
        informationText = "";
        const res = await fetch(API, {
            method: "DELETE"
        });
        resultStatusCode = await res.status;
        if (resultStatusCode == 200){
            getSales();
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
            informationText = `Error inesperado: ${resultStatusCode}`;
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
            getSales();
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
            informationText = `Error inesperado al verificar el recurso: ${resultStatusCode}`;
        }
    }

</script>

<h1> Online Sales </h1>

<Button onclick={loadInitialData}> Cargar los datos originales</Button>
<Button onclick={deleteAll}> Eliminar todos los datos </Button>

<div style="padding: 10px; margin-top: 10px; background-color: #e7f3ff; border-left: 5px solid #2196F3;">
    {#if resultStatusCode != 0}
        <strong> Status Code of Operation: </strong> {resultStatusCode}
    {/if}
    <br>
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
            <td><input type="text" bind:value={newRegion} placeholder="newRegion"></td>
            <td><input type="text" bind:value={newDate} placeholder="newDate"></td>
            <td><input type="text" bind:value={newCategory} placeholder="newCategory"></td>
            <td><input type="text" bind:value={newProduct} placeholder="newProduct"></td>
            <td><input type="number" bind:value={newQuantity}></td>
            <td><input type="number" bind:value={newPrice}></td>
            <td><input type="number" bind:value={newTotal}></td>
            <td><input type="text" bind:value={newPaymentMethod} placeholder="newPaymentMethod"></td>
            <td><Button onclick={insertSale}> Insertar </Button></td>
        </tr>

        {#each sales as sale (sale.region + sale.date)}
            <tr>
                <td> {sale.region} </td>
                <td> {sale.date} </td>
                <td> {sale.product_category} </td>
                <td> {sale.product_name} </td>
                <td> {sale.quantity_sold} </td>
                <td> {sale.unit_price} </td>
                <td> {sale.total} </td>
                <td> {sale.payment_method} </td>
                <td><Button onclick={() => deleteSale(sale.region, sale.date)}> Eliminar </Button> <Button onclick={() => goToUpdate(sale.region, sale.date)}> Actualizar </Button></td>
            </tr>
        {/each}
    </tbody>
</table>



<style>
    
</style>
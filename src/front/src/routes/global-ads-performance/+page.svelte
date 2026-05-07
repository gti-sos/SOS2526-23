<script>
    import {dev} from '$app/environment';
    import {onMount } from 'svelte';
    import { SvelteURLSearchParams } from 'svelte/reactivity';

    // Importamos los componentes de Sveltestrap que necesitamos
    import {
        Table, Button, Input, Container, Row, Col, 
        Alert, Badge, Card, CardBody, CardHeader
    } from '@sveltestrap/sveltestrap';
    
    let API = "/api/v1/global-ads-performance";

    // @ts-ignore
    let global_ad= $state([]);
    let resultStatusCode = $state(0);

    let newRegion = $state("newRegion");
    let newDate = $state("newDate");
    let newPlatform = $state("newPlatform");
    let newIndustry = $state("newIndustry");
    let newImpression = $state(0);
    let newClick = $state(0);
    let newAdSpend = $state(0);
    let newConversion = $state(0);
    let newRevenue = $state(0);

    //
    // 2. Nuevos estados reactivos para los campos de búsqueda
    let searchRegion = $state("");
    let searchPlatform = $state("");
    let searchIndustry = $state("");
    let searchFrom = $state("");
    let searchTo = $state("");

    // Campos numéricos para búsqueda avanzada
    let searchImpression = $state("");
    let searchClick = $state("");
    let searchAdSpend = $state("");
    let searchConversion = $state("");
    let searchRevenue = $state("");

    if (dev)
        API = ""+API;
    

        //FUNCION CARGAR DATOS INICIALES
    
async function loadInitialData() {
    // 1. Comprobamos si hay datos
    if (global_ad.length > 0) {
        const userWantsToContinue = confirm("Se borrará el contenido actual para cargar los datos iniciales.");
        if (!userWantsToContinue) return;

        try {
            // Borramos y esperamos a que el servidor confirme
            await fetch(API, { method: 'DELETE' });
            global_ad = []; // Vaciamos localmente para feedback visual inmediato
        } catch (e) {
            console.error("Error al limpiar:", e);
        }
    }

    // 2. Cargamos los datos iniciales
    try {
        const res = await fetch(API + "/loadInitialData", { method: 'GET' }); 
        resultStatusCode = res.status;

        if (res.ok || res.status === 201) {
            // IMPORTANTE: Esperamos a que getData actualice el estado de global_ad
            await getData(); 
            console.log("Datos cargados y tabla actualizada");
        }
    } catch (error) {
        console.error("Error de red:", error);
    }
}


        //FUNCION GET TODOS LOS DATOS
async function getData() {
    try {
        const res = await fetch(API, { method: 'GET' });
        if (res.ok) {
            const data = await res.json();
            // Esto dispara la reactividad en Svelte 5
            global_ad = data; 
        }
    } catch (e) {
        console.error("Error obteniendo datos:", e);
    }
}


        //FUNCION POST UN ELEMENTO
    async function insertAd() {
        // 1. Ocultar alerta de estado anterior para forzar la reactividad
        resultStatusCode = 0; 

        let newAd = {
            region: newRegion,
            date: newDate,
            platform: newPlatform,
            industry: newIndustry,
            impression: newImpression,
            click: newClick,
            ad_spend: newAdSpend,
            conversion: newConversion,
            revenue: newRevenue
        };

        try {
            const res = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newAd)
            });

            // 2. Asignamos el nuevo estado devuelto por el servidor
            resultStatusCode = res.status;

            // 3. Evaluamos la respuesta
            if (res.ok || res.status === 201) {
                // Éxito: recargamos la tabla para ver el nuevo dato
                await getData();
                console.log("Inserción exitosa (201).");
            } else if (res.status === 409) {
                // Conflicto: Ya existe (mismo id o claves compuestas)
                console.warn("Conflicto: El recurso ya existe (409).");
                alert("Atención: Ya existe un registro para esta Región y Fecha. (Error 409)");
            } else {
                // Otro tipo de error (400, 500, etc.)
                console.error("El servidor devolvió un código de error:", res.status);
            }

        } catch (error) {
            console.error("Fallo la petición fetch:", error);
            resultStatusCode = 500;
            alert("Error de conexión con el servidor. Revisa la consola.");
        }
    }

        //FUNCION DELETE TODO
    async function deleteAll() {
        if (!confirm("¿Estás seguro de que quieres borrar TODOS los registros?")) return;
        try {
            const res = await fetch(API, { method: 'DELETE' });
            resultStatusCode = res.status;
            if (res.ok) {
                global_ad = []; // Vaciamos la lista en el cliente
            }
        } catch (e) {
            console.error("Error al borrar todo:", e);
        }
    }

    
        //FUNCION DELETE UN ELEMENTO
    /** @param {{region: string, date: string}} ad */
    async function deleteAd(ad) {
        // CORRECCIÓN: Cambiamos los query params (?region=...) por parámetros de ruta (/.../...)
        const url = `${API}/${encodeURIComponent(ad.region)}/${encodeURIComponent(ad.date)}`;
        
        try {
            const res = await fetch(url, { method: 'DELETE' });
            resultStatusCode = res.status;

            if (res.ok) {
                // "Filtramos" el array: dejamos todos los que NO coincidan con el que borramos
                global_ad = global_ad.filter(item => 
                    !(item.region === ad.region && item.date === ad.date)
                );
            } else {
                alert("No se pudo eliminar el recurso del servidor. Status: " + res.status);
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    }

// 3. Nuevas funciones para manejar la búsqueda y limpiar los filtros (Valor Exacto)
    async function searchData() {
        // Usamos la clase que tenías definida
        const params = new SvelteURLSearchParams();

        // Campos de texto y fecha
        if (searchRegion) params.append("region", searchRegion);
        if (searchPlatform) params.append("platform", searchPlatform);
        if (searchIndustry) params.append("industry", searchIndustry);
        if (searchFrom) params.append("from", searchFrom); 
        if (searchTo) params.append("to", searchTo);       

        // Campos numéricos por valor exacto (permitiendo el 0)
        if (searchImpression !== "") params.append("impression", searchImpression);
        if (searchClick !== "") params.append("click", searchClick);
        if (searchAdSpend !== "") params.append("ad_spend", searchAdSpend);
        if (searchConversion !== "") params.append("conversion", searchConversion);
        if (searchRevenue !== "") params.append("revenue", searchRevenue);

        const queryString = params.toString();
        const url = queryString ? `${API}?${queryString}` : API;

        try {
            const res = await fetch(url, { method: 'GET' });
            resultStatusCode = res.status;
            
            if (res.ok) {
                global_ad = await res.json();
            } else {
                console.warn("No se encontraron resultados o hubo un error:", res.status);
                global_ad = [];
            }
        } catch (error) {
            console.error("Error en la búsqueda:", error);
            resultStatusCode = 500;
        }
    }

    function clearSearch() {
        // Limpiamos campos de texto y fecha
        searchRegion = "";
        searchPlatform = "";
        searchIndustry = "";
        searchFrom = "";
        searchTo = "";
        
        // Limpiamos los campos numéricos exactos
        searchImpression = "";
        searchClick = "";
        searchAdSpend = "";
        searchConversion = "";
        searchRevenue = "";
        
        getData();
    }

//------------------------------------------------------------------------------

    onMount(() => {
        getData();
    });

</script>

<svelte:head>
    <title>Global Ads List</title>
    <meta name="description" content="Gestión avanzada de métricas publicitarias en el proyecto SOS2526-23" />
</svelte:head>  

<Container class="mt-4">
    <Row class="align-items-center mb-4">
        <Col>
            <h2 class="text-primary">Global Ads Performance</h2>
            <p class="text-muted">Gestión avanzada de métricas publicitarias</p>
        </Col>
        <Col class="text-end">
            <Button color="info" outline onclick={loadInitialData}>
                🔄 Cargar Datos Iniciales
            </Button>
            <Button color="success" outline onclick={() => window.location.href = "/global-ads-performance/v2"}>
                Version 2
            </Button>
            <Button color="danger" onclick={deleteAll} disabled={global_ad.length === 0}>
                🗑️ Borrar Todo
            </Button>
        </Col>
    </Row>

<Card class="shadow-sm mb-4 border-info">
        <CardHeader class="bg-info text-white fw-bold">
            🔍 Buscar / Filtrar Recursos
        </CardHeader>
        <CardBody>
            <Row class="g-3">
                <Col md="2">
                    <Input type="text" bind:value={searchRegion} placeholder="Europe" bsSize="sm" />
                </Col>
                <Col md="2">
                    <Input type="text" bind:value={searchPlatform} placeholder="TikTok Ads" bsSize="sm" />
                </Col>
                <Col md="2">
                    <Input type="text" bind:value={searchIndustry} placeholder="Fintech" bsSize="sm" />
                </Col>
                <Col md="3">
                    <Input type="date" bind:value={searchFrom} placeholder="Desde" bsSize="sm" />
                </Col>
                <Col md="3">
                    <Input type="date" bind:value={searchTo} placeholder="Hasta" bsSize="sm" />
                </Col>

                <Col md="2">
                    <Input type="number" bind:value={searchImpression} placeholder="Impresiones" bsSize="sm" />
                </Col>
                <Col md="2">
                    <Input type="number" bind:value={searchClick} placeholder="Clicks" bsSize="sm" />
                </Col>
                <Col md="2">
                    <Input type="number" bind:value={searchAdSpend} placeholder="Gasto (€)" bsSize="sm" />
                </Col>
                <Col md="2">
                    <Input type="number" bind:value={searchConversion} placeholder="Conversiones" bsSize="sm" />
                </Col>
                <Col md="2">
                    <Input type="number" bind:value={searchRevenue} placeholder="Ingresos (€)" bsSize="sm" />
                </Col>
                
                <Col md="2" class="d-flex flex-column gap-2 justify-content-center">
                    <Button color="primary" size="sm" class="w-100" onclick={searchData}>
                        Buscar
                    </Button>
                    <Button color="secondary" size="sm" outline class="w-100" onclick={clearSearch}>
                        Limpiar
                    </Button>
                </Col>
            </Row>
        </CardBody>
    </Card>

    <Card class="shadow-sm mb-4">
        <CardBody>
            <Table hover responsive class="align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Region</th>
                        <th>Fecha</th>
                        <th>Plataforma</th>
                        <th>Industria</th>
                        <th>Impresiones</th>
                        <th>Clicks</th>
                        <th>Gasto (€)</th>
                        <th>Conv.</th>
                        <th>Ingresos (€)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <tr class="table-light">
                        <td><Input type="text" bind:value={newRegion} placeholder="Region" bsSize="sm" /></td>
                        <td><Input type="text" bind:value={newDate} placeholder="YYYY-MM-DD" bsSize="sm" /></td>
                        <td><Input type="text" bind:value={newPlatform} placeholder="Plataforma" bsSize="sm" /></td>
                        <td><Input type="text" bind:value={newIndustry} placeholder="Industria" bsSize="sm" /></td>
                        
                        <td><Input type="number" bind:value={newImpression} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newClick} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newAdSpend} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newConversion} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newRevenue} bsSize="sm" /></td>
                        <td>
                            <Button color="success" size="sm" class="w-100" onclick={insertAd}>
                                Insertar
                            </Button>
                        </td>
                    </tr>
                    {#each global_ad as ad, i (i)}
                    <tr data-testid="GlobalAd-row">
                            <td>
                                <a href="/global-ads-performance/{ad.region}/{ad.date}" class="text-decoration-none fw-bold">
                                    {ad.region}
                                </a>
                            </td>
                            <td><Badge color="light" class="text-dark">{ad.date}</Badge></td>
                            <td>{ad.platform}</td>
                            <td>{ad.industry}</td>
                            <td>{ad.impression}</td>
                            <td>{ad.click}</td>
                            <td class="text-danger">-{ad.ad_spend}</td>
                            <td>{ad.conversion}</td>
                            <td class="text-success fw-bold">+{ad.revenue}</td>
                            <td>
                                <Button color="outline-danger" size="sm" onclick={() => deleteAd(ad)}>
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="10" class="text-center py-4 text-muted">
                                No hay datos disponibles. Pulsa "Cargar Datos Iniciales".
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </Table>
        </CardBody>
    </Card>

    {#if resultStatusCode !== 0}
        <Alert color={resultStatusCode >= 200 && resultStatusCode < 300 ? 'success' : 'warning'} dismissible>
        <div class="info-message">
            <strong>Estado de la operación:</strong> {resultStatusCode} 
        </div>
        </Alert>
    {/if}
</Container>

<style>
    :global(body) {
        background-color: #f8f9fa;
    }
    :global(.table td) {
        font-size: 0.9rem;
    }
</style>

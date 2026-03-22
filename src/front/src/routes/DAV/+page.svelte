<script>
    import {dev} from '$app/environment';
    import {onMount } from 'svelte';

    // Importamos los componentes de Sveltestrap que necesitamos
    import {
        Table, Button, Input, Container, Row, Col, 
        Alert, Badge, Card, CardBody 
    } from '@sveltestrap/sveltestrap';
    
    let API = "/api/v1/global-ads-performance";

    // @ts-ignore
    let global_ad= $state([]);
    let resultStatusCode = $state(0);

    let newRegion = $state("newRegion");
    let newDate = $state("newDate");
    let newPlatform = $state("newPlatform");
    let newIndustry = $state("newIndustry");
    let newImpressions = $state(0);
    let newClicks = $state(0);
    let newAdSpend = $state(0);
    let newConversions = $state(0);
    let newRevenue = $state(0);

    if (dev)
        API = "http://localhost:3000"+API;
    

        //FUNCION CARGAR DATOS INICIALES
    
async function loadInitialData() {
        // 1. Comprobamos si ya hay datos en la tabla
        if (global_ad.length > 0) {
            const userWantsToContinue = confirm("A continuación se borrará el contenido a cambio de los datos iniciales");
            
            if (!userWantsToContinue) {
                return; 
            }

            // 2. Si acepta, primero borramos TODOS los datos del servidor para evitar el error 409 (Conflicto) al intentar cargar los iniciales.
            try {
                await fetch(API, { method: 'DELETE' });
            } catch (e) {
                console.error("Error al limpiar la base de datos:", e);
            }
        }

        // 3. Una vez limpio el backend (o si ya estaba vacío), cargamos los datos por defecto
        try {
            const res = await fetch(API + "/loadInitialData", {
                method: 'GET'
            }); 
            
            resultStatusCode = res.status;

            if (res.ok || res.status === 201) {
                // En lugar de asignar el json directo, llamamos a getData() 
                // para asegurarnos de que traemos el estado real y actualizado de la base de datos
                getData();
            } else {
                console.error("Error al cargar los datos iniciales. Status:", res.status);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    }


        //FUNCION GET TODOS LOS DATOS
    async function getData() {
        const res = await fetch(API,{
            method: 'GET'
        });
        const data = await res.json();
        global_ad = data;
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
            impressions: newImpressions,
            clicks: newClicks,
            ad_spend: newAdSpend,
            conversions: newConversions,
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
        const url = `${API}?region=${encodeURIComponent(ad.region)}&date=${encodeURIComponent(ad.date)}`;
        
        try {
            const res = await fetch(url, { method: 'DELETE' });
            resultStatusCode = res.status;

            if (res.ok) {
                // "Filtramos" el array: dejamos todos los que NO coincidan con el que borramos
                global_ad = global_ad.filter(item => 
                    !(item.region === ad.region && item.date === ad.date)
                );
            } else {
                alert("No se pudo eliminar el recurso del servidor.");
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    }

//------------------------------------------------------------------------------    


    onMount(() => {
        getData();
    });

</script>
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
            <Button color="danger" onclick={deleteAll} disabled={global_ad.length === 0}>
                🗑️ Borrar Todo
            </Button>
        </Col>
    </Row>

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
                        
                        <td><Input type="number" bind:value={newImpressions} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newClicks} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newAdSpend} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newConversions} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={newRevenue} bsSize="sm" /></td>
                        <td>
                            <Button color="success" size="sm" class="w-100" onclick={insertAd}>
                                Insertar
                            </Button>
                        </td>
                    </tr>
                    
                    {#each global_ad as ad (ad.region + ad.date)}
                        <tr>
                            <td>
                                <a href="/DAV/{ad.region}/{ad.date}" class="text-decoration-none fw-bold">
                                    {ad.region}
                                </a>
                            </td>
                            <td><Badge color="light" class="text-dark">{ad.date}</Badge></td>
                            <td>{ad.platform}</td>
                            <td>{ad.industry}</td>
                            <td>{ad.impressions}</td>
                            <td>{ad.clicks}</td>
                            <td class="text-danger">-{ad.ad_spend}</td>
                            <td>{ad.conversions}</td>
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
            <strong>Estado de la operación:</strong> {resultStatusCode} 
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
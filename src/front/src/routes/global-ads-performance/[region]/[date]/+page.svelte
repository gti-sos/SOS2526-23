<script>

    import { page } from '$app/state';
    import {dev} from '$app/environment';
    import {onMount } from 'svelte';

    // Importamos los mismos componentes de Sveltestrap que en la vista principal
    import { 
        Table, Button, Input, Container, Row, Col, 
        Alert, Badge, Card, CardBody 
    } from '@sveltestrap/sveltestrap';
    
    let region = page.params.region;
    let date = page.params.date;

    let API = "/api/v1/global-ads-performance";

    // Estado para controlar la visualización del mensaje de error 404
    let notFoundError = $state(false);

    let resultStatusCode = $state(0);
    let updatedRegion = $state("newRegion");
    let updatedDate = $state("newDate");
    let updatedPlatform = $state("newPlatform");
    let updatedIndustry = $state("newIndustry");
    let updatedImpression = $state(0);
    let updatedClick = $state(0);
    let updatedAdSpend = $state(0);
    let updatedConversion = $state(0);
    let updatedRevenue = $state(0);

    if (dev)
        API = "http://localhost:3000"+API;
    

        //FUNCION GET
    async function getData() {
        try {
            const res = await fetch(`${API}/${region}/${date}`,{
                method: 'GET'
            });

            // 1. Comprobamos si el servidor responde con un 404
            if (res.status === 404) {
                notFoundError = true;
                return; // Salimos de la función para no intentar procesar el JSON
            }

            if (!res.ok) {
                console.error("Error al obtener los datos:", res.status);
                return;
            }

            // 2. Si todo fue bien, cargamos los datos y nos aseguramos de que el error esté en false
            notFoundError = false;
            const data = await res.json();
            
            updatedRegion = data.region;
            updatedDate = data.date;
            updatedPlatform = data.platform;
            updatedIndustry = data.industry;
            updatedImpression = data.impression;
            updatedClick = data.click;
            updatedAdSpend = data.ad_spend;
            updatedConversion = data.conversion;
            updatedRevenue = data.revenue;

        } catch (err) {
            console.error("Error de red al intentar obtener el anuncio:", err);
        }
    }

        //FUNCION PUT
    async function updateAd() {
        let newAd= {
                region: updatedRegion,
                date: updatedDate,
                platform: updatedPlatform,
                industry: updatedIndustry,
                impression: updatedImpression,
                click: updatedClick,
                ad_spend: updatedAdSpend,
                conversion: updatedConversion,
                revenue: updatedRevenue
            };

        const res = await fetch(API+"/"+region+"/"+date,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(newAd)
            });

            resultStatusCode = await res.status;

            if(resultStatusCode==201)
                getData();
    }

    onMount(async () => {
        getData();
    });

</script>


<Container class="mt-4">
    <Row class="align-items-center mb-4">
        <Col>
            <h2 class="text-primary">Edición de Anuncio</h2>
            <p class="text-muted">
                Región: <Badge color="info">{region}</Badge> | 
                Fecha: <Badge color="info">{date}</Badge>
            </p>
        </Col>
        <Col class="text-end">
            <a href="/global-ads-performance" class="btn btn-outline-secondary">⬅ Volver al listado</a>
        </Col>
    </Row>

    {#if notFoundError}
        <Alert color="danger" class="shadow-sm">
            <h4 class="alert-heading">Error 404: Anuncio no encontrado</h4>
            <p>
                No existe un anuncio registrado en el sistema con región <strong>"{region}"</strong> en la fecha <strong>"{date}"</strong>.
            </p>
            <hr>
            <p class="mb-0">
                Por favor, comprueba la URL o vuelve al listado principal para seleccionar un registro válido.
            </p>
        </Alert>

    {:else}

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
                        <td><Input type="text" bind:value={updatedRegion} bsSize="sm" /></td>
                        <td><Input type="text" bind:value={updatedDate} bsSize="sm" /></td>
                        <td><Input type="text" bind:value={updatedPlatform} bsSize="sm" /></td>
                        <td><Input type="text" bind:value={updatedIndustry} bsSize="sm" /></td>
                        
                        <td><Input type="number" bind:value={updatedImpression} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={updatedClick} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={updatedAdSpend} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={updatedConversion} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={updatedRevenue} bsSize="sm" /></td>
                        
                        <td>
                            <Button color="primary" size="sm" class="w-100" onclick={updateAd}>
                                Actualizar
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </CardBody>
    </Card>

    {#if resultStatusCode !== 0}
        <Alert color={resultStatusCode >= 200 && resultStatusCode < 300 ? 'success' : 'warning'} dismissible>
            <strong>Estado de la operación:</strong> {resultStatusCode} 
            {resultStatusCode >= 200 && resultStatusCode < 300 ? '(Recurso actualizado correctamente)' : ''}
        </Alert>
    {/if}
{/if}
</Container>

<style>
    /* Estilos globales para mantener la consistencia con la página principal */
    :global(body) {
        background-color: #f8f9fa;
    }
    :global(.table td) {
    font-size: 0.9rem;
}
</style>

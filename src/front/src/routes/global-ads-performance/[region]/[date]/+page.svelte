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

    let resultStatusCode = $state(0);
    let updatedRegion = $state("newRegion");
    let updatedDate = $state("newDate");
    let updatedPlatform = $state("newPlatform");
    let updatedIndustry = $state("newIndustry");
    let updatedImpressions = $state(0);
    let updatedClicks = $state(0);
    let updatedAdSpend = $state(0);
    let updatedConversions = $state(0);
    let updatedRevenue = $state(0);

    if (dev)
        API = "http://localhost:3000"+API;
    

        //FUNCION GET
    async function getData() {
        const res = await fetch(API+"/"+region+"/"+date,{
            method: 'GET'
        });
        const data = await res.json();
        updatedRegion = data.region;
        updatedDate = data.date;
        updatedPlatform = data.platform;
        updatedIndustry = data.industry;
        updatedImpressions = data.impressions;
        updatedClicks = data.clicks;
        updatedAdSpend = data.ad_spend;
        updatedConversions = data.conversions;
        updatedRevenue = data.revenue;
    }

        //FUNCION PUT
    async function updateAd() {
        let newAd= {
                region: updatedRegion,
                date: updatedDate,
                platform: updatedPlatform,
                industry: updatedIndustry,
                impressions: updatedImpressions,
                clicks: updatedClicks,
                ad_spend: updatedAdSpend,
                conversions: updatedConversions,
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
                        
                        <td><Input type="number" bind:value={updatedImpressions} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={updatedClicks} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={updatedAdSpend} bsSize="sm" /></td>
                        <td><Input type="number" bind:value={updatedConversions} bsSize="sm" /></td>
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

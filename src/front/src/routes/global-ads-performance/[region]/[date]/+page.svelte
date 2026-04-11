<script>
    import { page } from '$app/state';
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';
    // Importamos las herramientas de tu librería de auth
    import { initAuth, getToken } from '$lib/auth.js';

    import { 
        Table, Button, Input, Container, Row, Col, 
        Alert, Badge, Card, CardBody 
    } from '@sveltestrap/sveltestrap';
    
    // Parámetros de la URL (claves primarias)
    let region = page.params.region;
    let date = page.params.date;

    let API = "/api/v1/global-ads-performance";
    if (dev) API = "http://localhost:3000" + API;

    // Estados reactivos
    let isAuthenticated = $state(false);
    let notFoundError = $state(false);
    let resultStatusCode = $state(0);

    // Variables de los campos
    let updatedRegion = $state("");
    let updatedDate = $state("");
    let updatedPlatform = $state("");
    let updatedIndustry = $state("");
    let updatedImpression = $state(0);
    let updatedClick = $state(0);
    let updatedAdSpend = $state(0);
    let updatedConversion = $state(0);
    let updatedRevenue = $state(0);

    // FUNCION GET: Carga los datos actuales del anuncio
    async function getData() {
        try {
            const res = await fetch(`${API}/${region}/${date}`);

            if (res.status === 404) {
                notFoundError = true;
                return;
            }

            if (!res.ok) {
                console.error("Error al obtener los datos:", res.status);
                return;
            }

            notFoundError = false;
            const data = await res.json();
            
            // Rellenamos los estados con los datos del servidor
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
            console.error("Error de red:", err);
        }
    }

    // FUNCION PUT: Envía los cambios al servidor
    async function updateAd() {
        // 1. Obtenemos el token para autorizar la acción
        const token = await getToken();
        
        let newAd = {
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

        try {
            const res = await fetch(`${API}/${region}/${date}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Inyectamos el token de seguridad
                }, 
                body: JSON.stringify(newAd)
            });

            resultStatusCode = res.status;

            // Si el éxito es 200 (como devuelve tu backend DAV), refrescamos
            if (res.ok) {
                getData();
            }
        } catch (error) {
            console.error("Fallo en la actualización:", error);
            resultStatusCode = 500;
        }
    }

onMount(async () => {
        // 1. IMPORTANTE: Guardamos el cliente en una variable
        const auth0 = await initAuth(); 
        
        // 2. Comprobamos la sesión usando esa variable específica
        isAuthenticated = await auth0.isAuthenticated();

        // 3. Cargamos los datos del anuncio
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
            <p>No existe un registro para <strong>"{region}"</strong> en la fecha <strong>"{date}"</strong>.</p>
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
                            <td><Input type="text" bind:value={updatedRegion} bsSize="sm" disabled /></td>
                            <td><Input type="text" bind:value={updatedDate} bsSize="sm" disabled /></td>
                            
                            <td><Input type="text" bind:value={updatedPlatform} bsSize="sm" /></td>
                            <td><Input type="text" bind:value={updatedIndustry} bsSize="sm" /></td>
                            <td><Input type="number" bind:value={updatedImpression} bsSize="sm" /></td>
                            <td><Input type="number" bind:value={updatedClick} bsSize="sm" /></td>
                            <td><Input type="number" bind:value={updatedAdSpend} bsSize="sm" /></td>
                            <td><Input type="number" bind:value={updatedConversion} bsSize="sm" /></td>
                            <td><Input type="number" bind:value={updatedRevenue} bsSize="sm" /></td>
                            
                            <td>
                                <Button color="primary" size="sm" class="w-100" onclick={updateAd} disabled={!isAuthenticated}>
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
                <strong>Estado:</strong> {resultStatusCode} 
                {#if resultStatusCode === 200}
                    (Actualizado correctamente)
                {:else if resultStatusCode === 401}
                    (Error: No autorizado. Inicia sesión)
                {/if}
            </Alert>
        {/if}
    {/if}
</Container>

<style>
    :global(body) { background-color: #f8f9fa; }
    :global(.table td) { font-size: 0.85rem; }
</style>
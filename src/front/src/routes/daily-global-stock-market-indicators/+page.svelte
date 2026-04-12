<script>
    import { onMount } from 'svelte';
    import { createAuth0Client } from '@auth0/auth0-spa-js';

    const BASE_URL = import.meta.env.VITE_API_URL || '';

    let token = $state('');
    let isLoggedIn = $state(false);
    let username = $state('');
    let password = $state('');
    let auth0 = null;

    let indicadores = $state([]);
    
    let nuevoIndicador = $state({
        date: '', index_name: '', region: '', open: '', high: '', low: '', close: '', volume: '', daily_change_percent: ''
    });

    let busqueda = $state({
        date: '', region: '', index_name: '', open: '', high: '', low: '', close: '', volume: '', daily_change_percent: '', limit: 10, offset: 0 
    });

    let mensaje = $state('');
    let esError = $state(false);

    function mostrarMensaje(texto, error = false) {
        mensaje = texto;
        esError = error;
        setTimeout(() => { mensaje = ''; }, 5000);
    }

    async function login() {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                token = data.token; 
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('isLoggedIn', 'true');
                }
                
                isLoggedIn = true;
                mostrarMensaje('¡Sesión iniciada correctamente!');
                cargarIndicadores(); 
            } else {
                mostrarMensaje('Usuario o contraseña incorrectos', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor al intentar hacer login.', true);
        }
    }

    function logout() {
        token = '';
        isLoggedIn = false;
        
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            sessionStorage.removeItem('isLoggedIn');
        }
        
        indicadores = [];
        username = '';
        password = '';
        mostrarMensaje('Has cerrado sesión correctamente.');
    }

    async function cargarIndicadores() {
        try {
            const params = new URLSearchParams();
            if (busqueda.date) params.append('date', busqueda.date);
            if (busqueda.region) params.append('region', busqueda.region);
            if (busqueda.index_name) params.append('index_name', busqueda.index_name);
            if (busqueda.open) params.append('open', busqueda.open);
            if (busqueda.high) params.append('high', busqueda.high);
            if (busqueda.low) params.append('low', busqueda.low);
            if (busqueda.close) params.append('close', busqueda.close);
            if (busqueda.volume) params.append('volume', busqueda.volume);
            if (busqueda.daily_change_percent) params.append('daily_change_percent', busqueda.daily_change_percent);
            if (busqueda.limit !== '') params.append('limit', busqueda.limit);
            if (busqueda.offset !== '') params.append('offset', busqueda.offset);

            const queryString = params.toString();
            const url = `${BASE_URL}/api/v1/daily-global-stock-market-indicators` + (queryString ? `?${queryString}` : '');

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                indicadores = await res.json();
                
                const hayFiltrosTexto = busqueda.date || busqueda.region || busqueda.index_name || 
                                        busqueda.open || busqueda.high || busqueda.low || 
                                        busqueda.close || busqueda.volume || busqueda.daily_change_percent;
                
                if (indicadores.length === 0 && hayFiltrosTexto) {
                    mostrarMensaje('No se han encontrado datos con esos filtros.', true);
                }
            } else {
                mostrarMensaje('No se pudieron cargar los datos del mercado.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    function limpiarFiltros() {
        busqueda = { date: '', region: '', index_name: '', open: '', high: '', low: '', close: '', volume: '', daily_change_percent: '', limit: 10, offset: 0 };
        cargarIndicadores();
    }
  
    async function crearIndicador() {
        const camposVacios = Object.values(nuevoIndicador).some(valor => valor === '' || valor === null);
        if (camposVacios) {
            mostrarMensaje('Error: Todos los campos son obligatorios. Por favor, rellénalos todos.', true);
            return; 
        }

        try {
            const res = await fetch(`${BASE_URL}/api/v1/daily-global-stock-market-indicators`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(nuevoIndicador)
            });

            if (res.status === 201) {
                mostrarMensaje('¡Dato del mercado añadido correctamente!');
                cargarIndicadores();
                nuevoIndicador = { date: '', index_name: '', region: '', open: '', high: '', low: '', close: '', volume: '', daily_change_percent: '' };
            } else if (res.status === 409) {
                mostrarMensaje('Error: Ya existe un registro para esa región y ese índice.', true);
            } else if (res.status === 400) {
                mostrarMensaje('Error: Faltan datos por rellenar o el formato es incorrecto.', true);
            } else {
                mostrarMensaje('Ocurrió un error inesperado al guardar. Asegúrate de tener permisos.', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    async function borrarIndicador(region, index_name) {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/daily-global-stock-market-indicators/${region}/${index_name}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` } 
            });

            if (res.status === 204 || res.status === 200) {
                mostrarMensaje('Dato eliminado con éxito.');
                cargarIndicadores(); 
            } else if (res.status === 404) {
                mostrarMensaje('Error: No se encontró el dato que intentas borrar.', true);
            } else {
                mostrarMensaje('Error al intentar borrar. ¿Tienes permisos?', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    async function borrarTodos() {
        if (!confirm('¿Estás seguro de que quieres borrar TODOS los datos?')) return;

        try {
            const res = await fetch(`${BASE_URL}/api/v1/daily-global-stock-market-indicators`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` } 
            });

            if (res.status === 204 || res.status === 200) {
                mostrarMensaje('¡Todos los datos han sido borrados de la base de datos!');
                cargarIndicadores();
            } else {
                mostrarMensaje('Error al intentar vaciar la base de datos. ¿Tienes permisos?', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    async function cargarDatosIniciales() {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/daily-global-stock-market-indicators/loadInitialData`, {
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            if (res.ok) {
                mostrarMensaje('¡Datos iniciales cargados correctamente!');
                cargarIndicadores(); 
            } else {
                mostrarMensaje('Error al cargar los datos iniciales. ¿Tienes permisos?', true);
            }
        } catch (error) {
            mostrarMensaje('Error de conexión con el servidor.', true);
        }
    }

    async function loginAuth0Google() {
        await auth0.loginWithRedirect({
            authorizationParams: { connection: 'google-oauth2' }
        });
    }

    async function loginAuth0GitHub() {
        await auth0.loginWithRedirect({
            authorizationParams: { connection: 'github' }
        });
    }

    onMount(async () => {
        if (typeof window !== 'undefined') {
            const sesionActiva = sessionStorage.getItem('isLoggedIn');
            const tokenGuardado = localStorage.getItem('token');
            if (sesionActiva === 'true' && tokenGuardado) {
                token = tokenGuardado;
                isLoggedIn = true;
                cargarIndicadores();
            }
        }

        auth0 = await createAuth0Client({
            domain: 'dev-wagdyedujxhal8aa.eu.auth0.com',
            clientId: 'PpWPyyPQJatSb1RJiCRl9njXHmXRHTIM',
            authorizationParams: {
                redirect_uri: window.location.origin + '/daily-global-stock-market-indicators'
            }
        });

        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            await auth0.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
            const authUser = await auth0.getUser();
            isLoggedIn = true;
            mostrarMensaje(`¡Bienvenido ${authUser.name} (Auth0)!`);
            cargarIndicadores();
        }
    });
</script>

<main style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    
    <h1>Indicadores Diarios del Mercado de Valores</h1>

    {#if mensaje}
        <div style="padding: 15px; margin: 20px 0; border-radius: 5px; color: white; background-color: {esError ? '#f44336' : '#4CAF50'}; font-weight: bold; text-align: center;">
            {mensaje}
        </div>
    {/if}

    {#if !isLoggedIn}
        <section style="max-width: 400px; margin: 40px auto; padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; text-align: center;">
            <h2 style="margin-top: 0;">Acceso Restringido</h2>
            <p style="color: #666; margin-bottom: 20px;">Por favor, inicia sesión para gestionar los datos.</p>
            
            <input type="text" placeholder="Usuario" bind:value={username} style="width: 90%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px;" />
            <input type="password" placeholder="Contraseña" bind:value={password} style="width: 90%; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 4px;" />
            
            <button on:click={login} style="background-color: #4CAF50; color: white; border: none; padding: 12px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; width: 95%;">
                Entrar
            </button>

            <div style="margin-top: 20px;">
                <p style="color: #666; margin-bottom: 10px;">O inicia sesión con:</p>
                <a href="{BASE_URL}/auth/github" style="display: inline-block; background-color: #333; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-right: 10px;">
                    🐙 GitHub
                </a>
                <a href="{BASE_URL}/auth/google" style="display: inline-block; background-color: #db4437; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                    🔴 Google
                </a>
            </div>

            <hr style="margin: 20px 0;">

            <div>
                <p style="color: #666; margin-bottom: 10px;">O inicia sesión con Auth0:</p>
                <button on:click={loginAuth0Google} style="display: inline-block; background-color: #4285F4; color: white; padding: 10px 20px; border-radius: 4px; font-weight: bold; border: none; cursor: pointer; margin-right: 10px;">
                    🔵 Google (Auth0)
                </button>
                <button on:click={loginAuth0GitHub} style="display: inline-block; background-color: #6e5494; color: white; padding: 10px 20px; border-radius: 4px; font-weight: bold; border: none; cursor: pointer;">
                    🟣 GitHub (Auth0)
                </button>
            </div>
        </section>
        
        <div style="text-align: center; margin-top: 20px;">
            <a href="/" style="color: #666;">&larr; Volver a la página principal</a>
        </div>
    {:else}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <a href="/">&larr; Volver a la página principal</a>
            
            <button on:click={logout} style="background-color: #607d8b; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold;">
                Cerrar Sesión
            </button>
        </div>

        <hr style="margin: 20px 0;">

        <section style="background-color: #fff9e6; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffe082;">
            <h3 style="margin-top: 0;">🔍 Buscar y Filtrar (Múltiples criterios)</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
                <input type="text" placeholder="Fecha (ej. 2024)" bind:value={busqueda.date} />
                <input type="text" placeholder="Región (ej. Europe)" bind:value={busqueda.region} />
                <input type="text" placeholder="Índice (ej. DAX)" bind:value={busqueda.index_name} />
                <input type="number" placeholder="Apertura" bind:value={busqueda.open} step="any" />
                <input type="number" placeholder="Máximo" bind:value={busqueda.high} step="any" />
                <input type="number" placeholder="Mínimo" bind:value={busqueda.low} step="any" />
                <input type="number" placeholder="Cierre" bind:value={busqueda.close} step="any" />
                <input type="number" placeholder="Volumen" bind:value={busqueda.volume} />
                <input type="number" placeholder="Cambio (%)" bind:value={busqueda.daily_change_percent} step="any" />
            </div>
            
            <h4 style="margin: 10px 0 5px 0;">Paginación</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="number" placeholder="Resultados por página" bind:value={busqueda.limit} style="width: 180px;" />
                <input type="number" placeholder="Saltar (Offset)" bind:value={busqueda.offset} style="width: 180px;" />
            </div>

            <div>
                <button style="background-color: #ff9800; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold; margin-right: 10px;" on:click={cargarIndicadores}>
                    Buscar
                </button>
                <button style="background-color: #9e9e9e; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold;" on:click={limpiarFiltros}>
                    Limpiar Filtros
                </button>
            </div>
        </section>

        <section style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cce7ff;">
            <h2>Añadir nuevo registro</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
                <input type="text" placeholder="Fecha (Ej. 2024-01-01)" bind:value={nuevoIndicador.date} />
                <input type="text" placeholder="Región" bind:value={nuevoIndicador.region} />
                <input type="text" placeholder="Nombre del Índice" bind:value={nuevoIndicador.index_name} />
                <input type="number" placeholder="Apertura" bind:value={nuevoIndicador.open} step="any" />
                <input type="number" placeholder="Máximo" bind:value={nuevoIndicador.high} step="any" />
                <input type="number" placeholder="Mínimo" bind:value={nuevoIndicador.low} step="any" />
                <input type="number" placeholder="Cierre" bind:value={nuevoIndicador.close} step="any" />
                <input type="number" placeholder="Volumen" bind:value={nuevoIndicador.volume} />
                <input type="number" placeholder="Cambio Diario (%)" bind:value={nuevoIndicador.daily_change_percent} step="any" />
            </div>
            <button style="background-color: #2196F3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold;" on:click={crearIndicador}>
                Guardar dato
            </button>
        </section>

        <div style="margin-bottom: 20px; text-align: right;">
            <button style="background-color: #28a745; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold; margin-right: 10px;" on:click={cargarDatosIniciales}>
                Cargar datos iniciales
            </button>
            <button style="background-color: #f44336; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold;" on:click={borrarTodos}>
                ¡Borrar todos los registros!
            </button>
        </div>

        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;">
                <thead>
                    <tr style="background-color: #333; color: white;">
                        <th style="padding: 12px; border: 1px solid #ccc;">Fecha</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Región</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Índice</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Apertura</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Máximo</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Mínimo</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Cierre</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Volumen</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Cambio (%)</th>
                        <th style="padding: 12px; border: 1px solid #ccc;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each indicadores as indicador}
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.date}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.region}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.index_name}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.open}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.high}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.low}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.close}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.volume}</td>
                            <td style="padding: 10px; border: 1px solid #ccc;">{indicador.daily_change_percent}</td>
                            <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">
                                <a href="/daily-global-stock-market-indicators/{indicador.region}/{indicador.index_name}" style="background-color: #2196F3; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; text-decoration: none; font-size: 13.3333px; display: inline-block; margin-right: 5px;">
                                    Editar
                                </a>
                                <button style="background-color: #ff9800; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;" on:click={() => borrarIndicador(indicador.region, indicador.index_name)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        {#if indicadores.length === 0}
            <p style="text-align: center; color: #666; margin-top: 20px; font-style: italic;">No hay datos en el sistema. ¡Añade un nuevo registro usando el formulario superior!</p>
        {/if}
    {/if}
</main>
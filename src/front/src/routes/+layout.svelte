<!--
  +layout.svelte
  Este es el layout base de toda la app. Todo lo que está aquí
  (Header, Footer, estilos) aparece en TODAS las páginas automáticamente.
  El {@render children()} es donde se mete el contenido de cada página.
-->
<script>
    import favicon from '$lib/assets/favicon.svg';
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';
    import { Styles } from '@sveltestrap/sveltestrap';

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<Styles></Styles>

<Header></Header>
<hr>
{@render children()}
<hr>
<Footer></Footer>
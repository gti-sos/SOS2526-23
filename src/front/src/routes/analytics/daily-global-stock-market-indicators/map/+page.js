// Apagamos el SSR (Server-Side Rendering o Renderizado en el Servidor).
// Con esto le decimos a SvelteKit: "Oye, no intentes procesar esta página en el servidor (Node.js). 
// Cárgala directamente en el navegador del usuario (Chrome, Safari, etc.)".
export const ssr = false;
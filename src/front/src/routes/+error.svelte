<!-- 
  +error.svelte
  
  Este archivo es el que muestra SvelteKit automáticamente cuando
  el usuario intenta entrar a una ruta que no existe (típico error 404).
  
  Por ejemplo, si alguien escribe en el navegador:
  /miapp/paginaquerealmentenoexiste → SvelteKit lo pilla y muestra esto.
  
  Lo bueno es que no hay que configurar nada extra, SvelteKit
  ya sabe que este archivo es el de errores por el nombre "+error".
  El "+" delante significa que es un archivo especial del framework.
-->

<h1>This page does not exist</h1>

<!-- 
  Aquí solo hay un h1 con el mensaje de error, bastante básico la verdad.
  En un proyecto más currado se podría poner el código de error real
  (404, 500...) usando la variable $page.status que da SvelteKit,
  pero para lo que necesitábamos en el proyecto nos valía con esto.
-->
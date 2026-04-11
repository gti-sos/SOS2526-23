import { j as attr, k as ensure_array_like, l as escape_html, m as stringify } from './index2-gV84oFCP.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let indicadores = [];
    let nuevoIndicador = {
      date: "",
      index_name: "",
      region: "",
      open: "",
      high: "",
      low: "",
      close: "",
      volume: "",
      daily_change_percent: ""
    };
    let busqueda = {
      date: "",
      region: "",
      index_name: "",
      open: "",
      high: "",
      low: "",
      close: "",
      volume: "",
      daily_change_percent: "",
      limit: 10,
      // Por defecto 10
      offset: 0
      // Por defecto 0
    };
    $$renderer2.push(`<main style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;"><h1>Indicadores Diarios del Mercado de Valores</h1> <a href="/">← Volver a la página principal</a> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <hr style="margin: 20px 0;"/> <section style="background-color: #fff9e6; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffe082;"><h3 style="margin-top: 0;">🔍 Buscar y Filtrar (Múltiples criterios)</h3> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;"><input type="text" placeholder="Fecha (ej. 2024)"${attr("value", busqueda.date)}/> <input type="text" placeholder="Región (ej. Europe)"${attr("value", busqueda.region)}/> <input type="text" placeholder="Índice (ej. DAX)"${attr("value", busqueda.index_name)}/> <input type="number" placeholder="Apertura"${attr("value", busqueda.open)} step="any"/> <input type="number" placeholder="Máximo"${attr("value", busqueda.high)} step="any"/> <input type="number" placeholder="Mínimo"${attr("value", busqueda.low)} step="any"/> <input type="number" placeholder="Cierre"${attr("value", busqueda.close)} step="any"/> <input type="number" placeholder="Volumen"${attr("value", busqueda.volume)}/> <input type="number" placeholder="Cambio (%)"${attr("value", busqueda.daily_change_percent)} step="any"/></div> <h4 style="margin: 10px 0 5px 0;">Paginación</h4> <div style="display: flex; gap: 10px; margin-bottom: 15px;"><input type="number" placeholder="Resultados por página"${attr("value", busqueda.limit)} style="width: 180px;"/> <input type="number" placeholder="Saltar (Offset)"${attr("value", busqueda.offset)} style="width: 180px;"/></div> <div><button style="background-color: #ff9800; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold; margin-right: 10px;">Buscar</button> <button style="background-color: #9e9e9e; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; font-weight: bold;">Limpiar Filtros</button></div></section> <section style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cce7ff;"><h2>Añadir nuevo registro</h2> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;"><input type="text" placeholder="Fecha (Ej. 2024-01-01)"${attr("value", nuevoIndicador.date)}/> <input type="text" placeholder="Región"${attr("value", nuevoIndicador.region)}/> <input type="text" placeholder="Nombre del Índice"${attr("value", nuevoIndicador.index_name)}/> <input type="number" placeholder="Apertura"${attr("value", nuevoIndicador.open)} step="any"/> <input type="number" placeholder="Máximo"${attr("value", nuevoIndicador.high)} step="any"/> <input type="number" placeholder="Mínimo"${attr("value", nuevoIndicador.low)} step="any"/> <input type="number" placeholder="Cierre"${attr("value", nuevoIndicador.close)} step="any"/> <input type="number" placeholder="Volumen"${attr("value", nuevoIndicador.volume)}/> <input type="number" placeholder="Cambio Diario (%)"${attr("value", nuevoIndicador.daily_change_percent)} step="any"/></div> <button style="background-color: #2196F3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold;">Guardar dato</button></section> <div style="margin-bottom: 20px; text-align: right;"><button style="background-color: #28a745; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold; margin-right: 10px;">Cargar datos iniciales</button> <button style="background-color: #f44336; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold;">¡Borrar todos los registros!</button></div> <div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;"><thead><tr style="background-color: #333; color: white;"><th style="padding: 12px; border: 1px solid #ccc;">Fecha</th><th style="padding: 12px; border: 1px solid #ccc;">Región</th><th style="padding: 12px; border: 1px solid #ccc;">Índice</th><th style="padding: 12px; border: 1px solid #ccc;">Apertura</th><th style="padding: 12px; border: 1px solid #ccc;">Máximo</th><th style="padding: 12px; border: 1px solid #ccc;">Mínimo</th><th style="padding: 12px; border: 1px solid #ccc;">Cierre</th><th style="padding: 12px; border: 1px solid #ccc;">Volumen</th><th style="padding: 12px; border: 1px solid #ccc;">Cambio (%)</th><th style="padding: 12px; border: 1px solid #ccc;">Acciones</th></tr></thead><tbody><!--[-->`);
    const each_array = ensure_array_like(indicadores);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let indicador = each_array[$$index];
      $$renderer2.push(`<tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.date)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.region)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.index_name)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.open)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.high)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.low)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.close)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.volume)}</td><td style="padding: 10px; border: 1px solid #ccc;">${escape_html(indicador.daily_change_percent)}</td><td style="padding: 10px; border: 1px solid #ccc; text-align: center;"><a${attr("href", `/daily-global-stock-market-indicators/${stringify(indicador.region)}/${stringify(indicador.index_name)}`)} style="background-color: #2196F3; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; text-decoration: none; font-size: 13.3333px; display: inline-block; margin-right: 5px;">Editar</a> <button style="background-color: #ff9800; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px;">Eliminar</button></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div> `);
    if (indicadores.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p style="text-align: center; color: #666; margin-top: 20px; font-style: italic;">No hay datos en el sistema. ¡Añade un nuevo registro usando el formulario superior!</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></main>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BkO8ra3x.js.map

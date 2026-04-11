import { n as store_get, j as attr, o as unsubscribe_stores, p as getContext } from './index2-gV84oFCP.js';
import './root-BXUemFiW.js';
import './state.svelte-ZeFaOGP8.js';

const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let region = store_get($$store_subs ??= {}, "$page", page).params.region;
    let index_name = store_get($$store_subs ??= {}, "$page", page).params.index_name;
    let indicador = {
      date: "",
      index_name,
      region,
      open: "",
      high: "",
      low: "",
      close: "",
      volume: "",
      daily_change_percent: ""
    };
    $$renderer2.push(`<main style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;"><h1>Editar Indicador</h1> <a href="/daily-global-stock-market-indicators" style="color: #2196F3; text-decoration: none; font-weight: bold;">← Volver a la tabla</a> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <section style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #cce7ff;"><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;"><div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Región (No editable)</label> <input type="text"${attr("value", indicador.region)} readonly="" style="width: 100%; padding: 8px; background-color: #e9ecef; border: 1px solid #ccc;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Índice (No editable)</label> <input type="text"${attr("value", indicador.index_name)} readonly="" style="width: 100%; padding: 8px; background-color: #e9ecef; border: 1px solid #ccc;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Fecha</label> <input type="text"${attr("value", indicador.date)} style="width: 100%; padding: 8px;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Apertura</label> <input type="number"${attr("value", indicador.open)} step="any" style="width: 100%; padding: 8px;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Máximo</label> <input type="number"${attr("value", indicador.high)} step="any" style="width: 100%; padding: 8px;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Mínimo</label> <input type="number"${attr("value", indicador.low)} step="any" style="width: 100%; padding: 8px;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Cierre</label> <input type="number"${attr("value", indicador.close)} step="any" style="width: 100%; padding: 8px;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Volumen</label> <input type="number"${attr("value", indicador.volume)} style="width: 100%; padding: 8px;"/></div> <div><label style="display: block; font-weight: bold; margin-bottom: 5px;">Cambio Diario (%)</label> <input type="number"${attr("value", indicador.daily_change_percent)} step="any" style="width: 100%; padding: 8px;"/></div></div> <button style="background-color: #4CAF50; color: white; border: none; padding: 12px 24px; cursor: pointer; border-radius: 4px; font-weight: bold; width: 100%;">Guardar Cambios</button></section></main>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B8wjULXR.js.map

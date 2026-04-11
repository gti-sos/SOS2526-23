import { h as head, l as escape_html, j as attr } from './index2-gV84oFCP.js';
import { p as page, g as goto } from './index3-CD0TcZDl.js';
import { B as Button } from './Button-CcYsdgdF.js';
import './Theme.svelte_svelte_type_style_lang-DNOdIBoT.js';
import './state.svelte-ZeFaOGP8.js';
import './root-BXUemFiW.js';
import './index-CLVmnW1j.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let regionName = page.params.region;
    let dateN = page.params.date;
    let API = "/api/v1/online-sales-popular-marketplaces";
    let resultStatusCode = 0;
    let informationText = "";
    let newRegion = "newRegion";
    let newDate = "newDate";
    let newCategory = "newCategory";
    let newProduct = "newProduct";
    let newQuantity = 0;
    let newPrice = 0;
    let newTotal = 0;
    let newPaymentMethod = "newPaymentMethod";
    async function getSale() {
      const res = await fetch(API + "/" + regionName + "/" + dateN, { method: "GET" });
      if (res.status === 404) {
        sessionStorage.setItem("mensajeError", `No existe el registro de ${regionName} en ${dateN}, créalo.`);
        goto();
        return;
      }
      if (res.status === 200) {
        const sale = await res.json();
        newRegion = sale.region;
        newDate = sale.date;
        newCategory = sale.product_category;
        newProduct = sale.product_name;
        newQuantity = sale.quantity_sold;
        newPrice = sale.unit_price;
        newTotal = sale.total;
        newPaymentMethod = sale.payment_method;
      }
    }
    async function updateSale() {
      informationText = "";
      let updatedSale = {
        region: newRegion,
        date: newDate,
        product_category: newCategory,
        product_name: newProduct,
        quantity_sold: newQuantity,
        unit_price: newPrice,
        total: newTotal,
        payment_method: newPaymentMethod
      };
      const res = await fetch(API + "/" + regionName + "/" + dateN, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSale)
      });
      resultStatusCode = await res.status;
      if (resultStatusCode == 200) {
        getSale();
        informationText = "¡Dato actualizado con éxito!";
      } else if (resultStatusCode == 400) {
        const data = await res.json();
        if (data.message.includes("falte algún elemento")) {
          informationText = "No puedes dejar campos vacíos en el formulario.";
        } else if (data.message.includes("No coincide")) {
          informationText = "La región o fecha del formulario no coinciden con el recurso que intentas editar.";
        } else {
          informationText = "Error 400: Petición incorrecta.";
        }
      } else {
        informationText = `Error inesperado`;
      }
    }
    head("q32nee", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Online Sale update</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Actualización de la venta online en el proyecto SOS2526-23"/>`);
    });
    $$renderer2.push(`<div class="sales-dashboard svelte-q32nee"><div class="dashboard-header svelte-q32nee"><div><h1 class="svelte-q32nee">Sale Details</h1> <h3 class="subtitle svelte-q32nee">${escape_html(regionName)} → ${escape_html(dateN)}</h3></div> <div class="header-actions">`);
    Button($$renderer2, {
      href: "/MRR",
      color: "secondary",
      outline: true,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->← Volver a la lista`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div> `);
    if (informationText != "") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="info-panel svelte-q32nee"><div class="info-message svelte-q32nee"><strong>Información:</strong> ${escape_html(informationText)}</div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="table-container svelte-q32nee"><table class="data-table svelte-q32nee"><thead class="svelte-q32nee"><tr><th class="svelte-q32nee">Región</th><th class="svelte-q32nee">Fecha</th><th class="svelte-q32nee">Categoría</th><th class="svelte-q32nee">Producto</th><th class="svelte-q32nee">Cantidad</th><th class="svelte-q32nee">Precio</th><th class="svelte-q32nee">Total</th><th class="svelte-q32nee">Método de pago</th><th class="text-center svelte-q32nee">Acciones</th></tr></thead><tbody><tr class="input-row svelte-q32nee"><td class="svelte-q32nee"><input type="text"${attr("value", newRegion)} class="svelte-q32nee"/></td><td class="svelte-q32nee"><input type="text"${attr("value", newDate)} class="svelte-q32nee"/></td><td class="svelte-q32nee"><input type="text"${attr("value", newCategory)} class="svelte-q32nee"/></td><td class="svelte-q32nee"><input type="text"${attr("value", newProduct)} class="svelte-q32nee"/></td><td class="svelte-q32nee"><input type="number"${attr("value", newQuantity)} class="svelte-q32nee"/></td><td class="svelte-q32nee"><input type="number"${attr("value", newPrice)} class="svelte-q32nee"/></td><td class="svelte-q32nee"><input type="number"${attr("value", newTotal)} class="svelte-q32nee"/></td><td class="svelte-q32nee"><input type="text"${attr("value", newPaymentMethod)} class="svelte-q32nee"/></td><td class="text-center svelte-q32nee">`);
    Button($$renderer2, {
      color: "primary",
      onclick: updateSale,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Actualizar`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></td></tr></tbody></table></div></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DWk3EE9c.js.map

import { h as head, j as attr, k as ensure_array_like, l as escape_html } from './index2-gV84oFCP.js';
import { B as Button } from './Button-CcYsdgdF.js';
import './Theme.svelte_svelte_type_style_lang-DNOdIBoT.js';
import { S as SvelteURLSearchParams } from './index-server-BDljRv6H.js';
import './index-CLVmnW1j.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let API = "/api/v1/online-sales-popular-marketplaces";
    let sales = [];
    let resultStatusCode = 0;
    let informationText = "";
    let newRegion = "";
    let newDate = "";
    let newCategory = "";
    let newProduct = "";
    let newQuantity = 0;
    let newPrice = 0;
    let newTotal = 0;
    let newPaymentMethod = "";
    let searchRegion = "";
    let searchDateFrom = "";
    let searchDateTo = "";
    let searchCategory = "";
    let searchProduct = "";
    let searchMinQuantity = "";
    let searchMaxQuantity = "";
    let searchMinPrice = "";
    let searchMaxPrice = "";
    let searchMinTotal = "";
    let searchMaxTotal = "";
    let searchPayment = "";
    let searchLimit = "";
    let searchOffset = "";
    async function loadInitialData() {
      await deleteAll();
      informationText = "";
      const res = await fetch(API + "/loadInitialData", { method: "GET" });
      resultStatusCode = await res.status;
      if (resultStatusCode == 200) {
        await getSales();
        informationText = "¡Datos cargados con éxito!";
      } else if (resultStatusCode == 409) {
        informationText = "¡Ya existen datos!";
      } else {
        informationText = `Error inesperado`;
      }
    }
    async function getSales(esBusqueda = false) {
      let queryParams = new SvelteURLSearchParams();
      if (searchRegion) queryParams.append("region", searchRegion);
      if (searchDateFrom) queryParams.append("from", searchDateFrom);
      if (searchDateTo) queryParams.append("to", searchDateTo);
      if (searchCategory) queryParams.append("product_category", searchCategory);
      if (searchProduct) queryParams.append("product_name", searchProduct);
      if (searchMinQuantity) queryParams.append("min_quantity_sold", searchMinQuantity);
      if (searchMaxQuantity) queryParams.append("max_quantity_sold", searchMaxQuantity);
      if (searchMinPrice) queryParams.append("min_unit_price", searchMinPrice);
      if (searchMaxPrice) queryParams.append("max_unit_price", searchMaxPrice);
      if (searchMinTotal) queryParams.append("min_total", searchMinTotal);
      if (searchMaxTotal) queryParams.append("max_total", searchMaxTotal);
      if (searchPayment) queryParams.append("payment_method", searchPayment);
      if (searchLimit) queryParams.append("limit", searchLimit);
      if (searchOffset) queryParams.append("offset", searchOffset);
      const queryString = queryParams.toString();
      const url = API + (queryString ? `?${queryString}` : "");
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        sales = await res.json();
        if (esBusqueda) {
          informationText = `Búsqueda completada. Se encontraron ${sales.length} resultados.`;
        }
      } else {
        informationText = "Error al realizar la búsqueda.";
      }
    }
    async function deleteAll() {
      informationText = "";
      const res = await fetch(API, { method: "DELETE" });
      resultStatusCode = await res.status;
      if (resultStatusCode == 200) {
        await getSales();
        informationText = "Datos eliminados.";
      }
    }
    async function insertSale() {
      informationText = "";
      let missingFields = [];
      missingFields.push("Región");
      missingFields.push("Fecha");
      missingFields.push("Categoría");
      missingFields.push("Producto");
      missingFields.push("Cantidad");
      missingFields.push("Precio");
      missingFields.push("Total");
      missingFields.push("Método de pago");
      let newSale = {
        region: newRegion,
        date: newDate,
        product_category: newCategory,
        product_name: newProduct,
        quantity_sold: newQuantity,
        unit_price: newPrice,
        total: newTotal,
        payment_method: newPaymentMethod
      };
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSale)
      });
      resultStatusCode = await res.status;
      if (resultStatusCode == 201) {
        getSales();
        informationText = `Dato creado con ${newRegion} y ${newDate}.`;
      } else if (resultStatusCode == 409) {
        informationText = "Ya existe un dato con esa misma región y fecha al que se quiere añadir.";
      } else if (resultStatusCode == 400) {
        informationText = `Faltan los siguientes campos por rellenar: ${missingFields.join(", ")}.`;
      } else {
        informationText = `Error inesperado`;
      }
    }
    async function deleteSale(regionName, dateN) {
      informationText = "";
      const res = await fetch(API + "/" + regionName + "/" + dateN, { method: "DELETE" });
      resultStatusCode = await res.status;
      if (resultStatusCode == 200) {
        await getSales();
        informationText = `El dato con ${regionName} y ${dateN} como region y fecha, respectivamente, ha sido eliminado.`;
      }
    }
    async function goToUpdate(regionName, dateN) {
      informationText = "";
      const res = await fetch(API + "/" + regionName + "/" + dateN, { method: "GET" });
      resultStatusCode = await res.status;
      if (resultStatusCode == 200) {
        window.location.href = `MRR/${regionName}/${dateN}`;
      } else if (resultStatusCode === 404) {
        informationText = `Error: No se puede actualizar porque el registro de ${regionName} en ${dateN} no existe.`;
      } else {
        informationText = `Error inesperado al verificar el recurso`;
      }
    }
    function clearSearch() {
      searchRegion = "";
      searchDateFrom = "";
      searchDateTo = "";
      searchCategory = "";
      searchProduct = "";
      searchMinQuantity = "";
      searchMaxQuantity = "";
      searchMinPrice = "";
      searchMaxPrice = "";
      searchMinTotal = "";
      searchMaxTotal = "";
      searchPayment = "";
      searchLimit = "";
      searchOffset = "";
      getSales();
    }
    head("1nvlpko", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Online Sales List</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Ventas online en marcas populares en el proyecto SOS2526-23"/>`);
    });
    $$renderer2.push(`<div class="sales-dashboard svelte-1nvlpko"><div class="dashboard-header svelte-1nvlpko"><h1 class="svelte-1nvlpko">Online Sales</h1> <div class="main-actions svelte-1nvlpko">`);
    Button($$renderer2, {
      color: "primary",
      onclick: loadInitialData,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Cargar los datos originales`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      color: "danger",
      onclick: deleteAll,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Eliminar todos los datos`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div> `);
    if (informationText != "") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="info-panel svelte-1nvlpko"><div class="info-message svelte-1nvlpko"><strong>Información:</strong> ${escape_html(informationText)}</div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="search-panel svelte-1nvlpko"><h4 class="svelte-1nvlpko">Filtros de Búsqueda</h4> <div class="search-grid svelte-1nvlpko"><input type="text" placeholder="Región"${attr("value", searchRegion)} class="svelte-1nvlpko"/> <div><small class="svelte-1nvlpko">Fecha Desde</small><input type="date"${attr("value", searchDateFrom)} class="svelte-1nvlpko"/></div> <div><small class="svelte-1nvlpko">Fecha Hasta</small><input type="date"${attr("value", searchDateTo)} class="svelte-1nvlpko"/></div> <input type="text" placeholder="Categoría"${attr("value", searchCategory)} class="svelte-1nvlpko"/> <input type="text" placeholder="Producto"${attr("value", searchProduct)} class="svelte-1nvlpko"/> <input type="number" placeholder="Cant. Mínima"${attr("value", searchMinQuantity)} class="svelte-1nvlpko"/> <input type="number" placeholder="Cant. Máxima"${attr("value", searchMaxQuantity)} class="svelte-1nvlpko"/> <input type="number" placeholder="Precio Mín."${attr("value", searchMinPrice)} class="svelte-1nvlpko"/> <input type="number" placeholder="Precio Máx."${attr("value", searchMaxPrice)} class="svelte-1nvlpko"/> <input type="number" placeholder="Total Mín."${attr("value", searchMinTotal)} class="svelte-1nvlpko"/> <input type="number" placeholder="Total Máx."${attr("value", searchMaxTotal)} class="svelte-1nvlpko"/> <input type="text" placeholder="Método de Pago"${attr("value", searchPayment)} class="svelte-1nvlpko"/> <input type="number" placeholder="Límite (Paginación)"${attr("value", searchLimit)} class="svelte-1nvlpko"/> <input type="number" placeholder="Offset (Paginación)"${attr("value", searchOffset)} class="svelte-1nvlpko"/></div> <div class="search-actions svelte-1nvlpko">`);
    Button($$renderer2, {
      color: "primary",
      onclick: () => getSales(true),
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Buscar`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      color: "secondary",
      outline: true,
      onclick: clearSearch,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Limpiar Filtros`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div> <div class="table-container svelte-1nvlpko"><table class="data-table svelte-1nvlpko"><thead class="svelte-1nvlpko"><tr><th class="svelte-1nvlpko">Región</th><th class="svelte-1nvlpko">Fecha</th><th class="svelte-1nvlpko">Categoría</th><th class="svelte-1nvlpko">Producto</th><th class="svelte-1nvlpko">Cantidad</th><th class="svelte-1nvlpko">Precio</th><th class="svelte-1nvlpko">Total</th><th class="svelte-1nvlpko">Método de pago</th><th class="text-center svelte-1nvlpko">Acciones</th></tr></thead><tbody><tr class="input-row svelte-1nvlpko"><td class="svelte-1nvlpko"><input type="text"${attr("value", newRegion)} placeholder="newRegion" class="svelte-1nvlpko"/></td><td class="svelte-1nvlpko"><input type="text"${attr("value", newDate)} placeholder="newDate" class="svelte-1nvlpko"/></td><td class="svelte-1nvlpko"><input type="text"${attr("value", newCategory)} placeholder="newCategory" class="svelte-1nvlpko"/></td><td class="svelte-1nvlpko"><input type="text"${attr("value", newProduct)} placeholder="newProduct" class="svelte-1nvlpko"/></td><td class="svelte-1nvlpko"><input type="number"${attr("value", newQuantity)} class="svelte-1nvlpko"/></td><td class="svelte-1nvlpko"><input type="number"${attr("value", newPrice)} class="svelte-1nvlpko"/></td><td class="svelte-1nvlpko"><input type="number"${attr("value", newTotal)} class="svelte-1nvlpko"/></td><td class="svelte-1nvlpko"><input type="text"${attr("value", newPaymentMethod)} placeholder="newPaymentMethod" class="svelte-1nvlpko"/></td><td class="text-center svelte-1nvlpko">`);
    Button($$renderer2, {
      color: "success",
      size: "sm",
      onclick: insertSale,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Insertar`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></td></tr><!--[-->`);
    const each_array = ensure_array_like(sales);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let sale = each_array[$$index];
      $$renderer2.push(`<tr class="data-row svelte-1nvlpko"><td class="svelte-1nvlpko">${escape_html(sale.region)}</td><td class="svelte-1nvlpko">${escape_html(sale.date)}</td><td class="svelte-1nvlpko">${escape_html(sale.product_category)}</td><td class="svelte-1nvlpko">${escape_html(sale.product_name)}</td><td class="svelte-1nvlpko">${escape_html(sale.quantity_sold)}</td><td class="svelte-1nvlpko">$${escape_html(sale.unit_price)}</td><td class="total-cell svelte-1nvlpko">$${escape_html(sale.total)}</td><td class="svelte-1nvlpko">${escape_html(sale.payment_method)}</td><td class="action-buttons svelte-1nvlpko">`);
      Button($$renderer2, {
        color: "danger",
        outline: true,
        size: "sm",
        onclick: () => deleteSale(sale.region, sale.date),
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Eliminar`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Button($$renderer2, {
        color: "info",
        outline: true,
        size: "sm",
        onclick: () => goToUpdate(sale.region, sale.date),
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Actualizar`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Ba8ClXiO.js.map

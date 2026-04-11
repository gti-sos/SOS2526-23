import { h as head, q as sanitize_props, r as rest_props, f as fallback, t as attributes, w as clsx, x as slot, c as bind_props, k as ensure_array_like, j as attr, m as stringify, l as escape_html } from './index2-gV84oFCP.js';
import { S as SvelteURLSearchParams } from './index-server-BDljRv6H.js';
import { C as Container, R as Row, a as Card, b as Col, c as CardBody, I as Input, T as Table, B as Badge, A as Alert } from './Table-Dct0oCl_.js';
import { B as Button, c as classnames } from './Button-CcYsdgdF.js';
import './Theme.svelte_svelte_type_style_lang-DNOdIBoT.js';
import './index-CLVmnW1j.js';

function CardHeader($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class", "tag"]);
  $$renderer.component(($$renderer2) => {
    let classes;
    let className = fallback($$props["class"], "");
    let tag = fallback($$props["tag"], "div");
    classes = classnames(className, "card-header");
    if (tag === "h3") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<h3${attributes({ ...$$restProps, class: clsx(classes) })}><!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]--></h3>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div${attributes({ ...$$restProps, class: clsx(classes) })}><!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { class: className, tag });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let API = "/api/v1/global-ads-performance";
    let global_ad = [];
    let resultStatusCode = 0;
    let newRegion = "newRegion";
    let newDate = "newDate";
    let newPlatform = "newPlatform";
    let newIndustry = "newIndustry";
    let newImpression = 0;
    let newClick = 0;
    let newAdSpend = 0;
    let newConversion = 0;
    let newRevenue = 0;
    let searchRegion = "";
    let searchPlatform = "";
    let searchIndustry = "";
    let searchFrom = "";
    let searchTo = "";
    async function loadInitialData() {
      if (global_ad.length > 0) {
        const userWantsToContinue = confirm("A continuación se borrará el contenido a cambio de los datos iniciales");
        if (!userWantsToContinue) {
          return;
        }
        try {
          await fetch(API, { method: "DELETE" });
        } catch (e) {
          console.error("Error al limpiar la base de datos:", e);
        }
      }
      try {
        const res = await fetch(API + "/loadInitialData", { method: "GET" });
        resultStatusCode = res.status;
        if (res.ok || res.status === 201) {
          getData();
        } else {
          console.error("Error al cargar los datos iniciales. Status:", res.status);
        }
      } catch (error) {
        console.error("Error de red:", error);
      }
    }
    async function getData() {
      const res = await fetch(API, { method: "GET" });
      const data = await res.json();
      global_ad = data;
    }
    async function insertAd() {
      resultStatusCode = 0;
      let newAd = {
        region: newRegion,
        date: newDate,
        platform: newPlatform,
        industry: newIndustry,
        impression: newImpression,
        click: newClick,
        ad_spend: newAdSpend,
        conversion: newConversion,
        revenue: newRevenue
      };
      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAd)
        });
        resultStatusCode = res.status;
        if (res.ok || res.status === 201) {
          await getData();
          console.log("Inserción exitosa (201).");
        } else if (res.status === 409) {
          console.warn("Conflicto: El recurso ya existe (409).");
          alert("Atención: Ya existe un registro para esta Región y Fecha. (Error 409)");
        } else {
          console.error("El servidor devolvió un código de error:", res.status);
        }
      } catch (error) {
        console.error("Fallo la petición fetch:", error);
        resultStatusCode = 500;
        alert("Error de conexión con el servidor. Revisa la consola.");
      }
    }
    async function deleteAll() {
      if (!confirm("¿Estás seguro de que quieres borrar TODOS los registros?")) return;
      try {
        const res = await fetch(API, { method: "DELETE" });
        resultStatusCode = res.status;
        if (res.ok) {
          global_ad = [];
        }
      } catch (e) {
        console.error("Error al borrar todo:", e);
      }
    }
    async function deleteAd(ad) {
      const url = `${API}/${encodeURIComponent(ad.region)}/${encodeURIComponent(ad.date)}`;
      try {
        const res = await fetch(url, { method: "DELETE" });
        resultStatusCode = res.status;
        if (res.ok) {
          global_ad = global_ad.filter((item) => !(item.region === ad.region && item.date === ad.date));
        } else {
          alert("No se pudo eliminar el recurso del servidor. Status: " + res.status);
        }
      } catch (error) {
        console.error("Error de red:", error);
      }
    }
    async function searchData() {
      const params = new SvelteURLSearchParams();
      if (searchRegion) params.append("region", searchRegion);
      if (searchPlatform) params.append("platform", searchPlatform);
      if (searchIndustry) params.append("industry", searchIndustry);
      if (searchFrom) params.append("from", searchFrom);
      if (searchTo) params.append("to", searchTo);
      const queryString = params.toString();
      const url = queryString ? `${API}?${queryString}` : API;
      try {
        const res = await fetch(url, { method: "GET" });
        resultStatusCode = res.status;
        if (res.ok) {
          global_ad = await res.json();
        } else {
          console.warn("No se encontraron resultados o hubo un error:", res.status);
          global_ad = [];
        }
      } catch (error) {
        console.error("Error en la búsqueda:", error);
        resultStatusCode = 500;
      }
    }
    function clearSearch() {
      searchRegion = "";
      searchPlatform = "";
      searchIndustry = "";
      searchFrom = "";
      searchTo = "";
      getData();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("10r15io", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Global Ads List</title>`);
        });
        $$renderer4.push(`<meta name="description" content="Gestión avanzada de métricas publicitarias en el proyecto SOS2526-23"/>`);
      });
      Container($$renderer3, {
        class: "mt-4",
        children: ($$renderer4) => {
          Row($$renderer4, {
            class: "align-items-center mb-4",
            children: ($$renderer5) => {
              Col($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(`<h2 class="text-primary">Global Ads Performance</h2> <p class="text-muted">Gestión avanzada de métricas publicitarias</p>`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> `);
              Col($$renderer5, {
                class: "text-end",
                children: ($$renderer6) => {
                  Button($$renderer6, {
                    color: "info",
                    outline: true,
                    onclick: loadInitialData,
                    children: ($$renderer7) => {
                      $$renderer7.push(`<!---->🔄 Cargar Datos Iniciales`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer6.push(`<!----> `);
                  Button($$renderer6, {
                    color: "danger",
                    onclick: deleteAll,
                    disabled: global_ad.length === 0,
                    children: ($$renderer7) => {
                      $$renderer7.push(`<!---->🗑️ Borrar Todo`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer6.push(`<!---->`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Card($$renderer4, {
            class: "shadow-sm mb-4 border-info",
            children: ($$renderer5) => {
              CardHeader($$renderer5, {
                class: "bg-info text-white fw-bold",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->🔍 Buscar / Filtrar Recursos`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> `);
              CardBody($$renderer5, {
                children: ($$renderer6) => {
                  Row($$renderer6, {
                    class: "g-3",
                    children: ($$renderer7) => {
                      Col($$renderer7, {
                        md: "2",
                        children: ($$renderer8) => {
                          Input($$renderer8, {
                            type: "text",
                            placeholder: "Región (Ej: Europe)",
                            bsSize: "sm",
                            get value() {
                              return searchRegion;
                            },
                            set value($$value) {
                              searchRegion = $$value;
                              $$settled = false;
                            }
                          });
                        },
                        $$slots: { default: true }
                      });
                      $$renderer7.push(`<!----> `);
                      Col($$renderer7, {
                        md: "2",
                        children: ($$renderer8) => {
                          Input($$renderer8, {
                            type: "text",
                            placeholder: "Plataforma (Ej: Google)",
                            bsSize: "sm",
                            get value() {
                              return searchPlatform;
                            },
                            set value($$value) {
                              searchPlatform = $$value;
                              $$settled = false;
                            }
                          });
                        },
                        $$slots: { default: true }
                      });
                      $$renderer7.push(`<!----> `);
                      Col($$renderer7, {
                        md: "2",
                        children: ($$renderer8) => {
                          Input($$renderer8, {
                            type: "text",
                            placeholder: "Industria",
                            bsSize: "sm",
                            get value() {
                              return searchIndustry;
                            },
                            set value($$value) {
                              searchIndustry = $$value;
                              $$settled = false;
                            }
                          });
                        },
                        $$slots: { default: true }
                      });
                      $$renderer7.push(`<!----> `);
                      Col($$renderer7, {
                        md: "2",
                        children: ($$renderer8) => {
                          Input($$renderer8, {
                            type: "number",
                            placeholder: "Desde año (Ej: 2000)",
                            bsSize: "sm",
                            get value() {
                              return searchFrom;
                            },
                            set value($$value) {
                              searchFrom = $$value;
                              $$settled = false;
                            }
                          });
                        },
                        $$slots: { default: true }
                      });
                      $$renderer7.push(`<!----> `);
                      Col($$renderer7, {
                        md: "2",
                        children: ($$renderer8) => {
                          Input($$renderer8, {
                            type: "number",
                            placeholder: "Hasta año (Ej: 2017)",
                            bsSize: "sm",
                            get value() {
                              return searchTo;
                            },
                            set value($$value) {
                              searchTo = $$value;
                              $$settled = false;
                            }
                          });
                        },
                        $$slots: { default: true }
                      });
                      $$renderer7.push(`<!----> `);
                      Col($$renderer7, {
                        md: "2",
                        class: "d-flex gap-2",
                        children: ($$renderer8) => {
                          Button($$renderer8, {
                            color: "primary",
                            size: "sm",
                            class: "w-100",
                            onclick: searchData,
                            children: ($$renderer9) => {
                              $$renderer9.push(`<!---->Buscar`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer8.push(`<!----> `);
                          Button($$renderer8, {
                            color: "secondary",
                            size: "sm",
                            outline: true,
                            class: "w-100",
                            onclick: clearSearch,
                            children: ($$renderer9) => {
                              $$renderer9.push(`<!---->Limpiar`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer8.push(`<!---->`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer7.push(`<!---->`);
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Card($$renderer4, {
            class: "shadow-sm mb-4",
            children: ($$renderer5) => {
              CardBody($$renderer5, {
                children: ($$renderer6) => {
                  Table($$renderer6, {
                    hover: true,
                    responsive: true,
                    class: "align-middle",
                    children: ($$renderer7) => {
                      $$renderer7.push(`<thead class="table-dark"><tr><th>Region</th><th>Fecha</th><th>Plataforma</th><th>Industria</th><th>Impresiones</th><th>Clicks</th><th>Gasto (€)</th><th>Conv.</th><th>Ingresos (€)</th><th>Acciones</th></tr></thead> <tbody><tr class="table-light"><td>`);
                      Input($$renderer7, {
                        type: "text",
                        placeholder: "Region",
                        bsSize: "sm",
                        get value() {
                          return newRegion;
                        },
                        set value($$value) {
                          newRegion = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "text",
                        placeholder: "YYYY-MM-DD",
                        bsSize: "sm",
                        get value() {
                          return newDate;
                        },
                        set value($$value) {
                          newDate = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "text",
                        placeholder: "Plataforma",
                        bsSize: "sm",
                        get value() {
                          return newPlatform;
                        },
                        set value($$value) {
                          newPlatform = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "text",
                        placeholder: "Industria",
                        bsSize: "sm",
                        get value() {
                          return newIndustry;
                        },
                        set value($$value) {
                          newIndustry = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "number",
                        bsSize: "sm",
                        get value() {
                          return newImpression;
                        },
                        set value($$value) {
                          newImpression = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "number",
                        bsSize: "sm",
                        get value() {
                          return newClick;
                        },
                        set value($$value) {
                          newClick = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "number",
                        bsSize: "sm",
                        get value() {
                          return newAdSpend;
                        },
                        set value($$value) {
                          newAdSpend = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "number",
                        bsSize: "sm",
                        get value() {
                          return newConversion;
                        },
                        set value($$value) {
                          newConversion = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Input($$renderer7, {
                        type: "number",
                        bsSize: "sm",
                        get value() {
                          return newRevenue;
                        },
                        set value($$value) {
                          newRevenue = $$value;
                          $$settled = false;
                        }
                      });
                      $$renderer7.push(`<!----></td><td>`);
                      Button($$renderer7, {
                        color: "success",
                        size: "sm",
                        class: "w-100",
                        onclick: insertAd,
                        children: ($$renderer8) => {
                          $$renderer8.push(`<!---->Insertar`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer7.push(`<!----></td></tr>`);
                      const each_array = ensure_array_like(global_ad);
                      if (each_array.length !== 0) {
                        $$renderer7.push("<!--[-->");
                        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
                          let ad = each_array[i];
                          $$renderer7.push(`<tr data-testid="GlobalAd-row"><td><a${attr("href", `/global-ads-performance/${stringify(ad.region)}/${stringify(ad.date)}`)} class="text-decoration-none fw-bold">${escape_html(ad.region)}</a></td><td>`);
                          Badge($$renderer7, {
                            color: "light",
                            class: "text-dark",
                            children: ($$renderer8) => {
                              $$renderer8.push(`<!---->${escape_html(ad.date)}`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!----></td><td>${escape_html(ad.platform)}</td><td>${escape_html(ad.industry)}</td><td>${escape_html(ad.impression)}</td><td>${escape_html(ad.click)}</td><td class="text-danger">-${escape_html(ad.ad_spend)}</td><td>${escape_html(ad.conversion)}</td><td class="text-success fw-bold">+${escape_html(ad.revenue)}</td><td>`);
                          Button($$renderer7, {
                            color: "outline-danger",
                            size: "sm",
                            onclick: () => deleteAd(ad),
                            children: ($$renderer8) => {
                              $$renderer8.push(`<!---->Eliminar`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!----></td></tr>`);
                        }
                      } else {
                        $$renderer7.push("<!--[!-->");
                        $$renderer7.push(`<tr><td colspan="10" class="text-center py-4 text-muted">No hay datos disponibles. Pulsa "Cargar Datos Iniciales".</td></tr>`);
                      }
                      $$renderer7.push(`<!--]--></tbody>`);
                    },
                    $$slots: { default: true }
                  });
                },
                $$slots: { default: true }
              });
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          if (resultStatusCode !== 0) {
            $$renderer4.push("<!--[0-->");
            Alert($$renderer4, {
              color: resultStatusCode >= 200 && resultStatusCode < 300 ? "success" : "warning",
              dismissible: true,
              children: ($$renderer5) => {
                $$renderer5.push(`<div class="info-message"><strong>Estado de la operación:</strong> ${escape_html(resultStatusCode)}</div>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DK8hLjWI.js.map

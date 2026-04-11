import { l as escape_html } from './index2-gV84oFCP.js';
import { p as page } from './index3-CD0TcZDl.js';
import { C as Container, R as Row, b as Col, a as Card, c as CardBody, B as Badge, T as Table, I as Input, A as Alert } from './Table-Dct0oCl_.js';
import { B as Button } from './Button-CcYsdgdF.js';
import './Theme.svelte_svelte_type_style_lang-DNOdIBoT.js';
import './state.svelte-ZeFaOGP8.js';
import './root-BXUemFiW.js';
import './index-CLVmnW1j.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let region = page.params.region;
    let date = page.params.date;
    let API = "/api/v1/global-ads-performance";
    let notFoundError = false;
    let resultStatusCode = 0;
    let updatedRegion = "newRegion";
    let updatedDate = "newDate";
    let updatedPlatform = "newPlatform";
    let updatedIndustry = "newIndustry";
    let updatedImpression = 0;
    let updatedClick = 0;
    let updatedAdSpend = 0;
    let updatedConversion = 0;
    let updatedRevenue = 0;
    async function getData() {
      try {
        const res = await fetch(`${API}/${region}/${date}`, { method: "GET" });
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
        console.error("Error de red al intentar obtener el anuncio:", err);
      }
    }
    async function updateAd() {
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
      const res = await fetch(API + "/" + region + "/" + date, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAd)
      });
      resultStatusCode = await res.status;
      if (resultStatusCode == 201) getData();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Container($$renderer3, {
        class: "mt-4",
        children: ($$renderer4) => {
          Row($$renderer4, {
            class: "align-items-center mb-4",
            children: ($$renderer5) => {
              Col($$renderer5, {
                children: ($$renderer6) => {
                  $$renderer6.push(`<h2 class="text-primary">Edición de Anuncio</h2> <p class="text-muted">Región: `);
                  Badge($$renderer6, {
                    color: "info",
                    children: ($$renderer7) => {
                      $$renderer7.push(`<!---->${escape_html(region)}`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer6.push(`<!----> | 
                Fecha: `);
                  Badge($$renderer6, {
                    color: "info",
                    children: ($$renderer7) => {
                      $$renderer7.push(`<!---->${escape_html(date)}`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer6.push(`<!----></p>`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> `);
              Col($$renderer5, {
                class: "text-end",
                children: ($$renderer6) => {
                  $$renderer6.push(`<a href="/global-ads-performance" class="btn btn-outline-secondary">⬅ Volver al listado</a>`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          if (notFoundError) {
            $$renderer4.push("<!--[0-->");
            Alert($$renderer4, {
              color: "danger",
              class: "shadow-sm",
              children: ($$renderer5) => {
                $$renderer5.push(`<h4 class="alert-heading">Error 404: Anuncio no encontrado</h4> <p>No existe un anuncio registrado en el sistema con región <strong>"${escape_html(region)}"</strong> en la fecha <strong>"${escape_html(date)}"</strong>.</p> <hr/> <p class="mb-0">Por favor, comprueba la URL o vuelve al listado principal para seleccionar un registro válido.</p>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
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
                          bsSize: "sm",
                          get value() {
                            return updatedRegion;
                          },
                          set value($$value) {
                            updatedRegion = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "text",
                          bsSize: "sm",
                          get value() {
                            return updatedDate;
                          },
                          set value($$value) {
                            updatedDate = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "text",
                          bsSize: "sm",
                          get value() {
                            return updatedPlatform;
                          },
                          set value($$value) {
                            updatedPlatform = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "text",
                          bsSize: "sm",
                          get value() {
                            return updatedIndustry;
                          },
                          set value($$value) {
                            updatedIndustry = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "number",
                          bsSize: "sm",
                          get value() {
                            return updatedImpression;
                          },
                          set value($$value) {
                            updatedImpression = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "number",
                          bsSize: "sm",
                          get value() {
                            return updatedClick;
                          },
                          set value($$value) {
                            updatedClick = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "number",
                          bsSize: "sm",
                          get value() {
                            return updatedAdSpend;
                          },
                          set value($$value) {
                            updatedAdSpend = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "number",
                          bsSize: "sm",
                          get value() {
                            return updatedConversion;
                          },
                          set value($$value) {
                            updatedConversion = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Input($$renderer7, {
                          type: "number",
                          bsSize: "sm",
                          get value() {
                            return updatedRevenue;
                          },
                          set value($$value) {
                            updatedRevenue = $$value;
                            $$settled = false;
                          }
                        });
                        $$renderer7.push(`<!----></td><td>`);
                        Button($$renderer7, {
                          color: "primary",
                          size: "sm",
                          class: "w-100",
                          onclick: updateAd,
                          children: ($$renderer8) => {
                            $$renderer8.push(`<!---->Actualizar`);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer7.push(`<!----></td></tr></tbody>`);
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
                  $$renderer5.push(`<strong>Estado de la operación:</strong> ${escape_html(resultStatusCode)} 
            ${escape_html(resultStatusCode >= 200 && resultStatusCode < 300 ? "(Recurso actualizado correctamente)" : "")}`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
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
//# sourceMappingURL=_page.svelte-C4GWzDfm.js.map

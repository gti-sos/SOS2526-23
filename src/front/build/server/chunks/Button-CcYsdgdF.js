import { q as sanitize_props, r as rest_props, f as fallback, t as attributes, w as clsx, l as escape_html, x as slot, c as bind_props } from './index2-gV84oFCP.js';

function isObject(value) {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
}
function getColumnSizeClass(isXs, colWidth, colSize) {
  if (colSize === true || colSize === "") {
    return isXs ? "col" : `col-${colWidth}`;
  } else if (colSize === "auto") {
    return isXs ? "col-auto" : `col-${colWidth}-auto`;
  }
  return isXs ? `col-${colSize}` : `col-${colWidth}-${colSize}`;
}
function toClassName(value) {
  let result = "";
  if (typeof value === "string" || typeof value === "number") {
    result += value;
  } else if (typeof value === "object") {
    if (Array.isArray(value)) {
      result = value.map(toClassName).filter(Boolean).join(" ");
    } else {
      for (let key in value) {
        if (value[key]) {
          result && (result += " ");
          result += key;
        }
      }
    }
  }
  return result;
}
const classnames = (...args) => args.map(toClassName).filter(Boolean).join(" ");
function Button($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "class",
    "active",
    "block",
    "content",
    "close",
    "color",
    "disabled",
    "href",
    "inner",
    "outline",
    "size",
    "value"
  ]);
  $$renderer.component(($$renderer2) => {
    let ariaLabel, classes, defaultAriaLabel;
    let className = fallback($$props["class"], "");
    let active = fallback($$props["active"], false);
    let block = fallback($$props["block"], false);
    let content = fallback($$props["content"], "");
    let close = fallback($$props["close"], false);
    let color = fallback($$props["color"], "secondary");
    let disabled = fallback($$props["disabled"], false);
    let href = fallback($$props["href"], "");
    let inner = fallback($$props["inner"], void 0);
    let outline = fallback($$props["outline"], false);
    let size = fallback($$props["size"], "");
    let value = fallback($$props["value"], "");
    ariaLabel = $$sanitized_props["aria-label"];
    classes = classnames(className, close ? "btn-close" : "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "d-block w-100" : false, { active });
    defaultAriaLabel = close ? "Close" : null;
    if (href) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attributes(
        {
          ...$$restProps,
          class: clsx(classes),
          href,
          "aria-label": ariaLabel || defaultAriaLabel
        },
        void 0,
        { disabled }
      )}>`);
      if (content) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(content)}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<button${attributes({
        ...$$restProps,
        class: clsx(classes),
        disabled,
        value,
        "aria-label": ariaLabel || defaultAriaLabel
      })}><!--[-->`);
      slot($$renderer2, $$props, "default", {}, () => {
        if (content) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(content)}`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<!--[-->`);
          slot($$renderer2, $$props, "default", {}, null);
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      });
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      class: className,
      active,
      block,
      content,
      close,
      color,
      disabled,
      href,
      inner,
      outline,
      size,
      value
    });
  });
}

export { Button as B, classnames as c, getColumnSizeClass as g, isObject as i };
//# sourceMappingURL=Button-CcYsdgdF.js.map

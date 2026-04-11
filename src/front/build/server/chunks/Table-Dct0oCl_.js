import { q as sanitize_props, r as rest_props, f as fallback, t as attributes, w as clsx, x as slot, c as bind_props, y as spread_props, l as escape_html, k as ensure_array_like, z as attr_class, j as attr, A as setContext, B as sanitize_slots } from './index2-gV84oFCP.js';
import { c as classnames, i as isObject, g as getColumnSizeClass } from './Button-CcYsdgdF.js';

function Alert($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "class",
    "content",
    "closeAriaLabel",
    "closeClassName",
    "color",
    "dismissible",
    "fade",
    "heading",
    "isOpen",
    "toggle",
    "theme",
    "transition"
  ]);
  $$renderer.component(($$renderer2) => {
    let showClose, classes, closeClassNames;
    let className = fallback($$props["class"], "");
    let content = fallback($$props["content"], void 0);
    let closeAriaLabel = fallback($$props["closeAriaLabel"], "Close");
    let closeClassName = fallback($$props["closeClassName"], "");
    let color = fallback($$props["color"], "success");
    let dismissible = fallback($$props["dismissible"], false);
    let fade = fallback($$props["fade"], true);
    let heading = fallback($$props["heading"], "");
    let isOpen = fallback($$props["isOpen"], true);
    let toggle = fallback($$props["toggle"], void 0);
    let theme = fallback($$props["theme"], void 0);
    let transition = fallback($$props["transition"], () => ({ duration: fade ? 400 : 0 }), true);
    showClose = dismissible || toggle;
    classes = classnames(className, "alert", `alert-${color}`, { "alert-dismissible": showClose });
    closeClassNames = classnames("btn-close", closeClassName);
    if (isOpen) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attributes({
        ...$$restProps,
        "data-bs-theme": theme,
        class: clsx(classes),
        role: "alert"
      })}>`);
      if (heading || $$slots.heading) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<h4 class="alert-heading">${escape_html(heading)}<!--[-->`);
        slot($$renderer2, $$props, "heading", {}, null);
        $$renderer2.push(`<!--]--></h4>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showClose) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button type="button"${attr_class(clsx(closeClassNames))}${attr("aria-label", closeAriaLabel)}></button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (content) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(content)}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      class: className,
      content,
      closeAriaLabel,
      closeClassName,
      color,
      dismissible,
      fade,
      heading,
      isOpen,
      toggle,
      theme,
      transition
    });
  });
}
function Badge($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "ariaLabel",
    "border",
    "class",
    "content",
    "color",
    "href",
    "indicator",
    "pill",
    "positioned",
    "placement",
    "shadow",
    "theme"
  ]);
  $$renderer.component(($$renderer2) => {
    let classes;
    let ariaLabel = fallback($$props["ariaLabel"], "");
    let border = fallback($$props["border"], false);
    let className = fallback($$props["class"], "");
    let content = fallback($$props["content"], "");
    let color = fallback($$props["color"], "secondary");
    let href = fallback($$props["href"], "");
    let indicator = fallback($$props["indicator"], false);
    let pill = fallback($$props["pill"], false);
    let positioned = fallback($$props["positioned"], false);
    let placement = fallback($$props["placement"], "top-0 start-100");
    let shadow = fallback($$props["shadow"], false);
    let theme = fallback($$props["theme"], void 0);
    classes = classnames(
      "badge",
      `text-bg-${color}`,
      pill ? "rounded-pill" : false,
      positioned ? "position-absolute translate-middle" : false,
      positioned ? placement : false,
      indicator ? "p-2" : false,
      border ? typeof border === "string" ? border : "border" : false,
      shadow ? typeof shadow === "string" ? shadow : "shadow" : false,
      className
    );
    if (href) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<a${attributes({
        ...$$restProps,
        href,
        class: clsx(classes),
        "data-bs-theme": theme
      })}>`);
      if (content) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(content)}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      if (positioned || indicator) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="visually-hidden">${escape_html(ariaLabel)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></a>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span${attributes({
        ...$$restProps,
        class: clsx(classes),
        "data-bs-theme": theme
      })}>`);
      if (content) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`${escape_html(content)}`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      if (positioned || indicator) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="visually-hidden">${escape_html(ariaLabel)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></span>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      ariaLabel,
      border,
      class: className,
      content,
      color,
      href,
      indicator,
      pill,
      positioned,
      placement,
      shadow,
      theme
    });
  });
}
function Card($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class", "body", "color", "inverse", "outline", "theme"]);
  $$renderer.component(($$renderer2) => {
    let classes;
    let className = fallback($$props["class"], "");
    let body = fallback($$props["body"], false);
    let color = fallback($$props["color"], "");
    let inverse = fallback($$props["inverse"], false);
    let outline = fallback($$props["outline"], false);
    let theme = fallback($$props["theme"], void 0);
    classes = classnames(className, "card", inverse ? "text-white" : false, body ? "card-body" : false, color ? `${outline ? "border" : "bg"}-${color}` : false);
    $$renderer2.push(`<div${attributes({
      ...$$restProps,
      "data-bs-theme": theme,
      class: clsx(classes)
    })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { class: className, body, color, inverse, outline, theme });
  });
}
function CardBody($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class"]);
  $$renderer.component(($$renderer2) => {
    let classes;
    let className = fallback($$props["class"], "");
    classes = classnames(className, "card-body");
    $$renderer2.push(`<div${attributes({ ...$$restProps, class: clsx(classes) })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { class: className });
  });
}
function Col($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class", "xs", "sm", "md", "lg", "xl", "xxl"]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], "");
    let xs = fallback($$props["xs"], void 0);
    let sm = fallback($$props["sm"], void 0);
    let md = fallback($$props["md"], void 0);
    let lg = fallback($$props["lg"], void 0);
    let xl = fallback($$props["xl"], void 0);
    let xxl = fallback($$props["xxl"], void 0);
    const colClasses = [];
    const lookup = { xs, sm, md, lg, xl, xxl };
    Object.keys(lookup).forEach((colWidth) => {
      const columnProp = lookup[colWidth];
      if (!columnProp && columnProp !== "") {
        return;
      }
      const isXs = colWidth === "xs";
      if (isObject(columnProp)) {
        const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
        const colClass = getColumnSizeClass(isXs, colWidth, columnProp.size);
        if (columnProp.size || columnProp.size === "") {
          colClasses.push(colClass);
        }
        if (columnProp.push) {
          colClasses.push(`push${colSizeInterfix}${columnProp.push}`);
        }
        if (columnProp.pull) {
          colClasses.push(`pull${colSizeInterfix}${columnProp.pull}`);
        }
        if (columnProp.offset) {
          colClasses.push(`offset${colSizeInterfix}${columnProp.offset}`);
        }
        if (columnProp.order) {
          colClasses.push(`order${colSizeInterfix}${columnProp.order}`);
        }
      } else {
        colClasses.push(getColumnSizeClass(isXs, colWidth, columnProp));
      }
    });
    if (!colClasses.length) {
      colClasses.push("col");
    }
    if (className) {
      colClasses.push(className);
    }
    $$renderer2.push(`<div${attributes({ ...$$restProps, class: clsx(colClasses.join(" ")) })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { class: className, xs, sm, md, lg, xl, xxl });
  });
}
function Container($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class", "sm", "md", "lg", "xl", "xxl", "fluid"]);
  $$renderer.component(($$renderer2) => {
    let classes;
    let className = fallback($$props["class"], "");
    let sm = fallback($$props["sm"], void 0);
    let md = fallback($$props["md"], void 0);
    let lg = fallback($$props["lg"], void 0);
    let xl = fallback($$props["xl"], void 0);
    let xxl = fallback($$props["xxl"], void 0);
    let fluid = fallback($$props["fluid"], false);
    classes = classnames(className, {
      "container-sm": sm,
      "container-md": md,
      "container-lg": lg,
      "container-xl": xl,
      "container-xxl": xxl,
      "container-fluid": fluid,
      container: !sm && !md && !lg && !xl && !xxl && !fluid
    });
    $$renderer2.push(`<div${attributes({ ...$$restProps, class: clsx(classes) })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { class: className, sm, md, lg, xl, xxl, fluid });
  });
}
function FormCheck($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "class",
    "checked",
    "disabled",
    "group",
    "id",
    "inline",
    "inner",
    "invalid",
    "label",
    "name",
    "reverse",
    "size",
    "type",
    "valid",
    "value"
  ]);
  $$renderer.component(($$renderer2) => {
    let classes, inputClasses, idFor;
    let className = fallback($$props["class"], "");
    let checked = fallback($$props["checked"], false);
    let disabled = fallback($$props["disabled"], false);
    let group = fallback($$props["group"], void 0);
    let id = fallback($$props["id"], void 0);
    let inline = fallback($$props["inline"], false);
    let inner = fallback($$props["inner"], void 0);
    let invalid = fallback($$props["invalid"], false);
    let label = fallback($$props["label"], "");
    let name = fallback($$props["name"], "");
    let reverse = fallback($$props["reverse"], false);
    let size = fallback($$props["size"], "");
    let type = fallback($$props["type"], "checkbox");
    let valid = fallback($$props["valid"], false);
    let value = fallback($$props["value"], void 0);
    classes = classnames(className, "form-check", {
      "form-check-reverse": reverse,
      "form-switch": type === "switch",
      "form-check-inline": inline,
      [`form-control-${size}`]: size
    });
    inputClasses = classnames("form-check-input", { "is-invalid": invalid, "is-valid": valid });
    idFor = id || label;
    $$renderer2.push(`<div${attr_class(clsx(classes))}>`);
    if (type === "radio") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<input${attributes(
        {
          ...$$restProps,
          class: clsx(inputClasses),
          id: idFor,
          type: "radio",
          checked: group === value,
          disabled,
          name,
          value
        },
        void 0,
        void 0,
        void 0,
        4
      )}/>`);
    } else if (type === "switch") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<input${attributes(
        {
          ...$$restProps,
          class: clsx(inputClasses),
          id: idFor,
          type: "checkbox",
          checked,
          disabled,
          name,
          value
        },
        void 0,
        void 0,
        void 0,
        4
      )}/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<input${attributes(
        {
          ...$$restProps,
          class: clsx(inputClasses),
          id: idFor,
          type: "checkbox",
          checked,
          disabled,
          name,
          value
        },
        void 0,
        void 0,
        void 0,
        4
      )}/>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (label) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<label class="form-check-label"${attr("for", idFor)}><!--[-->`);
      slot($$renderer2, $$props, "label", {}, () => {
        $$renderer2.push(`${escape_html(label)}`);
      });
      $$renderer2.push(`<!--]--></label>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, {
      class: className,
      checked,
      disabled,
      group,
      id,
      inline,
      inner,
      invalid,
      label,
      name,
      reverse,
      size,
      type,
      valid,
      value
    });
  });
}
function FormFeedback($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class", "valid", "tooltip"]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], "");
    let valid = fallback($$props["valid"], void 0);
    let tooltip = fallback($$props["tooltip"], false);
    let classes;
    {
      const validMode = tooltip ? "tooltip" : "feedback";
      classes = classnames(className, valid ? `valid-${validMode}` : `invalid-${validMode}`);
    }
    $$renderer2.push(`<div${attributes({ ...$$restProps, class: clsx(classes) })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { class: className, valid, tooltip });
  });
}
function Input($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "class",
    "bsSize",
    "checked",
    "color",
    "disabled",
    "feedback",
    "files",
    "group",
    "inner",
    "invalid",
    "label",
    "max",
    "min",
    "multiple",
    "name",
    "placeholder",
    "plaintext",
    "readonly",
    "reverse",
    "size",
    "theme",
    "type",
    "valid",
    "value"
  ]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], "");
    let bsSize = fallback($$props["bsSize"], void 0);
    let checked = fallback($$props["checked"], false);
    let color = fallback($$props["color"], void 0);
    let disabled = fallback($$props["disabled"], void 0);
    let feedback = fallback($$props["feedback"], void 0);
    let files = fallback($$props["files"], void 0);
    let group = fallback($$props["group"], void 0);
    let inner = fallback($$props["inner"], void 0);
    let invalid = fallback($$props["invalid"], false);
    let label = fallback($$props["label"], void 0);
    let max = fallback($$props["max"], void 0);
    let min = fallback($$props["min"], void 0);
    let multiple = fallback($$props["multiple"], void 0);
    let name = fallback($$props["name"], "");
    let placeholder = fallback($$props["placeholder"], "");
    let plaintext = fallback($$props["plaintext"], false);
    let readonly = fallback($$props["readonly"], void 0);
    let reverse = fallback($$props["reverse"], false);
    let size = fallback($$props["size"], void 0);
    let theme = fallback($$props["theme"], void 0);
    let type = fallback($$props["type"], "text");
    let valid = fallback($$props["valid"], false);
    let value = fallback($$props["value"], void 0);
    let classes;
    let tag;
    {
      const isNotaNumber = new RegExp("\\D", "g");
      let isBtn = false;
      let formControlClass = "form-control";
      tag = "input";
      switch (type) {
        case "color":
          formControlClass = `form-control form-control-color`;
          break;
        case "range":
          formControlClass = "form-range";
          break;
        case "select":
          formControlClass = `form-select`;
          tag = "select";
          break;
        case "textarea":
          tag = "textarea";
          break;
        case "button":
        case "reset":
        case "submit":
          formControlClass = `btn btn-${color || "secondary"}`;
          isBtn = true;
          break;
        case "hidden":
        case "image":
          formControlClass = void 0;
          break;
        default:
          formControlClass = "form-control";
          tag = "input";
      }
      if (plaintext) {
        formControlClass = `${formControlClass}-plaintext`;
        tag = "input";
      }
      if (size && isNotaNumber.test(size)) {
        console.warn(`Please use the prop "bsSize" instead of the "size" to bootstrap's input sizing.`);
        bsSize = size;
        size = void 0;
      }
      classes = classnames(className, formControlClass, {
        "is-invalid": invalid,
        "is-valid": valid,
        [`form-control-${bsSize}`]: bsSize && !isBtn && tag !== "select",
        [`form-select-${bsSize}`]: bsSize && tag === "select",
        [`btn-${bsSize}`]: bsSize && isBtn
      });
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (tag === "input") {
        $$renderer3.push("<!--[0-->");
        if (type === "text" || type === "password" || type === "search" || type === "tel" || type === "url") {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              ...{ type },
              "data-bs-theme": theme,
              class: clsx(classes),
              value,
              disabled,
              name,
              placeholder,
              readonly,
              size
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        } else if (type === "color") {
          $$renderer3.push("<!--[1-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              "data-bs-theme": theme,
              class: clsx(classes),
              type: "color",
              value,
              disabled,
              name,
              placeholder,
              readonly
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        } else if (type === "email") {
          $$renderer3.push("<!--[2-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              "data-bs-theme": theme,
              class: clsx(classes),
              type: "email",
              value,
              disabled,
              multiple,
              name,
              placeholder,
              readonly,
              size
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        } else if (type === "file") {
          $$renderer3.push("<!--[3-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              "data-bs-theme": theme,
              class: clsx(classes),
              type: "file",
              disabled,
              invalid,
              multiple,
              name,
              placeholder,
              readonly,
              valid
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        } else if (type === "checkbox" || type === "radio" || type === "switch") {
          $$renderer3.push("<!--[4-->");
          FormCheck($$renderer3, spread_props([
            $$restProps,
            {
              "data-bs-theme": theme,
              class: className,
              size: bsSize,
              type,
              disabled,
              invalid,
              label,
              name,
              placeholder,
              reverse,
              readonly,
              valid,
              get checked() {
                return checked;
              },
              set checked($$value) {
                checked = $$value;
                $$settled = false;
              },
              get inner() {
                return inner;
              },
              set inner($$value) {
                inner = $$value;
                $$settled = false;
              },
              get group() {
                return group;
              },
              set group($$value) {
                group = $$value;
                $$settled = false;
              },
              get value() {
                return value;
              },
              set value($$value) {
                value = $$value;
                $$settled = false;
              }
            }
          ]));
        } else if (type === "number") {
          $$renderer3.push("<!--[5-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              type: "number",
              "data-bs-theme": theme,
              class: clsx(classes),
              value,
              disabled,
              max,
              min,
              name,
              placeholder,
              readonly
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        } else if (type === "range") {
          $$renderer3.push("<!--[6-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              type: "range",
              "data-bs-theme": theme,
              class: clsx(classes),
              value,
              disabled,
              max,
              min,
              name,
              placeholder,
              readonly
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        } else if (type === "date" || type === "datetime" || type === "datetime-local" || type === "month" || type === "time" || type === "week") {
          $$renderer3.push("<!--[7-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              ...{ type },
              "data-bs-theme": theme,
              class: clsx(classes),
              value,
              disabled,
              max,
              min,
              name,
              placeholder,
              readonly
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<input${attributes(
            {
              ...$$restProps,
              "data-bs-theme": theme,
              class: clsx(classes),
              ...{ type },
              value,
              name,
              disabled,
              placeholder,
              readonly
            },
            void 0,
            void 0,
            void 0,
            4
          )}/>`);
        }
        $$renderer3.push(`<!--]-->`);
      } else if (tag === "textarea") {
        $$renderer3.push("<!--[1-->");
        $$renderer3.push(`<textarea${attributes({
          ...$$restProps,
          "data-bs-theme": theme,
          class: clsx(classes),
          disabled,
          name,
          placeholder,
          readonly
        })}>`);
        const $$body = escape_html(value);
        if ($$body) {
          $$renderer3.push(`${$$body}`);
        }
        $$renderer3.push(`</textarea>`);
      } else if (tag === "select" && !multiple) {
        $$renderer3.push("<!--[2-->");
        $$renderer3.select(
          {
            ...$$restProps,
            "data-bs-theme": theme,
            class: classes,
            value,
            this: inner,
            name,
            disabled,
            readonly
          },
          ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            slot($$renderer4, $$props, "default", {}, null);
            $$renderer4.push(`<!--]-->`);
          },
          void 0,
          void 0,
          void 0,
          void 0,
          true
        );
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (feedback) {
        $$renderer3.push("<!--[0-->");
        if (Array.isArray(feedback)) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(feedback);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let msg = each_array[$$index];
            FormFeedback($$renderer3, {
              valid,
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(msg)}`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
          FormFeedback($$renderer3, {
            valid,
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->${escape_html(feedback)}`);
            },
            $$slots: { default: true }
          });
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, {
      class: className,
      bsSize,
      checked,
      color,
      disabled,
      feedback,
      files,
      group,
      inner,
      invalid,
      label,
      max,
      min,
      multiple,
      name,
      placeholder,
      plaintext,
      readonly,
      reverse,
      size,
      theme,
      type,
      valid,
      value
    });
  });
}
function Row($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class", "noGutters", "form", "cols", "inner"]);
  $$renderer.component(($$renderer2) => {
    let classes;
    let className = fallback($$props["class"], "");
    let noGutters = fallback($$props["noGutters"], false);
    let form = fallback($$props["form"], false);
    let cols = fallback($$props["cols"], 0);
    let inner = fallback($$props["inner"], void 0);
    function getCols(cols2) {
      const colsValue = parseInt(cols2);
      if (!isNaN(colsValue)) {
        if (colsValue > 0) {
          return [`row-cols-${colsValue}`];
        }
      } else if (typeof cols2 === "object") {
        return ["xs", "sm", "md", "lg", "xl"].map((colWidth) => {
          const isXs = colWidth === "xs";
          const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
          const value = cols2[colWidth];
          if (typeof value === "number" && value > 0) {
            return `row-cols${colSizeInterfix}${value}`;
          }
          return null;
        }).filter((value) => !!value);
      }
      return [];
    }
    classes = classnames(className, noGutters ? "gx-0" : null, form ? "form-row" : "row", ...getCols(cols));
    $$renderer2.push(`<div${attributes({ ...$$restProps, class: clsx(classes) })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { class: className, noGutters, form, cols, inner });
  });
}
function Colgroup($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    setContext("colgroup", true);
    $$renderer2.push(`<colgroup><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></colgroup>`);
  });
}
function ResponsiveContainer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let responsiveClassName;
    let className = fallback($$props["class"], "");
    let responsive = fallback($$props["responsive"], false);
    responsiveClassName = classnames(className, {
      "table-responsive": responsive === true,
      [`table-responsive-${responsive}`]: typeof responsive === "string"
    });
    if (responsive) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(clsx(responsiveClassName))}><!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { class: className, responsive });
  });
}
function TableFooter($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, []);
  $$renderer.component(($$renderer2) => {
    setContext("footer", true);
    $$renderer2.push(`<tfoot${attributes({ ...$$restProps })}><tr><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></tr></tfoot>`);
  });
}
function TableHeader($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, []);
  $$renderer.component(($$renderer2) => {
    setContext("header", true);
    $$renderer2.push(`<thead${attributes({ ...$$restProps })}><tr><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></tr></thead>`);
  });
}
function Table($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "class",
    "size",
    "bordered",
    "borderless",
    "striped",
    "hover",
    "responsive",
    "rows"
  ]);
  $$renderer.component(($$renderer2) => {
    let classes;
    let className = fallback($$props["class"], "");
    let size = fallback($$props["size"], "");
    let bordered = fallback($$props["bordered"], false);
    let borderless = fallback($$props["borderless"], false);
    let striped = fallback($$props["striped"], false);
    let hover = fallback($$props["hover"], false);
    let responsive = fallback($$props["responsive"], false);
    let rows = fallback($$props["rows"], void 0);
    classes = classnames(className, "table", size ? "table-" + size : false, bordered ? "table-bordered" : false, borderless ? "table-borderless" : false, striped ? "table-striped" : false, hover ? "table-hover" : false);
    ResponsiveContainer($$renderer2, {
      responsive,
      children: ($$renderer3) => {
        $$renderer3.push(`<table${attributes({ ...$$restProps, class: clsx(classes) })}>`);
        if (rows) {
          $$renderer3.push("<!--[0-->");
          Colgroup($$renderer3, {
            children: ($$renderer4) => {
              $$renderer4.push(`<!--[-->`);
              slot($$renderer4, $$props, "default", {}, null);
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          TableHeader($$renderer3, {
            children: ($$renderer4) => {
              $$renderer4.push(`<!--[-->`);
              slot($$renderer4, $$props, "default", {}, null);
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> <tbody><!--[-->`);
          const each_array = ensure_array_like(rows);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let row = each_array[$$index];
            $$renderer3.push(`<tr><!--[-->`);
            slot($$renderer3, $$props, "default", { row }, null);
            $$renderer3.push(`<!--]--></tr>`);
          }
          $$renderer3.push(`<!--]--></tbody> `);
          TableFooter($$renderer3, {
            children: ($$renderer4) => {
              $$renderer4.push(`<!--[-->`);
              slot($$renderer4, $$props, "default", {}, null);
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!---->`);
        } else {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<!--[-->`);
          slot($$renderer3, $$props, "default", {}, null);
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></table>`);
      },
      $$slots: { default: true }
    });
    bind_props($$props, {
      class: className,
      size,
      bordered,
      borderless,
      striped,
      hover,
      responsive,
      rows
    });
  });
}

export { Alert as A, Badge as B, Container as C, Input as I, Row as R, Table as T, Card as a, Col as b, CardBody as c };
//# sourceMappingURL=Table-Dct0oCl_.js.map

import './state.svelte-ZeFaOGP8.js';
import './root-BXUemFiW.js';
import { w as writable } from './index-CLVmnW1j.js';
import { p as getContext } from './index2-gV84oFCP.js';

function create_updated_store() {
  const { set, subscribe } = writable(false);
  {
    return {
      subscribe,
      // eslint-disable-next-line @typescript-eslint/require-await
      check: async () => false
    };
  }
}
const stores = {
  updated: /* @__PURE__ */ create_updated_store()
};
function goto(url, opts = {}) {
  {
    throw new Error("Cannot call goto(...) on the server");
  }
}
({
  check: stores.updated.check
});
function context() {
  return getContext("__request__");
}
const page$1 = {
  get params() {
    return context().page.params;
  }
};
const page = page$1;

export { goto as g, page as p };
//# sourceMappingURL=index3-CD0TcZDl.js.map

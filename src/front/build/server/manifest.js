const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.CiZCjfob.js",app:"_app/immutable/entry/app.bOkXcY3C.js",imports:["_app/immutable/entry/start.CiZCjfob.js","_app/immutable/chunks/lvQR512N.js","_app/immutable/chunks/Z-Eo0-mA.js","_app/immutable/chunks/DAhcpXBW.js","_app/immutable/chunks/BuUyXCn9.js","_app/immutable/entry/app.bOkXcY3C.js","_app/immutable/chunks/Z-Eo0-mA.js","_app/immutable/chunks/_xz6bZhd.js","_app/immutable/chunks/DIUTUq8g.js","_app/immutable/chunks/DOTrcAjv.js","_app/immutable/chunks/BuUyXCn9.js","_app/immutable/chunks/BVs0J9pK.js","_app/immutable/chunks/BH0oa9Pl.js","_app/immutable/chunks/B07Cj5II.js","_app/immutable/chunks/DAhcpXBW.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DFxk-Y1Z.js')),
			__memo(() => import('./chunks/1-2yaC1CIJ.js')),
			__memo(() => import('./chunks/2-BPqki2BM.js')),
			__memo(() => import('./chunks/3-0il-HHby.js')),
			__memo(() => import('./chunks/4-BqQg9zXw.js')),
			__memo(() => import('./chunks/5-DHw1SewW.js')),
			__memo(() => import('./chunks/6-DcxEoosW.js')),
			__memo(() => import('./chunks/7-BVmxkitr.js')),
			__memo(() => import('./chunks/8-KPdC_hO5.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/MRR",
				pattern: /^\/MRR\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/MRR/[region]/[date]",
				pattern: /^\/MRR\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"region","optional":false,"rest":false,"chained":false},{"name":"date","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/daily-global-stock-market-indicators",
				pattern: /^\/daily-global-stock-market-indicators\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/daily-global-stock-market-indicators/[region]/[index_name]",
				pattern: /^\/daily-global-stock-market-indicators\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"region","optional":false,"rest":false,"chained":false},{"name":"index_name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/global-ads-performance",
				pattern: /^\/global-ads-performance\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/global-ads-performance/[region]/[date]",
				pattern: /^\/global-ads-performance\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"region","optional":false,"rest":false,"chained":false},{"name":"date","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map

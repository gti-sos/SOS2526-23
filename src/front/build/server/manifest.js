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
		client: {start:"_app/immutable/entry/start.CIC0k_dc.js",app:"_app/immutable/entry/app.D3HfJtWi.js",imports:["_app/immutable/entry/start.CIC0k_dc.js","_app/immutable/chunks/Cxd0D7sN.js","_app/immutable/chunks/BYMlpFAu.js","_app/immutable/chunks/zEjYn7gx.js","_app/immutable/chunks/ZlAYTAop.js","_app/immutable/entry/app.D3HfJtWi.js","_app/immutable/chunks/BYMlpFAu.js","_app/immutable/chunks/CjYYSGJn.js","_app/immutable/chunks/BKJV3-6o.js","_app/immutable/chunks/DLPMak-A.js","_app/immutable/chunks/ZlAYTAop.js","_app/immutable/chunks/ClvhDxV0.js","_app/immutable/chunks/D_YkF-Gm.js","_app/immutable/chunks/BhRjyPS3.js","_app/immutable/chunks/zEjYn7gx.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-QQmIZ611.js')),
			__memo(() => import('./chunks/1-CxLuUAlw.js')),
			__memo(() => import('./chunks/2-CAEHWGV4.js')),
			__memo(() => import('./chunks/3-XHWsxc6G.js')),
			__memo(() => import('./chunks/4--nNoSb15.js')),
			__memo(() => import('./chunks/5-CdvBo208.js')),
			__memo(() => import('./chunks/6-BeridMBh.js')),
			__memo(() => import('./chunks/7-DMC9_gIm.js')),
			__memo(() => import('./chunks/8-pAVjRJxD.js')),
			__memo(() => import('./chunks/9-C_wX7YyH.js'))
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
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/MRR/[region]/[date]",
				pattern: /^\/MRR\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"region","optional":false,"rest":false,"chained":false},{"name":"date","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/auth/success",
				pattern: /^\/auth\/success\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/daily-global-stock-market-indicators",
				pattern: /^\/daily-global-stock-market-indicators\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/daily-global-stock-market-indicators/[region]/[index_name]",
				pattern: /^\/daily-global-stock-market-indicators\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"region","optional":false,"rest":false,"chained":false},{"name":"index_name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/global-ads-performance",
				pattern: /^\/global-ads-performance\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/global-ads-performance/[region]/[date]",
				pattern: /^\/global-ads-performance\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"region","optional":false,"rest":false,"chained":false},{"name":"date","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
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

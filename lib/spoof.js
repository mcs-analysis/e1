global.setTimeout = () => Math.floor(Math.random() * 1000000);
global.clearTimeout = (id) => {};
// global.setInterval = () => Math.floor(Math.random() * 1000000);

const genericProxyHandler = {
	get: (target, name) => () => new Proxy({}, genericProxyHandler),
	apply: (target, thisArg, args) => () => new Proxy({}, genericProxyHandler),
};

const documentProxyHandler = {
	get: (target, prop) => {
		if (prop === "querySelector") {
			return (selector) => {
				if (selector === 'meta[name="_gg_fb"]') {
					return {
						content: __CLIENT_KEY__,
					};
				}
				return null;
			};
		}
		return new Proxy(() => {}, genericProxyHandler);
	},
};

global.document = new Proxy({}, documentProxyHandler);

global.$ = function (selector) {
	return {
		data: function (key) {
			if (key === "id") return "AAAAAAAAAA==";
			if (key === "realid") return "1234567";
			return "";
		},
		on: function (event, selector, handler) {
			return this;
		},
		ajaxSetup: function (options) {
			return this;
		},
	};
};

global.$.get = function (url, callback) {
	const dummyResponse = url.includes("/getSources")
		? {
				sources: __SOURCES__,
				encrypted: true,
			}
		: {
				status: 200,
				data: {
					vast: [],
					ima: null,
				},
			};
	if (typeof callback === "function") {
		callback(dummyResponse);
	}
};

global.jwplayer = (elementId) => ({
	setup: function (config) {
		sendOutDecryptedSources(config.sources);
		return this;
	},
	on: function (event, callback) {
		return this;
	},
	play: function () {
		return this;
	},
	remove: function () {
		return this;
	},
});

global.MobileDetect = function (userAgent) {
	return {};
};
window.addEventListener = (event, handler) => {};

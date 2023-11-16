/**
 * Provide storage
 */
const kvstore = {};
window.kvstore = kvstore;

const DEFAULTS = {
	cmp: true
};

/**
 * 
 * @param {string} key 
 * @param {?Object} callback to match chrome.storage.get
 * @returns {promise} ?value
 */
kvstore.get = (key) => {
	console.log("kvstore get",key,val);
	// use chrome storage?
	if (chrome?.storage?.sync?.get) {
		window.__storage = chrome.storage;
		console.log("kvstore get sync",chrome.storage.sync);
		let p = chrome.storage.sync.get([key]);
		return p.then(kv => kv[key]); // unwrap it
	}
	// this is site specific memory
	// map??
	let val = window.localStorage.getItem(key);	
	if (callback) {
		let options = {};
		options[key] = val;
		callback(options);
	}
	return Promise.resolve(val);
};

/**
 * @returns {promise}
 */
kvstore.set = (key, value) => {
	console.log("kvstore SET",key,value);
	// use chrome storage?
	if (chrome?.storage?.sync?.set) {
		let kv = {};
		kv[key] = value;
		return chrome.storage.sync.set(kv);
	}
	window.localStorage.setItem(key, value);	
	return Promise.resolve(value);
};


kvstore.setupDefaults = () => {
	console.log("setupDefaults");
	Object.keys(DEFAULTS).forEach(k => {
		// TODO: Undisable for production
		if ( ! kvstore.get(k)) {
			kvstore.set(k, DEFAULTS[k]);
		}
	});
};

kvstore.setupDefaults();
export default kvstore;

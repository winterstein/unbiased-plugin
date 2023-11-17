
import { browser } from "webextension-polyfill-ts";
import { getDomain } from "./base/utils/miscutils";
import kvstore from "./kvstore";

if ( ! chrome) { // ??needed for Firefox or Edge??
	console.log("shim for non-chrome browser");
	chrome = browser;
}

function doRunNow() {
	console.log("doRunNow");
	chrome.tabs.query({active:true,currentWindow:true}, async function(tab){		
		console.log("UQ runNow tab",tab,tab[0],"windoW",window);
		chrome.tabs.sendMessage(tab[0].id, "doAnalyse");
	});
}
document.getElementById('runNow').addEventListener('click', doRunNow);


function save_preference(e) {
	console.log("save_preference", e);
    chrome.tabs.query({active:true,currentWindow:true}, async function(tab){
        let temp = new URL(tab[0].url);
        let domain = getDomain(temp.hostname);
        const allowed = !(document.getElementById('toggler').checked);
		let ignorelist = await kvstore.get("ignorelist");
		if ( ! allowed) {
			ignorelist = ignorelist.filter(d => ! domain.endsWith(d));
		} else {
			ignorelist.push(domain);
		}		
		kvstore.set("ignorelist",ignorelist);
    });
}
document.getElementById('toggler').addEventListener('change', save_preference);

function load_preference() {
    chrome.tabs.query({active:true,currentWindow:true}, async function(tab){
        let temp = new URL(tab[0].url);
        let domain = getDomain(temp.hostname);
        console.log(domain);
		let ignorelist = await kvstore.get("ignorelist");
		if (ignorelist.filter(d => domain.endsWith(d)).length) {
			document.getElementById('toggler').checked = false;
		} else {
			document.getElementById('toggler').checked = true;
			console.log("Unbiased default=on");
		}
    });
}

window.onload = load_preference();


document.getElementById('options_link').addEventListener('click', e => {
	chrome.runtime.openOptionsPage();
});

import { browser } from 'webextension-polyfill-ts';

chrome.runtime.onInstalled.addListener(function(details) {
	console.log("addListener",details);
    if (details.reason == 'install' || details.reason == 'update') {
        console.log("Extension installed for the first time");
        console.log("Setting all purposes consent as default false");
        let currentDate = new Date();
        let newDate = new Date(currentDate.setMonth(currentDate.getMonth()+2)); 
        console.log(newDate);
        chrome.storage.sync.set({
            purposes: [false, false, false, false, false,
                        false, false, false, false, false],
            nextupdate: newDate.toISOString()
        });
        chrome.storage.local.set({
            userlist: {"Description": "For users to allow sites"} // why provide this??
        });
        updateList();
        const url = chrome.extension.getURL('install-page1.html');
        chrome.tabs.create({'url':url});
    }
}); 

window.onload = checkUpdate();

// update once every month
async function checkUpdate() {
	console.log("checkUpdate");
    chrome.storage.sync.get(['nextupdate'], function(result) {
        let currentDate = new Date();
        let updateDate = Date.parse(result.nextupdate);
        if (currentDate > updateDate) {
            let newDate = new Date(currentDate.setMonth(currentDate.getMonth()+1)); 
            chrome.storage.sync.set({nextupdate: newDate.toISOString()});
            updateList();
        } // else do nothing
    });
}

async function updateList() {
	console.log("updateList");
    // const gvl = await fetch('https://raw.githubusercontent.com/good-loop/cmp-browser-plugin/master/src/js/data/vendor-list.json');
    // const gvljson = await gvl.json();
    // const allow = await fetch('https://raw.githubusercontent.com/good-loop/cmp-browser-plugin/master/src/js/data/allowlist.json');
    // const allowlistjson = await allow.json();
    // chrome.storage.local.set({vendorlist: gvljson, allowlist:allowlistjson}, function(){
    //     console.log("Done updating!");
    // });
}

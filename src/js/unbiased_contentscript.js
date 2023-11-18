// load the kvstore options manager
import kvstore from './kvstore';
import { getDomain } from './base/utils/miscutils';
// import {addScript} from './base/utils/miscutils';
import $ from 'jquery';
// import _ from 'lodash';
const Cookies = require('js-cookie');

const LOGTAG = "UQ-extension";
console.log(LOGTAG, "Hello from Unbiased Quality :)", window, document);

function getArticleText() {
	// TODO support custom text finding for special sites (e.g. Facebook)
	// TODO support multiple posts (e.g. reddit)
	let articleText = $("article").text() 
		|| window.document.textContent
		|| window.document.body?.innerText
		|| $(window.document).text();
	console.log(LOGTAG, "articleText", articleText, window.document.textContent);
	return articleText;
}

export const doAnalyse = async (options={}) => {
	let domain = getDomain();
	if ( ! options.force) {
		let ignorelist = await getOptionData("ignorelist");
		if (ignorelist.includes(domain)) {
			console.log(LOGTAG, "skip " + domain);
			return;
		}
		if ( ! window.location.protocol.startsWith("http") || ! domain.includes(".")) {
			console.log(LOGTAG, "skip not-a-website " + domain+" "+window.location);
			return;
		}
	}
	console.log(LOGTAG, "Run for domain " + domain);
	// 1. Get page text
	console.log(LOGTAG, window, window.document);
	// BBC
	let articleText = getArticleText();

	if (!articleText) {
		console.log("No articleText?");
		return;
	}

	// 2. Send to ChatGPT
	let apiKey = await kvstore.get("openai_api_key");
	if (!apiKey) {
		console.log("No API Key", kvstore);
		return;
	}
	let model = await getOptionData("gpt_model");
	let content = await getOptionData("prompt");
	if (options.force) { // force
		content+="\n\nProcess the page for bias and manipulation as best you can regardless of what type of page it is. Do not answer N/A."
	}
	/**
	 * 
	 * @param {{role, content}[]} messages 
	 * @returns 
	 */
	const doChat = async (articleText) => {
		assert(articleText);
		articleText = articleText.replace(/["`]/g, "'");
		articleText = articleText.substring(0, 1500); // cap length
		console.log(LOGTAG, "doChat", articleText);
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + apiKey
			},
			body: JSON.stringify({
				model,
				messages: [
					{
						role: "system",
						content
					},
					{
						role: "user", content: `Article/web-page text: ${articleText}

			Media Analyst Response:`}
				],
				"max_tokens": 2000
			})
		}); // ./fetch
		// let response = await openai.createChatCompletion({
		//     model: "gpt-3.5-turbo", // "text-davinci-003", // gpt-4
		//     //   prompt: "Say this is a test",
		//     //   temperature: 0,
		//     //   max_tokens: 7,
		//     messages
		// });
		console.log(LOGTAG, "response", response);
		return response;
	};
	let prom = doChat(articleText);

	// 3. Modify page to show results
	prom.then(async r => {
		let rText = await r.text();
		console.log("rText", rText);
		let jobj = JSON.parse(rText);
		let tellMe;
		if (jobj.error) {
			tellMe = "" + jobj.error;
		} else {
			tellMe = jobj.choices[0].message.content;
			if (tellMe.includes("Bias Level: N/A")) {
				console.log(LOGTAG, "N/A", tellMe);
				return;
			}
		}
		tellMe = tellMe.replace(/["`]/g, "'");
		tellMe = tellMe.replace(/\n/g, "<br/>\n");
		// TODO a close button
		let infoPop = document.createElement("div");
		infoPop.setAttribute("class", "_quality_infopop");
		let closeButton = document.createElement("div");
		closeButton.innerHTML = "x";
		closeButton.setAttribute("class", "_quality_closebutton");
		closeButton.onclick = e => {
			console.log("close");
			infoPop.setAttribute("style", "display:none");
		};
		infoPop.appendChild(closeButton);
		let p = document.createElement("p");
		p.innerHTML = tellMe;
		infoPop.appendChild(p);
		// NB: link to potions doesnt work in content-script -- would need to use messaging
		$("body").append(infoPop);
	});
} // ./doAnalyse
// activate after page load
setTimeout(doAnalyse, 500);
// allow for manual activation
chrome.runtime.onMessage.addListener(msg => {
	console.log(LOGTAG, "msg",msg);
	if (msg==="doAnalyse") doAnalyse({force:true});
});

chrome.tabs.sendMessage(tab[0].id, "doAnalyse");

function showSettingsPage() {
	console.log(LOGTAG, "showSettingsPage");
	if (document.getElementsByClassName("gpt3_prompter___settings-popup").length > 0) {
		document.getElementsByClassName("gpt3_prompter___settings-popup")[0].focus();
		return;
	}

	var settingsPopup = document.createElement('div');
	settingsPopup.className = "gpt3_prompter___settings-popup";

	let title = document.createElement('h3');
	title.innerHTML = "Bias Detector Plugin";

	var input = document.createElement('input');
	input.className = "gpt3_prompter___input-field";
	input.placeholder = 'Enter your OpenAI API key';
	input.style.width = '80%';
	input.style.height = '30px';
	input.style.margin = '10px';
	input.style.padding = '10px';

	var hint = document.createElement('p');
	hint.className = "gpt3_prompter___gray-text";
	hint.innerHTML = "You can change it later in the extension's popup menu.";


	var get_api_key = document.createElement('button');
	get_api_key.className = "gpt3_prompter___button";
	get_api_key.setAttribute('autocomplete', 'off');
	get_api_key.innerHTML = 'Get API key';


	var saveBtn = document.createElement('button');
	saveBtn.className = "gpt3_prompter___button";
	saveBtn.innerHTML = "Save";

	appendChildren(settingsPopup, [title, input, hint, get_api_key, saveBtn]);
	let body = document.getElementsByTagName("body")[0];
	console.log("document", document, "body", body);
	body.appendChild(settingsPopup);
	console.log("showSettingsPage appended");

	input.focus();

	get_api_key.addEventListener('click', function () {
		window.open('https://beta.openai.com/account/api-keys');
	});

	saveBtn.addEventListener('click', function () {
		kvstore.set("openai_api_key", input.value);
		//   chrome.storage.sync.set({ api_key: input.value }, function () {
		settingsPopup.remove();
		//   });
	});

	input.addEventListener('keydown', function (e) {
		if (e.ctrlKey && e.key == "Enter") {
			saveBtn.click();
		}
	});

}

function appendChildren(parent, children) {
	children.forEach(child => parent.appendChild(child));
}

setTimeout(async () => {
	console.log(LOGTAG, "setup?");
	let apiKey = await kvstore.get("openai_api_key");
	if (!apiKey) showSettingsPage();
}, 100);

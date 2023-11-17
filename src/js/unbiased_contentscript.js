// load the kvstore options manager
import kvstore from './kvstore';
import { getDomain } from './base/utils/miscutils';
// import {addScript} from './base/utils/miscutils';
import $ from 'jquery';
// import _ from 'lodash';
const Cookies = require('js-cookie');

const LOGTAG = "Q-extension";
console.log(LOGTAG, "Hello from Quality :)", window, document);
// console.log(LOGTAG, "CMP?", kvstore.get("cmp"));

// // userlist is domain: {off:true} to whitelist domains
// // What are vendorlist and allowlist??
// chrome.storage.local.get(['vendorlist', 'allowlist', 'userlist'], function(result) {
// 	console.log(LOGTAG, "CMP storage local load: ", result);
// 	const domain = getDomain();
// 	if (result.userlist[domain] || result.allowlist[domain] || !kvstore.get("cmp")) {
// 		console.log(LOGTAG, "Website allowed! Q turned off.");
// 		return;
// 	}
// }); 
const doAnalyse = async () => {
	let ignorelist = await kvstore.get("ignorelist");
	let domain = getDomain()
	if (ignorelist && ignorelist.includes(domain)) {
		console.log(LOGTAG, "skip " + domain);
		return;
	}
	// 1. Get page text
	console.log(LOGTAG, window, window.document);
	// BBC
	let articleText = $("article").text() || window.document.textContent
		|| window.document.body.innerText
		|| $(window.document).text();
	console.log(LOGTAG, "articleText", articleText, window.document.textContent);

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
	let model = await kvstore.get("gpt_model");
	if (!model) model = "gpt-4"; //"gpt-4-1106-preview"; // "text-davinci-003";
	let content = await kvstore.get("prompt");
	if ( ! content) {
		content = 
`You are a media analyst evaluating articles and web-pages for bias, manipulation, and logical fallacies. 
When sent an article or web-page you respond with a 'Media Analyst Response' which is:
Bias Level: objective or slight bias or strong bias or N/A
Biased For: keywords of subjects that the article unfairly promotes
Biased Against: keywords of subjects that the article unfairly attacks
Bias Summary: a short sentence summarising bias in the article
Manipulation Warnings: upto 3 sentences where a rhetorical device or logical fallacy is used to manipulate the reader.			
Evidence Given for Key Points: yes or partly or no
Distinction between fact and opinion: clear or unclear
Political leaning: left-wing or right-wing or neutral`;
		kvstore.set("prompt", content);
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
		// articleText = "Putin's evil attacks are a threat to democracy. The former KGB spy-master is a scorpion.";
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
						content},
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
	prom.then(r => {
		let rTextPromise = r.text();
		console.log("r", r, rTextPromise);
		rTextPromise.then(rText => {
			console.log("rText", rText);
			let tellMe = JSON.parse(rText).choices[0].message.content;
			if (tellMe.includes("Bias Level: N/A")) {
				console.log(LOGTAG, "N/A", tellMe);
				return;
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
			$("body").append(infoPop);
		});
	});
} // ./doAnalyse

setTimeout(doAnalyse, 1000);


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

setTimeout(() => {
	console.log(LOGTAG, "setup?");
	let apiKey = kvstore.get("openai_api_key");
	if (!apiKey) showSettingsPage();
}, 100);

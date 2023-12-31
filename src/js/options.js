import { getDomain } from "./base/utils/miscutils";
import kvstore from "./kvstore";
import {getOptionData, setOptionData} from "./data";

let input_openai_api_key = document.getElementById('openai_api_key');
let input_gpt_model = document.getElementById('gpt_model');
let input_prompt = document.getElementById('prompt');
let whitelistUL = document.getElementById('whitelist');

async function save_options() {
	let setted = await kvstore.set("openai_api_key", input_openai_api_key.value);
	await setOptionData("gpt_model", input_gpt_model.value);
	await setOptionData("prompt", input_prompt.value);
	// Update status to let user know options were saved.
	let status = document.getElementById('status');
	status.textContent = 'Preferences saved!';
	setTimeout(function () {
		status.textContent = '';
	}, 1000);
};

async function load_options() {
	console.log("load_options");
	let apiKey = await kvstore.get("openai_api_key");
	console.log("apiKey", apiKey);
	if (apiKey) input_openai_api_key.value = apiKey;
	let gpt_model = await getOptionData("gpt_model");
	if (gpt_model) input_gpt_model.value = gpt_model;
	let prompt = await getOptionData("prompt");
	if (prompt) input_prompt.value = prompt;
	let ignorelist = await getOptionData("ignorelist");
	if ( ! ignorelist) ignorelist = [];

	// make LI item fn
	let appendWhitelistLI = (domain) => {
		let $li = document.createElement("li");
		$li.textContent = domain;
		whitelistUL.appendChild($li);
		// remove button
		let $rm = document.createElement("button");
		$rm.className = "btn btn-outline-danger";
		$rm.textContent = "x";
		$rm.title = "Remove from allow-list";
		$rm.onclick = () => {
			ignorelist = ignorelist.filter(d => d !== domain);
			setOptionData("ignorelist", ignorelist);
			renderWhitelist();
		};
		$li.appendChild($rm);
	};

	const renderWhitelist = () => {
		if ( ! ignorelist.length) {
			let $li = document.createElement("li");
			$li.textContent = "No ignore-List sites";
			whitelistUL.appendChild($li);
		}
		ignorelist.forEach(appendWhitelistLI);
	};
	renderWhitelist();
	// wire up add control
	let $addToWhitelist = document.getElementById('addToWhitelist');
	$addToWhitelist.onchange = e => {
		let domain = $addToWhitelist.value;
		console.log("Add to ignorelist", domain, e);
		if (!domain) return;
		console.log("domain", domain, getDomain(domain));
		ignorelist.push(domain);
		$addToWhitelist.value = "";
		setOptionData("ignorelist", ignorelist);
		renderWhitelist();
	};
} // ./load_options()

document.getElementById('save').addEventListener('click', save_options);
window.onload = load_options();

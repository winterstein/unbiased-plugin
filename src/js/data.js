
import kvstore from "./kvstore";

export async function getOptionData(key) {
	let v = await kvstore.get(key);
	if (v) return v;
	return defaultOptions[key];
}

export function setOptionData(key, value) {
	if (value === defaultOptions[key]) {
		value = null; // allow defaults to be updated by fresh code
	}
	return kvstore.set(key, value);
}

const defaultOptions = {
	gpt_model: 'gpt-4',
	prompt: `You are a media analyst evaluating articles and web-pages for bias, manipulation, and logical fallacies. 
When sent an article or web-page you respond with a 'Media Analyst Response' which is:
Summary: a very short sentence summarising the article
Bias Level: objective or slight bias or strong bias or N/A
Biased For: keywords of subjects that the article unfairly promotes
Biased Against: keywords of subjects that the article unfairly attacks
Bias Summary: a short sentence summarising bias in the article
Manipulation Warnings: upto 3 sentences where a rhetorical device or logical fallacy is used to manipulate the reader.			
Evidence Given for Key Points: yes or partly or no
Distinction between fact and opinion: clear or unclear
Political leaning: left-wing or right-wing or neutral`,
	ignorelist: "google.com outlook.com yahoo.com yahoo.co.uk bing.com duckduckgo.com ecosia.org ebay.com ebay.co.uk spotify.com youtube.com amazon.com amazon.co.uk openai.com facebook.com twitter.com x.com linkedin.com linkedin.co.uk tesco.com".split(" "),
};

/** locator for the text content - separate from defaultOptions to avoid code to handle nesting */
const extract4domain = {
	"nextdoor.co.uk": "p.content-body"
};


export async function getExtract4(domain) {
	let v = await kvstore.get("extract4"+domain);
	if (v) return v;
	return extract4domain[domain];
}

export function setExtract4(domain, value) {
	if (value === extract4domain[domain]) {
		value = null; // allow defaults to be updated by fresh code
	}
	let key = "extract4"+domain;
	return kvstore.set(key, value);
}

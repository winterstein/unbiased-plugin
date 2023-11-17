# Unbiased Chrome Plugin

A chrome browser extension for detecting bias and manipulation in web content.

## Installation (Chrome)

1. Clone this repository   
	`git clone https://github.com/winterstein/unbiased-plugin.git`
2. Go to `chrome://extensions/` in your browser.
3. Enable developer mode.
4. Click "Load unpacked"
5. Select the cloned repository folder.

The core functions should work automatically.

(optional) Pin the extension in the toolbar, for access to extra functions.

The prompt and other details can be edited in the extension options page.
Access this via the extension toolbar button, or via the chrome "Manage Extensions" settings page.

### For Development

1. Switch to the dev bracnch: `git checkout dev`
2. `npm i`
3. `npm run compile` (or `watch.sh`)
4. Put <chrome://extensions/> in your browser
5. ...Switch on Developer Mode (it's a toggle in the top-right)
6. ...Click on "Load Unpacked"
7. ...Pick the `unbiased-plugin/extension` folder to load.

Publish here: https://chrome.google.com/webstore/devconsole/

## Future Work

Support for site-specific article-text extraction.
Support for Facebook and other social media with several separate posts per page.

Default exclusions: google, outlook

A button to activate for e.g. emails

Test with Playwright?
https://playwright.dev/docs/chrome-extensions#headless-mode

Mobile app browser

Cross-browser - see: 
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension

## License Notes

Based on an idea by Seb Mhatre.

This plugin includes code (c) Good-Loop from the Cookie-Cutter browser plugin, used under the MIT License.

/**
 * This code initialise __tcfapi on websites with default rejection
 */

// prevent instance of babel polyfill to be loaded twice
global._babelPolyfill = false; 

console.log("HELLO FROM inject.js", document);

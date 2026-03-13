/**
 * Injects dark background into Expo-generated index.html so first paint is never white.
 * Run after: npx expo export --platform web
 */
const fs = require("fs");
const path = require("path");

const distIndex = path.join(__dirname, "..", "dist", "index.html");
const WEB_BG = "#0A0A0A";
const styleBlock = `<style>html,body{background:${WEB_BG}!important;margin:0;min-height:100vh;}body *{box-sizing:border-box;}#root,.root{background:${WEB_BG}!important;min-height:100vh!important;display:flex!important;flex-direction:column!important;}</style>`;

if (!fs.existsSync(distIndex)) {
  console.warn("patch-index: dist/index.html not found, skipping");
  process.exit(0);
}

let html = fs.readFileSync(distIndex, "utf8");
if (html.includes("0A0A0A")) {
  console.log("patch-index: dark style already present");
  process.exit(0);
}

if (html.includes("<head>")) {
  html = html.replace("<head>", "<head>" + styleBlock);
} else if (html.includes("<head ")) {
  html = html.replace(/<head(\s[^>]*)>/, "<head$1>" + styleBlock);
} else {
  console.warn("patch-index: no <head> found");
  process.exit(0);
}

fs.writeFileSync(distIndex, html);
console.log("patch-index: injected dark background into index.html");

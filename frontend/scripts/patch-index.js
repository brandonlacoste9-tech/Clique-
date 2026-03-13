/**
 * Injects dark background and a visible loading fallback into Expo-generated
 * index.html so first paint is never a blank black screen.
 * Run after: npx expo export --platform web
 */
const fs = require("fs");
const path = require("path");

const distIndex = path.join(__dirname, "..", "dist", "index.html");
const WEB_BG = "#0A0A0A";
const GOLD = "#D4AF37";

const styleBlock = `<style>html,body{background:${WEB_BG}!important;margin:0;padding:0;min-height:100vh;height:100%;}body *{box-sizing:border-box;}#root,.root{background:${WEB_BG}!important;min-height:100vh!important;height:100%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:100%!important;}#root>*,.root>*{flex:1!important;min-height:100vh!important;display:flex!important;flex-direction:column!important;width:100%!important;}</style>`;

const loadingFallback = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;width:100%;background:${WEB_BG};"><p style="color:${GOLD};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:1.25rem;letter-spacing:0.05em;">Loading ChatSnap\u2026</p></div>`;

if (!fs.existsSync(distIndex)) {
  console.warn("patch-index: dist/index.html not found, skipping");
  process.exit(0);
}

let html = fs.readFileSync(distIndex, "utf8");

// --- Inject <style> into <head> ---
if (html.includes("<head>")) {
  html = html.replace("<head>", "<head>" + styleBlock);
} else if (html.includes("<head ")) {
  html = html.replace(/<head(\s[^>]*)>/, "<head$1>" + styleBlock);
} else {
  console.warn("patch-index: no <head> found");
  process.exit(0);
}

// --- Ensure <script> tags load as ES modules so import.meta works ---
html = html.replace(
  /<script(?=\s)((?!type\s*=)[^>]*)src=/g,
  '<script type="module"$1src='
);
console.log("patch-index: converted script tags to type=\"module\"");

// --- Inject loading fallback inside #root (or .root) ---
// React will replace the contents of #root when it mounts.
if (html.includes('id="root"')) {
  html = html.replace(/(<div\s+id="root"[^>]*>)(\s*<\/div>)/, `$1${loadingFallback}$2`);
  console.log("patch-index: injected loading fallback into #root");
} else if (html.includes('class="root"')) {
  html = html.replace(/(<div\s+class="root"[^>]*>)(\s*<\/div>)/, `$1${loadingFallback}$2`);
  console.log("patch-index: injected loading fallback into .root");
} else {
  console.warn("patch-index: no #root or .root div found, loading fallback skipped");
}

fs.writeFileSync(distIndex, html);
console.log("patch-index: injected dark background into index.html");

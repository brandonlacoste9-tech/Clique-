/**
 * Injects dark background, theme-color meta, and a visible loading fallback
 * into Expo-generated index.html so first paint is never a blank black screen.
 *
 * Run after:  npx expo export --platform web
 *
 * What it patches:
 *   1. <meta name="theme-color"> in <head> (dark browser chrome on mobile)
 *   2. Critical CSS in <head> (dark bg + full-viewport root)
 *   3. Loading spinner fallback inside #root / .root (replaced by React on mount)
 */
const fs = require("fs");
const path = require("path");

const distIndex = path.join(__dirname, "..", "dist", "index.html");
const WEB_BG = "#0A0A0A";
const GOLD = "#D4AF37";

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

const themeColorMeta = `<meta name="theme-color" content="${WEB_BG}">`;

const styleBlock = [
  "<style>",
  `html,body{background:${WEB_BG}!important;margin:0;padding:0;min-height:100vh;height:100%;}`,
  "body *{box-sizing:border-box;}",
  `#root,.root{background:${WEB_BG}!important;min-height:100vh!important;height:100%!important;`,
  "display:flex!important;flex-direction:column!important;width:100%!important;}",
  "#root>*,.root>*{flex:1!important;min-height:100vh!important;display:flex!important;",
  "flex-direction:column!important;width:100%!important;}",
  `@keyframes cs-pulse{0%,100%{opacity:.6}50%{opacity:1}}`,
  "</style>",
].join("");

const loadingFallback = [
  `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;`,
  `min-height:100vh;width:100%;background:${WEB_BG};">`,
  `<p style="color:${GOLD};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,`,
  `sans-serif;font-size:1.25rem;letter-spacing:.05em;animation:cs-pulse 1.8s ease-in-out infinite">`,
  `Loading ChatSnap\u2026</p></div>`,
].join("");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function injectIntoHead(html, fragment) {
  if (html.includes("<head>")) {
    return html.replace("<head>", "<head>" + fragment);
  }
  const match = html.match(/<head(\s[^>]*)>/);
  if (match) {
    return html.replace(match[0], match[0] + fragment);
  }
  return null;
}

function injectIntoRoot(html) {
  for (const attr of ['id="root"', 'class="root"']) {
    if (!html.includes(attr)) continue;

    const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Only replace empty / whitespace-only root divs (what Expo generates)
    const re = new RegExp(`(<div\\s+${escaped}[^>]*>)(\\s*)(<\\/div>)`);
    const m = html.match(re);
    if (m) {
      html = html.replace(re, `$1${loadingFallback}$3`);
      const label = attr.startsWith("id") ? "#root" : ".root";
      console.log(`patch-index: injected loading fallback into ${label}`);
      return html;
    }
  }
  const hasRoot = html.includes('id="root"') || html.includes('class="root"');
  if (hasRoot) {
    console.log("patch-index: root div already has content, loading fallback skipped");
  } else {
    console.warn("patch-index: no #root or .root div found, loading fallback skipped");
  }
  return html;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

try {
  if (!fs.existsSync(distIndex)) {
    console.warn("patch-index: dist/index.html not found, skipping");
    process.exit(0);
  }

  let html = fs.readFileSync(distIndex, "utf8");
  const originalSize = html.length;

  // 1. <meta name="theme-color">
  if (!html.includes('name="theme-color"')) {
    const result = injectIntoHead(html, themeColorMeta);
    if (result) {
      html = result;
      console.log("patch-index: added theme-color meta");
    }
  }

  // 2. Critical CSS
  const cssResult = injectIntoHead(html, styleBlock);
  if (cssResult) {
    html = cssResult;
    console.log("patch-index: injected dark background styles");
  } else {
    console.warn("patch-index: no <head> found — could not inject styles");
    process.exit(0);
  }

  // 3. Loading fallback inside root div
  html = injectIntoRoot(html);

  fs.writeFileSync(distIndex, html);
  console.log(
    `patch-index: done (${originalSize} → ${html.length} bytes)`
  );
} catch (err) {
  console.error("patch-index: failed —", err.message);
  process.exit(1);
}

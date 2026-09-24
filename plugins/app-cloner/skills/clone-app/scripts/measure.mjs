#!/usr/bin/env node
/**
 * Screenshot a website and measure its real design tokens.
 *
 *   node measure.mjs <url> <outDir> [--mobile] [--wait=ms]
 *
 * Writes <outDir>/<host>-desktop.png (viewport), -full.png (full page), optional -mobile.png,
 * and <outDir>/<host>-tokens.json: CSS custom properties on :root, the most used background /
 * text / border colours (weighted by element area), font families and sizes, border radii, and
 * the size of header/nav/aside/footer landmarks.
 *
 * Playwright is resolved from the project, then from the global npm root. In cloud sessions a
 * Chromium build is preinstalled (PLAYWRIGHT_BROWSERS_PATH) — never run `playwright install` there.
 */
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [url, outDir = "docs/clone/reference", ...flags] = process.argv.slice(2);
if (!url) {
  console.error("usage: node measure.mjs <url> <outDir> [--mobile] [--wait=ms]");
  process.exit(1);
}
const wait = Number(flags.find((f) => f.startsWith("--wait="))?.split("=")[1] ?? 4000);

function loadPlaywright() {
  const req = createRequire(path.join(process.cwd(), "package.json"));
  try {
    return req("playwright");
  } catch {}
  try {
    return req("@playwright/test");
  } catch {}
  const root = execSync("npm root -g").toString().trim();
  return createRequire(path.join(root, "noop.js"))(path.join(root, "playwright"));
}

const { chromium, devices } = loadPlaywright();
mkdirSync(outDir, { recursive: true });
const host = new URL(url).hostname.replace(/^www\./, "");
const launch = {};
if (process.env.PLAYWRIGHT_BROWSERS_PATH === undefined && process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(launch);

async function shoot(ctxOpts, suffix) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: path.join(outDir, `${host}-${suffix}.png`) });
  if (suffix === "desktop") await page.screenshot({ path: path.join(outDir, `${host}-full.png`), fullPage: true });
  return { ctx, page };
}

const { ctx, page } = await shoot({ viewport: { width: 1440, height: 900 } }, "desktop");

const tokens = await page.evaluate(() => {
  const toHex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return c;
    const [r, g, b, a = "1"] = m[1].split(/[ ,/]+/).filter(Boolean);
    const hex = "#" + [r, g, b].map((v) => Number(v).toString(16).padStart(2, "0")).join("").toUpperCase();
    return Number(a) < 1 ? `${hex} @${Number(a).toFixed(2)}` : hex;
  };
  const vars = {};
  for (const sheet of [...document.styleSheets]) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const r of rules) {
      if (r.selectorText && /(^|,)\s*(:root|html|body|\.dark|\[data-theme)/.test(r.selectorText)) {
        for (const prop of r.style) if (prop.startsWith("--")) vars[prop] = r.style.getPropertyValue(prop).trim();
      }
    }
  }
  const rootStyle = getComputedStyle(document.documentElement);
  for (const k of Object.keys(vars)) vars[k] = rootStyle.getPropertyValue(k).trim() || vars[k];

  const tally = (map, key, w) => key && map.set(key, (map.get(key) ?? 0) + w);
  const bg = new Map(), text = new Map(), border = new Map(), fonts = new Map(), sizes = new Map(), radii = new Map();
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight * 2) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") continue;
    const area = r.width * r.height;
    if (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor)) tally(bg, toHex(s.backgroundColor), area);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText) {
      tally(text, toHex(s.color), 1);
      tally(fonts, s.fontFamily, 1);
      tally(sizes, `${s.fontSize}/${s.fontWeight}`, 1);
    }
    if (parseFloat(s.borderTopWidth) > 0) tally(border, toHex(s.borderTopColor), r.width);
    if (parseFloat(s.borderTopLeftRadius) > 0) tally(radii, s.borderTopLeftRadius, 1);
  }
  const top = (m, n = 10) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, weight: Math.round(v) }));
  const landmarks = {};
  for (const sel of ["header", "nav", "aside", "footer", "main", "[role=toolbar]", "[role=navigation]"]) {
    const els = [...document.querySelectorAll(sel)].slice(0, 4);
    if (els.length) landmarks[sel] = els.map((e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bg: toHex(s.backgroundColor) };
    });
  }
  const b = getComputedStyle(document.body);
  return {
    page: { title: document.title, bodyBg: toHex(b.backgroundColor), bodyColor: toHex(b.color), bodyFont: b.fontFamily, viewport: [innerWidth, innerHeight] },
    cssVariables: vars,
    backgrounds: top(bg),
    textColors: top(text),
    borders: top(border, 6),
    fonts: top(fonts, 5),
    fontSizes: top(sizes, 12),
    radii: top(radii, 6),
    landmarks,
  };
});

if (flags.includes("--mobile")) {
  const m = await shoot({ ...devices["iPhone 13"] }, "mobile");
  await m.ctx.close();
}
await ctx.close();
await browser.close();
writeFileSync(path.join(outDir, `${host}-tokens.json`), JSON.stringify({ url, capturedAt: new Date().toISOString(), ...tokens }, null, 2));
console.log(`saved ${host}-desktop.png, ${host}-full.png${flags.includes("--mobile") ? `, ${host}-mobile.png` : ""} and ${host}-tokens.json in ${outDir}`);

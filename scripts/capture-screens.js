/**
 * Capture real SkoolConnectNG screens as PNGs for the films to animate.
 *
 *   node scripts/capture-screens.js
 *
 * Two captures per route:
 *
 *   screens/<name>.png       the viewport exactly — one phone screen
 *   screens/<name>-full.png  the whole scrollable page
 *
 * The full-page one is the useful one. Dropped into the phone shell and
 * translated on Y by frame, it *is* a scroll animation — real content, real
 * type, real spacing, moving the way the app moves. The viewport capture is
 * for beats that just hold on a screen.
 *
 * Captures at deviceScaleFactor 3, so a 390pt-wide screen lands at 1170px.
 * The phone in a 1080p frame is around 470px wide, so 3x leaves headroom to
 * push in on a card without the text turning to mush. Do not capture at 1x.
 *
 * ── Two ways to run it ────────────────────────────────────────────────────
 *
 * A. puppeteer-core (needed for anything behind a login)
 *
 *      npm i -D --save-exact puppeteer-core
 *      powershell -File scripts\restore-binaries.ps1   # installs re-infect
 *
 *    puppeteer-core ships no browser — it drives the Chrome already on this
 *    machine, which is the point: no 150 MB download, and one small pure-JS
 *    package rather than a binary for the infector to find.
 *
 * B. No install at all (public routes only)
 *
 *    Falls back to Chrome's own headless screenshot flag. It cannot log in,
 *    cannot wait for a selector, and cannot capture full-page — so it is only
 *    useful for pages that render signed-out.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

/* ── Configure this ───────────────────────────────────────────────────── */

const CONFIG = {
  /** Where the app is running. A local dev server gives the best fidelity. */
  baseUrl: process.env.SKNG_URL ?? "http://localhost:3000",

  /** Route -> output name. Add the screens the film actually needs. */
  routes: {
    "/feed": "feed",
    "/network": "network",
    "/messages": "inbox",
    "/resources": "resources",
    "/discover": "discover",
    "/profile": "profile",
  },

  /** iPhone 14-ish logical size. 3x gives 1170x2532 of real pixels. */
  viewport: { width: 390, height: 844, deviceScaleFactor: 3 },

  /**
   * Session for authenticated routes.
   *
   * Easiest reliable route: log into the app in your own Chrome, copy the
   * session cookie out of DevTools > Application > Cookies, and paste it here.
   * Scripted form-filling breaks every time the login page changes.
   */
  cookies: [
    // { name: "session", value: "...", domain: "localhost", path: "/" },
  ],

  /** Anything to drop into localStorage before the first paint. */
  localStorage: {
    // "skng.theme": "light",
  },

  /**
   * Give the page a beat after network idle. Lists that animate in on mount
   * will otherwise be captured mid-entrance, which looks like a broken layout
   * rather than a screenshot.
   */
  settleMs: 900,

  outDir: path.resolve(__dirname, "..", "public", "screens"),

  chrome:
    process.env.CHROME_PATH ??
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
};

/* ── Path A: puppeteer-core ───────────────────────────────────────────── */

const captureWithPuppeteer = async (puppeteer) => {
  if (!fs.existsSync(CONFIG.chrome)) {
    throw new Error(
      `Chrome not found at ${CONFIG.chrome}. Set CHROME_PATH to its location.`,
    );
  }

  const browser = await puppeteer.launch({
    executablePath: CONFIG.chrome,
    headless: "new",
    args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);

    if (CONFIG.cookies.length > 0) await page.setCookie(...CONFIG.cookies);

    if (Object.keys(CONFIG.localStorage).length > 0) {
      await page.evaluateOnNewDocument((entries) => {
        for (const [k, v] of Object.entries(entries)) {
          try {
            window.localStorage.setItem(k, v);
          } catch {
            /* private mode, or storage disabled - not worth failing over */
          }
        }
      }, CONFIG.localStorage);
    }

    for (const [route, name] of Object.entries(CONFIG.routes)) {
      const url = new URL(route, CONFIG.baseUrl).toString();
      process.stdout.write(`  ${name.padEnd(12)} ${url} ... `);

      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
        await new Promise((r) => setTimeout(r, CONFIG.settleMs));

        const viewportPath = path.join(CONFIG.outDir, `${name}.png`);
        const fullPath = path.join(CONFIG.outDir, `${name}-full.png`);

        await page.screenshot({ path: viewportPath, fullPage: false });
        await page.screenshot({ path: fullPath, fullPage: true });

        const h = await page.evaluate(() => document.body.scrollHeight);
        console.log(
          `ok (viewport + full page, ${h}pt tall = ${h * CONFIG.viewport.deviceScaleFactor}px)`,
        );
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
  }
};

/* ── Path B: Chrome's own screenshot flag ─────────────────────────────── */

const captureWithChromeCli = () => {
  const { width, height, deviceScaleFactor } = CONFIG.viewport;

  console.log(
    "puppeteer-core is not installed - falling back to Chrome's headless\n" +
      "screenshot flag. This cannot log in, cannot wait for content, and\n" +
      "cannot capture full-page, so authenticated routes will come back as\n" +
      "the sign-in screen.\n",
  );

  for (const [route, name] of Object.entries(CONFIG.routes)) {
    const url = new URL(route, CONFIG.baseUrl).toString();
    const out = path.join(CONFIG.outDir, `${name}.png`);
    process.stdout.write(`  ${name.padEnd(12)} ${url} ... `);
    try {
      execFileSync(
        CONFIG.chrome,
        [
          "--headless",
          "--disable-gpu",
          "--hide-scrollbars",
          `--force-device-scale-factor=${deviceScaleFactor}`,
          `--window-size=${width},${height}`,
          `--screenshot=${out}`,
          "--virtual-time-budget=8000",
          url,
        ],
        { stdio: "pipe", timeout: 60000 },
      );
      console.log(`ok (viewport only, ${fs.statSync(out).size} bytes)`);
    } catch (err) {
      console.log(`FAILED: ${err.message.split("\n")[0]}`);
    }
  }
};

/* ── Run ──────────────────────────────────────────────────────────────── */

const main = async () => {
  fs.mkdirSync(CONFIG.outDir, { recursive: true });
  console.log(`capturing ${CONFIG.baseUrl} -> ${CONFIG.outDir}`);
  console.log(
    `viewport ${CONFIG.viewport.width}x${CONFIG.viewport.height} @${CONFIG.viewport.deviceScaleFactor}x ` +
      `= ${CONFIG.viewport.width * CONFIG.viewport.deviceScaleFactor}x${CONFIG.viewport.height * CONFIG.viewport.deviceScaleFactor}px\n`,
  );

  let puppeteer = null;
  try {
    puppeteer = require("puppeteer-core");
  } catch {
    /* not installed - fall through to the CLI path */
  }

  if (puppeteer) await captureWithPuppeteer(puppeteer);
  else captureWithChromeCli();

  console.log(
    `\nDone. Reference them from a composition with staticFile("screens/<name>-full.png").`,
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

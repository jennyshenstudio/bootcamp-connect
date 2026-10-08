// D028: the built site (dist/) is an installable web app that works offline and runs under a
// Content Security Policy. This suite builds dist/ itself and serves it over http, because
// service workers and manifests don't work on file:// pages.
const fs = require('fs');
const path = require('path');
const { ROOT, signUp, sleep } = require('./helpers');

module.exports = async (browser, t) => {
  const { build } = await import('../scripts/build.mjs');
  const { serve } = await import('../scripts/serve.mjs');
  const { version, precache } = build();
  const DIST = path.join(ROOT, 'dist');

  // ---- Build output ----
  const sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  t.ok('build stamps index.html and sw.js with the same version', html.includes(`data-build="${version}"`) && sw.includes(`const VERSION = '${version}';`));
  t.ok('built page has a Content Security Policy with no inline script', /http-equiv="Content-Security-Policy"[^>]*script-src 'self'/.test(html) && !/script-src[^;]*'unsafe-inline'/.test(html));
  t.ok('offline list covers the page, styles, scripts and manifest',
    ['./', 'index.html', 'css/app.css', 'css/tailwind.css', 'js/actions.js', 'js/app.js', 'manifest.webmanifest', 'assets/icons/icon-192.png'].every(f => precache.includes(f)));
  t.ok('offline list leaves out tests, docs and the large pdf.js files',
    !precache.some(f => /^(tests|docs|specs|vendor)\//.test(f)) && fs.existsSync(path.join(DIST, 'vendor/pdfjs/3.11.174/pdf.min.js')));
  t.ok('source index.html has no build stamp, so the service worker is off while developing', !fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').includes('data-build'));

  const server = await serve(DIST);
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.evaluateOnNewDocument(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', e => window.__cspViolations.push(e.violatedDirective + ' ' + e.blockedURI));
  });
  await page.setViewport({ width: 390, height: 844 });

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });

    // ---- Manifest and icons ----
    const manifest = await page.evaluate(async () => {
      const href = document.querySelector('link[rel=manifest]').href;
      const m = await (await fetch(href)).json();
      const icons = await Promise.all(m.icons.map(i => new Promise(done => {
        const img = new Image();
        img.onload = () => done({ ...i, w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => done({ ...i, w: 0, h: 0 });
        img.src = new URL(i.src, href).href;
      })));
      return { m, icons };
    });
    const { m, icons } = manifest;
    t.ok('manifest has a name, start page, standalone display and theme colour',
      m.name === 'Bootcamp Connect' && m.short_name && m.start_url === './' && m.display === 'standalone' && m.theme_color && m.lang === 'en-GB');
    const png = icons.filter(i => i.type === 'image/png');
    t.ok('manifest icons load at their stated sizes',
      png.length >= 3 && png.every(i => i.sizes === i.w + 'x' + i.h), JSON.stringify(png.map(i => i.src + ' ' + i.w)));
    t.ok('there are 192px and 512px icons and a maskable icon',
      png.some(i => i.sizes === '192x192') && png.some(i => i.sizes === '512x512' && i.purpose === 'any') && png.some(i => i.purpose === 'maskable'));
    t.ok('phone home screen tags are set (theme colour, Apple touch icon)',
      await page.$('meta[name="theme-color"]') !== null && await page.$eval('link[rel="apple-touch-icon"]', l => l.href.endsWith('apple-touch-icon.png')));

    // ---- Service worker ----
    const scope = await page.evaluate(() => Promise.race([
      navigator.serviceWorker.ready.then(r => r.scope),
      new Promise(r => setTimeout(() => r(null), 8000)),
    ]));
    t.ok('service worker installs for the whole site', scope === url, String(scope));
    await page.reload({ waitUntil: 'networkidle0' });
    t.ok('service worker controls the page after a reload', await page.evaluate(() => !!navigator.serviceWorker.controller));
    const cached = await page.evaluate(async v => {
      const cache = await caches.open('bootcamp-connect-' + v);
      return (await cache.keys()).length;
    }, version);
    t.ok('app files are cached for offline use', cached >= precache.length, cached + ' of ' + precache.length);

    // ---- The app under the CSP ----
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await signUp(page);
    t.ok('sign-up works under the CSP', await page.$eval('#app-dashboard', e => !e.classList.contains('hidden')));
    await page.click('.tab-bar button[data-tab="feed"]'); await sleep(400);
    await page.click('button[data-on-click="openComposer(\'work\')"]'); await sleep(300);
    t.ok('composer opens under the CSP', await page.$('#cp-title') !== null);
    await page.keyboard.press('Escape'); await sleep(200);
    await page.evaluate(() => openViewer('p-unit-econ', 'a-ue')); await sleep(2500);
    t.ok('PDFs render with the self-hosted pdf.js', (await page.$$eval('#viewer-pdf canvas', x => x.length)) >= 1);
    await page.keyboard.press('Escape'); await sleep(200);
    await page.click('.tab-bar button[data-tab="chat"]'); await sleep(400);
    await page.$eval('#chat-list button', b => b.click()); await sleep(300);
    await page.type('#composer-input', 'Hello from the installed app');
    await page.keyboard.press('Enter'); await sleep(300);
    t.ok('messages send under the CSP', (await page.$eval('#thread-body', e => e.innerText)).includes('Hello from the installed app'));
    const violations = await page.evaluate(() => window.__cspViolations);
    t.ok('nothing is blocked by the CSP', violations.length === 0, violations.slice(0, 3).join('; '));

    // ---- Offline ----
    await page.setOfflineMode(true);
    await page.reload({ waitUntil: 'domcontentloaded' }); await sleep(1200);
    t.ok('the app opens offline, still signed in', await page.$eval('#app-dashboard', e => !e.classList.contains('hidden')));
    t.ok('offline page is fully styled (Tailwind and icons load from the cache)', await page.evaluate(() =>
      getComputedStyle(document.querySelector('.tab-bar')).position === 'fixed' &&
      getComputedStyle(document.getElementById('toast')).display === 'none' &&
      document.querySelectorAll('#icon-sprite symbol').length >= 25));
    await page.setOfflineMode(false);

    t.ok('no page errors on the built site', errors.length === 0, errors.slice(0, 3).join('; '));
  } finally {
    await page.close();
    await context.close();
    server.close();
  }
};

// Shared helpers for the browser tests. Each suite opens the app in headless Chrome and clicks
// through it like a member would. By default that's index.html from disk (file://); with
// `npm run test:dist` it's the built site in dist/, served over http with its CSP and service worker.
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_URL = 'file://' + encodeURI(path.join(ROOT, 'index.html'));
let APP_URL = SOURCE_URL;
// tests/run.js calls this with the dist/ server's address for `npm run test:dist`
function setAppUrl(url) { APP_URL = url; }
const appUrl = () => APP_URL;
const FIXTURES = path.join(__dirname, 'fixtures');
const OUTPUT = path.join(__dirname, 'output');
const CHROME = process.env.CHROME_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find(p => fs.existsSync(p));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const fixture = name => path.join(FIXTURES, name);

async function launch() {
  if (!CHROME) throw new Error('Chrome not found. Set CHROME_PATH to your Chrome or Chromium executable.');
  // Chrome refuses to start as root (Docker, some CI) without --no-sandbox
  const args = process.getuid && process.getuid() === 0 ? ['--no-sandbox'] : [];
  return puppeteer.launch({ executablePath: CHROME, headless: 'new', args });
}

// A fresh page with no saved data; page errors count as test failures.
async function openApp(browser, t, { width = 1440, height = 900, scheme = 'light', beforeLoad } = {}) {
  const page = await browser.newPage();
  page.on('pageerror', e => t.fail('page error: ' + e.message));
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
  await page.setViewport({ width, height });
  if (beforeLoad) await page.evaluateOnNewDocument(beforeLoad);
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); try { indexedDB.deleteDatabase('bc-attachments'); } catch {} });
  await page.reload({ waitUntil: 'networkidle0' });
  return page;
}

async function signUp(page, { first = 'Maya', last = 'Okafor', email = 'maya@example.com', track = 'dev' } = {}) {
  if (first) await page.type('#first-name', first);
  if (last) await page.type('#last-name', last);
  await page.type('#email', email);
  await page.type('#password', 'password123');
  await page.click('#track-' + track + ' + div');
  await page.click('#terms');
  await page.click('#auth-submit');
  await sleep(1000);
}

const visible = (page, id) => page.$eval('#' + id, e => !e.classList.contains('hidden'));
const noHorizontalScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const pageFits = page => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight);

async function screenshot(page, name) {
  fs.mkdirSync(OUTPUT, { recursive: true });
  await page.screenshot({ path: path.join(OUTPUT, name + '.png') });
}

module.exports = { ROOT, SOURCE_URL, appUrl, setAppUrl, FIXTURES, OUTPUT, sleep, fixture, launch, openApp, signUp, visible, noHorizontalScroll, pageFits, screenshot };

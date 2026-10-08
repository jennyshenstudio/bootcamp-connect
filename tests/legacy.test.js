// The archived v1 prototype (legacy/prototype-v1/) still works after being split into files (D027).
const fs = require('fs');
const path = require('path');
const { ROOT, sleep } = require('./helpers');

module.exports = async (browser, t) => {
  const dir = path.join(ROOT, 'legacy', 'prototype-v1');
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  t.ok('v1 has no inline script, style block or event handlers',
    !/<script(?![^>]*\bsrc=)[^>]*>/i.test(html) && !/<style[\s>]/i.test(html) && !/\son[a-z]+\s*=/i.test(html) && !html.includes('cdn.tailwindcss.com'));
  t.ok('v1 files exist', ['css/style.css', 'css/tailwind.css', 'js/app.js'].every(f => fs.existsSync(path.join(dir, f))));

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.goto('file://' + encodeURI(path.join(dir, 'index.html')), { waitUntil: 'networkidle0' });
  const shown = () => page.evaluate(() => [...document.querySelectorAll('.tab-content')].filter(e => !e.classList.contains('hidden')).map(e => e.id).join());
  t.ok('v1 opens on the feed, styled', await shown() === 'tab-feed' && await page.$eval('#tab-matching', e => getComputedStyle(e).display === 'none'));
  for (const tab of ['matching', 'chat', 'profile', 'feed']) {
    await page.click('#nav-' + tab); await sleep(50);
    t.ok('v1 tab switches to ' + tab, await shown() === 'tab-' + tab && await page.$eval('#nav-' + tab, e => e.classList.contains('active')));
  }
  await page.click('#nav-matching'); await sleep(50);
  await page.click('[data-action="connect"]'); await sleep(50);
  t.ok('v1 connection request button updates', (await page.$eval('[data-action="connect"]', e => e.textContent)).includes('Request Sent'));
  t.ok('v1 has no page errors', errors.length === 0, errors.join('; '));
  await page.close();
};

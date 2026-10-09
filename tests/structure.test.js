// D027: code is separated into HTML, CSS and JS, with a compiled Tailwind build.
// Checks the files themselves, then walks the app and checks what ends up in the page.
const fs = require('fs');
const path = require('path');
const { ROOT, openApp, signUp, sleep, noHorizontalScroll, pageFits } = require('./helpers');

// Class names used only as hooks for JavaScript or as Tailwind markers (group, peer).
// They intentionally have no CSS rule of their own.
const HOOK_CLASSES = new Set([
  'group', 'peer', 'upvote-count', 'auth-brand-body',
  // Named groups, so nested open/closed sections don't affect each other
  'group/work', 'group/tech', 'group/more',
]);

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
// Code without // and /* */ comments, so documentation that mentions onclick or eval doesn't count
const code = f => read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// Class names that have a rule in our stylesheets. Read from the files, because Chrome won't let a
// file:// page read its own stylesheet rules.
function definedClasses() {
  const out = new Set();
  for (const f of ['css/app.css', 'css/tailwind.css']) {
    const css = read(f).replace(/\/\*[\s\S]*?\*\//g, '');
    for (const block of css.matchAll(/([^{}]+)\{/g)) {
      if (block[1].trim().startsWith('@')) continue;
      // CSS escapes: \: \[ … and hex escapes such as \2c (a comma) followed by an optional space
      for (const m of block[1].matchAll(/\.((?:\\[0-9a-fA-F]{1,6} ?|\\.|[\w-])+)/g)) {
        out.add(m[1].replace(/\\([0-9a-fA-F]{1,6}) ?|\\(.)/g, (_, hex, ch) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : ch)));
      }
    }
  }
  return out;
}
const jsFiles = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f);

// Every class on the page, the class selectors in its stylesheets, and every data-on-* handler
async function snapshot(page) {
  return page.evaluate(() => {
    const classes = new Set();
    document.querySelectorAll('[class]').forEach(el => {
      const cls = typeof el.className === 'string' ? el.className : el.getAttribute('class');
      (cls || '').split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    });
    const inlineHandlers = [];
    document.querySelectorAll('*').forEach(el => {
      for (const a of el.attributes) if (/^on/i.test(a.name)) inlineHandlers.push(el.tagName + '[' + a.name + ']');
    });
    const actionErrors = [];
    for (const type of ACTION_EVENTS) {
      document.querySelectorAll('[data-on-' + type + ']').forEach(el => {
        try {
          for (const st of parseActions(el.getAttribute('data-on-' + type))) {
            const head = st.path[0];
            if (head !== 'this' && head !== 'event' && typeof window[head] !== 'function') actionErrors.push(head + ' is not a function');
          }
        } catch (e) { actionErrors.push(e.message); }
      });
    }
    return { classes: [...classes], inlineHandlers, actionErrors };
  });
}

module.exports = async (browser, t) => {
  // ---- Files ----
  const html = read('index.html');
  t.ok('index.html has no inline <script> code', !/<script(?![^>]*\bsrc=)[^>]*>/i.test(html));
  t.ok('index.html has no <style> block or style="" attributes', !/<style[\s>]/i.test(html) && !/\sstyle="/i.test(html));
  t.ok('index.html has no inline event handlers', !/\son[a-z]+\s*=/i.test(html));
  t.ok('Tailwind is compiled, not loaded from the CDN', !html.includes('cdn.tailwindcss.com') && html.includes('css/tailwind.css') && fs.existsSync(path.join(ROOT, 'css/tailwind.css')));
  t.ok('Tailwind utilities load after app.css', html.indexOf('css/app.css') < html.indexOf('css/tailwind.css'));
  t.ok('page language is British English', html.includes('<html lang="en-GB"'));
  const handlerFiles = jsFiles.filter(f => /(^|[^\w.-])on(click|submit|change|input|keydown|keyup|focus|blur|load|error)=\\?["']/.test(code(f)));
  t.ok('no JS file writes inline event handlers', handlerFiles.length === 0, handlerFiles.join(', '));
  const evalFiles = jsFiles.filter(f => /\beval\(|new Function\(/.test(code(f)));
  t.ok('no JS file uses eval or new Function', evalFiles.length === 0, evalFiles.join(', '));
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  const missing = jsFiles.filter(f => !scripts.includes(f));
  t.ok('every js/ file is loaded by index.html', missing.length === 0, missing.join(', '));
  t.ok('actions.js loads first, icons.js second, pwa.js last', scripts[0] === 'js/actions.js' && scripts[1] === 'js/icons.js' && scripts[scripts.length - 1] === 'js/pwa.js', scripts.join(' '));
  const linked = [...html.matchAll(/(?:href|src)="((?!https?:|#|data:)[^"]+)"/g)].map(m => m[1]);
  const broken = linked.filter(f => !fs.existsSync(path.join(ROOT, f)));
  t.ok('every local file index.html links to exists', broken.length === 0, broken.join(', '));

  // ---- Data-on handlers (js/actions.js) ----
  let page = await openApp(browser, t);
  const unit = await page.evaluate(() => {
    const out = [];
    const st = parseActions("event.stopPropagation(); removeSkill(2); f('it\\'s', -1, true, null, this.files[0], this.dataset.skill)");
    out.push(st.length === 3 && st[0].path.join('.') === 'event.stopPropagation' && st[1].args[0].value === 2);
    const a = st[2].args;
    out.push(a[0].value === "it's" && a[1].value === -1 && a[2].value === true && a[3].value === null && a[4].ref.join() === 'this,files,0' && a[5].ref.join() === 'this,dataset,skill');
    let rejected = 0;
    for (const bad of ['alert(document.cookie)', 'f(window)', 'x = 1', 'f(1) g(2)', "f('open"]) {
      try { parseActions(bad); } catch { rejected++; }
    }
    out.push(rejected === 5);
    return out;
  });
  t.ok('handler parser reads calls, strings, numbers and this/event paths', unit[0] && unit[1]);
  t.ok('handler parser rejects anything that is not a plain call', unit[2]);

  // Handlers run inside out, and stopPropagation stops outer ones
  const order = await page.evaluate(() => {
    window.__log = [];
    window.__mark = v => window.__log.push(v);
    const outer = document.createElement('div');
    outer.setAttribute('data-on-click', "__mark('outer')");
    outer.innerHTML = '<button type="button" data-on-click="__mark(\'inner\')">a</button><button type="button" data-on-click="event.stopPropagation(); __mark(\'stopped\')">b</button>';
    document.body.appendChild(outer);
    outer.children[0].click(); outer.children[1].click();
    outer.remove();
    return window.__log.join(',');
  });
  t.ok('handlers run from the element outwards; stopPropagation stops outer ones', order === 'inner,outer,stopped', order);

  // ---- Walk the app and check the live page ----
  const all = { classes: new Set(), defined: definedClasses(), inline: new Set(), action: new Set() };
  const collect = async () => {
    const s = await snapshot(page);
    s.classes.forEach(c => all.classes.add(c));
    s.inlineHandlers.forEach(h => all.inline.add(h)); s.actionErrors.forEach(e => all.action.add(e));
  };
  await collect();
  t.ok('icons are inserted from js/icons.js', await page.$$eval('#icon-sprite symbol', s => s.length) >= 25);
  await signUp(page);
  await collect(); // profile
  await page.click('button[data-on-click="switchTab(\'feed\')"]'); await sleep(400); await collect();
  await page.click('button[data-on-click="openComposer(\'work\')"]'); await sleep(400); await collect();
  await page.keyboard.press('Escape'); await sleep(300);
  await page.click('button[data-on-click="switchTab(\'matching\')"]'); await sleep(400); await collect();
  await page.click('#mm-view [data-view="people"]'); await sleep(400); await collect();
  await page.$eval('#people-grid button[data-on-click^="openPerson"]', b => b.click()); await sleep(400); await collect();
  await page.keyboard.press('Escape'); await sleep(300);
  await page.click('button[data-on-click="switchTab(\'chat\')"]'); await sleep(500);
  await page.$eval('#chat-list button', b => b.click()); await sleep(500); await collect();

  const undefinedClasses = [...all.classes].filter(c => !all.defined.has(c) && !HOOK_CLASSES.has(c)).sort();
  t.ok('every class used on screen has CSS (compiled Tailwind is complete)', undefinedClasses.length === 0, undefinedClasses.join(' '));
  t.ok('no inline event handlers appear at run time', all.inline.size === 0, [...all.inline].slice(0, 5).join(', '));
  t.ok('every data-on-* handler on screen calls a real function', all.action.size === 0, [...all.action].join('; '));
  await page.close();

  // ---- Layout with a non-Apple system font (Windows, Linux, Android) ----
  // The headline in the desktop brand panel used to wrap to four lines and push the page past one screen.
  for (const [width, height] of [[1280, 650], [1366, 768], [390, 844]]) {
    page = await openApp(browser, t, { width, height });
    await page.addStyleTag({ content: '* { font-family: Arial, "Liberation Sans", sans-serif !important; }' });
    await sleep(100);
    t.ok(`sign-up fits one screen at ${width}×${height} with a fallback font`, await pageFits(page) && await noHorizontalScroll(page),
      String(await page.evaluate(() => document.documentElement.scrollHeight)));
    await page.close();
  }
};

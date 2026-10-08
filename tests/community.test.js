// Spec 04: sample community, Connect (people), profiles, messages.
const { openApp, signUp, sleep, visible } = require('./helpers');

module.exports = async (browser, t) => {
  let page = await openApp(browser, t);
  await signUp(page);
  t.ok('Messages badge starts at 7 unread', (await page.$eval('#btn-chat [data-badge]', e => e.hidden ? '' : e.textContent)) === '7');

  await page.evaluate(() => { switchTab('matching'); setMatchmakerView('people'); }); await sleep(200);
  const count = () => page.$$eval('#people-grid article', x => x.length);
  t.ok('Connect › People shows 8 members', (await count()) === 8);
  await page.click('#people-filter [data-filter=connected]'); t.ok('5 connections', (await count()) === 5);
  await page.click('#people-filter [data-filter=suggested]'); t.ok('3 suggestions', (await count()) === 3);

  await page.evaluate(() => openPerson('elena')); await sleep(200);
  const sheet = await page.$eval('#sheet-panel', e => e.innerText);
  t.ok('profile sheet shows match reasons, verified experience, and skills to learn', sheet.includes('match with you') && sheet.includes('Verified experience') && sheet.includes('Wants to learn'));
  await page.keyboard.press('Escape');
  t.ok('Escape closes the sheet', await page.$eval('#sheet', e => e.classList.contains('hidden')));

  await page.evaluate(() => connectPerson('aisha')); await sleep(1700);
  t.ok('a connection request is accepted', await page.evaluate(() => demo.connected.aisha === true));
  await page.evaluate(() => messagePerson('aisha')); await sleep(300);
  t.ok('Message opens a new direct message', (await page.evaluate(() => openChatId)) === 'd-aisha' && await visible(page, 'tab-chat'));

  await page.evaluate(() => openChat('g-cohort')); await sleep(200);
  t.ok('opening a group clears its unread count', (await page.$eval('#btn-chat [data-badge]', e => e.textContent)) === '3');
  t.ok('group header shows 8 members', (await page.$eval('#thread-header', e => e.innerText)).includes('8 members'));
  await page.type('#composer-input', 'Count me in for Demo Day!'); await page.keyboard.press('Enter'); await sleep(1200);
  t.ok('a typing indicator appears', !!(await page.$('#thread-body .typing')));
  await sleep(1800);
  t.ok('someone replies', (await page.$$eval('#thread-body .bubble-them', x => x.length)) > 7);
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
  await page.evaluate(() => goToChat('g-cohort')); await sleep(200);
  t.ok('sent messages persist after reload', await page.$$eval('#thread-body .bubble-me', x => x.some(e => e.textContent.includes('Demo Day'))));
  await page.close();

  // On the published page Claude writes replies in the member's voice
  page = await openApp(browser, t, {
    beforeLoad: () => {
      const fn = async (prompt, opts) => { window.__prompt = prompt; window.__opts = opts; return { text: 'Priya: "Yes! Let\'s pair on the reorder flow tomorrow 💊"', truncated: false }; };
      fn.json = async () => ({});
      window.claude = { use: async name => name === 'sample' ? fn : null };
    },
  });
  await signUp(page);
  await page.evaluate(() => goToChat('g-health')); await sleep(200);
  await page.type('#composer-input', 'I finished a mockup of the one-tap reorder screen!'); await page.keyboard.press('Enter'); await sleep(3200);
  t.ok('Claude reply is cleaned of name and quotes', (await page.$$eval('#thread-body .bubble-them', x => x[x.length - 1].textContent)) === "Yes! Let's pair on the reorder flow tomorrow 💊");
  t.ok('prompt includes the profile, group, and latest message', await page.evaluate(() => /Your profile:/.test(window.__prompt) && window.__prompt.includes('reorder screen') && window.__prompt.includes('Health Tech Builders') && window.__opts.cache === false));
  await page.close();
};

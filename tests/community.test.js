// Spec 04: sample community, Connect (people), profiles, messages. Spec 10: the generated community.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, openApp, signUp, sleep, visible } = require('./helpers');

module.exports = async (browser, t) => {
  // The community file is generated, never edited by hand, and the same every time
  const fresh = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bc-community-')), 'demo-members.js');
  execFileSync('node', [path.join(ROOT, 'scripts', 'make-community.mjs'), fresh]);
  t.ok('js/demo-members.js matches what the script generates', fs.readFileSync(fresh, 'utf8') === fs.readFileSync(path.join(ROOT, 'js', 'demo-members.js'), 'utf8'));

  let page = await openApp(browser, t);
  await signUp(page);
  const community = await page.evaluate(() => {
    const cohorts = {};
    DEMO_PEOPLE.forEach(p => { cohorts[p.cohort] = (cohorts[p.cohort] || 0) + 1; });
    return {
      total: DEMO_PEOPLE.length, cohorts,
      allUK: DEMO_PEOPLE.every(p => p.location.endsWith(', UK')),
      complete: DEMO_PEOPLE.every(p => p.stage && p.cohort && p.education.length && p.skills.length),
      linksBothWays: Object.entries(DEMO_LINKS).every(([a, list]) => list.every(b => DEMO_LINKS[b].includes(a))),
      invites: DEMO_INVITES.every(i => person(i.from) && i.note),
    };
  });
  t.ok('99 sample members: 24 in Cohort 12 (25 with you) and 25 in each of Cohorts 9 to 11', community.total === 99 && community.cohorts[12] === 24 && [9, 10, 11].every(c => community.cohorts[c] === 25), JSON.stringify(community.cohorts));
  t.ok('every sample member lives in the UK', community.allUK);
  t.ok('every sample member has a stage, cohort, education and skills', community.complete);
  t.ok('connections between members go both ways', community.linksBothWays);
  t.ok('waiting connection requests come from real sample members, with a note', community.invites);
  t.ok('Messages badge starts at 7 unread', (await page.$eval('#btn-chat [data-badge]', e => e.hidden ? '' : e.textContent)) === '7');

  await page.evaluate(() => { switchTab('matching'); setMatchmakerView('people'); }); await sleep(200);
  const count = () => page.$$eval('#people-grid article', x => x.length);
  const shown = () => page.$eval('#people-count', e => e.textContent);

  // Spec 10: Invitations, then Suggested for you, then All members
  const order = await page.$$eval('#people-view > section:not(.hidden) h3', x => x.map(e => e.textContent));
  t.ok('People view shows Invitations, Suggested for you, then All members', order[0] === 'Invitations (2)' && order[1] === 'Suggested for you' && order[2] === 'All members', order.join(' | '));
  const suggested = await page.$$eval('#people-suggested article', x => x.map(e => ({ id: e.dataset.person, reasons: e.querySelectorAll('li').length })));
  t.ok('5 suggestions, none already connected, each with a reason', suggested.length === 5 && await page.evaluate(ids => ids.every(id => !demo.connected[id]), suggested.map(x => x.id)) && suggested.every(x => x.reasons >= 1));
  t.ok('All members shows the first 24 of 99', (await count()) === 24 && (await shown()) === 'Showing 24 of 99 members');
  await page.click('#people-more'); await sleep(100);
  t.ok('Show more adds 24 more and moves focus to the first new card', (await count()) === 48 && await page.evaluate(() => document.activeElement.closest('article') === document.querySelectorAll('#people-grid article')[24]));
  const card = await page.$eval('#people-grid article', e => e.innerText);
  t.ok('cards show stage, cohort and mutual connections, and no match percentage', /Cohort \d+/.test(card) && /mutual connection/.test(card) && !/%/.test(card) && !(await page.$eval('#people-view', e => e.innerText)).includes('%'));

  // Search and filters
  const setFilter = async (id, value) => { await page.select('#' + id, value); await sleep(100); };
  await setFilter('people-conn', 'connected'); t.ok('Connected filter shows your 5 connections', (await shown()) === 'Showing 5 of 5 members');
  await setFilter('people-conn', 'not'); t.ok('Not connected filter shows the other 94', (await shown()) === 'Showing 24 of 94 members');
  await setFilter('people-conn', '');
  await setFilter('people-cohort', 'alumni'); t.ok('Alumni filter shows 75 members', (await shown()) === 'Showing 24 of 75 members');
  await setFilter('people-track', 'Business Developer');
  const combined = await page.evaluate(() => [...document.querySelectorAll('#people-grid article')].map(a => person(a.dataset.person)));
  t.ok('filters work together (alumni and Business Developer)', combined.length > 0 && combined.every(p => p.cohort !== 12 && p.track === 'Business Developer'));
  await setFilter('people-stage', 'Junior (under 2 years)');
  t.ok('a stage from the other track finds no one', (await shown()) === 'No members found');
  t.ok('Clear filters appears when filtering', await visible(page, 'people-clear'));
  await page.click('#people-clear'); await sleep(100);
  t.ok('Clear filters shows everyone again and hides itself', (await shown()) === 'Showing 24 of 99 members' && !(await visible(page, 'people-clear')));
  const search = async q => { await page.$eval('#people-q', e => { e.value = ''; }); await page.type('#people-q', q); await sleep(100); return page.$$eval('#people-grid article', x => x.map(e => e.dataset.person)); };
  t.ok('search finds members by name', (await search('Elena Rostova')).join() === 'elena');
  t.ok('search finds members by company', (await search('Tillwise')).includes('elena'));
  t.ok('search finds members by school', (await search('Caledon')).includes('tom'));
  t.ok('search finds members by skill', (await search('PyTorch')).join() === 'priya');
  await page.click('#people-clear'); await sleep(100);

  // Connecting with a note
  await page.evaluate(() => openConnect('aisha')); await sleep(200);
  t.ok('Connect opens a dialog with an optional note of up to 300 characters', await page.$eval('#connect-note', e => e.maxLength === 300 && document.activeElement === e) && (await page.$eval('label[for=connect-note]', e => e.textContent)).includes('optional'));
  await page.type('#connect-note', 'Hi Aisha, I loved StudySprint.');
  t.ok('the note shows how many characters are left', (await page.$eval('#connect-note-count', e => e.textContent)) === 'You have 270 characters remaining');
  await page.evaluate(() => [...document.querySelectorAll('#sheet-panel button')].find(b => b.textContent === 'Send request').click()); await sleep(100);
  t.ok('sending saves the request with its note and offers Withdraw', await page.evaluate(() => demo.requested.aisha && demo.requested.aisha.note === 'Hi Aisha, I loved StudySprint.') &&
    (await page.$eval('#people-grid [data-person=aisha]', e => e.innerText)).includes('Withdraw request'));
  await sleep(1700);
  t.ok('a connection request is accepted', await page.evaluate(() => demo.connected.aisha === true && !demo.requested.aisha));
  const waiting = await page.evaluate(() => DEMO_PEOPLE.find(p => leavesWaiting(p.id)).id);
  await page.evaluate(id => { openConnect(id); sendRequest(id); }, waiting); await sleep(1700);
  t.ok('some members leave a request waiting', await page.evaluate(id => !!demo.requested[id] && !demo.connected[id], waiting));
  await page.evaluate(id => withdrawRequest(id), waiting); await sleep(100);
  t.ok('a waiting request can be withdrawn', await page.evaluate(id => !demo.requested[id], waiting));

  // Invitations
  const [first, second] = await page.evaluate(() => DEMO_INVITES.map(i => i.from));
  t.ok('invitations show the sender\'s note', (await page.$eval('#people-invites', e => e.innerText)).includes('Want to pair on something for Demo Day?'));
  await page.evaluate(id => acceptInvite(id), first); await sleep(100);
  t.ok('accepting an invitation connects you and enables Message', await page.evaluate(id => demo.connected[id] === true, first) && (await page.$eval('#people-grid [data-person="' + first + '"]', e => e.innerText).catch(() => '')) !== null &&
    await page.evaluate(id => connectButton(person(id), '').includes('Message'), first));
  await page.evaluate(id => ignoreInvite(id), second); await sleep(100);
  t.ok('ignoring an invitation removes it', await page.evaluate(id => !demo.invites.length && !demo.connected[id], second) && !(await visible(page, 'people-invites')));

  // Suggestion score (spec 10, criterion 7)
  const score = await page.evaluate(() => {
    const id = DEMO_PEOPLE.find(p => p.cohort === 9 && !demo.connected[p.id] && p.experience.some(e => e.company !== 'Self-employed' && !e.company.startsWith('Bootcamp'))).id;
    const target = person(id);
    const before = suggestionFor(id);
    const acc = currentAccount();
    acc.profile = acc.profile || {};
    acc.profile.goals = ['Co-founder', 'Hiring teammates']; acc.profile.stage = 'Senior (5 years or more)'; saveAccount(acc);
    const sameGoals = suggestionFor(id).score === before.score;
    const company = target.experience.find(e => e.company !== 'Self-employed' && !e.company.startsWith('Bootcamp')).company;
    acc.profile.experience = [{ title: 'Analyst', company, start: '2020-01', end: '2022-01' }];
    acc.profile.education = [{ school: target.education[0].school, course: 'BA', start: '2016', end: '2019' }];
    acc.profile.cohort = 9; saveAccount(acc);
    const after = suggestionFor(id);
    const friend = DEMO_LINKS[id].find(x => !demo.connected[x]);
    demo.connected[friend] = true;
    const withFriend = suggestionFor(id);
    delete demo.connected[friend]; acc.profile.cohort = undefined; acc.profile.experience = []; acc.profile.education = []; saveAccount(acc);
    return { sameGoals, rise: after.score - before.score, reasons: after.reasons, mutualRise: withFriend.mutual.length - after.mutual.length, mutualReason: withFriend.reasons[0] };
  });
  t.ok('changing goals or stage doesn\'t change the score', score.sameGoals);
  t.ok('same cohort, company and school raise the score by 30, each with a reason', score.rise === 30 && score.reasons.some(r => r.startsWith('Both in Cohort 9')) && score.reasons.some(r => r.startsWith('Both worked at')) && score.reasons.some(r => r.startsWith('Both studied at')), JSON.stringify(score));
  t.ok('a mutual connection counts, with a reason', score.mutualRise === 1 && /mutual connection/.test(score.mutualReason));

  await page.evaluate(() => openPerson('elena')); await sleep(200);
  const sheet = await page.$eval('#sheet-panel', e => e.innerText);
  const why = await page.$eval('#sheet-panel .entry', e => e.innerText);
  t.ok('profile sheet shows reasons without a percentage, the stage evidence line, verified experience and skills to learn',
    why.includes('Why you might connect') && !why.includes('%') && sheet.includes('Available from 1 Nov') && sheet.includes('Exploring an idea · ') && sheet.includes('Cohort 12') && sheet.includes('Verified experience') && sheet.includes('Wants to learn'), sheet.slice(0, 400));
  await page.keyboard.press('Escape');
  t.ok('Escape closes the sheet', await page.$eval('#sheet', e => e.classList.contains('hidden')));

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

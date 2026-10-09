// Spec 11: profile built around work to show (D039).
const { openApp, signUp, sleep, visible, noHorizontalScroll } = require('./helpers');

module.exports = async (browser, t) => {
  let page = await openApp(browser, t);
  await signUp(page);
  await page.evaluate(() => switchTab('profile')); await sleep(200);

  // Sample profiles: sections in the order of spec 11
  await page.evaluate(() => openPerson('marcus')); await sleep(200);
  const headings = await page.$$eval('#sheet-panel section > h3', x => x.map(e => e.textContent));
  const order = ['Work to show', 'About', 'Skills', 'Experience', 'Education', 'Verified experience', 'Available for'];
  t.ok('profile sections follow the spec 11 order', order.every((h, i) => headings.indexOf(h) === headings.indexOf(order[0]) + i), headings.join(' | '));
  const marcus = await page.$eval('#sheet-panel', e => e.innerText);
  t.ok('the top of the profile shows currently working on, stage and cohort', marcus.includes('Currently working on:') && marcus.includes('Learning (in bootcamp) · ') && marcus.includes('Cohort 12'));
  t.ok('a piece of work shows its facts line and teammate confirmation', marcus.includes('Contributed · team of 4 to 6 · 1 to 3 months · Live') && marcus.includes('Confirmed by Sarah Jenkins'));
  t.ok('every profile says members can use AI to help write it', marcus.includes('Members can use AI to help write their profiles.'));
  t.ok('no AI badge on profiles or work', !/AI badge|Written with AI|AI-written/i.test(marcus));

  // Skills: confirmed, proven or listed, in words
  const groups = await page.$$eval('#sheet-panel section p.text-footnote.font-semibold', x => x.map(e => e.textContent));
  t.ok('skills are grouped as confirmed, proven and listed, in words', groups.some(g => g.startsWith('Confirmed')) && groups.some(g => g.startsWith('Listed')), groups.join(' | '));
  const listed = await page.evaluate(() => { const { groups } = skillGroups(person('marcus'), workFor(person('marcus'))); return groups; });
  t.ok('a skill used in confirmed work is confirmed; one not in any work is listed', listed.confirmed.includes('TypeScript') && listed.listed.includes('Docker'), JSON.stringify(listed));
  await page.evaluate(() => document.querySelector('#sheet-panel [data-skill="TypeScript"]').click()); await sleep(100);
  t.ok('selecting a skill shows the work behind it', (await page.$eval('#skill-work', e => e.innerText)).includes('Work using TypeScript') && (await page.$eval('#skill-work', e => e.innerText)).includes('Convoy Planner'));

  // Viewer order (D023): a developer sees code links straight away
  const devView = await page.$eval('#sheet-panel [data-piece="0"]', e => ({ code: !!e.querySelector('a[href*="github.com"]') && !e.querySelector('details a[href*="github.com"]'), built: e.innerText.includes('Built with:') }));
  t.ok('a Software Developer viewer sees the code link and Built with beside each piece', devView.code && devView.built);
  await page.evaluate(() => { const a = currentAccount(); a.track = 'Business Developer'; saveAccount(a); openPerson('marcus'); }); await sleep(200);
  const bizView = await page.$eval('#sheet-panel [data-piece="0"]', e => {
    const d = e.querySelector('details');
    return { closed: d && !d.open, inside: !!(d && d.querySelector('a[href*="github.com"]')) && d.innerText.includes('Technical details'), liveFirst: e.querySelector('a').textContent.startsWith('See it live') };
  });
  t.ok('a Business Developer viewer sees the live link first, with code in a closed Technical details section', bizView.closed && bizView.inside && bizView.liveFirst, JSON.stringify(bizView));
  await page.evaluate(() => { const a = currentAccount(); a.track = 'Software Developer'; saveAccount(a); });

  // Read more: the full case study, and back
  await page.evaluate(() => openPerson('marcus')); await sleep(200);
  await page.evaluate(() => document.querySelector('#sheet-panel [data-piece="0"] button[aria-label^="Read more"]').click()); await sleep(200);
  const study = await page.$eval('#sheet-panel', e => e.innerText);
  t.ok('Read more shows the full case study', study.includes('What was the problem?') && study.includes('What did they do?') && study.includes('What happened?') && study.includes('Skills used'));
  await page.evaluate(() => [...document.querySelectorAll('#sheet-panel button')].find(b => b.textContent.startsWith('Back to')).click()); await sleep(200);
  t.ok('Back returns to the profile', (await page.$eval('#sheet-title', e => e.textContent)) === 'Marcus Johnson');
  await page.keyboard.press('Escape'); await sleep(100);

  // Work tagged by someone else shows on the teammate's profile
  await page.evaluate(() => openPerson('elena')); await sleep(200);
  t.ok('confirmed work by a teammate appears on their profile too', (await page.$eval('#sheet-panel', e => e.innerText)).includes('Added by Sarah Jenkins, and confirmed'));
  await page.keyboard.press('Escape'); await sleep(100);

  // The editor: new fields, guided questions, facts, skills, teammates
  t.ok('the editing page says members can use AI to help write profiles', (await page.$eval('#profile-form', e => e.innerText)).includes('Members can use AI to help write their profiles.'));
  t.ok('Claude buttons are hidden when Claude isn\'t available', !(await page.$$eval('[data-work] [data-ai-only]', x => x.some(e => !e.classList.contains('hidden')))));
  await page.type('#pf-headline', 'Full-stack developer · ex-teacher');
  await page.type('#pf-currently', 'Building a budgeting app for students');
  await page.select('#pf-stage', 'Junior (under 2 years)');
  await page.select('#pf-cohort', '11');
  await page.type('#edu-list [data-field=school]', 'University of Ashworth');
  await page.type('#edu-list [data-field=course]', 'BSc Physics');
  await page.type('#pf-skill-input', 'React'); await page.keyboard.press('Enter');
  await page.click('#work-add'); await sleep(100);
  const uid = await page.$eval('[data-work]', e => e.dataset.work);
  t.ok('a new piece opens with the title focused', await page.evaluate(id => document.activeElement.id === id + '-title', uid));
  const hint = () => page.$eval('[data-work] [data-hint="did"]', e => e.textContent);
  t.ok('questions are worded for a Software Developer', (await hint()).startsWith('What you designed and built'));
  await page.select('#pf-track', 'Business Developer'); await sleep(100);
  t.ok('questions change for a Business Developer', (await hint()).startsWith('The research, plans, sales or numbers'));
  t.ok('stages change with the track', (await page.$$eval('#pf-stage option', x => x.map(o => o.value))).includes('Exploring an idea'));
  await page.select('#pf-track', 'Software Developer'); await sleep(100);
  await page.select('#pf-stage', 'Junior (under 2 years)');

  await page.type('#' + uid + '-title', 'SplitHouse');
  await page.type('#' + uid + '-link', 'splithouse.example');
  await page.type('#' + uid + '-code', 'github.com/maya/splithouse');
  await page.type('#' + uid + '-problem', 'Students in shared houses lose track of bills.');
  await page.type('#' + uid + '-role', 'Built it on my own.');
  await page.type('#' + uid + '-did', 'Built a web app with bill splitting and reminders.');
  await page.type('#' + uid + '-result', 'Live, used by 140 students.');
  for (const id of ['role-0', 'team-0', 'length-1', 'reached-2']) await page.click('#' + uid + '-' + id + ' + .chip');
  t.ok('character counts update as you type', (await page.$eval('[data-count-for="' + uid + '-did"]', e => e.textContent)) === '50/300');
  t.ok('the facts line updates as facts are chosen', (await page.$eval('[data-work] [data-work-facts]', e => e.textContent)) === 'Led · just me · 1 to 3 months · Live');
  await page.click('[data-work] [data-skill="React"] + .chip');
  await page.type('#' + uid + '-newskill', 'Supabase'); await page.keyboard.press('Enter');
  t.ok('a skill added to a piece is added to your skills too', await page.evaluate(() => skills.includes('Supabase')));
  await page.type('#' + uid + '-built', 'Claude Code'); await page.keyboard.press('Enter');
  await page.select('#' + uid + '-mate', 'tom');
  await page.evaluate(id => [...document.querySelectorAll('[data-work="' + id + '"] button')].find(b => b.textContent === 'Tag').click(), uid);
  t.ok('a tagged teammate waits to confirm', (await page.$eval('[data-work] [data-mates]', e => e.innerText)).includes('Waiting to confirm'));

  // A piece with content but no title can't be saved
  await page.click('#work-add'); await sleep(100);
  const uid2 = await page.$$eval('[data-work]', x => x[1].dataset.work);
  await page.type('#' + uid2 + '-did', 'Something without a title');
  await page.click('#profile-form button[type=submit]'); await sleep(300);
  t.ok('a piece without a title shows an error', await visible(page, uid2 + '-title-error'));
  await page.evaluate(id => document.querySelector('[data-work="' + id + '"] button.hover\\:text-redText').click(), uid2); await sleep(100);

  // A piece with only a code link and a teammate isn't dropped: it asks for a title
  await page.click('#work-add'); await sleep(100);
  const uid3 = await page.$$eval('[data-work]', x => x[1].dataset.work);
  await page.type('#' + uid3 + '-code', 'github.com/maya/other');
  await page.click('#profile-form button[type=submit]'); await sleep(300);
  t.ok('a piece with only a code link isn\'t dropped: it asks for a title', await visible(page, uid3 + '-title-error'));
  await page.evaluate(id => document.querySelector('[data-work="' + id + '"] button.hover\\:text-redText').click(), uid3); await sleep(100);

  await page.click('#profile-form button[type=submit]'); await sleep(300);
  const saved = await page.evaluate(() => profileOf(currentAccount()));
  t.ok('stage, cohort, currently working on, education and work are saved', saved.stage === 'Junior (under 2 years)' && saved.cohort === 11 && saved.currently.startsWith('Building') &&
    saved.education[0].school === 'University of Ashworth' && saved.work.length === 1 && saved.work[0].facts.reached === 'Live' && saved.work[0].builtWith[0] === 'Claude Code', JSON.stringify(saved).slice(0, 300));
  await sleep(1700);
  t.ok('the teammate confirms after a moment', await page.evaluate(() => profileOf(currentAccount()).work[0].teammates[0].confirmed === true) &&
    (await page.$eval('[data-work] [data-mates]', e => e.innerText)).includes('Confirmed'));
  await page.evaluate(() => openPerson('tom')); await sleep(200);
  t.ok('your confirmed work shows on your teammate\'s profile', (await page.$eval('#sheet-panel', e => e.innerText)).includes('Added by Maya Okafor, and confirmed'));
  await page.keyboard.press('Escape');

  await page.evaluate(() => openPerson('me')); await sleep(200);
  const me = await page.$eval('#sheet-panel', e => e.innerText);
  t.ok('your full profile shows the new fields and the piece of work', me.includes('Currently working on: Building a budgeting app') && me.includes('Cohort 11 alumni') && me.includes('University of Ashworth') && me.includes('SplitHouse') && me.includes('Confirmed by Tom Nguyen'));
  t.ok('skills used in your work show as proven or confirmed', await page.evaluate(() => { const p = profileView('me'); return skillGroups(p, workFor(p)).groups.confirmed.includes('React'); }));
  await page.keyboard.press('Escape');

  // Teammate confirmations find the right piece even when two pieces share a title
  const dup = await page.evaluate(async () => {
    const acc = currentAccount();
    const work = [{ ...emptyWork(), id: 'wk-a', title: 'Hackathon app' }, { ...emptyWork(), id: 'wk-b', title: 'Hackathon app', teammates: [{ id: 'aisha', confirmed: false }] }];
    updateProfile(acc, { work });
    scheduleTeammateConfirmations(work);
    await new Promise(r => setTimeout(r, 1700));
    const after = profileOf(currentAccount()).work;
    const keep = after.filter(w => w.id !== 'wk-a' && w.id !== 'wk-b');
    updateProfile(currentAccount(), { work: keep });
    return after.find(w => w.id === 'wk-b').teammates[0].confirmed;
  });
  t.ok('a teammate confirms the right piece when two pieces share a title', dup === true);
  t.ok('links written in capitals still work', await page.evaluate(() => hrefOf('HTTPS://example.com/app') === 'https://example.com/app'));

  // Up to 6 pieces; the first 3 show, the rest behind Show all work
  for (let i = 0; i < 5; i++) await page.evaluate(n => addWork({ ...emptyWork(), title: 'Piece ' + n, result: 'Result ' + n }), i);
  t.ok('up to 6 pieces: the Add button is disabled at 6', (await page.$eval('#work-count', e => e.textContent)) === '6/6' && await page.$eval('#work-add', b => b.disabled));
  await page.evaluate(() => addWork({ ...emptyWork(), title: 'Seventh' })); await sleep(100);
  t.ok('a seventh piece is refused with a message', (await page.$$eval('[data-work]', x => x.length)) === 6 && (await page.$eval('#toast', e => e.textContent)).includes('up to 6'));
  await page.evaluate(() => openPerson('me')); await sleep(200);
  const shown = await page.$$eval('#sheet-panel section:first-of-type > .space-y-3 > article', x => x.length);
  t.ok('the first 3 show on the profile, and Show all work has the rest', shown === 3 && (await page.$eval('#sheet-panel', e => e.innerText)).includes('Show all work (6)'));
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const els = document.querySelectorAll('[data-work]'); [...els].slice(1).forEach(el => el.remove()); updateWorkCount(); });

  await page.setViewport({ width: 320, height: 640 }); await sleep(200);
  t.ok('the profile editor with a piece open has no sideways scroll at 320px', await noHorizontalScroll(page));
  await page.evaluate(() => openPerson('marcus')); await sleep(200);
  t.ok('a profile with work has no sideways scroll at 320px', await noHorizontalScroll(page));
  await page.close();

  // On the published page: Claude interviews, drafts, and suggests from a code link
  page = await openApp(browser, t, {
    beforeLoad: () => {
      let turn = 0;
      const fn = async () => ({ text: '' });
      fn.json = async prompt => {
        window.__prompts = (window.__prompts || []).concat(prompt);
        if (prompt.includes('README')) return { skills: ['React', 'Vite'], builtWith: ['Vite'], did: 'Built the front end in React.' };
        if (window.__emptyDraft) return { draft: { title: '', problem: '', facts: { role: 'Boss' }, skills: [] } };
        turn++;
        if (turn === 1) return { question: 'What problem did it solve?' };
        return { draft: { title: 'Rota Builder', problem: 'Cafés build rotas in group chats.', did: 'Built drag-and-drop rotas.', result: 'Used by 2 cafés.', summary: 'Rotas for small cafés.', facts: { role: 'Led', team: 'Just me', length: 'Under a month', reached: 'Live' }, skills: ['React'], builtWith: ['Next.js'] } };
      };
      window.claude = { use: async name => name === 'sample' ? fn : null };
      const realFetch = window.fetch;
      window.fetch = (url, opts) => String(url).includes('githubusercontent') ? Promise.reject(new Error('blocked')) : realFetch(url, opts);
    },
  });
  await signUp(page);
  await page.evaluate(() => switchTab('profile')); await sleep(200);
  await page.click('#work-add'); await sleep(300);
  const ai = await page.$eval('[data-work]', e => e.dataset.work);
  t.ok('Claude buttons show on the published page', await page.$eval('[data-work] [data-ai-only]', e => !e.classList.contains('hidden')));
  await page.evaluate(id => openWorkInterview(id), ai); await sleep(300);
  t.ok('Claude asks one question at a time', (await page.$eval('#ai-log', e => e.innerText)).includes('What problem did it solve?'));
  await page.type('#ai-input', 'Cafés plan staff rotas in WhatsApp.');
  await page.evaluate(() => document.querySelector('#ai-form button[type=submit]').click()); await sleep(400);
  t.ok('the answer goes back to Claude', await page.evaluate(() => window.__prompts[1].includes('Cafés plan staff rotas in WhatsApp.')));
  const box = await page.$eval('[data-work] [data-suggestions]', e => e.innerText);
  t.ok('the draft arrives as suggestions, marked Suggested', box.includes('Suggested by Claude') && box.includes('Rota Builder') && box.includes('Suggested'));
  t.ok('nothing is saved until the member saves', await page.evaluate(() => profileOf(currentAccount()).work.length === 0));
  await page.evaluate(id => useAllSuggestions(id), ai); await sleep(100);
  t.ok('Use all fills the form', (await page.$eval('#' + ai + '-title', e => e.value)) === 'Rota Builder' && (await page.$eval('[data-work] [data-work-facts]', e => e.textContent)) === 'Led · just me · under a month · Live');

  await page.evaluate(() => { window.__emptyDraft = true; addWork(); }); await sleep(100);
  const empty = await page.$$eval('[data-work]', x => x[1].dataset.work);
  await page.evaluate(id => { openWorkInterview(id); }, empty); await sleep(100);
  await page.evaluate(() => aiFinish()); await sleep(400);
  t.ok('an empty draft says Claude didn\'t have enough, instead of failing silently', (await page.$eval('#toast', e => e.textContent)).includes('didn\'t have enough') && await page.evaluate(id => document.activeElement.id === id + '-title', empty));
  await page.evaluate(() => { window.__emptyDraft = false; });

  await page.type('#' + ai + '-code', 'github.com/maya/rota');
  await page.evaluate(id => suggestFromCode(id), ai); await sleep(300);
  t.ok('if the repository can\'t be read, the member can paste the README instead', await page.$eval('#' + ai + '-paste', e => document.activeElement === e));
  await page.type('#' + ai + '-paste', '# Rota\nBuilt with React and Vite.');
  await page.evaluate(id => suggestFromPaste(id), ai); await sleep(300);
  const sug = await page.$eval('[data-work] [data-suggestions]', e => e.innerText);
  t.ok('suggestions from code are marked Suggested until accepted', sug.includes('Vite') && sug.includes('Suggested by Claude') && !!(await page.$('[data-work] [data-suggestions] button[aria-label="Accept Vite"]')));
  await page.evaluate(() => document.querySelector('[data-work] [data-suggestions] button[aria-label="Accept Vite"]').click()); await sleep(100);
  t.ok('an accepted skill is added to the piece', await page.evaluate(id => workExtras[id].skills.includes('Vite'), ai));
  await page.close();
};

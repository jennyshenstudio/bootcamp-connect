// Spec 14: Your activity (the Feed sidebar) and drafts.
const { openApp, signUp, sleep, noHorizontalScroll } = require('./helpers');

module.exports = async (browser, t) => {
  const page = await openApp(browser, t);
  await signUp(page);
  const headings = () => page.$$eval('#feed-sidebar h3', x => x.map(e => e.textContent));
  const sidebarText = () => page.$eval('#feed-sidebar', e => e.innerText);

  // ---------- A new member ----------
  await page.evaluate(() => switchTab('feed')); await sleep(300);
  let h = await headings();
  t.ok('a new member sees To do first', h[0] === 'To do', h.join('|'));
  const firstText = await sidebarText();
  t.ok('To do lists unfinished profile steps and applying to a first opportunity', firstText.includes('Add a profile photo') && firstText.includes('Apply to your first opportunity'), firstText);
  t.ok('To do has at most 3 items', (await page.$$eval('#feed-sidebar section:first-of-type li', x => x.length)) <= 3);
  t.ok('the header says Your activity with your name and pathway', (await page.$eval('#feed-sidebar h2', e => e.textContent)) === 'Your activity' && (await sidebarText()).includes('Software Developer'));

  // ---------- A member with a headline and some activity ----------
  await page.evaluate(() => updateProfile(currentAccount(), { headline: 'Full-stack developer', skills: ['React', 'Node.js'], openTo: ['Paid', 'Unpaid'] }));
  await page.evaluate(() => { renderFeedSidebar(); }); await sleep(100);
  h = await headings();
  t.ok('sections show in order: New for you, Current, People to get back to, To do', h.join('|') === 'New for you|Current|People to get back to|To do', h.join('|'));
  const text = await sidebarText();
  t.ok('New for you shows opportunities for your pathway with pay and commitment', text.includes('TableTurn') && text.includes('£950, fixed · Part-time') && !text.includes('Landing page copy'));
  t.ok('Current shows a project in progress with its end date', text.includes('In progress · Ends 20 Nov'));
  t.ok('People to get back to shows invitations and unread conversations', text.includes('2 invitations to connect') && /\d+ new/.test(text));
  await page.$eval('#feed-sidebar button[data-on-click^="openOpportunity"]', b => b.click()); await sleep(300);
  t.ok('a New for you item opens the opportunity page', (await page.$eval('#sheet-title', e => e.textContent)).length > 0 && await page.evaluate(() => $('sheet').dataset.person.startsWith('opportunity:')));
  await page.keyboard.press('Escape'); await sleep(200);
  await page.evaluate(() => openApply('p-tableturn')); await sleep(200);
  await page.type('#apply-note', 'Keen to help.'); await page.click('#sheet button[type=submit]'); await sleep(300);
  t.ok('an application shows under Current as waiting', (await sidebarText()).includes('Applied · Waiting to hear from Diego'));
  t.ok('applying removes it from New for you and from To do', !(await page.$$eval('#feed-sidebar section', x => x.find(s => s.querySelector('h3').textContent === 'New for you')?.innerText || '')).includes('TableTurn') &&
    !(await sidebarText()).includes('Apply to your first opportunity'));
  await sleep(2600); // the demo poster accepts

  // ---------- Drafts ----------
  await page.evaluate(() => openComposer('update')); await sleep(200);
  await page.click('#cp-draft'); await sleep(100);
  t.ok('Save draft on an empty form says what to do', (await page.$eval('#cp-att-error', e => e.textContent)) === 'Write something before saving a draft.');
  await page.evaluate(() => closeSheet()); await sleep(200);
  t.ok('closing an empty form saves no draft', await page.evaluate(() => demo.drafts.length === 0));
  await page.evaluate(() => openComposer('update')); await sleep(200);
  await page.click('input[name=cp-label][value=Project] + .chip');
  await page.type('#cp-body', 'Our booking page is live for 3 restaurants.');
  await page.keyboard.press('Escape'); await sleep(300);
  t.ok('closing the form with something written saves a draft, and says so', await page.evaluate(() => demo.drafts.length === 1) && (await page.$eval('#toast', e => e.textContent)).includes('Saved as a draft'));
  t.ok('the draft shows under Drafts with its type and first words', (await headings()).includes('Drafts') && (await sidebarText()).includes('Update · Our booking page is live'));
  t.ok('a draft says when it was saved, in words', (await sidebarText()).includes('Saved just now'));
  t.ok('saved times read naturally', (await page.evaluate(() => [savedAgo(Date.now() - 5 * 60000), savedAgo(Date.now() - 3 * 3600000)].join())) === '5 minutes ago,3 hours ago');

  await page.evaluate(() => { openComposer('work'); }); await sleep(200);
  await page.type('#cp-title', 'Landing page for TableTurn');
  await page.click('input[name=cp-pay][value=Unpaid] + .chip');
  await page.click('input[name=cp-workplace][value=Hybrid] + .chip');
  await page.type('#cp-town', 'Bristol');
  await page.click('#cp-draft'); await sleep(300);
  t.ok('Save draft keeps an opportunity as a draft', await page.evaluate(() => demo.drafts.length === 2 && demo.drafts[0].type === 'work'));

  await page.reload({ waitUntil: 'networkidle0' }); await sleep(400);
  await page.evaluate(() => switchTab('feed')); await sleep(300);
  t.ok('drafts persist after a reload', await page.evaluate(() => demo.drafts.length === 2));
  await page.evaluate(() => continueDraft(demo.drafts[0].id)); await sleep(300);
  const restored = await page.evaluate(() => ({ title: $('cp-title').value, pay: choiceOf('cp-pay'), fee: $('cp-amount-wrap').classList.contains('hidden'), place: choiceOf('cp-workplace'), town: $('cp-town').value, townShown: !$('cp-town-wrap').classList.contains('hidden') }));
  t.ok('Continue restores every field, including choices that show or hide others', restored.title === 'Landing page for TableTurn' && restored.pay === 'Unpaid' && restored.fee && restored.place === 'Hybrid' && restored.town === 'Bristol' && restored.townShown, JSON.stringify(restored));
  await page.evaluate(() => closeSheet()); await sleep(200);
  t.ok('closing a continued draft keeps one copy, not two', await page.evaluate(() => demo.drafts.length === 2));

  await page.evaluate(() => continueDraft(demo.drafts.find(d => d.type === 'update').id)); await sleep(300);
  t.ok('Continue restores an update', (await page.evaluate(() => choiceOf('cp-label') + '|' + $('cp-body').value)) === 'Project|Our booking page is live for 3 restaurants.');
  await page.click('#cp-submit'); await sleep(400);
  t.ok('posting a draft removes it', await page.evaluate(() => demo.drafts.length === 1 && demo.posts[0].body === 'Our booking page is live for 3 restaurants.'));
  // Review fixes: hidden title, full storage, applied-only rows, the count
  await page.evaluate(() => { openComposer('support'); }); await sleep(200);
  await page.type('#cp-title', 'Typed as a question');
  await page.click('input[name=cp-type][value=update] + .chip'); await sleep(100);
  await page.evaluate(() => closeSheet()); await sleep(200);
  t.ok("hidden title text doesn't become a draft", await page.evaluate(() => demo.drafts.length === 1));
  await page.evaluate(() => { openComposer('update'); }); await sleep(200);
  await page.type('#cp-body', 'This will not fit.');
  await page.evaluate(() => { window.realSave = saveDemo; saveDemo = () => false; });
  await page.click('#cp-draft'); await sleep(200);
  t.ok('a draft that cannot be stored says so and keeps the form open', (await page.$eval('#cp-att-error', e => e.textContent)).includes("Couldn't save the draft") && await page.evaluate(() => !$('sheet').classList.contains('hidden') && demo.drafts.length === 1));
  await page.evaluate(() => { saveDemo = window.realSave; $('cp-body').value = ''; closeSheet(); }); await sleep(200);
  const applied = await page.evaluate(() => {
    demo.applications['p-refill'] = { status: 'applied', note: 'Hi', at: Date.now() };
    setProject(postById('p-refill'), { status: 'in-progress' });
    return (currentRow(postById('p-refill')).match(/Applied · Waiting to hear from Priya/) || [])[0] || '';
  });
  t.ok("an opportunity you've only applied to stays 'Applied' even once it has started", applied === 'Applied · Waiting to hear from Priya');
  const needs = await page.evaluate(() => { const a = activityData(); return { todo: a.todo.map(x => x.label), todoNeeds: a.todoNeeds }; });
  t.ok("'Apply to your first opportunity' is a suggestion, not counted as needing you", !needs.todo.includes('Apply to your first opportunity') || needs.todoNeeds < needs.todo.length, JSON.stringify(needs));
  await page.evaluate(() => deleteDraft(demo.drafts[0].id)); await sleep(200);
  t.ok('Delete removes a draft and the Drafts section', await page.evaluate(() => demo.drafts.length === 0) && !(await headings()).includes('Drafts'));

  // ---------- A tall sidebar scrolls with the page, then stays ----------
  await page.evaluate(() => { openComposer('update'); $('cp-body').value = 'A draft to make the sidebar long'; closeSheet(); }); await sleep(300);
  await page.setViewport({ width: 1440, height: 700 });
  await page.evaluate(() => { switchTab('feed'); window.scrollTo(0, 0); }); await sleep(300);
  const tall = await page.$eval('#feed-sidebar', e => ({ h: e.offsetHeight, overflow: getComputedStyle(e).overflowY }));
  t.ok('the sidebar has no scrollbar of its own', tall.h > 700 && tall.overflow === 'visible', JSON.stringify(tall));
  await page.evaluate(() => window.scrollTo(0, 3000)); await sleep(300);
  const after = await page.$eval('#feed-sidebar', e => { const r = e.getBoundingClientRect(); const last = e.querySelector('section:last-child').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, lastBottom: last.bottom }; });
  t.ok('scrolling the page brings the last section into view, and the sidebar stays there', after.lastBottom <= 700 && after.bottom > 600, JSON.stringify(after));
  await page.evaluate(() => deleteDraft(demo.drafts[0].id)); await page.setViewport({ width: 1440, height: 1600 }); await sleep(200);
  await page.evaluate(() => { placeActivity(); window.scrollTo(0, 2000); }); await sleep(300);
  const short = await page.$eval('#feed-sidebar', e => Math.round(e.getBoundingClientRect().top));
  t.ok('a sidebar shorter than the window stays under the header', short === 80, String(short));

  // ---------- Phones ----------
  await page.setViewport({ width: 390, height: 800 });
  await page.evaluate(() => { switchTab('feed'); window.scrollTo(0, 0); }); await sleep(300);
  const bar = await page.$eval('#activity-toggle', e => ({ shown: e.getClientRects().length > 0, expanded: e.getAttribute('aria-expanded'), text: e.innerText }));
  t.ok('on phones a Your activity bar shows how many things need you', bar.shown && bar.expanded === 'false' && /\d+ things? needs? you|All caught up/.test(bar.text), bar.text);
  t.ok('on phones the summary starts closed', await page.$eval('#feed-sidebar', e => e.getClientRects().length === 0));
  await page.click('#activity-toggle'); await sleep(200);
  t.ok('the bar opens the summary', await page.$eval('#feed-sidebar', e => e.getClientRects().length > 0) && (await page.$eval('#activity-toggle', e => e.getAttribute('aria-expanded'))) === 'true');
  await page.setViewport({ width: 320, height: 700 }); await sleep(200);
  t.ok('Your activity has no sideways scroll at 320px', await noHorizontalScroll(page));
  await page.click('#activity-toggle'); await sleep(200);
  t.ok('the bar closes the summary again', await page.$eval('#feed-sidebar', e => e.getClientRects().length === 0));
  await page.close();
};

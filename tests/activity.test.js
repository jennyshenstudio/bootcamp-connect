// Spec 14: Your activity (the Feed sidebar) and drafts.
const { openApp, signUp, sleep, noHorizontalScroll } = require('./helpers');

module.exports = async (browser, t) => {
  const page = await openApp(browser, t);
  await signUp(page);
  const headings = () => page.$$eval('#feed-sidebar h3', x => x.map(e => e.textContent));
  const sidebarText = () => page.$eval('#feed-sidebar', e => e.innerText);

  // ---------- A new member (D046) ----------
  await page.evaluate(() => switchTab('feed')); await sleep(300);
  let h = await headings();
  t.ok('a new member sees their profile first, then Needs you and In progress', h.join('|') === 'Your profile|Needs you|In progress', h.join('|'));
  const firstText = await sidebarText();
  t.ok('Your profile shows how complete it is and the next step', /0%/.test(firstText) && firstText.includes('Next: add a profile photo'), firstText);
  t.ok('no header card and no New for you (the Feed already has For you)', !(await page.$('#feed-sidebar h2')) && !firstText.includes('New for you'));
  t.ok('Needs you merges invitations and unread conversations', firstText.includes('2 invitations to connect') && /\d+ conversations with new messages/.test(firstText));
  t.ok('In progress shows a project in progress with its end date', firstText.includes('In progress · ends 20 Nov'));
  t.ok('the sidebar fits a 1440×900 window without scrolling', await page.$eval('#feed-sidebar', e => e.getBoundingClientRect().bottom <= 900));

  // ---------- A member with a headline and some activity ----------
  await page.evaluate(() => updateProfile(currentAccount(), { headline: 'Full-stack developer', skills: ['React', 'Node.js'], openTo: ['Paid', 'Unpaid'] }));
  await page.evaluate(() => { renderFeedSidebar(); }); await sleep(100);
  h = await headings();
  t.ok('with a headline, Needs you comes first and the profile last', h.join('|') === 'Needs you|In progress|Your profile', h.join('|'));
  await page.$eval('#feed-sidebar button[data-on-click="switchTab(\'matching\')"]', b => b.click()); await sleep(300);
  t.ok('an invitations row opens Connect', await page.$eval('#tab-matching', e => !e.classList.contains('hidden')));
  await page.evaluate(() => switchTab('feed')); await sleep(200);
  await page.evaluate(() => openApply('p-tableturn')); await sleep(200);
  await page.type('#apply-note', 'Keen to help.'); await page.click('#sheet button[type=submit]'); await sleep(300);
  t.ok('an application shows under In progress as waiting', (await sidebarText()).includes('Applied · waiting for Diego'));
  t.ok('the sidebar count matches what Needs you lists', await page.evaluate(() => $('activity-count').textContent === activityData().count + ' things need you'));
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
  t.ok('drafts take one line in the sidebar', (await sidebarText()).includes('1 draft'));
  await page.$eval('#feed-sidebar button[data-on-click="openDrafts()"]', b => b.click()); await sleep(200);
  const draftsSheet = await page.$eval('#sheet-panel', e => e.innerText);
  t.ok('the drafts line opens Drafts, with each type and first words', draftsSheet.includes('Drafts') && draftsSheet.includes('Update · Our booking page is live'));
  t.ok('a draft says when it was saved, in words', draftsSheet.includes('Saved just now'));
  await page.evaluate(() => closeSheet()); await sleep(200);
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
    return (progressRow(postById('p-refill')).match(/Applied · waiting for Priya/) || [])[0] || '';
  });
  t.ok("an opportunity you've only applied to stays 'Applied' even once it has started", applied === 'Applied · waiting for Priya');
  const lists = await page.evaluate(() => {
    activityOpen.clear();
    const rows = n => Array.from({ length: n }, (_, i) => activityRow('showOpportunities()', 'Row ' + i));
    const short = activityList('needs', rows(4)), long = activityList('needs', rows(6));
    activityOpen.add('needs');
    const opened = activityList('needs', rows(6));
    activityOpen.clear();
    return { short: (short.match(/<li>/g) || []).length, long: (long.match(/<li>/g) || []).length, more: long.includes('3 more'), opened: (opened.match(/<li>/g) || []).length };
  });
  t.ok('a list shows up to 4 rows, then "N more" opens the rest', lists.short === 4 && lists.long === 4 && lists.more && lists.opened === 6, JSON.stringify(lists));
  await page.evaluate(() => deleteDraft(demo.drafts[0].id)); await sleep(200);
  t.ok('Delete removes a draft and the drafts line', await page.evaluate(() => demo.drafts.length === 0) && !(await sidebarText()).includes('draft'));
  await page.setViewport({ width: 1440, height: 1600 }); await sleep(200);
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

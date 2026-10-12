// Specs 05–07, 12 and 13: typed feed and attachments, opportunities, updates, matching, project loop and verified experience.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT, openApp, signUp, sleep, fixture, screenshot, noHorizontalScroll } = require('./helpers');

module.exports = async (browser, t) => {
  // Files that must be rejected, made on the fly
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-test-'));
  const zip = path.join(tmp, 'archive.zip'); fs.writeFileSync(zip, 'PK not really a zip');
  const huge = path.join(tmp, 'huge.pdf'); fs.writeFileSync(huge, Buffer.alloc(21 * 1024 * 1024));

  const page = await openApp(browser, t);
  await signUp(page);

  // ---------- Profile inputs for matching ----------
  await page.type('#pf-headline', 'Full-stack developer · former nurse');
  for (const s of ['React', 'Node.js', 'TypeScript', 'PostgreSQL']) { await page.type('#pf-skill-input', s); await page.keyboard.press('Enter'); }
  await page.type('#pf-learn-input', 'Stripe'); await page.keyboard.press('Enter');
  await page.click('#learn-suggestions [data-skill="Customer discovery"]');
  await page.click('#pf-open-0 + .chip'); await page.click('#pf-open-1 + .chip');
  await page.click('#pf-hours-1 + .chip'); await page.click('#pf-goals-1 + .chip');
  await page.click('#pf-industries-7 + .chip'); await page.click('#pf-industries-2 + .chip');
  await page.click('#profile-form button[type=submit]'); await sleep(300);

  // ---------- Opportunity matching (spec 12) ----------
  const fit = id => page.evaluate(id => { const f = projectFit(postById(id), memberView('me')); return { score: f.score, blocked: f.blocked, reasons: f.reasons, blockers: f.blockers }; }, id);
  let f = await fit('p-tableturn');
  t.ok('skills named in the opportunity count as a reason', f.reasons.some(r => r.startsWith('Uses React, Node.js')), JSON.stringify(f.reasons));
  t.ok('a skill you want to learn counts as a reason', f.reasons.some(r => r.includes('practise Stripe')));
  t.ok('an opportunity for your pathway is not blocked', !f.blocked);
  f = await fit('p-footprint-landing');
  t.ok('an opportunity for the other pathway is blocked, with the reason', f.blocked && f.blockers[0] === 'For Business Developers only');
  await page.evaluate(() => updateProfile(currentAccount(), { openTo: ['Paid'] }));
  f = await fit('p-refill');
  t.ok('pay-type filter blocks unpaid when not open to it', f.blocked && f.blockers[0].includes('unpaid'));
  await page.evaluate(() => updateProfile(currentAccount(), { openTo: ['Equity'] }));
  f = await fit('p-refill');
  t.ok('members open to equity (a pay type before D040) can see unpaid opportunities', !f.blocked);
  await page.evaluate(() => updateProfile(currentAccount(), { openTo: ['Paid', 'Unpaid'] }));
  const words = await page.evaluate(() => [mentions('a digital product', 'Git'), mentions('built with git and react', 'Git'), mentions('node.js api', 'Node.js'), mentions('c++ and rust', 'C++')]);
  t.ok('skills match whole words only', words.join() === 'false,true,true,true', words.join());
  const dates = await page.evaluate(() => opportunityDates({ start: '2026-12-14', end: '2027-01-20' }));
  t.ok('dates that cross a year show both years', dates === '14 Dec 2026 – 20 Jan 2027', dates);
  // People suggestions replaced two-way person fit (spec 10); their tests are in community.test.js
  const people = await page.evaluate(() => ['elena', 'marcus', 'diego'].map(id => suggestionFor(id)));
  t.ok('people suggestions include two-way skill reasons', people.some(p => p.reasons.some(r => r.startsWith('Can help you learn') || r.startsWith('You can help them'))));
  const team = await page.evaluate(() => suggestTeam(postById('p-gradeloop')).map(x => x.person.track));
  t.ok('suggested members are on the pathway the opportunity is looking for', team.length > 0 && team.length <= 3 && team.every(tr => tr === 'Business Developer'), team.join());

  // ---------- Feed filters and fees ----------
  await page.evaluate(() => switchTab('feed')); await sleep(300);
  const forYou = await page.$$eval('#feed-list article', x => x.map(e => e.dataset.post));
  t.ok('For you hides blocked projects and ranks good fits first', !forYou.includes('p-footprint-landing') && forYou.includes('p-tableturn') &&
    (forYou.indexOf('p-tableturn') < forYou.indexOf('p-gradeloop') || !forYou.includes('p-gradeloop')));
  for (const [k, label] of [['work', 'Opportunity'], ['update', 'Update'], ['support', 'Support'], ['resource', 'Resource']]) {
    await page.evaluate(k => setFeedFilter(k), k); await sleep(100);
    const badges = await page.$$eval('#feed-list article', x => x.map(e => e.querySelector('span.shrink-0.inline-flex').textContent.trim()));
    t.ok('filter ' + k + ' shows only ' + label + ' posts', badges.length > 0 && badges.every(b => b === label));
  }
  await page.evaluate(() => setFeedFilter('work')); await sleep(100);
  t.ok('Opportunities filter is labelled and selected', (await page.$eval('#feed-filters [aria-pressed="true"]', e => e.textContent)) === 'Opportunities');
  t.ok('sample fees are fixed and in pounds', (await page.$$eval('#feed-list article', x => x.map(e => (e.innerText.match(/£\d+, fixed/) || [])[0]).filter(Boolean).join())) === '£950, fixed,£300, fixed');
  const card = id => page.$eval(`[data-post="${id}"]`, e => ({ cls: e.className, facts: [...e.querySelectorAll('.flex-wrap.gap-1\\.5 > span')].map(s => s.textContent), text: e.innerText }));
  const dev = await card('p-tableturn'), biz = await card('p-gradeloop');
  t.ok('a Software Developer opportunity has a blue edge and names the pathway first', dev.cls.includes('border-l-appleBlue') && dev.facts[0] === 'Software Developer', JSON.stringify(dev.facts));
  t.ok('a Business Developer opportunity has a purple edge and names the pathway first', biz.cls.includes('border-l-applePurple') && biz.facts[0] === 'Business Developer');
  t.ok('the card shows pay, commitment, workplace and dates', ['£950, fixed', 'Part-time', 'Hybrid · Bristol', '2 Nov – 14 Dec 2026'].every(x => dev.facts.includes(x)), JSON.stringify(dev.facts));
  t.ok('no fit percentage on opportunity cards', !(await page.$eval('#feed-list', e => e.innerText)).includes('% fit'));
  // D043: one row of buttons, and the files wait on the opportunity page
  const row = await page.$eval('[data-post="p-tableturn"] .border-t', e => [...e.querySelectorAll('button')].map(b => b.textContent.trim()));
  t.ok('Apply and See details share the row with likes and comments', row.includes('Apply') && row.includes('See details') && row.length === 4, JSON.stringify(row));
  // D044: photos stay on the card in a small frame; documents wait in the details, with a count
  t.ok('an opportunity photo shows in a frame 220px tall', (await page.$eval('[data-post="p-tableturn"] img[alt="tableturn-mockup.png"]', e => Math.round(e.closest('button').getBoundingClientRect().height))) === 220);
  t.ok('documents are not on the card, which counts them instead', await page.$eval('[data-post="p-refill"]', e => !e.innerText.includes('Pharmacy interview notes.pdf') && e.innerText.includes('1 attachment')));
  const cardHtml = id => page.evaluate(id => renderPost(postById(id)), id);
  t.ok("a resource's document waits in the details too", !(await cardHtml('p-unit-econ')).includes('Unit economics template.pdf') && (await cardHtml('p-unit-econ')).includes('1 attachment'));
  t.ok("a resource's link stays on the card as one line, and isn't counted", (await cardHtml('p-rls')).includes('Row Level Security') && !(await cardHtml('p-rls')).includes('attachment'));
  t.ok('long text on a card stops after 3 lines', (await cardHtml('p-footprint')).includes('line-clamp-3'));
  await page.evaluate(() => openPost('p-unit-econ')); await sleep(300);
  t.ok('See details shows the whole post with its documents and comments', await page.$eval('#sheet-panel', e => e.innerText.includes('Unit economics template.pdf') && !!e.querySelector('#comment-full-p-unit-econ') && !e.querySelector('.line-clamp-3')));
  t.ok('the details have a heading for screen readers and no repeated ids', await page.evaluate(() => !!document.querySelector('#sheet-panel #sheet-title') && !document.querySelector('#sheet-panel [id^="post-"]')));
  await page.type('#comment-full-p-unit-econ', 'Thanks, very useful'); await page.keyboard.press('Enter'); await sleep(200);
  t.ok('a comment can be added from the details', (await page.$eval('#sheet-panel', e => e.innerText)).includes('Thanks, very useful') && await page.evaluate(() => document.activeElement.id === 'comment-full-p-unit-econ'));
  await page.evaluate(() => closeSheet()); await sleep(200);
  await page.evaluate(() => openPost('p-tableturn')); await sleep(300);
  t.ok("an opportunity's See details opens its page", (await page.$$eval('#sheet-panel h3', x => x.map(e => e.textContent))).includes('At a glance'));
  await page.evaluate(() => closeSheet()); await sleep(200);
  await page.evaluate(() => openOpportunity('p-tableturn')); await sleep(300);
  t.ok('the opportunity page shows its attachments', !!(await page.$('#sheet-panel img[alt="tableturn-mockup.png"]')));
  const sections = await page.$$eval('#sheet-panel h3', x => x.map(e => e.textContent));
  t.ok('the opportunity page shows its sections in order', sections.join('|') === 'At a glance|About the project|Responsibilities|Minimum requirements|Nice to have|About Diego', sections.join('|'));
  t.ok('At a glance includes the length in weeks', (await page.$eval('#sheet-panel dl', e => e.innerText)).includes('6 weeks'));
  await page.click('#opp-save'); await sleep(200);
  t.ok('Save keeps keyboard focus on the Save button', await page.evaluate(() => document.activeElement.id === 'opp-save' && document.activeElement.getAttribute('aria-pressed') === 'true'));
  await page.keyboard.press('Escape'); await sleep(200);
  t.ok("you can't apply to another pathway's opportunity", await page.$eval('[data-post="p-footprint-landing"]', e => [...e.querySelectorAll('button')].some(b => b.textContent === 'Apply' && b.disabled)));
  await page.evaluate(() => openApply('p-footprint-landing')); await sleep(200);
  t.ok("the application form doesn't open for another pathway", !(await page.$('#apply-note')));
  await page.evaluate(() => setFeedFilter('foryou')); await sleep(200);
  const forYouOrder = await page.evaluate(() => {
    const open = allPosts().filter(p => p.type === 'work' && !isMine(p) && !onTeam(p) && projectStatus(p) === 'open' && !projectFit(p, memberView('me')).blocked).map(p => p.id);
    const shown = [...document.querySelectorAll('#feed-list article')].map(e => e.dataset.post);
    return { open, first: shown.slice(0, open.length) };
  });
  t.ok('For you shows opportunities for your pathway first', forYouOrder.open.length >= 2 && forYouOrder.open.every(id => forYouOrder.first.includes(id)), JSON.stringify(forYouOrder));
  await page.evaluate(() => setFeedFilter('work')); await sleep(100);

  // ---------- Composer, attachments, viewer ----------
  // ---------- Updates (spec 13) ----------
  const filters = await page.$$eval('#feed-filters button', x => x.map(e => e.textContent));
  t.ok('filters are For you, All, Opportunities, Updates, Support and Resources', filters.join('|') === 'For you|All|Opportunities|Updates|Support|Resources', filters.join('|'));
  t.ok('the post box has no type buttons: the form asks for the type', await page.evaluate(() => !document.querySelector('#tab-feed [data-on-click^="openComposer(\'work\')"]') && document.querySelector('#tab-feed .card button').textContent.includes('question')));
  t.ok('no Personal project or Community composer buttons', await page.evaluate(() => !document.querySelector('[data-on-click="openComposer(\'personal\')"], [data-on-click="openComposer(\'community\')"]') && !POST_TYPES.personal && !POST_TYPES.community));
  await page.evaluate(() => { setFeedFilter('update'); }); await sleep(100);
  const labels = await page.$$eval('#feed-list article', x => x.map(e => (e.querySelector('p > span') || {}).textContent || ''));
  t.ok('sample updates show their Career or Project label in words', labels.length === 3 && labels.includes('Career') && labels.every(l => l === 'Career' || l === 'Project'), labels.join());
  await page.evaluate(() => { setFeedFilter('all'); openComposer('update'); }); await sleep(200);
  t.ok('an update has no title field', await page.$eval('#cp-title-wrap', e => e.classList.contains('hidden')));
  t.ok('an update starts as Career, with Project as the other choice', (await page.$$eval('input[name=cp-label]', x => x.map(e => e.value + (e.checked ? '*' : '')).join())) === 'Career*,Project');
  t.ok('the news box allows up to 1,000 characters and says so', await page.$eval('#cp-body', e => e.maxLength === 1000) && await page.$eval('#cp-body-hint', e => !e.classList.contains('hidden') && e.textContent.includes('1,000')));
  t.ok('no feedback option on updates', !(await page.$('#cp-feedback')));
  await page.click('#cp-submit'); await sleep(100);
  t.ok('an update needs your news', (await page.$eval('#cp-body-error', e => !e.classList.contains('hidden') && e.textContent)) === 'Write your news.');
  await page.click('input[name=cp-label][value=Project] + .chip');
  await page.type('#cp-body', 'Booking flow demo from today, plus slides and notes.');
  t.ok('typing clears the error', await page.$eval('#cp-body-error', e => e.classList.contains('hidden')));
  t.ok('the 1,000-character hint is announced for updates only', await page.$eval('#cp-body', e => e.getAttribute('aria-describedby') === 'cp-body-hint'));
  await page.click('input[name=cp-type][value=support] + .chip'); await sleep(100);
  t.ok('other post types neither show nor announce the hint', await page.$eval('#cp-body', e => !e.hasAttribute('aria-describedby') && e.maxLength === 2000) && await page.$eval('#cp-body-hint', e => e.classList.contains('hidden')));
  await page.type('#cp-title', 'A question typed before switching');
  await page.evaluate(() => { $('cp-body').value = 'x'.repeat(1500); });
  await page.click('input[name=cp-type][value=update] + .chip'); await sleep(100);
  await page.click('#cp-submit'); await sleep(100);
  t.ok('news over 1,000 characters is refused with a message', (await page.$eval('#cp-body-error', e => e.textContent)) === 'This is 1,500 characters. Cut it to 1,000 or fewer.' && await page.evaluate(() => !demo.posts.length));
  await page.evaluate(() => { $('cp-body').value = ''; });
  await page.click('input[name=cp-label][value=Project] + .chip');
  await page.type('#cp-body', 'Booking flow demo from today, plus slides and notes.');
  await (await page.$('#cp-media')).uploadFile(fixture('photo.png'), fixture('clip.webm'));
  await (await page.$('#cp-doc')).uploadFile(path.join(ROOT, 'test-data', 'sample-cv.pdf'), fixture('notes.txt'));
  await page.waitForFunction(() => !cp.attachments.some(a => a.kind === 'pending'), { timeout: 15000 });
  await (await page.$('#cp-doc')).uploadFile(zip); await sleep(300);
  t.ok('unsupported file is rejected', (await page.$eval('#cp-att-error', e => e.textContent)).includes("isn't supported"));
  await (await page.$('#cp-doc')).uploadFile(huge);
  await page.waitForFunction(() => !cp.attachments.some(a => a.kind === 'pending'), { timeout: 20000 }); await sleep(200);
  t.ok('document over 20 MB is rejected', (await page.$eval('#cp-att-error', e => e.textContent)).includes('up to 20 MB'));
  await page.evaluate(() => toggleLinkForm());
  await page.type('#cp-link-url', 'not a url'); await page.evaluate(() => addComposerLink()); await sleep(100);
  t.ok('invalid link is rejected', (await page.$eval('#cp-att-error', e => e.textContent)).includes('valid link'));
  await page.evaluate(() => { $('cp-link-url').value = 'stripe.com/docs/payments/checkout'; $('cp-link-title').value = 'Stripe Checkout docs'; addComposerLink(); });
  t.ok('photo, video, 2 documents, and a link attached', (await page.evaluate(() => cp.attachments.map(a => a.kind).sort().join())) === 'doc,doc,image,link,video');
  await page.click('#cp-submit'); await sleep(900);
  t.ok('a new post shows its photo and video side by side, and counts its 2 documents and link', await page.$eval('#feed-list article', e => e.dataset.post.startsWith('u-') && e.querySelectorAll('img').length === 1 && e.querySelectorAll('video').length === 1 && !e.querySelector('a[target=_blank]') && e.innerText.includes('3 attachments')));
  t.ok('See details shows the documents and the link', await page.evaluate(() => { openPost(demo.posts[0].id); const t = $('sheet-panel').innerText; closeSheet(); return t.includes('notes.txt') && t.includes('Stripe Checkout docs'); }));
  t.ok('a posted update shows its label and its text', await page.$eval('#feed-list article', e => e.querySelector('p > span').textContent === 'Project' && e.innerText.includes('Booking flow demo from today')));
  t.ok("a title typed for another post type isn't saved on an update", await page.evaluate(() => demo.posts[0].title === '' && !document.querySelector('#feed-list article:first-child h3')));
  t.ok('uploaded photo loads from browser storage', await page.$eval('#feed-list article img', e => e.src.startsWith('blob:') && e.naturalWidth > 0));
  await page.$eval('#feed-list article button[data-on-click^="openViewer"]', e => e.click()); await sleep(500);
  t.ok('viewer opens the photo', await page.$eval('#viewer-media', e => e.tagName === 'IMG' && e.src.startsWith('blob:')));
  await page.keyboard.press('ArrowRight'); await sleep(400);
  t.ok('arrow key moves to the video', await page.$eval('#viewer-media', e => e.tagName === 'VIDEO'));
  await page.keyboard.press('ArrowRight'); await sleep(2500);
  t.ok('PDF renders page by page', (await page.$$eval('#viewer-pdf canvas', x => x.length)) >= 1);
  await page.evaluate(() => { const p = demo.posts[0]; openViewer(p.id, p.attachments.find(a => a.name === 'notes.txt').id); }); await sleep(300);
  t.ok('other documents show their details', (await page.$eval('#viewer-stage', e => e.innerText)).includes('Previews for Text files'));
  await page.keyboard.press('Escape');
  await page.evaluate(() => openViewer('p-unit-econ', 'a-ue')); await sleep(2500);
  t.ok('sample PDF renders', (await page.$$eval('#viewer-pdf canvas', x => x.length)) >= 1);
  await screenshot(page, 'viewer-pdf');
  await page.keyboard.press('Escape');

  // ---------- Likes, saves, comments, support ----------
  await page.evaluate(() => { toggleLike('p-rls'); toggleSave('p-rls'); toggleComments('p-rls'); }); await sleep(100);
  await page.type('#comment-p-rls', 'Super helpful, thanks Marcus!'); await page.keyboard.press('Enter'); await sleep(100);
  await page.evaluate(() => openComposer('support')); await sleep(100);
  await page.type('#cp-title', 'Best way to test Stripe webhooks locally?'); await page.click('#cp-submit'); await sleep(300);
  const supportId = await page.evaluate(() => demo.posts.find(p => p.type === 'support').id);
  await page.evaluate(id => markSolved(id), supportId);
  await page.evaluate(() => openComposer('work')); await sleep(100);
  const fieldOrder = await page.$$eval('#composer legend, #composer label.pf-label', x => x.map(e => e.textContent));
  t.ok('the opportunity form asks its questions in order', ['Looking for', 'Title', 'Pay', 'Commitment', 'Workplace', 'Start date', 'End date', 'About the project', 'Responsibilities', 'Minimum requirements', 'Nice to have (optional)'].every((l, i, all) => fieldOrder.indexOf(l) >= 0 && (i === 0 || fieldOrder.indexOf(all[i - 1]) < fieldOrder.indexOf(l))), fieldOrder.join('|'));
  t.ok('looking for starts on the other pathway', (await page.$eval('input[name=cp-looking]:checked', e => e.value)) === 'Business Developer');
  await page.click('input[name=cp-looking][value="Software Developer"] + .chip');
  await page.click('input[name=cp-type][value=resource] + .chip'); await page.click('input[name=cp-type][value=work] + .chip'); await sleep(100);
  t.ok('looking for is kept when switching post type and back', (await page.$eval('input[name=cp-looking]:checked', e => e.value)) === 'Software Developer');
  await page.click('input[name=cp-looking][value="Business Developer"] + .chip');
  t.ok('fees are in pounds only', !(await page.$('#cp-currency')) && (await page.$eval('#cp-amount-wrap', e => e.innerText)).includes('£'));
  await page.type('#cp-title', 'x'); await page.type('#cp-body', 'y'); await page.click('#cp-submit'); await sleep(100);
  const shown = id => page.$eval('#' + id + '-error', e => !e.classList.contains('hidden'));
  t.ok('an opportunity needs a fee, dates, responsibilities and requirements', await shown('cp-amount') && await shown('cp-start') && await shown('cp-end') && await shown('cp-duties') && await shown('cp-requirements'));
  await page.evaluate(() => { $('cp-start').value = '2026-12-10'; $('cp-end').value = '2026-12-01'; }); await page.click('#cp-submit'); await sleep(100);
  t.ok('the end date cannot be before the start', (await page.$eval('#cp-end-error', e => e.textContent)).includes('after the start date'));
  await page.click('input[name=cp-workplace][value="In person"] + .chip'); await page.click('#cp-submit'); await sleep(100);
  t.ok('in person needs a town or city', await shown('cp-town'));
  await page.evaluate(() => closeSheet());
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(500);
  const kept = await page.evaluate(id => ({ liked: postState('p-rls').liked, saved: postState('p-rls').saved, comment: !!postState('p-rls').comments[0], solved: postSolved(postById(id)), posts: demo.posts.length }), supportId);
  t.ok('likes, saves, comments, solved, and posts persist', kept.liked && kept.saved && kept.comment && kept.solved && kept.posts === 2, JSON.stringify(kept));
  await page.evaluate(() => { switchTab('feed'); setFeedFilter('all'); }); await sleep(700);
  t.ok('attachments still load after reload', await page.$eval('[data-post^="u-"] img', e => e.src.startsWith('blob:')));

  // ---------- Project loop: apply ----------
  await page.evaluate(() => openApply('p-tableturn')); await sleep(200);
  t.ok('the application asks for a message to the poster', (await page.$eval('label[for=apply-note]', e => e.textContent)) === 'Message to Diego');
  t.ok('the application asks for your most relevant work', (await page.$eval('label[for=apply-work]', e => e.textContent)) === 'Your most relevant work');
  await page.click('#sheet button[type=submit]'); await sleep(100);
  t.ok('a message is required', await page.$eval('#apply-note-error', e => !e.classList.contains('hidden')) && await page.evaluate(() => !demo.applications['p-tableturn']));
  await page.type('#apply-note', 'I want to go deeper on Stripe.'); await page.click('#sheet button[type=submit]'); await sleep(200);
  t.ok('application is pending', await page.evaluate(() => demo.applications['p-tableturn'].status === 'applied' && demo.applications['p-tableturn'].note === 'I want to go deeper on Stripe.'));
  await sleep(2600);
  const acc = await page.evaluate(() => ({ team: projectTeam(postById('p-tableturn')), chat: allChats().find(c => c.id === 'p-p-tableturn') }));
  t.ok('accepted: on the team with a project chat', acc.team.includes('me') && !!acc.chat && acc.chat.messages[0].from === 'system');
  t.ok('card offers Project chat and Mark complete', await page.$eval('[data-post="p-tableturn"]', e => e.innerText.includes('Project chat') && e.innerText.includes('Mark complete')));

  // ---------- Own opportunity: applicants, manage, start ----------
  await page.evaluate(() => openComposer('work')); await sleep(100);
  await page.type('#cp-title', 'Pricing page and pilot pitch for RefillRadar');
  await page.click('input[name=cp-commitment][value="Contract"] + .chip');
  await page.click('input[name=cp-workplace][value="Hybrid"] + .chip');
  await page.type('#cp-town', 'Leeds');
  await page.type('#cp-amount', '500');
  await page.evaluate(() => { $('cp-start').value = '2026-11-02'; $('cp-end').value = '2026-11-30'; });
  await page.type('#cp-body', 'Need a Business Developer to shape pricing and pitch the pilot.');
  await page.type('#cp-duties', 'Shape the pricing page\nPitch the pilot to one pharmacy');
  await page.type('#cp-requirements', "You've run customer interviews");
  await page.click('#cp-submit'); await sleep(300);
  const myPost = await page.evaluate(() => demo.posts.find(p => p.type === 'work').id);
  const mine = await card(myPost);
  t.ok('a posted opportunity shows its pathway, fee, commitment, workplace and dates', mine.cls.includes('border-l-applePurple') &&
    ['Business Developer', '£500, fixed', 'Contract', 'Hybrid · Leeds', '2 Nov – 30 Nov 2026'].every(x => mine.facts.includes(x)), JSON.stringify(mine.facts));
  t.ok('responsibilities are saved one per line', await page.evaluate(id => postById(id).responsibilities.length === 2, myPost));
  await sleep(5600);
  const apps = await page.evaluate(id => projectApplicantList(postById(id)).map(a => a.id), myPost);
  t.ok('members on the right pathway apply', apps.length >= 2 && await page.evaluate(ids => ids.every(id => person(id).track === 'Business Developer'), apps), apps.join());
  await page.evaluate(id => openManage(id), myPost); await sleep(200);
  const manage = await page.$eval('#sheet-panel', e => e.innerText);
  t.ok('Manage shows each applicant\'s message and relevant work, with no fit percentage', manage.includes('Relevant work:') && manage.includes('"') && !manage.includes('% fit'));
  await page.evaluate((id, who) => respondToApplicant(id, who, true), myPost, apps[0]); await sleep(200);
  t.ok('accepted applicant joins the team', await page.evaluate((id, who) => projectTeam(postById(id)).includes(who), myPost, apps[0]));
  await page.evaluate(id => startProject(id), myPost); await sleep(400);
  t.ok('starting the project opens its team chat', await page.evaluate(id => openChatId === projectState(postById(id)).chatId, myPost) && (await page.$eval('#thread-body', e => e.innerText)).includes('Project started'));

  // ---------- Complete: verified experience ----------
  await page.evaluate(() => { switchTab('feed'); openComplete('p-finance'); }); await sleep(200);
  t.ok('completion sheet lists 3 teammates', (await page.$$eval('#sheet-panel li.entry', x => x.length)) === 3);
  await page.click('input[name="rate-marcus"][value="4"] + .star');
  await page.type('#complete-note', 'Shipped the quarterly tax estimate screen.');
  await page.click('#sheet button[type=submit]'); await sleep(400);
  const v = await page.evaluate(() => ({ entry: demo.verified[0], endorsements: demo.endorsements, status: projectStatus(postById('p-finance')) }));
  t.ok('verified experience is added', v.entry && v.status === 'completed' && v.entry.given.find(g => g.id === 'marcus').rating === 4);
  t.ok('endorsements are received', Object.keys(v.endorsements).length > 0);
  await page.evaluate(() => switchTab('profile')); await sleep(200);
  t.ok('profile shows verified experience and endorsement counts', (await page.$eval('#verified-list', e => e.innerText)).includes('Freelancer Finance') && /\d/.test(await page.$eval('#skill-tags', e => e.innerText)));
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
  t.ok('verified experience persists after reload', await page.evaluate(() => demo.verified.length === 1));
  // ---------- Saved Personal project and Community posts load as updates ----------
  await page.evaluate(() => {
    demo.posts.push({ id: 'u-old-personal', type: 'personal', author: 'me', ts: Date.now() - 1000, title: 'StudyBuddy v1', body: 'Built a flashcard app.', feedback: true, attachments: [], likes: 0, comments: [] },
      { id: 'u-old-community', type: 'community', author: 'me', ts: Date.now() - 2000, title: 'Meetup', body: 'Pizza on Friday.', attachments: [], likes: 0, comments: [] });
    saveDemo();
  });
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(400);
  const old = await page.evaluate(() => ['u-old-personal', 'u-old-community'].map(id => { const p = postById(id); return [p.type, p.label || '', p.title, 'feedback' in p].join(':'); }));
  t.ok('saved Personal project and Community posts load as updates, keeping their title', old.join() === 'update:Project:StudyBuddy v1:false,update::Meetup:false', old.join());
  await page.evaluate(() => { switchTab('feed'); setFeedFilter('update'); }); await sleep(200);
  t.ok('upgraded posts show in the Updates filter', await page.$$eval('#feed-list article', x => ['u-old-personal', 'u-old-community'].every(id => x.some(e => e.dataset.post === id))));

  // ---------- Opportunities at 320px wide ----------
  await page.setViewport({ width: 320, height: 700 });
  await page.evaluate(() => { switchTab('feed'); setFeedFilter('work'); }); await sleep(300);
  t.ok('opportunity cards have no sideways scroll at 320px', await noHorizontalScroll(page));
  await page.evaluate(() => openOpportunity('p-tableturn')); await sleep(300);
  t.ok('the opportunity page has no sideways scroll at 320px', await noHorizontalScroll(page) && await page.$eval('#sheet-panel', e => e.scrollWidth <= e.clientWidth));
  await screenshot(page, 'opportunity-320');
  await page.keyboard.press('Escape'); await sleep(200);
  await page.evaluate(() => openComposer('work')); await sleep(200);
  t.ok('the opportunity form has no sideways scroll at 320px', await noHorizontalScroll(page) && await page.$eval('#sheet-panel', e => e.scrollWidth <= e.clientWidth));
  await page.evaluate(() => closeSheet());
  await page.evaluate(() => { setFeedFilter('update'); openComposer('update'); }); await sleep(200);
  t.ok('the update form and updates have no sideways scroll at 320px', await noHorizontalScroll(page) && await page.$eval('#sheet-panel', e => e.scrollWidth <= e.clientWidth));
  await page.evaluate(() => closeSheet());
  await page.setViewport({ width: 1440, height: 900 });

  // ---------- Connect is People only (D040) ----------
  await page.evaluate(() => switchTab('matching')); await sleep(300);
  t.ok('Connect has no Projects view', await page.evaluate(() => !$('projects-view') && !$('mm-view') && !$('people-view').classList.contains('hidden')));
  await page.close();
  fs.rmSync(tmp, { recursive: true, force: true });
};

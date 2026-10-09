// Specs 05–07: typed feed and attachments, matching v2, project loop and verified experience.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT, openApp, signUp, sleep, fixture, screenshot } = require('./helpers');

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

  // ---------- Matching v2 ----------
  const fit = id => page.evaluate(id => { const f = projectFit(postById(id), memberView('me')); return { score: f.score, blocked: f.blocked, reasons: f.reasons, blockers: f.blockers }; }, id);
  let f = await fit('p-tableturn');
  t.ok('strong skill match reason', f.reasons.some(r => r.startsWith('Strong skill match: React, Node.js, PostgreSQL')), JSON.stringify(f.reasons));
  t.ok('growth fit reason for a skill you want to learn', f.reasons.some(r => r.includes('practise Stripe')));
  t.ok('good fit scores 70%+', !f.blocked && f.score >= 70, 'score ' + f.score);
  f = await fit('p-finance');
  t.ok('pay-type filter blocks equity when not open to it', f.blocked && f.blockers[0].includes('equity'));
  f = await fit('p-footprint-landing');
  t.ok('track filter blocks a Business-only project for a developer', f.blocked && f.blockers[0].includes('Business Dev only'));
  await page.evaluate(() => { const a = currentAccount(); a.profile.hours = 'Under 10'; saveAccount(a); });
  f = await fit('p-tableturn');
  t.ok('hours filter blocks a 10–20 hrs project for someone with under 10', f.blocked && f.blockers.some(b => b.includes('Needs 10–20')));
  await page.evaluate(() => { const a = currentAccount(); a.profile.hours = '10–20'; saveAccount(a); });
  // People suggestions replaced two-way person fit (spec 10); their tests are in community.test.js
  const people = await page.evaluate(() => ['elena', 'marcus', 'diego'].map(id => suggestionFor(id)));
  t.ok('people suggestions include two-way skill reasons', people.some(p => p.reasons.some(r => r.startsWith('Can help you learn') || r.startsWith('You can help them'))));
  const team = await page.evaluate(() => suggestTeam(postById('p-refill')).map(x => x.role.track));
  t.ok('team suggestions cover every open role', team.length === 2 && team.includes('Software Developer') && team.includes('Business Developer'));

  // ---------- Feed filters and fees ----------
  await page.evaluate(() => switchTab('feed')); await sleep(300);
  const forYou = await page.$$eval('#feed-list article', x => x.map(e => e.dataset.post));
  t.ok('For you hides blocked projects and ranks good fits first', !forYou.includes('p-footprint-landing') && forYou.includes('p-tableturn') &&
    (forYou.indexOf('p-tableturn') < forYou.indexOf('p-gradeloop') || !forYou.includes('p-gradeloop')));
  for (const [k, label] of [['work', 'Project'], ['resource', 'Resource'], ['personal', 'Personal project'], ['support', 'Support'], ['community', 'Community']]) {
    await page.evaluate(k => setFeedFilter(k), k); await sleep(100);
    const badges = await page.$$eval('#feed-list article', x => x.map(e => e.querySelector('span.shrink-0.inline-flex').textContent.trim()));
    t.ok('filter ' + k + ' shows only ' + label + ' posts', badges.length > 0 && badges.every(b => b === label));
  }
  await page.evaluate(() => setFeedFilter('work')); await sleep(100);
  t.ok('sample fees are in pounds', (await page.$$eval('#feed-list article', x => x.map(e => (e.innerText.match(/Paid · \S+/) || [])[0]).filter(Boolean).join())) === 'Paid · £950,Paid · £300');

  // ---------- Composer, attachments, viewer ----------
  await page.evaluate(() => { setFeedFilter('all'); openComposer('community'); }); await sleep(200);
  await page.click('#cp-submit'); await sleep(100);
  t.ok('a community post needs a message', await page.$eval('#cp-body-error', e => !e.classList.contains('hidden')));
  await page.type('#cp-title', 'Sprint demo recording + notes');
  t.ok('typing clears the error', await page.$eval('#cp-title-error', e => e.classList.contains('hidden')));
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
  t.ok('new post shows photo, video, and link', await page.$eval('#feed-list article', e => e.dataset.post.startsWith('u-') && e.querySelectorAll('img').length === 1 && e.querySelectorAll('video').length === 1 && e.querySelectorAll('a[target=_blank]').length === 1));
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
  await page.type('#cp-title', 'x'); await page.type('#cp-body', 'y'); await page.click('#cp-submit'); await sleep(100);
  t.ok('a project needs roles and a deliverable', await page.$eval('#cp-roles-error', e => !e.classList.contains('hidden')) && await page.$eval('#cp-deliverable-error', e => !e.classList.contains('hidden')));
  t.ok('fixed fee defaults to pounds', (await page.$eval('#cp-currency', e => e.value)) === 'GBP');
  await page.evaluate(() => closeSheet());
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(500);
  const kept = await page.evaluate(id => ({ liked: postState('p-rls').liked, saved: postState('p-rls').saved, comment: !!postState('p-rls').comments[0], solved: postSolved(postById(id)), posts: demo.posts.length }), supportId);
  t.ok('likes, saves, comments, solved, and posts persist', kept.liked && kept.saved && kept.comment && kept.solved && kept.posts === 2, JSON.stringify(kept));
  await page.evaluate(() => { switchTab('feed'); setFeedFilter('all'); }); await sleep(700);
  t.ok('attachments still load after reload', await page.$eval('[data-post^="u-"] img', e => e.src.startsWith('blob:')));

  // ---------- Project loop: apply ----------
  await page.evaluate(() => openApply('p-tableturn')); await sleep(200);
  await page.type('#apply-note', 'I want to go deeper on Stripe.'); await page.click('#sheet button[type=submit]'); await sleep(200);
  t.ok('application is pending', await page.evaluate(() => demo.applications['p-tableturn'].status === 'applied'));
  await sleep(2600);
  const acc = await page.evaluate(() => ({ team: projectTeam(postById('p-tableturn')), chat: allChats().find(c => c.id === 'p-p-tableturn') }));
  t.ok('accepted: on the team with a project chat', acc.team.includes('me') && !!acc.chat && acc.chat.messages[0].from === 'system');
  t.ok('card offers Project chat and Mark complete', await page.$eval('[data-post="p-tableturn"]', e => e.innerText.includes('Project chat') && e.innerText.includes('Mark complete')));

  // ---------- Own project: applicants, manage, start ----------
  await page.evaluate(() => openComposer('work')); await sleep(100);
  await page.type('#cp-title', 'Pricing page and pilot pitch for RefillRadar');
  await page.type('#cp-body', 'Need a Biz partner to shape pricing and pitch the pilot.');
  await page.evaluate(() => { $('cp-role-track-0').value = 'Business Developer'; });
  await page.type('#cp-role-skills-0', 'Pricing, Customer discovery, Sales');
  await page.click('input[name=cp-hours][value="Under 10"] + .chip');
  await page.select('#cp-currency', 'EUR');
  await page.type('#cp-amount', '500'); await page.type('#cp-deliverable', 'Pricing page + pilot agreement draft');
  await page.click('#cp-submit'); await sleep(300);
  const myPost = await page.evaluate(() => demo.posts.find(p => p.type === 'work').id);
  t.ok('fee shows in the chosen currency', (await page.$eval(`[data-post="${myPost}"]`, e => e.innerText)).includes('Paid · €500'));
  await sleep(5600);
  const apps = await page.evaluate(id => projectApplicantList(postById(id)).map(a => a.id), myPost);
  t.ok('best-fitting members apply', apps.length >= 2, apps.join());
  await page.evaluate(id => openManage(id), myPost); await sleep(200);
  t.ok('Manage lists applicants with fit', (await page.$eval('#sheet-panel', e => e.innerText)).includes('% fit'));
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
  await page.close();
  fs.rmSync(tmp, { recursive: true, force: true });
};

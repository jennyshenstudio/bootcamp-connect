// Spec 15: the profile page (D050).
const { openApp, signUp, sleep, visible, noHorizontalScroll } = require('./helpers');

module.exports = async (browser, t) => {
  const page = await openApp(browser, t);
  await signUp(page);
  const text = id => page.$eval('#' + id, e => e.innerText);
  const toast = () => page.$eval('#toast', e => e.textContent);
  const clickText = (root, label) => page.evaluate((root, label) => [...document.querySelectorAll(root + ' button')].find(b => b.textContent.trim() === label).click(), root, label);

  // ---------- Your Profile tab: the form first, then your page ----------
  t.ok('a new member starts on the form, with the banner', await visible(page, 'profile-edit') && await visible(page, 'profile-banner') && !(await visible(page, 'profile-page')));
  const form = await page.evaluate(() => ({
    main: [...document.querySelectorAll('#profile-form > div > [id^="pf-section-"]')].map(e => e.id.replace('pf-section-', '')),
    side: [...document.querySelectorAll('#profile-form > aside > [id^="pf-section-"]')].map(e => e.id.replace('pf-section-', '')),
    preview: !!document.getElementById('pv-photo'),
  }));
  t.ok('the form is laid out like the page: top card and main sections, then the side column (D051)',
    form.main.join() === 'basics,about,work,skills,experience,education,verified' && form.side.join() === 'strength,import,looking,links' && !form.preview, JSON.stringify(form));
  await page.type('#pf-headline', 'Full-stack developer · ex-teacher');
  await page.click('#profile-form button[type=submit]'); await sleep(300);
  t.ok('Save profile returns to your page', await visible(page, 'profile-page') && !(await visible(page, 'profile-edit')) && (await text('profile-page')).includes('Full-stack developer · ex-teacher'));
  t.ok('your page has Edit profile and no Connect, Message or Why you might connect', await page.$('#profile-page [data-focus-key="edit"]') !== null &&
    !/Why you might connect|Connect with|Message/.test(await text('profile-page')));
  await page.click('#profile-page [data-focus-key="edit"]'); await sleep(200);
  t.ok('Edit profile opens the form, with focus on its title', await visible(page, 'profile-edit') && await page.evaluate(() => document.activeElement.id === 'profile-edit-title'));
  await page.$eval('#pf-headline', e => { e.value = 'Changed my mind'; });
  await page.click('#profile-cancel'); await sleep(200);
  t.ok('Cancel returns to your page without saving, and puts the form back', (await text('profile-page')).includes('Full-stack developer · ex-teacher') &&
    (await page.$eval('#pf-headline', e => e.value)) === 'Full-stack developer · ex-teacher');
  await page.evaluate(() => { editMyProfile(); $('pf-headline').value = 'Unsaved'; openPerson('me'); }); await sleep(200);
  t.ok('while you are editing, the Profile tab stays on the form', await visible(page, 'profile-edit') && !(await visible(page, 'profile-page')));
  await page.click('#profile-cancel'); await sleep(200);

  // ---------- Someone else's page ----------
  await page.evaluate(() => { switchTab('feed'); setFeedFilter('all'); }); await sleep(300);
  await page.click('#feed-list [data-post="p-finance"] button.font-semibold'); await sleep(300);
  t.ok('selecting a name opens their profile page, not a sheet, with focus on their name', await visible(page, 'tab-person') && await page.$eval('#sheet', e => e.classList.contains('hidden')) &&
    await page.evaluate(() => document.activeElement.id === 'profile-name' && $('profile-name').textContent === 'Sarah Jenkins'));
  const sarah = await text('person-page');
  t.ok('their page shows Message and Why you might connect, and no Edit profile or Saved', sarah.includes('Message') && sarah.includes('Why you might connect') && !sarah.includes('Edit profile') && !sarah.includes('Saved'));
  const pinned = await page.$$eval('#person-page section', x => { const s = x.find(e => e.querySelector('h2') && e.querySelector('h2').textContent === 'Pinned'); return s ? [...s.querySelectorAll('h3')].map(h => h.textContent) : []; });
  t.ok('pinned work and posts show first, in the order pinned', pinned.join(' | ') === 'Freelancer Finance waitlist | Freelancer Finance: AI tax and savings planner (MVP)', pinned.join(' | '));
  t.ok('the side column has the CV, Available for and Group chats together', ['View CV', 'Available for', 'Group chats together'].every(s => sarah.includes(s)));
  await page.setViewport({ width: 320, height: 700 }); await sleep(200);
  t.ok('a profile page has no sideways scroll at 320px', await noHorizontalScroll(page));
  await page.setViewport({ width: 1440, height: 900 }); await sleep(200);

  // ---------- CV ----------
  await clickText('#person-page', 'View CV'); await sleep(200);
  const cv = await text('sheet-panel');
  t.ok('View CV shows a CV made from the profile, with Print or save as PDF', cv.includes('Sarah Jenkins') && cv.includes('EXPERIENCE') && cv.includes('Founder') && cv.includes('Print or save as PDF') && cv.includes('Made from Sarah\'s profile'), cv.slice(0, 200));
  t.ok('the CV has no email address or phone number', !/@|\+44|\b0\d{9,10}\b/.test(cv));
  await page.keyboard.press('Escape'); await sleep(100);
  await clickText('#person-page', 'Back to Feed'); await sleep(200);
  t.ok('Back returns to where you came from', await visible(page, 'tab-feed') && !(await page.$eval('#person-page', e => e.innerHTML)));

  // ---------- Your posts, pins and saves ----------
  for (const title of ['First question', 'Second question', 'Third question', 'Fourth question']) {
    await page.evaluate(() => openComposer('support')); await sleep(150);
    await page.type('#cp-title', title);
    await page.click('#cp-submit'); await sleep(250);
  }
  await page.evaluate(() => openPerson('me')); await sleep(200);
  const rows = () => page.$$eval('#profile-page [data-pin^="posts:"]', x => x.map(b => b.closest('li').innerText));
  let posts = await rows();
  t.ok('Posts shows your 2 newest posts, then Show all posts', posts.length === 2 && posts[0].includes('Fourth question') && (await text('profile-page')).includes('Show all posts (4)'));
  await page.click('#profile-page [data-focus-key="posts-more"]'); await sleep(200);
  posts = await rows();
  t.ok('Show all posts shows them all, newest first', posts.length === 4 && posts[3].includes('First question'));

  const pinBtn = n => page.$$eval('#profile-page [data-pin^="posts:"]', (x, n) => x[n].click(), n);
  for (let i = 0; i < 3; i++) { await pinBtn(i); await sleep(150); }
  t.ok('pinning saves straight away and keeps focus on the button', (await toast()) === 'Pinned to your profile' && await page.evaluate(() => document.activeElement.dataset.pin && document.activeElement.textContent === 'Unpin') &&
    (await page.evaluate(() => profileOf(currentAccount()).pinned.length)) === 3);
  await pinBtn(3); await sleep(150);
  t.ok('a fourth pin is refused with a message', (await toast()) === 'You can pin up to 3. Unpin one first.' && (await page.evaluate(() => profileOf(currentAccount()).pinned.length)) === 3);
  await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
  await page.evaluate(() => openPerson('me')); await sleep(200);
  const myPinned = await page.$$eval('#profile-page [data-pin^="pinned:"]', x => x.map(b => b.closest('li').querySelector('h3').textContent));
  t.ok('pins show first on your page, in the order pinned, after a reload', myPinned.join() === 'Fourth question,Third question,Second question', myPinned.join());
  await page.$eval('#profile-page [data-pin^="pinned:"]', b => b.click()); await sleep(150);
  t.ok('Unpin from Pinned removes it and moves focus to the Pinned heading', (await toast()) === 'Unpinned' && await page.evaluate(() => document.activeElement.id === 'pinned-title') &&
    (await page.$$eval('#profile-page [data-pin^="pinned:"]', x => x.length)) === 2);
  const third = await page.evaluate(() => demo.posts.find(p => p.title === 'Third question').id);
  await page.evaluate(id => deletePost(id), third); await sleep(200);
  t.ok('deleting a pinned post unpins it', await page.evaluate(id => !profileOf(currentAccount()).pinned.some(p => p.id === id), third));

  t.ok('Saved is on your page only, and starts empty', (await text('profile-page')).includes('Only you can see this.') && (await text('profile-page')).includes('Nothing saved yet.'));
  await page.evaluate(() => toggleSave('p-yc-library')); await sleep(200);
  t.ok('a saved resource shows in Saved', (await page.$eval('#profile-page .saved-card', e => e.innerText)).includes('Free startup library worth bookmarking'));
  // Saving or liking in a sheet updates the page underneath, and focus comes back to the button that opened it
  await page.click('#profile-page [data-focus-key="saved-open:p-yc-library"]'); await sleep(200);
  await page.evaluate(() => toggleLike('p-yc-library')); await sleep(100);
  await page.keyboard.press('Escape'); await sleep(200);
  t.ok('closing a sheet returns focus to the button that opened it, after the page updates', await page.evaluate(() => document.activeElement.dataset.focusKey === 'saved-open:p-yc-library'));
  const pinnedLikes = await page.evaluate(() => { const p = demo.posts.find(x => x.title === 'Second question'); toggleLike(p.id); return document.querySelector('#profile-page [data-focus-key="pinned-open:' + p.id + '"]').closest('li').innerText; });
  t.ok('a pinned post\'s like count updates on the page', pinnedLikes.includes('1 like'), pinnedLikes);

  // Your work is pinned by its lasting id: renaming keeps the pin, and two pieces with one title stay apart
  await page.evaluate(() => updateProfile(currentAccount(), { pinned: [], work: [{ ...emptyWork(), id: 'wk-1', title: 'Portfolio site', result: 'Live' }, { ...emptyWork(), id: 'wk-2', title: 'Portfolio site', result: 'Live' }] }));
  await page.evaluate(() => { loadProfileForm(currentAccount()); openPerson('me'); }); await sleep(200);
  await page.$$eval('#profile-page [data-pin^="work:"]', x => x[1].click()); await sleep(150);
  const same = await page.$$eval('#profile-page [data-pin^="work:"]', x => x.map(b => b.textContent));
  t.ok('two pieces with the same title are pinned separately', same.join() === 'Pin,Unpin' && (await page.evaluate(() => profileOf(currentAccount()).pinned[0].id)) === 'wk-2', same.join());
  await page.evaluate(() => { const w = profileOf(currentAccount()).work; w[1].title = 'Portfolio site, rebuilt'; updateProfile(currentAccount(), { work: w }); loadProfileForm(currentAccount()); refreshProfilePages(); }); await sleep(150);
  t.ok('renaming a pinned piece keeps the pin', (await page.$$eval('#profile-page [data-pin^="pinned:"]', x => x.map(b => b.closest('li').querySelector('h3').textContent))).join() === 'Portfolio site, rebuilt');

  t.ok('the page sets its banner colours without a style attribute (D027)', await page.evaluate(() => {
    const d = document.createElement('div'); d.innerHTML = profilePageHtml('me');
    return !d.querySelector('[data-banner]').hasAttribute('style') && getComputedStyle(document.querySelector('#profile-page [data-banner]')).backgroundImage.includes('gradient');
  }));
  await page.emulateMediaType('print');
  t.ok('printing anything other than a CV leaves the page as it is', await page.$eval('#app-dashboard', e => getComputedStyle(e).display !== 'none'));
  await page.evaluate(() => { openCv('me'); document.body.classList.add('printing-cv'); });
  t.ok('printing a CV shows only the CV', await page.evaluate(() => getComputedStyle($('app-dashboard')).display === 'none' && getComputedStyle($('sheet')).display !== 'none' && getComputedStyle(document.querySelector('.cv-actions')).display === 'none'));
  await page.evaluate(() => { document.body.classList.remove('printing-cv'); closeSheet(); });
  await page.emulateMediaType('screen');

  await page.setViewport({ width: 320, height: 700 }); await sleep(200);
  t.ok('your page has no sideways scroll at 320px', await noHorizontalScroll(page));
  await page.close();
};

// Spec 01: sign-up, log in, log out, one-screen sign-up page.
const { openApp, signUp, visible, sleep, noHorizontalScroll, pageFits } = require('./helpers');

module.exports = async (browser, t) => {
  let page = await openApp(browser, t);

  await page.click('#auth-submit');
  t.ok('sign-up without track or terms shows both errors', await visible(page, 'track-error') && await visible(page, 'terms-error'));
  t.ok('dashboard stays hidden after a failed sign-up', !(await visible(page, 'app-dashboard')));
  await page.click('button[data-on-click="handleGoogle()"]');
  t.ok('Google sign-up is blocked until track and terms are chosen', !(await visible(page, 'app-dashboard')));

  await page.click('#mode-login');
  await page.type('#email', 'nobody@example.com'); await page.type('#password', 'password123');
  await page.click('#auth-submit');
  t.ok('log in with an unknown email shows an error', await visible(page, 'auth-error'));

  await page.click('#mode-signup');
  await page.$eval('#auth-form', f => f.reset());
  await signUp(page, { first: 'Alex', last: 'Chen', email: 'alex@bootcamp.edu', track: 'biz' });
  t.ok('new sign-up lands on the profile tab with the banner', await visible(page, 'tab-profile') && await visible(page, 'profile-banner'));
  t.ok('track badge shows Business Dev', (await page.$eval('#user-pill', e => e.textContent)).includes('Business Dev'));
  t.ok('no "Signed in as" line', !(await page.evaluate(() => document.body.innerText.includes('Signed in as'))));

  await page.reload({ waitUntil: 'networkidle0' });
  t.ok('session survives a reload', await visible(page, 'app-dashboard'));

  await page.click('button[data-on-click="logout()"]'); await sleep(800);
  t.ok('log out returns to Log in with the email filled in',
    await visible(page, 'auth-screen') && (await page.$eval('#auth-title', e => e.textContent)) === 'Welcome back' && (await page.$eval('#email', e => e.value)) === 'alex@bootcamp.edu');
  await page.type('#password', 'anything1'); await page.click('#auth-submit'); await sleep(1000);
  t.ok('returning member logs in to the Feed', await visible(page, 'tab-feed') && !(await visible(page, 'profile-banner')));
  await page.close();

  // The sign-up page fits one screen at common sizes
  for (const [width, height] of [[1440, 900], [1366, 768], [1280, 720], [1280, 650], [390, 844]]) {
    page = await openApp(browser, t, { width, height });
    t.ok(`sign-up fits one screen at ${width}×${height}`, await pageFits(page) && await noHorizontalScroll(page));
    await page.close();
  }
};

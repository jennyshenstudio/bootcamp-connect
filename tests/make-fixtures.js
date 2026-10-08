// Recreates the small test files in tests/fixtures/ (run with `npm run test:fixtures`).
// The Word CV (cv-word.docx) is made by tests/fixtures/make_docx.py (needs python-docx).
const fs = require('fs');
const { launch, fixture } = require('./helpers');

const LINKEDIN_PDF_HTML = `<html><body style="font-family:Helvetica;display:flex;gap:40px">
<div style="width:180px">
<h3>Contact</h3><p>www.linkedin.com/in/jordan-lee-dev (LinkedIn)</p>
<h3>Top Skills</h3><p>React</p><p>Node.js</p><p>PostgreSQL</p>
<h3>Languages</h3><p>English</p>
</div>
<div>
<h1>Jordan Lee</h1><p>Full-Stack Developer | Bootcamp Grad | Ex-Barista</p><p>Seattle, Washington, United States</p>
<h2>Summary</h2><p>Career changer who builds web apps end to end. I like small teams, fast feedback, and shipping things people use.</p>
<h2>Experience</h2>
<p>Zillow</p><p>Software Engineering Intern</p><p>June 2024 - Present (4 months)</p><p>Seattle, Washington</p><p>Built React components for the listings page and cut load time by 20%.</p>
<p>Starbucks</p><p>Shift Supervisor</p><p>March 2019 - May 2024 (5 years 3 months)</p><p>Ran a team of 8 and trained new baristas.</p>
<h2>Education</h2><p>General Assembly</p><p>Software Engineering Immersive · (2024)</p>
</div></body></html>`;

(async () => {
  fs.mkdirSync(fixture(''), { recursive: true });
  const browser = await launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 400, height: 300 });
  await page.setContent('<div style="width:400px;height:300px;background:linear-gradient(135deg,#f97316,#7c3aed)"></div>');
  await page.screenshot({ path: fixture('photo.png') });

  await page.setContent(LINKEDIN_PDF_HTML);
  await page.pdf({ path: fixture('linkedin-profile.pdf'), format: 'A4' });

  const b64 = await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const ctx = c.getContext('2d');
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: 'video/webm' });
    const chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    rec.start();
    let f = 0;
    await new Promise(r => { const t = setInterval(() => { ctx.fillStyle = `hsl(${f * 6},70%,55%)`; ctx.fillRect(0, 0, 320, 180); if (++f > 45) { clearInterval(t); r(); } }, 33); });
    rec.stop(); await new Promise(r => rec.onstop = r);
    const buf = await new Blob(chunks).arrayBuffer();
    let s = ''; new Uint8Array(buf).forEach(x => s += String.fromCharCode(x)); return btoa(s);
  });
  fs.writeFileSync(fixture('clip.webm'), Buffer.from(b64, 'base64'));
  fs.writeFileSync(fixture('notes.txt'), 'Sprint notes\n- booking flow\n- deposit refunds\n');

  await browser.close();
  console.log('Fixtures written to tests/fixtures/');
})();

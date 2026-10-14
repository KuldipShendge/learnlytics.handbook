// Local browser regression checks. Requires Playwright and a Chromium installation.
// NODE_PATH may point to the bundled Playwright packages; BROWSER_PATH overrides Chrome.
// Optional BASELINE_ROOT compares all five product hero layouts against a local baseline.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const catalog = require('../js/course-catalog.js');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'phase3a');
fs.mkdirSync(output, { recursive: true });
const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml' };
async function serve(directory) {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(directory, '.' + pathname);
    if (!file.startsWith(directory + path.sep) && file !== directory) { res.writeHead(403); return res.end(); }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      if (path.extname(pathname)) { res.writeHead(404); return res.end(); }
      file = path.join(directory, 'index.html');
    }
    res.setHeader('Content-Type', (mime[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
async function heroSignature(page, id) {
  return page.locator(`#course-${id} .dakit-hero`).evaluate(hero => {
    const properties = ['display','gridTemplateColumns','width','padding','fontSize','color','backgroundColor','borderRadius'];
    return [hero, ...hero.querySelectorAll('.dakit-hero-title, .dakit-hero-inner, .dakit-hero-pricing-new, .dakit-hero-right')].map(el => {
      const style = getComputedStyle(el);
      return { className: el.className, styles: Object.fromEntries(properties.map(p => [p, style[p]])) };
    });
  });
}
(async () => {
  const local = await serve(root);
  const baseline = process.env.BASELINE_ROOT ? await serve(path.resolve(process.env.BASELINE_ROOT)) : null;
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  // All external requests are blocked: no analytics, payment, form or download requests leave this test.
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const go = async (url, country = 'IN') => {
    await page.goto(local.url + url + (url.includes('?') ? '&' : '?') + 'test-country=' + country);
    await page.evaluate(() => window.checkoutRegionReady);
  };
  try {
    // Source protection covers product markup, footer and all shared dialogs.
    if (baseline) {
      const before = fs.readFileSync(path.join(process.env.BASELINE_ROOT, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
      const after = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
      const start = before.indexOf('id="course-data-analyst"');
      const end = before.indexOf('<nav class="outer-nav">');
      assert(after.includes(before.slice(start, end).trim()), 'All product markup and shared footer must remain verbatim');
      for (const file of ['js/kit-payments.js','js/ml-pdf-samples.js','js/ml-module-preview.js','js/aptitude-kit.js','js/hero-videos.js','free-ml-part-01.html']) {
        assert(fs.readFileSync(path.join(process.env.BASELINE_ROOT, file)).equals(fs.readFileSync(path.join(root, file))), `${file} changed`);
      }
    }
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await go('/');
      assert(await page.locator('#home-title').isVisible());
      assert.equal(await page.locator('.home-kit').count(), 5);
      assert.equal(await page.locator('.home-resource').count(), 5);
      assert.equal(await page.locator('#main-stage, #track, #homeFooter, .outer-nav, #detail-view').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`);
      for (const img of await page.locator('.home-page img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(image => image.decode());
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await go('/');
    await page.locator('a[href="#home-kits"]').click();
    assert.equal(await page.locator('#home-kits-title').evaluate(el => el === document.activeElement), true);
    for (const course of catalog.courses) {
      await page.evaluate(() => showDashboard());
      await page.locator(`[data-home-course-link="${course.id}"]`).click();
      assert.equal(new URL(page.url()).pathname, course.path);
      assert(await page.locator(`#course-${course.id}`).isVisible());
      await page.goBack();
      assert(await page.locator('#home-title').isVisible());
    }
    for (const id of Object.keys(catalog.freeBooks)) {
      await page.locator(`[data-home-download="${id}"]`).click();
      assert(await page.locator('#modal.open').isVisible(), `${id} free form`);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#modal.open').count(), 0);
    }
    await page.locator('[data-home-help]').click();
    assert(await page.locator('#course-help').isVisible());
    await page.evaluate(() => { sessionStorage.setItem('lastLearnyticsUrl', '/course-bundles/data-scientist-genai-engineer-bundle'); });
    for (const url of ['/', '/index.html', '/course-bundles']) { await go(url); assert(await page.locator('#home-title').isVisible()); }
    for (const country of ['IN', 'US', 'DE', 'AU', 'JP', 'ZA']) {
      await go('/', country);
      for (const course of catalog.courses.filter(c => c.price)) {
        const values = await page.locator(`[data-catalog-price="${course.id}"]:not([data-price-field]), [data-catalog-price="${course.id}"][data-price-field="price"]`).allTextContents();
        assert(values.length > 1, 'Related cards must exist');
        assert(values.every(v => v === values[0]), `${country}/${course.id} price mismatch`);
        const expected = course.id === 'ds-genai-ml' ? (country === 'IN' ? '₹899' : '$24.99')
          : course.id === 'data-science' ? (country === 'IN' ? '₹499' : '$14.99')
          : course.id === 'ai-automation' ? (['US','DE'].includes(country) ? '$14.99' : '₹499')
          : ['IN','JP','ZA'].includes(country) ? '₹399' : '$14.99';
        assert.equal(values[0], expected, `${country}/${course.id} market`);
      }
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const course of catalog.courses) {
        await go(course.path);
        assert(await page.locator(`#course-${course.id}.active`).isVisible());
        if (baseline) {
          const before = await context.newPage();
          await before.setViewportSize({ width, height: 900 });
          await before.goto(baseline.url + course.path + '?test-country=IN');
          assert.deepEqual(await heroSignature(page, course.id), await heroSignature(before, course.id), `${course.id} hero styles at ${width}`);
          await before.close();
        }
        if (course.id !== 'data-analyst') {
          await page.locator(`#course-${course.id} .ml-module-summary`).first().click();
          assert(await page.locator(`#course-${course.id} .ml-module-dialog[open]`).isVisible());
          await page.keyboard.press('Escape');
        }
        if (course.id === 'aptitude-kit') {
          await page.locator('#course-aptitude-kit [data-ak-register]').first().click();
          assert(await page.locator('#ak-register-dialog[open]').isVisible());
          await page.keyboard.press('Escape');
        } else {
          const links = page.locator(`#course-${course.id} .related-course-link`);
          assert.equal(await links.count(), 3);
          await links.first().click();
          assert.notEqual(new URL(page.url()).pathname, course.path);
        }
      }
    }
    await go('/course-bundles/data-scientist-genai-engineer-bundle');
    await page.locator('#course-data-science [data-ml-pdf]').first().click();
    assert(await page.locator('#mlPdfPreview[open]').isVisible());
    await page.keyboard.press('Escape');
    await page.locator('#course-data-science [data-kit-video]').first().click();
    assert(await page.locator('#kitVideoDialog[open]').isVisible());
    await page.keyboard.press('Escape');
    // Removing homepage DOM cannot affect recommendation construction or prices.
    await page.evaluate(() => document.getElementById('coursesMenuSection').remove());
    await page.addScriptTag({ url: local.url + '/js/related-courses.js' });
    assert.equal(await page.locator('#course-data-science .related-course-card').count(), 6);
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS: five responsive widths; homepage links/history; five free forms; six pricing markets; five product routes and layouts; module, registration, PDF and video dialogs; recommendations independent of homepage DOM; no page errors.');
  } finally {
    await browser.close();
    local.server.close();
    baseline?.server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

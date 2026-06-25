// Headless verification for the data-layer labs (code-lab.js).
// For each lab: load it, assert the STARTER is incomplete, click "Show solution",
// assert ALL checks pass + the completion banner shows, exercise every scenario
// button, and assert no page/console errors anywhere. Also smoke-tests index.html.
//
// Run:  node labs/verify-code-labs.mjs        (from the repo root)
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire('/Users/joepangallo/AndroidStudioProjects/NetworkParsing/');
const { chromium } = require('playwright');

const labsDir = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const LABS = [
  'net-01-dto', 'net-02-retrofit', 'net-03-mapper', 'net-04-uistate', 'net-05-error',
  'fire-01-entity', 'fire-02-optimistic', 'fire-03-tombstone', 'fire-04-lww', 'fire-05-sync',
  'supa-01-serialname', 'supa-02-select', 'supa-03-upsert', 'supa-04-rls', 'supa-05-client',
  'cap-01-statein', 'cap-02-routing', 'cap-03-purelogic', 'cap-04-sharedstate', 'cap-05-offlinefirst',
];

const fails = [];
function check(cond, msg) { if (!cond) fails.push(msg); }

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  for (const lab of LABS) {
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    const url = pathToFileURL(path.join(labsDir, lab + '.html')).href;
    await page.goto(url);
    await page.waitForSelector('.checkitem');

    const total = await page.locator('.checkitem').count();
    check(total >= 2, `${lab}: expected >=2 checks, got ${total}`);

    // starter must be incomplete (at least one check failing)
    const starterOk = await page.locator('.checkitem.ok').count();
    check(starterOk < total, `${lab}: STARTER already passes all ${total} checks (should be incomplete)`);
    const bannerVisibleStart = await page.locator('.banner').isVisible();
    check(!bannerVisibleStart, `${lab}: completion banner visible on the STARTER`);

    // reveal the solution → every check must pass
    await page.locator('.labbtns .btn', { hasText: 'solution' }).click();
    await page.waitForTimeout(60);
    const solvedOk = await page.locator('.checkitem.ok').count();
    check(solvedOk === total, `${lab}: SOLUTION passes ${solvedOk}/${total} checks (want ${total})`);
    const bannerVisible = await page.locator('.banner').isVisible();
    check(bannerVisible, `${lab}: completion banner NOT shown after solution`);
    const heroDone = await page.evaluate(() => document.querySelector('header.hero')?.classList.contains('done'));
    check(heroDone, `${lab}: hero not marked done after solution`);
    const progText = await page.locator('.hchip.prog').textContent();
    check(progText.trim() === `${total} / ${total} checks`, `${lab}: progress chip says "${progText}" (want ${total}/${total})`);

    // simulator rendered something
    const simKids = await page.locator('.previewstage').evaluate((n) => n.childElementCount);
    check(simKids > 0, `${lab}: simulator rendered nothing after solution`);

    // exercise every scenario button (if any)
    const scn = page.locator('.simbar .simbtn');
    const scnCount = await scn.count();
    for (let i = 0; i < scnCount; i++) {
      await scn.nth(i).click();
      await page.waitForTimeout(20);
      const kids = await page.locator('.previewstage').evaluate((n) => n.childElementCount);
      check(kids > 0, `${lab}: scenario #${i} rendered nothing`);
    }

    // reset must drop back to incomplete
    await page.locator('.labbtns .btn', { hasText: 'Reset' }).click();
    await page.waitForTimeout(60);
    const afterResetOk = await page.locator('.checkitem.ok').count();
    check(afterResetOk < total, `${lab}: still complete after Reset`);

    check(errors.length === 0, `${lab}: JS errors → ${errors.join(' | ')}`);
    await page.close();
  }

  // index smoke test: 33 cards total, no errors
  const idxErrors = [];
  ctx.on('pageerror', (e) => idxErrors.push('pageerror: ' + e.message));
  ctx.on('console', (m) => { if (m.type() === 'error') idxErrors.push('console: ' + m.text()); });
  await ctx.goto(pathToFileURL(path.join(labsDir, 'index.html')).href);
  await ctx.waitForSelector('.labcard');
  const cards = await ctx.locator('.labcard').count();
  check(cards === 33, `index.html: expected 33 lab cards, got ${cards}`);
  const broken = await ctx.locator('.labcard[href=""]').count();
  check(broken === 0, `index.html: ${broken} cards with empty href`);
  check(idxErrors.length === 0, `index.html: JS errors → ${idxErrors.join(' | ')}`);

  await browser.close();

  if (fails.length) {
    console.error('❌ VERIFICATION FAILED (' + fails.length + ')');
    for (const f of fails) console.error('  • ' + f);
    process.exit(1);
  }
  console.log(`✅ All ${LABS.length} labs verified: starters incomplete, solutions pass every check, scenarios render, index lists 33 cards, zero JS errors.`);
}

run().catch((e) => { console.error(e.stack || e.message); process.exit(1); });

import fs from 'node:fs';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const gender = process.argv[2];
const videoPath = process.argv[3];
const baseUrl = process.argv[4] || 'http://127.0.0.1:4173';
const chrome = process.env.CHROME;
const HARD_DEADLINE_MS = 95000;

if (!['male', 'female'].includes(gender)) throw new Error('gender must be male or female');
if (!videoPath || !fs.existsSync(videoPath)) throw new Error(`missing fake camera video: ${videoPath}`);
if (!chrome) throw new Error('CHROME environment variable is required');

const resultPath = `/tmp/chisel-${gender}-result.txt`;
const logPath = `/tmp/chisel-${gender}-chrome.log`;
const htmlPath = `/tmp/chisel-${gender}-qa.html`;
const tryonJsonPath = `/tmp/chisel-${gender}-tryon-result.json`;
const log = [];
let finished = false;
let browser = null;

function appendEmergency(message) {
  try { fs.appendFileSync(logPath, `${message}\n`); } catch (_) {}
  try {
    if (!fs.existsSync(resultPath)) fs.writeFileSync(resultPath, `${JSON.stringify({ gender, checks:{}, errors:[message], failed:['runnerWatchdog'] }, null, 2)}\n`);
  } catch (_) {}
}

const watchdog = setTimeout(() => {
  if (finished) return;
  appendEmergency(`runner-watchdog: portrait QA exceeded ${HARD_DEADLINE_MS}ms`);
  process.exit(124);
}, HARD_DEADLINE_MS);
watchdog.unref?.();

async function captureTryOns(page) {
  const evidence = { gender, captures: [], errors: [] };
  const frame = page.frames().find((candidate) => candidate.url().includes('/www/index.html'));
  if (!frame) {
    evidence.errors.push('app iframe unavailable');
    fs.writeFileSync(tryonJsonPath, `${JSON.stringify(evidence, null, 2)}\n`);
    return evidence;
  }

  try {
    await frame.evaluate(() => {
      try { closeCam(); } catch (_) {}
      try { openStyle(); } catch (err) { throw new Error(`openStyle: ${err?.message || err}`); }
    });
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const cases = gender === 'female'
      ? [
          { slug:'french-bob-bare', hair:'frenchbob', beard:'none', makeup:'none' },
          { slug:'butterfly-peach-lift', hair:'butterfly', beard:'none', makeup:'peachlift' },
          { slug:'defined-curls-draped-rose', hair:'curls', beard:'none', makeup:'drapedrose' },
        ]
      : [
          { slug:'quiff-clean', hair:'quiff', beard:'none', makeup:'none' },
          { slug:'crop-soft-stubble', hair:'crop', beard:'stubble', makeup:'none' },
          { slug:'flow-short-beard', hair:'mlong', beard:'short', makeup:'none' },
        ];

    for (const testCase of cases) {
      const selected = await frame.evaluate((item) => {
        return eval(`(() => {
          const hairList = styleGender === 'women' ? HAIR_WOMEN : HAIR_MEN;
          const h = hairList.findIndex(x => x && x.id === ${JSON.stringify(item.hair)});
          const b = BEARD_STYLES.findIndex(x => x && x.id === ${JSON.stringify(item.beard)});
          const m = MAKEUP_LOOKS.findIndex(x => x && x.id === ${JSON.stringify(item.makeup)});
          if (h >= 0) styleHair = h;
          if (b >= 0) styleBeard = b;
          if (m >= 0) styleMakeup = m;
          if (typeof renderStyleChips === 'function') renderStyleChips();
          const style = hairList[styleHair] || {};
          const beard = BEARD_STYLES[styleBeard] || {};
          const makeup = MAKEUP_LOOKS[styleMakeup] || {};
          return { styleGender, hairId:style.id, hairName:style.name, beardId:beard.id, beardName:beard.name, makeupId:makeup.id, makeupName:makeup.name };
        })()`);
      }, testCase);
      await new Promise((resolve) => setTimeout(resolve, 850));
      const cam = await frame.$('#camwrap');
      if (!cam) throw new Error('camera wrapper missing during try-on capture');
      const path = `/tmp/chisel-${gender}-tryon-${testCase.slug}.png`;
      await cam.screenshot({ path });
      const canvas = await frame.evaluate(() => {
        const c = document.getElementById('overlay');
        if (!c) return null;
        const x = c.getContext('2d', { willReadFrequently:true });
        if (!x || !c.width || !c.height) return null;
        const px = x.getImageData(0, 0, c.width, c.height).data;
        let visible = 0;
        for (let i = 3; i < px.length; i += 4 * 211) if (px[i] > 8) visible++;
        return { width:c.width, height:c.height, sampledVisiblePixels:visible };
      });
      evidence.captures.push({ slug:testCase.slug, file:path, selected, canvas });
    }
  } catch (err) {
    evidence.errors.push(err?.stack || err?.message || String(err));
  }
  fs.writeFileSync(tryonJsonPath, `${JSON.stringify(evidence, null, 2)}\n`);
  return evidence;
}

try {
  browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader',
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-video-capture=${videoPath}`,
    ],
  });

  const page = await browser.newPage();
  page.on('console', (msg) => log.push(`console.${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (err) => log.push(`pageerror: ${err.stack || err.message || String(err)}`));
  page.on('requestfailed', (req) => log.push(`requestfailed: ${req.url()} :: ${req.failure()?.errorText || 'unknown'}`));

  await page.setViewport({ width: 430, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/tests/portrait-qa.html?gender=${gender}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  let timeoutError = null;
  try {
    await page.waitForFunction(
      () => document.body?.dataset?.status === 'pass' || document.body?.dataset?.status === 'fail',
      { timeout: 65000, polling: 250 },
    );
  } catch (err) {
    timeoutError = err;
    log.push(`runner-timeout: ${err.message || String(err)}`);
  }

  const status = await page.evaluate(() => document.body?.dataset?.status || 'missing').catch(() => 'missing');
  const resultText = await page.evaluate(() => document.getElementById('qa-result')?.textContent || 'qa-result missing').catch(() => 'qa-result unavailable');

  // Capture the actual camera try-on renderer even when Quick Scan failed. This lets QA distinguish
  // a scan-gate problem from a hairstyle/beard/makeup rendering problem.
  const tryonEvidence = await captureTryOns(page);
  log.push(`tryon-captures: ${JSON.stringify(tryonEvidence)}`);

  const html = await page.content().catch(() => '<!-- page unavailable -->');
  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(logPath, `${log.join('\n')}\n`);
  fs.writeFileSync(resultPath, `${resultText}\n`);

  console.log(`===== ${gender} portrait QA =====`);
  console.log(resultText);
  console.log(`===== ${gender} try-on QA =====`);
  console.log(JSON.stringify(tryonEvidence, null, 2));
  if (log.length) console.log(`===== ${gender} browser diagnostics =====\n${log.join('\n')}`);

  if (timeoutError || status !== 'pass' || tryonEvidence.captures.length !== 3 || tryonEvidence.errors.length) process.exitCode = 1;
} catch (err) {
  log.push(`runner-fatal: ${err?.stack || err?.message || String(err)}`);
  try { fs.writeFileSync(logPath, `${log.join('\n')}\n`); } catch (_) {}
  try { fs.writeFileSync(resultPath, `${JSON.stringify({ gender, checks:{}, errors:[err?.message || String(err)], failed:['runnerFatal'] }, null, 2)}\n`); } catch (_) {}
  process.exitCode = 1;
} finally {
  finished = true;
  clearTimeout(watchdog);
  if (browser) {
    await Promise.race([
      browser.close().catch((err) => log.push(`browser-close: ${err?.message || String(err)}`)),
      new Promise((resolve) => setTimeout(() => { log.push('browser-close-timeout: forced exit'); resolve(); }, 5000)),
    ]);
  }
}

process.exit(process.exitCode || 0);

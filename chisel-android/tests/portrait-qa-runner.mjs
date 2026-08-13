import fs from 'node:fs';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const gender = process.argv[2];
const videoPath = process.argv[3];
const baseUrl = process.argv[4] || 'http://127.0.0.1:4173';
const chrome = process.env.CHROME;
const HARD_DEADLINE_MS = 85000;

if (!['male', 'female'].includes(gender)) throw new Error('gender must be male or female');
if (!videoPath || !fs.existsSync(videoPath)) throw new Error(`missing fake camera video: ${videoPath}`);
if (!chrome) throw new Error('CHROME environment variable is required');

const resultPath = `/tmp/chisel-${gender}-result.txt`;
const logPath = `/tmp/chisel-${gender}-chrome.log`;
const htmlPath = `/tmp/chisel-${gender}-qa.html`;
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
  // process.exit is intentional here: a wedged Chromium/MediaPipe child must not hold CI open.
  process.exit(124);
}, HARD_DEADLINE_MS);
watchdog.unref?.();

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
      { timeout: 70000, polling: 250 },
    );
  } catch (err) {
    timeoutError = err;
    log.push(`runner-timeout: ${err.message || String(err)}`);
  }

  const status = await page.evaluate(() => document.body?.dataset?.status || 'missing').catch(() => 'missing');
  const resultText = await page.evaluate(() => document.getElementById('qa-result')?.textContent || 'qa-result missing').catch(() => 'qa-result unavailable');
  const html = await page.content().catch(() => '<!-- page unavailable -->');

  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(logPath, `${log.join('\n')}\n`);
  fs.writeFileSync(resultPath, `${resultText}\n`);

  console.log(`===== ${gender} portrait QA =====`);
  console.log(resultText);
  if (log.length) console.log(`===== ${gender} browser diagnostics =====\n${log.join('\n')}`);

  if (timeoutError || status !== 'pass') process.exitCode = 1;
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

// Explicit exit prevents orphan Chromium/MediaPipe workers from keeping Node alive after results are written.
process.exit(process.exitCode || 0);

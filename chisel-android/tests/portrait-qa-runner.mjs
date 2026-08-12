import fs from 'node:fs';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const gender = process.argv[2];
const videoPath = process.argv[3];
const baseUrl = process.argv[4] || 'http://127.0.0.1:4173';
const chrome = process.env.CHROME;

if (!['male', 'female'].includes(gender)) throw new Error('gender must be male or female');
if (!videoPath || !fs.existsSync(videoPath)) throw new Error(`missing fake camera video: ${videoPath}`);
if (!chrome) throw new Error('CHROME environment variable is required');

const log = [];
const browser = await puppeteer.launch({
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

try {
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

  const status = await page.evaluate(() => document.body?.dataset?.status || 'missing');
  const resultText = await page.evaluate(() => document.getElementById('qa-result')?.textContent || 'qa-result missing');
  const html = await page.content();

  fs.writeFileSync(`/tmp/chisel-${gender}-qa.html`, html);
  fs.writeFileSync(`/tmp/chisel-${gender}-chrome.log`, `${log.join('\n')}\n`);
  fs.writeFileSync(`/tmp/chisel-${gender}-result.txt`, `${resultText}\n`);

  console.log(`===== ${gender} portrait QA =====`);
  console.log(resultText);
  if (log.length) console.log(`===== ${gender} browser diagnostics =====\n${log.join('\n')}`);

  if (timeoutError || status !== 'pass') process.exitCode = 1;
} finally {
  await browser.close();
}

/**
 * generate-og-image.js
 * Renders public/og-image.html via Puppeteer and saves a
 * pixel-perfect 1200×630 PNG to public/og-image.png.
 *
 * Usage:  node scripts/generate-og-image.js
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const HTML_PATH = resolve(__dirname, '../public/og-image.html');
const OUT_PATH  = resolve(__dirname, '../public/og-image.png');

if (!existsSync(HTML_PATH)) {
  console.error(`Source not found: ${HTML_PATH}`);
  process.exit(1);
}

console.log('Launching browser…');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();

// Match exact OG dimensions
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

// Load file, let Google Fonts finish
await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0', timeout: 30_000 });

// Extra settle time for font rendering
await new Promise(r => setTimeout(r, 400));

await page.screenshot({
  path: OUT_PATH,
  type: 'png',
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});

await browser.close();

console.log(`OG image written → ${OUT_PATH}`);

/**
 * checkRedirects.js
 * Simple redirect-chain debugger for Search Console "Redirect error" reports.
 *
 * Usage:
 *   node scripts/checkRedirects.js https://nythos.io/
 *   node scripts/checkRedirects.js --file urls.txt
 *   cat urls.txt | node scripts/checkRedirects.js
 */

import { readFileSync } from 'fs';

const MAX_HOPS = Number(process.env.MAX_HOPS || 12);

function usageAndExit(code = 1) {
  console.error('Usage: node scripts/checkRedirects.js <url> [url2 ...] | --file urls.txt');
  process.exit(code);
}

function normalizeInputUrl(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // If someone pastes a bare domain/path from Search Console.
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function resolveLocation(currentUrl, location) {
  try {
    return new URL(location, currentUrl).toString();
  } catch {
    return null;
  }
}

async function followRedirects(startUrl) {
  const chain = [];
  const seen = new Set();
  let current = startUrl;

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    if (seen.has(current)) {
      chain.push({ url: current, status: 'LOOP' });
      return chain;
    }
    seen.add(current);

    const res = await fetch(current, {
      redirect: 'manual',
      headers: {
        'user-agent': 'NYTHOS-Redirect-Check/1.0 (+https://nythos.io)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const status = res.status;
    const location = res.headers.get('location');
    chain.push({ url: current, status, location });

    if (![301, 302, 303, 307, 308].includes(status)) return chain;
    if (!location) {
      chain.push({ url: current, status: 'ERROR', location: 'Missing Location header' });
      return chain;
    }

    const next = resolveLocation(current, location);
    if (!next) {
      chain.push({ url: current, status: 'ERROR', location: `Bad Location: ${location}` });
      return chain;
    }

    current = next;
  }

  chain.push({ url: current, status: 'ERROR', location: `Too many redirects (>${MAX_HOPS})` });
  return chain;
}

async function getUrlsFromStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const content = Buffer.concat(chunks).toString('utf8');
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function formatStep(step, i) {
  const idx = String(i + 1).padStart(2, '0');
  const loc = step.location ? ` -> ${step.location}` : '';
  return `${idx}. ${step.status} ${step.url}${loc}`;
}

const args = process.argv.slice(2);
let urls = [];

if (args.includes('--help') || args.includes('-h')) usageAndExit(0);

const fileIndex = args.findIndex(a => a === '--file');
if (fileIndex !== -1) {
  const path = args[fileIndex + 1];
  if (!path) usageAndExit(1);
  urls = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
} else if (args.length > 0) {
  urls = args;
} else if (!process.stdin.isTTY) {
  urls = await getUrlsFromStdin();
} else {
  usageAndExit(1);
}

const normalized = urls
  .map(normalizeInputUrl)
  .filter(Boolean);

for (const inputUrl of normalized) {
  console.log(`\n=== ${inputUrl} ===`);
  try {
    const chain = await followRedirects(inputUrl);
    chain.forEach((step, i) => console.log(formatStep(step, i)));

    const last = chain[chain.length - 1];
    if (last?.status === 'LOOP') {
      console.log('Result: redirect loop');
    } else if (last?.status === 'ERROR') {
      console.log('Result: redirect error');
    } else if ([301, 302, 303, 307, 308].includes(last?.status)) {
      console.log('Result: still redirecting');
    } else {
      console.log('Result: ok');
    }
  } catch (err) {
    console.log(`01. ERROR ${inputUrl} -> ${err?.message || String(err)}`);
  }
}


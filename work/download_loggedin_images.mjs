#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const inputPath = path.resolve(process.argv[2] || 'outputs/toptanpastacim-urunler-girisli-2026-09-14T21-47-54.json');
const outputsDir = path.resolve('outputs');
const imagesDir = path.join(outputsDir, 'product-images-loggedin');
const csvOut = path.join(outputsDir, 'toptanpastacim-urunler-girisli-urun-gorselleri.csv');
const jsonOut = path.join(outputsDir, 'toptanpastacim-urunler-girisli-urun-gorselleri.json');
const reportOut = path.join(imagesDir, 'download_report.json');
const zipName = `toptanpastacim-urun-gorselleri-girisli-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.zip`;
const zipPath = path.join(outputsDir, zipName);

const dataset = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const items = Array.isArray(dataset.items) ? dataset.items : [];

await fs.mkdir(imagesDir, { recursive: true });

const sanitize = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s._-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

const seen = new Map();
const downloaded = [];
const failures = [];

for (let i = 0; i < items.length; i += 1) {
  const item = items[i];
  const imageUrl = item.detail_image || item.listing_image;
  if (!imageUrl) {
    failures.push({ product: item.product_name, url: imageUrl, reason: 'MISSING_IMAGE_URL' });
    continue;
  }

  const urlObj = new URL(imageUrl);
  const remoteExt = path.extname(urlObj.pathname).toLowerCase() || '.jpg';
  const slug = sanitize(item.product_name || `product-${i + 1}`);
  const base = `${String(i + 1).padStart(3, '0')}_${slug}_${item.product_name ? item.product_name.slice(0, 24) : `p${i + 1}`}`;
  let fileName = `${base}${remoteExt}`;
  const key = fileName;
  const same = seen.get(key) || 0;
  seen.set(key, same + 1);
  if (same > 0) fileName = `${base}-${same + 1}${remoteExt}`;
  const filePath = path.join(imagesDir, fileName);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const resp = await fetch(imageUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Referer': 'https://toptanpastacim.com/',
      },
    });
    clearTimeout(timer);

    if (!resp.ok) {
      failures.push({
        product: item.product_name,
        url: imageUrl,
        reason: `HTTP_${resp.status}_${resp.statusText}`,
      });
      continue;
    }

    const arrayBuffer = await resp.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      failures.push({
        product: item.product_name,
        url: imageUrl,
        reason: 'EMPTY_BODY',
      });
      continue;
    }

    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    downloaded.push({
      index: i + 1,
      file: fileName,
      product_name: item.product_name,
      image_url: imageUrl,
      source: item.product_url,
    });
    console.log(`${i + 1}/${items.length} OK ${fileName}`);
  } catch (error) {
    failures.push({
      product: item.product_name,
      url: imageUrl,
      reason: String(error?.message || error),
    });
    console.log(`${i + 1}/${items.length} FAIL ${item.product_name}`);
  }
}

const report = {
  collectedAt: new Date().toISOString(),
  totalProducts: items.length,
  downloaded: downloaded.length,
  failed: failures.length,
  missingImageUrl: failures.filter((f) => f.reason === 'MISSING_IMAGE_URL').length,
  files: {
    inputJson: inputPath,
    csvInput: path.join(outputsDir, 'toptanpastacim-urunler-girisli-2026-09-14T21-47-54.csv'),
    imagesDir,
    zip: zipPath,
    report: reportOut,
  },
  login: dataset.login || null,
  downloadedFiles: downloaded,
  failures,
};

await fs.writeFile(reportOut, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await fs.writeFile(jsonOut, JSON.stringify(downloaded, null, 2) + '\n', 'utf8');

const csvRows = [
  ['index', 'product_name', 'product_url', 'image_url', 'file'],
  ...downloaded.map((row) => [
    row.index,
    row.product_name,
    row.source,
    row.image_url,
    row.file,
  ]),
];

await fs.writeFile(
  csvOut,
  csvRows
    .map((row) => row.map((col) => `"${String(col ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n') + '\n',
  'utf8',
);

execSync(`cd ${JSON.stringify(outputsDir)} && zip -q -r ${JSON.stringify(path.basename(zipPath))} ${path.relative(outputsDir, imagesDir)}`);

console.log(`totalProducts=${items.length}`);
console.log(`downloaded=${downloaded.length}`);
console.log(`failed=${failures.length}`);
console.log(`zip=${zipPath}`);

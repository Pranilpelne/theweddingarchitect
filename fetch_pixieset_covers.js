const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const outputDir = path.join(__dirname, 'assets', 'images', 'pixieset_covers');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const galleries = [
  { slug: 'vaishaliandatharva',  name: 'vaishali-atharva',   url: 'https://theweddingarchitect25.pixieset.com/vaishaliandatharva/' },
  { slug: 'tishaandharsh',       name: 'tisha-harsh',        url: 'https://theweddingarchitect25.pixieset.com/tishaandharsh/' },
  { slug: 'kajolandprasad',      name: 'kajol-prasad',       url: 'https://theweddingarchitect25.pixieset.com/kajolandprasad/' },
  { slug: 'ayeshaandandres',     name: 'ayesha-andres',      url: 'https://theweddingarchitect25.pixieset.com/ayeshaandandres/' },
  { slug: 'nehaandaniruddh',     name: 'neha-aniruddh',      url: 'https://theweddingarchitect25.pixieset.com/nehaandaniruddh/' },
  { slug: 'pratikkanaka',        name: 'pratik-kanaka',      url: 'https://theweddingarchitect25.pixieset.com/pratikkanaka/' },
  { slug: 'snehaandashish',      name: 'sneha-ashish',       url: 'https://theweddingarchitect25.pixieset.com/snehaandashish/' },
  { slug: 'jayeshandrakshita',   name: 'jayesh-rakshita',    url: 'https://theweddingarchitect25.pixieset.com/jayeshandrakshita/' },
  { slug: 'sohamandayushi',      name: 'soham-ayushi',       url: 'https://theweddingarchitect25.pixieset.com/sohamandayushi/' },
  { slug: 'roshniandsoham',      name: 'roshni-soham',       url: 'https://theweddingarchitect25.pixieset.com/roshniandsoham/' },
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
  'Connection': 'keep-alive',
};

function fetchPage(pageUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(pageUrl);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers,
      timeout: 15000,
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchPage(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function extractOgImage(html) {
  // Try multiple patterns
  let m = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (m) return m[1];
  m = html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (m) return m[1];
  m = html.match(/og:image.*?content=["']([^"']+)["']/is);
  if (m) return m[1];
  // Try data-src or src on a cover img element
  m = html.match(/class=["'][^"']*cover[^"']*["'][^>]*(?:data-src|src)=["']([^"']+\.jpg[^"'"]*)["']/i);
  if (m) return m[1];
  return null;
}

function downloadImage(imgUrl, destPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(imgUrl);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: { ...headers, 'Sec-Fetch-Dest': 'image', 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' },
      timeout: 30000,
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadImage(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for image`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function processGallery(gallery) {
  console.log(`\nProcessing: ${gallery.name}`);
  try {
    const { status, body } = await fetchPage(gallery.url);
    console.log(`  Page status: ${status}`);
    if (status !== 200) {
      console.log(`  SKIP: Non-200 status`);
      return null;
    }

    const imgUrl = extractOgImage(body);
    if (!imgUrl) {
      // Print first 500 chars of html for debugging
      console.log(`  Could not find og:image. HTML snippet:\n  ${body.substring(0, 600)}`);
      return null;
    }

    console.log(`  OG image: ${imgUrl}`);
    const ext = imgUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
    const destPath = path.join(outputDir, `${gallery.name}.${ext}`);
    await downloadImage(imgUrl, destPath);
    console.log(`  Saved to: ${destPath}`);
    return { name: gallery.name, file: `${gallery.name}.${ext}`, imgUrl };
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    return null;
  }
}

(async () => {
  const results = [];
  for (const g of galleries) {
    const r = await processGallery(g);
    results.push({ gallery: g.name, result: r });
  }
  console.log('\n\n=== RESULTS ===');
  results.forEach(r => console.log(`${r.gallery}: ${r.result ? r.result.file : 'FAILED'}`));
})();

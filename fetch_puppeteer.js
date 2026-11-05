const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const outputDir = path.join(__dirname, 'assets', 'images', 'pixieset_covers');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const galleries = [
  { name: 'vaishali-atharva',   pageUrl: 'https://theweddingarchitect25.pixieset.com/vaishaliandatharva/' },
  { name: 'tisha-harsh',        pageUrl: 'https://theweddingarchitect25.pixieset.com/tishaandharsh/' },
  { name: 'kajol-prasad',       pageUrl: 'https://theweddingarchitect25.pixieset.com/kajolandprasad/' },
  { name: 'ayesha-andres',      pageUrl: 'https://theweddingarchitect25.pixieset.com/ayeshaandandres/' },
  { name: 'neha-aniruddh',      pageUrl: 'https://theweddingarchitect25.pixieset.com/nehaandaniruddh/' },
  { name: 'pratik-kanaka',      pageUrl: 'https://theweddingarchitect25.pixieset.com/pratikkanaka/' },
  { name: 'sneha-ashish',       pageUrl: 'https://theweddingarchitect25.pixieset.com/snehaandashish/' },
  { name: 'jayesh-rakshita',    pageUrl: 'https://theweddingarchitect25.pixieset.com/jayeshandrakshita/' },
  { name: 'soham-ayushi',       pageUrl: 'https://theweddingarchitect25.pixieset.com/sohamandayushi/' },
  { name: 'roshni-soham',       pageUrl: 'https://theweddingarchitect25.pixieset.com/roshniandsoham/' },
];

function downloadFile(imgUrl, destPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(imgUrl);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.get(imgUrl, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    });
    req.on('error', reject);
  });
}

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    for (const g of galleries) {
      console.log(`\n[${g.name}] Loading: ${g.pageUrl}`);
      try {
        await page.goto(g.pageUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Get og:image
        const ogImage = await page.evaluate(() => {
          const el = document.querySelector('meta[property="og:image"]');
          return el ? el.getAttribute('content') : null;
        });

        if (!ogImage) {
          // Try to get the first big visible image
          const firstImg = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            const big = imgs.find(i => i.naturalWidth > 200 && i.src && !i.src.includes('logo') && !i.src.includes('icon'));
            return big ? big.src : null;
          });
          console.log(`  og:image not found. First img: ${firstImg}`);
          if (firstImg) {
            const ext = firstImg.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
            const dest = path.join(outputDir, `${g.name}.${ext}`);
            await downloadFile(firstImg, dest);
            console.log(`  Saved: ${dest}`);
          }
          continue;
        }

        console.log(`  og:image: ${ogImage}`);
        const ext = ogImage.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
        const dest = path.join(outputDir, `${g.name}.${ext}`);
        await downloadFile(ogImage, dest);
        console.log(`  Saved: ${dest}`);
      } catch (err) {
        console.log(`  ERROR: ${err.message}`);
      }
    }
  } finally {
    if (browser) await browser.close();
  }
  console.log('\nDone! Check assets/images/pixieset_covers/');
})();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const urlModule = require('url');

const outputDir = path.join(__dirname, 'assets', 'images', 'pixieset_covers');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const galleries = [
  { name: 'vaishali-atharva',  url: 'https://theweddingarchitect25.pixieset.com/vaishaliandatharva/' },
  { name: 'tisha-harsh',       url: 'https://theweddingarchitect25.pixieset.com/tishaandharsh/' },
  { name: 'kajol-prasad',      url: 'https://theweddingarchitect25.pixieset.com/kajolandprasad/' },
  { name: 'ayesha-andres',     url: 'https://theweddingarchitect25.pixieset.com/ayeshaandandres/' },
  { name: 'neha-aniruddh',     url: 'https://theweddingarchitect25.pixieset.com/nehaandaniruddh/' },
  { name: 'pratik-kanaka',     url: 'https://theweddingarchitect25.pixieset.com/pratikkanaka/' },
  { name: 'sneha-ashish',      url: 'https://theweddingarchitect25.pixieset.com/snehaandashish/' },
  { name: 'jayesh-rakshita',   url: 'https://theweddingarchitect25.pixieset.com/jayeshandrakshita/' },
  { name: 'soham-ayushi',      url: 'https://theweddingarchitect25.pixieset.com/sohamandayushi/' },
  { name: 'roshni-soham',      url: 'https://theweddingarchitect25.pixieset.com/roshniandsoham/' },
];

function downloadFile(imgUrl, destPath) {
  return new Promise((resolve, reject) => {
    const parsed = new urlModule.URL(imgUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    lib.get(imgUrl, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  const chromePath = await require('puppeteer').executablePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,900'
    ]
  });

  const results = {};

  for (const g of galleries) {
    console.log(`\n[${g.name}] → ${g.url}`);
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 900 });
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

      // Wait up to 30s for network to be idle (Cloudflare challenge to pass)
      await page.goto(g.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Extra wait for JS rendering
      await new Promise(r => setTimeout(r, 3000));

      const title = await page.title();
      console.log(`  Title: ${title}`);

      // Screenshot for debugging
      await page.screenshot({ path: path.join(outputDir, `${g.name}_debug.png`) });

      // Try OG image
      let imgUrl = await page.evaluate(() => {
        const m = document.querySelector('meta[property="og:image"]');
        return m ? m.content : null;
      });

      if (!imgUrl) {
        // Try to find the biggest loaded image
        imgUrl = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img[src]'));
          const candidates = imgs
            .filter(i => i.naturalWidth > 100 && i.src && !i.src.includes('logo') && !i.src.includes('icon') && !i.src.includes('favicon'))
            .sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
          return candidates.length > 0 ? candidates[0].src : null;
        });
      }

      if (!imgUrl) {
        // Try background-image CSS
        imgUrl = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('[style]'));
          for (const el of els) {
            const bg = el.style.backgroundImage;
            if (bg && bg.includes('url(')) {
              const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
              if (m && (m[1].includes('.jpg') || m[1].includes('.jpeg') || m[1].includes('.webp'))) {
                return m[1];
              }
            }
          }
          return null;
        });
      }

      if (imgUrl) {
        console.log(`  Found image: ${imgUrl}`);
        const ext = imgUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
        const dest = path.join(outputDir, `${g.name}.${ext}`);
        await downloadFile(imgUrl, dest);
        console.log(`  ✓ Saved: ${dest}`);
        results[g.name] = `${g.name}.${ext}`;
      } else {
        console.log(`  ✗ No image found`);
        results[g.name] = null;
      }
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results[g.name] = null;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n=== SUMMARY ===');
  Object.entries(results).forEach(([k, v]) => console.log(`${k}: ${v || 'FAILED'}`));
})();

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('https://theweddingarchitect25.pixieset.com/vaishaliandatharva/', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Save screenshot
  await page.screenshot({ path: 'pixieset_debug.png', fullPage: false });
  
  // Save page title and HTML snippet
  const title = await page.title();
  const html = await page.content();
  
  console.log('Title:', title);
  console.log('HTML snippet (first 2000 chars):');
  console.log(html.substring(0, 2000));
  
  // Check all image srcs on page
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, naturalWidth: i.naturalWidth }));
  });
  console.log('\nImages found:', JSON.stringify(imgs, null, 2));
  
  await browser.close();
})();

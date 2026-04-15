// Render the built Jekyll CV page (_site/cv/index.html) to a letter-size PDF
// using headless Chromium via Puppeteer. Invoked by .github/workflows/build-cv-pdf.yml
//
// Env:
//   SITE_DIR  — path to Jekyll _site directory (default: "_site")
//   OUT_PATH  — output PDF path (default: "assets/docs/Jialing_Wu_CV.pdf")

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SITE_DIR = process.env.SITE_DIR || '_site';
const OUT_PATH = process.env.OUT_PATH || 'assets/docs/Jialing_Wu_CV.pdf';

(async () => {
  const htmlPath = path.resolve(SITE_DIR, 'cv/index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error(`CV HTML not found at ${htmlPath}`);
    process.exit(1);
  }

  // Make sure output directory exists
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Load the built site via file:// so that relative asset paths resolve
    const fileUrl = 'file://' + htmlPath;
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });

    // Force print media so our @media print CSS takes effect
    await page.emulateMediaType('print');

    // Wait a beat for web fonts to settle
    await page.evaluateHandle('document.fonts.ready');

    await page.pdf({
      path: OUT_PATH,
      format: 'Letter',
      margin: {
        top: '0.6in',
        right: '0.6in',
        bottom: '0.6in',
        left: '0.6in',
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`Wrote ${OUT_PATH}`);
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

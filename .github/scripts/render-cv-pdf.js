// Render the built Jekyll CV page (_site/cv/index.html) to a letter-size PDF.
//
// Serves _site/ over a local HTTP server on an ephemeral port, then
// navigates Puppeteer to http://localhost:PORT/cv/. This is required
// because the page references CSS via root-relative paths
// (e.g. /style.css), which don't resolve under file://.
//
// Env:
//   SITE_DIR  — path to Jekyll _site directory (default: "_site")
//   OUT_PATH  — output PDF path (default: "assets/docs/Jialing_Wu_CV.pdf")

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const SITE_DIR = path.resolve(process.env.SITE_DIR || '_site');
const OUT_PATH = process.env.OUT_PATH || 'assets/docs/Jialing_Wu_CV.pdf';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain; charset=utf-8',
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        let reqPath = decodeURIComponent(req.url.split('?')[0]);
        if (reqPath.endsWith('/')) reqPath += 'index.html';
        const filePath = path.join(SITE_DIR, reqPath);
        // Reject path traversal
        if (!filePath.startsWith(SITE_DIR)) {
          res.writeHead(403); res.end('Forbidden'); return;
        }
        fs.stat(filePath, (err, stat) => {
          if (err || !stat.isFile()) {
            // try appending /index.html for extension-less URLs
            const alt = path.join(filePath, 'index.html');
            fs.stat(alt, (err2, stat2) => {
              if (err2 || !stat2.isFile()) {
                res.writeHead(404); res.end('Not found: ' + reqPath);
                return;
              }
              serveFile(alt, res);
            });
            return;
          }
          serveFile(filePath, res);
        });
      } catch (e) {
        res.writeHead(500); res.end('Server error');
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

(async () => {
  if (!fs.existsSync(path.join(SITE_DIR, 'cv/index.html'))) {
    console.error(`CV HTML not found at ${path.join(SITE_DIR, 'cv/index.html')}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });

  const { server, port } = await startServer();
  console.log(`Serving ${SITE_DIR} on http://127.0.0.1:${port}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    const url = `http://127.0.0.1:${port}/cv/`;
    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    if (!response || !response.ok()) {
      throw new Error(`Failed to load ${url}: ${response ? response.status() : 'no response'}`);
    }

    await page.emulateMediaType('print');
    await page.evaluateHandle('document.fonts.ready');

    await page.pdf({
      path: OUT_PATH,
      format: 'Letter',
      margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' },
      printBackground: true,
      preferCSSPageSize: true,
    });

    console.log(`Wrote ${OUT_PATH}`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

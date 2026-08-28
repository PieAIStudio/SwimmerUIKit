import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import path from 'path';

// Start a simple server to serve dist/
const server = createServer((req, res) => {
  try {
    let filePath = './dist' + (req.url === '/' ? '/index.html' : req.url);
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <link rel="stylesheet" href="/styles.css">
            <style>
              body { margin: 0; padding: 50px; }
              .box { width: 100px; height: 100px; background: red; position: absolute; border-radius: 50%; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="module">
              import { createElement as h, Component } from 'https://esm.sh/react@18';
              import { createRoot } from 'https://esm.sh/react-dom@18/client';
              import { LiquidGroup } from 'http://127.0.0.1:9099/index.js'; // This won't work well due to react peer deps.
            </script>
          </body>
          </html>
        `);
        return;
    }
  } catch (e) {
    res.writeHead(404);
    res.end();
  }
});


#!/usr/bin/env node
/**
 * Static file server for local use.
 *
 * The app has to be served over http rather than opened as a file:// page —
 * ES modules and the font/manifest fetches are both blocked by the file://
 * origin rules. There is no build step; this just hands the files over.
 *
 *   node tools/serve.mjs [port]
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

/** A marker the launcher probes to tell our server apart from someone else's. */
export const SERVER_ID = 'slate-plaque-studio';

export function createServer() {
  return http.createServer(handle);
}

async function handle(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/__id') {
      res.writeHead(200, { 'Content-Type': 'text/plain' }).end(SERVER_ID);
      return;
    }

    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);

    // Stay inside the project directory.
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(file);
    const target = info.isDirectory() ? path.join(file, 'index.html') : file;
    const body = await readFile(target);

    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream',
      // no-store, not no-cache: no-cache still lets the browser keep a copy,
      // and with no ETag to revalidate against it can go on serving a stale
      // module. That produces the worst kind of bug — fresh HTML rendering a
      // new control while cached JS runs without the handler behind it, so the
      // button is there and does nothing.
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}

/**
 * Listen on `port`, or on the next free port after it.
 *
 * Falling back matters for a double-clickable launcher: a port left occupied by
 * a previous run should not greet a non-technical user with EADDRINUSE.
 */
export function listen(port = PORT, attempts = 20) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    let remaining = attempts;
    let current = port;

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && remaining-- > 0) {
        server.listen(++current);
      } else {
        reject(err);
      }
    });

    server.on('listening', () => resolve({ server, port: current }));
    server.listen(current);
  });
}

// Only self-start when run directly, so tools/launch.mjs can import it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { port } = await listen(PORT);
  console.log(`Slate Plaque Studio → http://localhost:${port}`);
}

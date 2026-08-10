#!/usr/bin/env node
/**
 * One-click launcher: start the server, open the browser, stay up until the
 * window is closed.
 *
 * Behaviour that matters for someone double-clicking rather than typing:
 *  - if the studio is already running, reuse it instead of starting a second
 *    copy on a different port and quietly editing in two places;
 *  - if the port is taken by something else, move to the next free one;
 *  - closing the window stops the server.
 */
import { spawn } from 'node:child_process';
import { listen, SERVER_ID } from './serve.mjs';

const START_PORT = Number(process.argv[2] || process.env.PORT || 4173);
const SCAN = 20;

/** Is our own studio already answering on this port? */
async function studioOn(port) {
  try {
    const res = await fetch(`http://localhost:${port}/__id`, {
      signal: AbortSignal.timeout(400),
    });
    return res.ok && (await res.text()).trim() === SERVER_ID;
  } catch {
    return false;
  }
}

/**
 * Open the default browser, resolving false if we could not.
 *
 * spawn reports a missing binary asynchronously, as an 'error' event — an
 * unhandled one is fatal, so a machine without xdg-open would take the whole
 * server down at the moment it finished starting. The handler is the point of
 * this function.
 */
function openBrowser(url) {
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : ['xdg-open', [url]];

  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    } catch {
      resolve(false);
      return;
    }

    const settle = (ok) => { clearTimeout(timer); resolve(ok); };
    const timer = setTimeout(() => settle(true), 400);
    child.on('error', () => settle(false));
    child.unref();
  });
}

const line = (s = '') => console.log(s);

async function main() {
  for (let port = START_PORT; port < START_PORT + SCAN; port++) {
    if (await studioOn(port)) {
      const url = `http://localhost:${port}`;
      line();
      line('  Slate Plaque Studio is already running.');
      line(`  Open  ${url}`);
      line();
      await openBrowser(url);
      return;
    }
  }

  const { server, port } = await listen(START_PORT, SCAN);
  const url = `http://localhost:${port}`;

  line();
  line('  ┌──────────────────────────────────────────┐');
  line('  │           SLATE PLAQUE STUDIO            │');
  line('  └──────────────────────────────────────────┘');
  line();
  line(`  Running at  ${url}`);
  line();

  if (!(await openBrowser(url))) {
    line('  Could not open your browser automatically —');
    line('  copy the address above into it.');
    line();
  }

  line('  Close this window when you are finished.');
  line('  (Your designs are saved in the browser, not here.)');
  line();

  const shutdown = () => {
    server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  line();
  line(`  Could not start: ${err.message}`);
  line();
  process.exitCode = 1;
});

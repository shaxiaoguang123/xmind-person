import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'http://127.0.0.1:4173';
const CDP_PORT = 9223;
const OUTPUT = resolve('artifacts/t03-browser/mixed-cards.png');
const delay = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

function chromeExecutable() {
  for (const candidate of ['google-chrome', 'google-chrome-stable', 'chromium-browser', 'chromium']) {
    const result = spawnSync('which', [candidate], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }
  throw new Error('No Chrome/Chromium executable is available on the runner.');
}

async function waitForJson(url, attempts = 160) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await delay(125);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id === undefined) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
      else pending.resolve(message.result ?? {});
    });
  }

  call(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.call('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? 'Browser evaluation failed.');
    return result.result?.value;
  }
}

async function waitFor(check, label, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await check()) return;
    await delay(125);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function main() {
  mkdirSync(resolve('artifacts/t03-browser'), { recursive: true });
  const profile = resolve('/tmp', `t03-mixed-screenshot-${process.pid}`);
  mkdirSync(profile, { recursive: true });
  const chrome = spawn(chromeExecutable(), [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-address=127.0.0.1',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=1440,1000',
    'about:blank'
  ], { stdio: ['ignore', 'ignore', 'ignore'] });

  try {
    const pages = await waitForJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const page = pages.find((entry) => entry.type === 'page');
    if (!page?.webSocketDebuggerUrl) throw new Error('Chrome DevTools page target was not found.');

    const socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolvePromise, reject) => {
      socket.addEventListener('open', resolvePromise, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    const cdp = new CdpClient(socket);
    await cdp.call('Page.enable');
    await cdp.call('Runtime.enable');
    await cdp.call('Page.navigate', { url: `${BASE_URL}/?demo=mixed-cards` });
    await waitFor(
      () => cdp.evaluate(`document.readyState === 'complete' && document.querySelectorAll('.react-flow__node-document').length === 9`),
      'mixed-cards nodes'
    );
    await cdp.evaluate('document.fonts.ready.then(() => true)');

    const anchor = await cdp.evaluate(`(() => {
      const cards = [...document.querySelectorAll('.document-card')];
      const targets = cards.filter((card) => {
        const title = card.querySelector('.document-card-title')?.textContent;
        return title === '文件处理系统' || title === '上传文件';
      });
      const rects = targets.map((card) => card.getBoundingClientRect());
      if (rects.length !== 2) throw new Error('Mixed screenshot anchor cards were not found.');
      const left = Math.min(...rects.map((rect) => rect.left));
      const right = Math.max(...rects.map((rect) => rect.right));
      const top = Math.min(...rects.map((rect) => rect.top));
      const bottom = Math.max(...rects.map((rect) => rect.bottom));
      return { x: (left + right) / 2, y: (top + bottom) / 2 };
    })()`);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const zoom = await cdp.evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('.react-flow__viewport')).transform).a`);
      if (zoom >= 0.5) break;
      await cdp.call('Input.dispatchMouseEvent', {
        type: 'mouseWheel', x: anchor.x, y: anchor.y, deltaX: 0, deltaY: -260
      });
      await delay(100);
    }

    const visible = await cdp.evaluate(`(() => {
      const pane = document.querySelector('.react-flow__pane').getBoundingClientRect();
      const cards = [...document.querySelectorAll('.document-card')];
      const visibleCards = cards.filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.right > pane.left && rect.left < pane.right && rect.bottom > pane.top && rect.top < pane.bottom;
      });
      return {
        modes: [...new Set(visibleCards.map((card) => card.dataset.viewMode))],
        titles: visibleCards.map((card) => card.querySelector('.document-card-title')?.textContent ?? '')
      };
    })()`);

    if (!visible.modes.includes('heading') || !visible.modes.includes('markdown')) {
      throw new Error(`Mixed screenshot does not show both presentation modes: ${JSON.stringify(visible)}`);
    }
    if (!visible.titles.includes('上传文件') || !visible.titles.includes('TXT')) {
      throw new Error(`Mixed screenshot lost its intended Heading/Markdown anchors: ${JSON.stringify(visible)}`);
    }

    const capture = await cdp.call('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    writeFileSync(OUTPUT, capture.data, 'base64');
    console.log(JSON.stringify({ mixedScreenshot: 'pass', visible }, null, 2));
    socket.close();
  } finally {
    chrome.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

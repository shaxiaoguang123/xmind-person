import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'http://127.0.0.1:4173';
const CDP_PORT = 9222;
const OUTPUT_DIR = resolve('artifacts/t02-browser');
const DEMOS = [
  { name: 'basic', nodes: 6, edges: 5, duplicateApi: 0 },
  { name: 'nested', nodes: 9, edges: 8, duplicateApi: 0 },
  { name: 'duplicate-mixed', nodes: 7, edges: 5, duplicateApi: 2 }
];

function delay(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function chromeExecutable() {
  for (const candidate of [
    'google-chrome',
    'google-chrome-stable',
    'chromium-browser',
    'chromium'
  ]) {
    const result = spawnSync('which', [candidate], { encoding: 'utf8' });
    if (result.status === 0 && result.stdout.trim() !== '') {
      return result.stdout.trim();
    }
  }

  throw new Error('No Chrome/Chromium executable is available on the runner.');
}

async function waitForJson(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
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
    this.listeners = new Map();

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id !== undefined) {
        const pending = this.pending.get(message.id);
        if (pending !== undefined) {
          this.pending.delete(message.id);
          if (message.error !== undefined) {
            pending.reject(
              new Error(`${message.error.code}: ${message.error.message}`)
            );
          } else {
            pending.resolve(message.result ?? {});
          }
        }
        return;
      }

      const handlers = this.listeners.get(message.method) ?? [];
      handlers.forEach((handler) => handler(message.params ?? {}));
    });
  }

  on(method, handler) {
    const handlers = this.listeners.get(method) ?? [];
    handlers.push(handler);
    this.listeners.set(method, handlers);
  }

  call(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
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

    if (result.exceptionDetails !== undefined) {
      throw new Error(
        result.exceptionDetails.text ?? 'Browser evaluation failed.'
      );
    }

    return result.result?.value;
  }
}

async function waitForCondition(check, label, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await check()) {
      return;
    }
    await delay(125);
  }

  throw new Error(`Timed out waiting for ${label}`);
}

async function click(cdp, point) {
  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: point.x,
    y: point.y,
    button: 'left',
    buttons: 1,
    clickCount: 1,
    pointerType: 'mouse'
  });
  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: point.x,
    y: point.y,
    button: 'left',
    buttons: 0,
    clickCount: 1,
    pointerType: 'mouse'
  });
}

async function drag(cdp, from, to, steps = 8) {
  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: from.x,
    y: from.y,
    button: 'left',
    buttons: 1,
    clickCount: 1,
    pointerType: 'mouse'
  });

  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps;
    await cdp.call('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      button: 'left',
      buttons: 1,
      pointerType: 'mouse'
    });
    await delay(35);
  }

  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: to.x,
    y: to.y,
    button: 'left',
    buttons: 0,
    clickCount: 1,
    pointerType: 'mouse'
  });
}

function movedEnough(before, after, minimum = 20) {
  return (
    Math.abs(after.left - before.left) >= minimum ||
    Math.abs(after.top - before.top) >= minimum
  );
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browserErrors = [];
  const chrome = spawn(
    chromeExecutable(),
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      `--remote-debugging-port=${CDP_PORT}`,
      '--window-size=1440,1000',
      'about:blank'
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  try {
    const pages = await waitForJson(
      `http://127.0.0.1:${CDP_PORT}/json/list`
    );
    const page = pages.find((entry) => entry.type === 'page');
    if (page?.webSocketDebuggerUrl === undefined) {
      throw new Error('Chrome DevTools page target was not found.');
    }

    const socket = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolvePromise, reject) => {
      socket.addEventListener('open', resolvePromise, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });

    const cdp = new CdpClient(socket);
    cdp.on('Runtime.exceptionThrown', (params) => {
      browserErrors.push(
        `exception: ${params.exceptionDetails?.text ?? 'unknown'}`
      );
    });
    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const text = (params.args ?? [])
          .map((arg) => arg.value ?? arg.description ?? '')
          .join(' ');
        browserErrors.push(`console.error: ${text}`);
      }
    });
    cdp.on('Log.entryAdded', ({ entry }) => {
      if (entry?.level === 'error') {
        browserErrors.push(`log.error: ${entry.text ?? 'unknown'}`);
      }
    });

    await cdp.call('Page.enable');
    await cdp.call('Runtime.enable');
    await cdp.call('Log.enable');

    const report = { demos: {}, interactions: {} };
    const allDepthLabels = new Set();

    for (const demo of DEMOS) {
      await cdp.call('Page.navigate', {
        url: `${BASE_URL}/?demo=${demo.name}`
      });
      await waitForCondition(
        async () =>
          cdp.evaluate(
            `document.readyState === 'complete' && document.querySelectorAll('.react-flow__node').length === ${demo.nodes}`
          ),
        `${demo.name} React Flow nodes`
      );
      await cdp.evaluate('document.fonts.ready.then(() => true)');

      const snapshot = await cdp.evaluate(`(() => {
        const titles = [...document.querySelectorAll('.heading-node-title')].map((element) => element.textContent);
        const nodeTransforms = [...document.querySelectorAll('.react-flow__node')].map((element) => element.style.transform);
        return {
          nodes: document.querySelectorAll('.react-flow__node').length,
          edges: document.querySelectorAll('.react-flow__edge').length,
          titles,
          duplicateApi: titles.filter((title) => title === 'API').length,
          syntheticRootVisible: titles.includes('Document Root'),
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          uniqueNodeTransforms: new Set(nodeTransforms).size,
          depthLabels: [...document.querySelectorAll('.heading-node-depth')].map((element) => element.textContent),
          cjkFontAvailable: document.fonts.check('16px "Noto Sans CJK SC"', '文件处理系统')
        };
      })()`);

      if (snapshot.nodes !== demo.nodes || snapshot.edges !== demo.edges) {
        throw new Error(
          `${demo.name}: expected ${demo.nodes}/${demo.edges} nodes/edges, received ${snapshot.nodes}/${snapshot.edges}`
        );
      }
      if (snapshot.duplicateApi !== demo.duplicateApi) {
        throw new Error(`${demo.name}: duplicate API heading count mismatch.`);
      }
      if (snapshot.syntheticRootVisible) {
        throw new Error(`${demo.name}: synthetic Document Root became visible.`);
      }
      if (snapshot.horizontalOverflow) {
        throw new Error(`${demo.name}: page has horizontal overflow.`);
      }
      if (snapshot.uniqueNodeTransforms !== snapshot.nodes) {
        throw new Error(`${demo.name}: nodes completely overlap in debug placement.`);
      }
      if (!snapshot.cjkFontAvailable) {
        throw new Error(`${demo.name}: CJK font fallback is unavailable in browser QA.`);
      }

      snapshot.depthLabels.forEach((label) => allDepthLabels.add(label));
      report.demos[demo.name] = snapshot;

      const screenshot = await cdp.call('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      });
      writeFileSync(
        resolve(OUTPUT_DIR, `${demo.name}.png`),
        screenshot.data,
        'base64'
      );
    }

    const expectedDepthLabels = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    if (!expectedDepthLabels.every((label) => allDepthLabels.has(label))) {
      throw new Error(
        `Browser demos do not cover H1-H6 labels: ${[...allDepthLabels].join(', ')}`
      );
    }

    await cdp.call('Page.navigate', { url: `${BASE_URL}/?demo=basic` });
    await waitForCondition(
      async () =>
        cdp.evaluate(
          "document.querySelectorAll('.react-flow__node').length === 6"
        ),
      'basic demo interaction target'
    );

    const initial = await cdp.evaluate(`(() => {
      const node = document.querySelector('.react-flow__node');
      const rect = node.getBoundingClientRect();
      return {
        nodeTransform: node.style.transform,
        nodeRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        nodeCenter: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      };
    })()`);

    await click(cdp, initial.nodeCenter);
    await waitForCondition(
      async () =>
        cdp.evaluate(
          "document.querySelectorAll('.heading-node-card[data-selected=\"true\"]').length === 1"
        ),
      'node selection'
    );

    await drag(
      cdp,
      initial.nodeCenter,
      { x: initial.nodeCenter.x + 110, y: initial.nodeCenter.y + 70 },
      10
    );

    await waitForCondition(
      async () => {
        const currentRect = await cdp.evaluate(`(() => {
          const rect = document.querySelector('.react-flow__node').getBoundingClientRect();
          return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        })()`);
        return movedEnough(initial.nodeRect, currentRect);
      },
      'ephemeral node drag'
    );

    await cdp.call('Page.reload');
    await waitForCondition(
      async () =>
        cdp.evaluate(
          "document.querySelectorAll('.react-flow__node').length === 6"
        ),
      'basic demo reload'
    );
    const reloadedTransform = await cdp.evaluate(
      "document.querySelector('.react-flow__node').style.transform"
    );
    if (reloadedTransform !== initial.nodeTransform) {
      throw new Error(
        'Dragged node position persisted across reload; T02 drag must be ephemeral.'
      );
    }

    const viewportState = await cdp.evaluate(`(() => {
      const pane = document.querySelector('.react-flow__pane');
      const viewport = document.querySelector('.react-flow__viewport');
      const paneRect = pane.getBoundingClientRect();
      return {
        viewportTransform: viewport.style.transform,
        panePoint: { x: paneRect.right - 80, y: paneRect.bottom - 80 }
      };
    })()`);

    await cdp.call('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: viewportState.panePoint.x,
      y: viewportState.panePoint.y,
      deltaX: 0,
      deltaY: -240,
      pointerType: 'mouse'
    });
    await waitForCondition(
      async () =>
        (await cdp.evaluate(
          "document.querySelector('.react-flow__viewport').style.transform"
        )) !== viewportState.viewportTransform,
      'viewport zoom'
    );
    const zoomedTransform = await cdp.evaluate(
      "document.querySelector('.react-flow__viewport').style.transform"
    );

    await drag(
      cdp,
      viewportState.panePoint,
      {
        x: viewportState.panePoint.x - 80,
        y: viewportState.panePoint.y - 45
      },
      6
    );
    await waitForCondition(
      async () =>
        (await cdp.evaluate(
          "document.querySelector('.react-flow__viewport').style.transform"
        )) !== zoomedTransform,
      'viewport pan'
    );

    report.interactions = {
      selection: 'pass',
      drag: 'pass',
      dragPersistence: 'not persisted',
      zoom: 'pass',
      pan: 'pass'
    };

    const keyWarnings = browserErrors.filter((message) =>
      /unique.*key|key prop/i.test(message)
    );
    if (keyWarnings.length > 0) {
      throw new Error(
        `React key warning detected: ${keyWarnings.join('\n')}`
      );
    }
    if (browserErrors.length > 0) {
      throw new Error(`Browser errors detected:\n${browserErrors.join('\n')}`);
    }

    writeFileSync(
      resolve(OUTPUT_DIR, 'report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log(JSON.stringify(report, null, 2));
    socket.close();
  } finally {
    chrome.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'http://127.0.0.1:4173';
const CDP_PORT = 9222;
const OUTPUT_DIR = resolve('artifacts/t03-browser');
const DEMOS = [
  {
    name: 'mixed-cards',
    nodes: 9,
    edges: 8,
    headingCards: 4,
    markdownCards: 5,
    duplicateApi: 2
  },
  {
    name: 'gfm-card',
    nodes: 2,
    edges: 1,
    headingCards: 1,
    markdownCards: 1,
    duplicateApi: 0
  },
  {
    name: 'long-card',
    nodes: 2,
    edges: 1,
    headingCards: 1,
    markdownCards: 1,
    duplicateApi: 0
  },
  {
    name: 'empty-card',
    nodes: 3,
    edges: 2,
    headingCards: 2,
    markdownCards: 1,
    duplicateApi: 0
  }
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
    await delay(30);
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

function movedEnough(before, after, minimum = 12) {
  return (
    Math.abs(after.left - before.left) >= minimum ||
    Math.abs(after.top - before.top) >= minimum
  );
}

async function navigateToDemo(cdp, demoName, nodeCount) {
  await cdp.call('Page.navigate', { url: `${BASE_URL}/?demo=${demoName}` });
  await waitForCondition(
    async () =>
      cdp.evaluate(
        `document.readyState === 'complete' && document.querySelectorAll('.react-flow__node-document').length === ${nodeCount}`
      ),
    `${demoName} Document Nodes`
  );
  await cdp.evaluate('document.fonts.ready.then(() => true)');
}

async function screenshot(cdp, name) {
  const capture = await cdp.call('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  writeFileSync(resolve(OUTPUT_DIR, `${name}.png`), capture.data, 'base64');
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
    { stdio: ['ignore', 'ignore', 'ignore'] }
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

    const report = {
      demos: {},
      markdown: {},
      scrolling: {},
      interactions: {}
    };

    for (const demo of DEMOS) {
      await navigateToDemo(cdp, demo.name, demo.nodes);

      const snapshot = await cdp.evaluate(`(() => {
        const cards = [...document.querySelectorAll('.document-card')];
        const titles = cards.map((card) => card.querySelector('.document-card-title')?.textContent ?? '');
        const nodeTransforms = [...document.querySelectorAll('.react-flow__node-document')].map((element) => element.style.transform);
        const apiModes = cards
          .filter((card) => card.querySelector('.document-card-title')?.textContent === 'API')
          .map((card) => card.getAttribute('data-view-mode'));
        return {
          nodes: document.querySelectorAll('.react-flow__node-document').length,
          edges: document.querySelectorAll('.react-flow__edge').length,
          headingCards: document.querySelectorAll('.document-card--heading').length,
          markdownCards: document.querySelectorAll('.document-card--markdown').length,
          handles: document.querySelectorAll('.react-flow__handle').length,
          titles,
          duplicateApi: titles.filter((title) => title === 'API').length,
          apiModes,
          syntheticRootVisible: titles.includes('Document Root'),
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          uniqueNodeTransforms: new Set(nodeTransforms).size,
          depthLabels: [...document.querySelectorAll('.document-card-depth')].map((element) => element.textContent),
          cjkFontAvailable: document.fonts.check('16px "Noto Sans CJK SC"', '文件处理系统')
        };
      })()`);

      if (
        snapshot.nodes !== demo.nodes ||
        snapshot.edges !== demo.edges ||
        snapshot.headingCards !== demo.headingCards ||
        snapshot.markdownCards !== demo.markdownCards
      ) {
        throw new Error(
          `${demo.name}: expected nodes/edges/heading/markdown ${demo.nodes}/${demo.edges}/${demo.headingCards}/${demo.markdownCards}, received ${snapshot.nodes}/${snapshot.edges}/${snapshot.headingCards}/${snapshot.markdownCards}`
        );
      }
      if (snapshot.handles !== demo.nodes * 2) {
        throw new Error(`${demo.name}: Document Nodes do not share exactly two structural handles.`);
      }
      if (snapshot.duplicateApi !== demo.duplicateApi) {
        throw new Error(`${demo.name}: duplicate API heading count mismatch.`);
      }
      if (
        demo.name === 'mixed-cards' &&
        JSON.stringify(snapshot.apiModes) !== JSON.stringify(['heading', 'markdown'])
      ) {
        throw new Error('mixed-cards: duplicate API nodes did not keep independent view modes.');
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

      report.demos[demo.name] = snapshot;

      if (demo.name === 'mixed-cards') {
        const center = await cdp.evaluate(`(() => {
          const pane = document.querySelector('.react-flow__pane').getBoundingClientRect();
          return { x: pane.left + pane.width / 2, y: pane.top + pane.height / 2 };
        })()`);
        await cdp.call('Input.dispatchMouseEvent', {
          type: 'mouseWheel',
          x: center.x,
          y: center.y,
          deltaX: 0,
          deltaY: -220,
          pointerType: 'mouse'
        });
        await delay(180);
      }

      await screenshot(cdp, demo.name);
    }

    await navigateToDemo(cdp, 'gfm-card', 2);
    const markdownChecks = await cdp.evaluate(`(() => {
      const body = document.querySelector('.markdown-card-body');
      const links = [...body.querySelectorAll('a')];
      const safeLink = links.find((link) => link.textContent === '安全链接');
      const unsafeLink = links.find((link) => link.textContent === '不安全链接');
      return {
        paragraph: body.querySelectorAll('p').length > 0,
        unorderedList: body.querySelectorAll('ul').length > 0,
        orderedList: body.querySelectorAll('ol').length > 0,
        taskList: body.querySelectorAll('input[type="checkbox"]').length === 2,
        inlineCode: [...body.querySelectorAll('code')].some((code) => code.textContent === 'inlineCode()'),
        codeBlock: body.querySelectorAll('pre code').length > 0,
        blockquote: body.querySelectorAll('blockquote').length > 0,
        table: body.querySelectorAll('table').length > 0,
        strikethrough: body.querySelectorAll('del').length > 0,
        safeLinkHref: safeLink?.getAttribute('href') ?? null,
        safeLinkTarget: safeLink?.getAttribute('target') ?? null,
        safeLinkRel: safeLink?.getAttribute('rel') ?? null,
        safeLinkNoDrag: safeLink?.classList.contains('nodrag') ?? false,
        unsafeLinkHref: unsafeLink?.getAttribute('href') ?? null,
        rawScriptElements: body.querySelectorAll('script').length,
        rawClickElements: body.querySelectorAll('[onclick]').length,
        rawHtmlExecuted: globalThis.__t03RawHtmlExecuted === true || globalThis.__t03RawHtmlClicked === true
      };
    })()`);

    for (const key of [
      'paragraph',
      'unorderedList',
      'orderedList',
      'taskList',
      'inlineCode',
      'codeBlock',
      'blockquote',
      'table',
      'strikethrough',
      'safeLinkNoDrag'
    ]) {
      if (!markdownChecks[key]) {
        throw new Error(`gfm-card: Markdown rendering check failed for ${key}.`);
      }
    }
    if (
      markdownChecks.safeLinkHref !== 'https://example.com/docs' ||
      markdownChecks.safeLinkTarget !== '_blank' ||
      markdownChecks.safeLinkRel !== 'noopener noreferrer'
    ) {
      throw new Error('gfm-card: safe link attributes are incorrect.');
    }
    if (
      markdownChecks.unsafeLinkHref?.toLowerCase().startsWith('javascript:')
    ) {
      throw new Error('gfm-card: unsafe link protocol was allowed.');
    }
    if (
      markdownChecks.rawScriptElements !== 0 ||
      markdownChecks.rawClickElements !== 0 ||
      markdownChecks.rawHtmlExecuted
    ) {
      throw new Error('gfm-card: raw HTML became executable DOM.');
    }
    report.markdown = markdownChecks;

    const linkDragStart = await cdp.evaluate(`(() => {
      const link = [...document.querySelectorAll('.markdown-card-body a')].find((element) => element.textContent === '安全链接');
      const node = link.closest('.react-flow__node-document');
      const linkRect = link.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      return {
        point: { x: linkRect.left + linkRect.width / 2, y: linkRect.top + linkRect.height / 2 },
        nodeRect: { left: nodeRect.left, top: nodeRect.top }
      };
    })()`);
    await drag(
      cdp,
      linkDragStart.point,
      { x: linkDragStart.point.x + 22, y: linkDragStart.point.y + 4 },
      5
    );
    await delay(120);
    const linkDragAfter = await cdp.evaluate(`(() => {
      const link = [...document.querySelectorAll('.markdown-card-body a')].find((element) => element.textContent === '安全链接');
      const rect = link.closest('.react-flow__node-document').getBoundingClientRect();
      return { left: rect.left, top: rect.top };
    })()`);
    if (movedEnough(linkDragStart.nodeRect, linkDragAfter, 4)) {
      throw new Error('Link interaction accidentally dragged its Document Node.');
    }

    await navigateToDemo(cdp, 'long-card', 2);
    const scrollBefore = await cdp.evaluate(`(() => {
      const body = document.querySelector('.markdown-card-body');
      const viewport = document.querySelector('.react-flow__viewport');
      const rect = body.getBoundingClientRect();
      return {
        scrollHeight: body.scrollHeight,
        clientHeight: body.clientHeight,
        scrollTop: body.scrollTop,
        viewportTransform: viewport.style.transform,
        point: { x: rect.left + rect.width / 2, y: rect.top + Math.min(rect.height / 2, 120) }
      };
    })()`);
    if (scrollBefore.scrollHeight <= scrollBefore.clientHeight) {
      throw new Error('long-card: Markdown body is not bounded and scrollable.');
    }

    await cdp.call('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: scrollBefore.point.x,
      y: scrollBefore.point.y,
      deltaX: 0,
      deltaY: 420,
      pointerType: 'mouse'
    });
    await waitForCondition(
      async () =>
        (await cdp.evaluate(
          "document.querySelector('.markdown-card-body').scrollTop"
        )) > scrollBefore.scrollTop,
      'Markdown body internal scroll'
    );
    const scrollAfter = await cdp.evaluate(`(() => ({
      scrollTop: document.querySelector('.markdown-card-body').scrollTop,
      viewportTransform: document.querySelector('.react-flow__viewport').style.transform
    }))()`);
    if (scrollAfter.viewportTransform !== scrollBefore.viewportTransform) {
      throw new Error('Markdown body wheel changed Canvas viewport transform.');
    }
    report.scrolling = {
      scrollHeight: scrollBefore.scrollHeight,
      clientHeight: scrollBefore.clientHeight,
      scrollTopBefore: scrollBefore.scrollTop,
      scrollTopAfter: scrollAfter.scrollTop,
      viewportZoomIsolation: 'pass'
    };

    const headerDragStart = await cdp.evaluate(`(() => {
      const card = document.querySelector('.document-card--markdown');
      const header = card.querySelector('.document-card-header');
      const node = card.closest('.react-flow__node-document');
      const headerRect = header.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      return {
        point: { x: headerRect.left + headerRect.width / 2, y: headerRect.top + headerRect.height / 2 },
        nodeRect: { left: nodeRect.left, top: nodeRect.top }
      };
    })()`);
    await drag(
      cdp,
      headerDragStart.point,
      { x: headerDragStart.point.x + 86, y: headerDragStart.point.y + 54 },
      9
    );
    await waitForCondition(
      async () => {
        const current = await cdp.evaluate(`(() => {
          const rect = document.querySelector('.document-card--markdown').closest('.react-flow__node-document').getBoundingClientRect();
          return { left: rect.left, top: rect.top };
        })()`);
        return movedEnough(headerDragStart.nodeRect, current);
      },
      'Document Node drag from card header'
    );

    await navigateToDemo(cdp, 'mixed-cards', 9);
    const firstNode = await cdp.evaluate(`(() => {
      const node = document.querySelector('.react-flow__node-document');
      const rect = node.getBoundingClientRect();
      return {
        point: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      };
    })()`);
    await click(cdp, firstNode.point);
    await waitForCondition(
      async () =>
        cdp.evaluate(
          "document.querySelectorAll('.document-card[data-selected=\"true\"]').length === 1"
        ),
      'Document Node selection'
    );
    const selectedOutline = await cdp.evaluate(`(() => {
      const card = document.querySelector('.document-card[data-selected="true"]');
      const style = getComputedStyle(card);
      return { width: style.outlineWidth, style: style.outlineStyle };
    })()`);
    if (selectedOutline.width === '0px' || selectedOutline.style === 'none') {
      throw new Error('Selected state has no non-color outline.');
    }

    await cdp.call('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9
    });
    await cdp.call('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Tab',
      code: 'Tab',
      windowsVirtualKeyCode: 9
    });
    await delay(100);
    const focusState = await cdp.evaluate(`(() => {
      const active = document.activeElement;
      const style = active instanceof HTMLElement ? getComputedStyle(active) : null;
      return {
        isDocumentNode: active?.classList?.contains('react-flow__node-document') ?? false,
        outlineWidth: style?.outlineWidth ?? '0px',
        outlineStyle: style?.outlineStyle ?? 'none'
      };
    })()`);
    if (
      !focusState.isDocumentNode ||
      focusState.outlineWidth === '0px' ||
      focusState.outlineStyle === 'none'
    ) {
      throw new Error('Keyboard focus indication is missing on Document Nodes.');
    }

    const viewportBefore = await cdp.evaluate(`(() => {
      const pane = document.querySelector('.react-flow__pane');
      const viewport = document.querySelector('.react-flow__viewport');
      const rect = pane.getBoundingClientRect();
      return {
        transform: viewport.style.transform,
        point: { x: rect.right - 70, y: rect.bottom - 70 }
      };
    })()`);
    await cdp.call('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: viewportBefore.point.x,
      y: viewportBefore.point.y,
      deltaX: 0,
      deltaY: -220,
      pointerType: 'mouse'
    });
    await waitForCondition(
      async () =>
        (await cdp.evaluate(
          "document.querySelector('.react-flow__viewport').style.transform"
        )) !== viewportBefore.transform,
      'Canvas zoom outside Markdown body'
    );
    const zoomedTransform = await cdp.evaluate(
      "document.querySelector('.react-flow__viewport').style.transform"
    );
    await drag(
      cdp,
      viewportBefore.point,
      { x: viewportBefore.point.x - 70, y: viewportBefore.point.y - 40 },
      6
    );
    await waitForCondition(
      async () =>
        (await cdp.evaluate(
          "document.querySelector('.react-flow__viewport').style.transform"
        )) !== zoomedTransform,
      'Canvas pan outside Markdown body'
    );

    report.interactions = {
      selection: 'pass',
      focus: 'pass',
      selectedOutline: 'pass',
      nodeDragFromHeader: 'pass',
      linkDragIsolation: 'pass',
      canvasZoom: 'pass',
      canvasPan: 'pass'
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

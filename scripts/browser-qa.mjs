import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'http://127.0.0.1:4173';
const CDP_PORT = 9222;
const OUTPUT_DIR = resolve('artifacts/t03-browser');
const DEMOS = [
  ['mixed-cards', 9, 8, 4, 5, 2],
  ['gfm-card', 2, 1, 1, 1, 0],
  ['long-card', 2, 1, 1, 1, 0],
  ['empty-card', 3, 2, 2, 1, 0]
];

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
      // Browser is still starting.
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
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
        else pending.resolve(message.result ?? {});
        return;
      }
      for (const handler of this.listeners.get(message.method) ?? []) handler(message.params ?? {});
    });
  }

  on(method, handler) {
    this.listeners.set(method, [...(this.listeners.get(method) ?? []), handler]);
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

async function navigate(cdp, demo, count) {
  await cdp.call('Page.navigate', { url: `${BASE_URL}/?demo=${demo}` });
  await waitFor(
    () => cdp.evaluate(`document.readyState === 'complete' && document.querySelectorAll('.react-flow__node-document').length === ${count}`),
    `${demo} nodes`
  );
  await cdp.evaluate('document.fonts.ready.then(() => true)');
}

async function click(cdp, point) {
  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: point.x, y: point.y, button: 'left', buttons: 1, clickCount: 1
  });
  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: point.x, y: point.y, button: 'left', buttons: 0, clickCount: 1
  });
}

async function drag(cdp, from, to, steps = 8) {
  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1
  });
  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps;
    await cdp.call('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      button: 'left',
      buttons: 1
    });
    await delay(30);
  }
  await cdp.call('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1
  });
}

async function pressTab(cdp) {
  await cdp.call('Input.dispatchKeyEvent', {
    type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9
  });
  await cdp.call('Input.dispatchKeyEvent', {
    type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9
  });
}

function moved(before, after, minimum = 12) {
  return Math.abs(after.left - before.left) >= minimum || Math.abs(after.top - before.top) >= minimum;
}

async function screenshot(cdp, name) {
  const capture = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(resolve(OUTPUT_DIR, `${name}.png`), capture.data, 'base64');
}

async function zoomMixedForEvidence(cdp) {
  const point = await cdp.evaluate(`(() => {
    const rect = document.querySelector('.react-flow__pane').getBoundingClientRect();
    return { x: rect.left + rect.width * 0.58, y: rect.top + rect.height * 0.48 };
  })()`);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const zoom = await cdp.evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('.react-flow__viewport')).transform).a`);
    if (zoom >= 0.55) return;
    await cdp.call('Input.dispatchMouseEvent', {
      type: 'mouseWheel', x: point.x, y: point.y, deltaX: 0, deltaY: -320
    });
    await delay(100);
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const profile = resolve('/tmp', `t03-chrome-${process.pid}`);
  mkdirSync(profile, { recursive: true });
  const errors = [];
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
    cdp.on('Runtime.exceptionThrown', (params) => errors.push(`exception: ${params.exceptionDetails?.text ?? 'unknown'}`));
    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') errors.push(`console.error: ${(params.args ?? []).map((arg) => arg.value ?? arg.description ?? '').join(' ')}`);
    });
    cdp.on('Log.entryAdded', ({ entry }) => {
      if (entry?.level === 'error') errors.push(`log.error: ${entry.text ?? 'unknown'}`);
    });
    await cdp.call('Page.enable');
    await cdp.call('Runtime.enable');
    await cdp.call('Log.enable');
    await cdp.call('Page.bringToFront');

    const report = { demos: {}, markdown: {}, scrolling: {}, interactions: {} };

    for (const [name, nodeCount, edgeCount, headingCount, markdownCount, duplicateApi] of DEMOS) {
      await navigate(cdp, name, nodeCount);
      const snapshot = await cdp.evaluate(`(() => {
        const nodes = [...document.querySelectorAll('.react-flow__node-document')];
        const cards = [...document.querySelectorAll('.document-card')];
        const titles = cards.map((card) => card.querySelector('.document-card-title')?.textContent ?? '');
        const apiModes = cards.filter((card) => card.querySelector('.document-card-title')?.textContent === 'API').map((card) => card.dataset.viewMode);
        const h2 = cards.filter((card) => card.matches('.document-card--heading.document-card--h2')).map((card) => {
          const cardStyle = getComputedStyle(card);
          const titleStyle = getComputedStyle(card.querySelector('.document-card-title'));
          return [cardStyle.borderWidth, titleStyle.fontSize, titleStyle.fontWeight].join('|');
        });
        const edgePaths = [...document.querySelectorAll('.react-flow__edge-path')];
        return {
          nodes: nodes.length,
          nodeIdsUnique: new Set(nodes.map((node) => node.dataset.id)).size === nodes.length,
          edges: document.querySelectorAll('.react-flow__edge').length,
          edgePathsReady: edgePaths.length > 0 && edgePaths.every((path) => (path.getAttribute('d') ?? '').length > 0),
          headingCards: document.querySelectorAll('.document-card--heading').length,
          markdownCards: document.querySelectorAll('.document-card--markdown').length,
          handles: document.querySelectorAll('.react-flow__handle').length,
          duplicateApi: titles.filter((title) => title === 'API').length,
          apiModes,
          syntheticRootVisible: titles.includes('Document Root'),
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          uniqueTransforms: new Set(nodes.map((node) => node.style.transform)).size,
          cjk: document.fonts.check('16px "Noto Sans CJK SC"', '文件处理系统'),
          sameDepthTheme: h2.length < 2 || new Set(h2).size === 1
        };
      })()`);

      if (snapshot.nodes !== nodeCount || snapshot.edges !== edgeCount || snapshot.headingCards !== headingCount || snapshot.markdownCards !== markdownCount) {
        throw new Error(`${name}: count mismatch ${JSON.stringify(snapshot)}`);
      }
      if (!snapshot.nodeIdsUnique || !snapshot.edgePathsReady) throw new Error(`${name}: node identity or hierarchy edge rendering failed.`);
      if (snapshot.handles !== nodeCount * 2) throw new Error(`${name}: handle contract failed.`);
      if (snapshot.duplicateApi !== duplicateApi) throw new Error(`${name}: duplicate API count failed.`);
      if (name === 'mixed-cards' && JSON.stringify(snapshot.apiModes) !== JSON.stringify(['heading', 'markdown'])) throw new Error('Duplicate API nodes did not keep independent view modes.');
      if (!snapshot.sameDepthTheme) throw new Error(`${name}: same-depth Heading Card theme drifted.`);
      if (snapshot.syntheticRootVisible || snapshot.horizontalOverflow || snapshot.uniqueTransforms !== snapshot.nodes || !snapshot.cjk) throw new Error(`${name}: visual invariant failed.`);

      if (name === 'mixed-cards') {
        const ownership = await cdp.evaluate(`(() => {
          const card = [...document.querySelectorAll('.document-card')].find((item) => item.querySelector('.document-card-title')?.textContent === '上传文件');
          const text = card?.querySelector('.markdown-card-body')?.textContent ?? '';
          return { own: text.includes('支持多种格式'), descendants: ['TXT','PDF','Word'].some((title) => text.includes(title)) };
        })()`);
        if (!ownership.own || ownership.descendants) throw new Error('Markdown Card violated Local Body ownership.');
      }

      if (name === 'empty-card') {
        const empty = await cdp.evaluate(`(() => {
          const card = [...document.querySelectorAll('.document-card')].find((item) => item.querySelector('.document-card-title')?.textContent === 'Empty');
          return { mode: card?.dataset.viewMode ?? null, body: card?.querySelector('.markdown-card-body') !== null };
        })()`);
        if (empty.mode !== 'markdown' || empty.body) throw new Error('Empty Local Body presentation failed.');
      }

      report.demos[name] = snapshot;
      if (name === 'mixed-cards') await zoomMixedForEvidence(cdp);
      await screenshot(cdp, name);
    }

    await navigate(cdp, 'gfm-card', 2);
    const markdown = await cdp.evaluate(`(() => {
      const body = document.querySelector('.markdown-card-body');
      const links = [...body.querySelectorAll('a')];
      const safe = links.find((link) => link.textContent === '安全链接');
      const unsafe = links.find((link) => link.textContent === '不安全链接');
      return {
        paragraph: body.querySelectorAll('p').length > 0,
        unordered: body.querySelectorAll('ul').length > 0,
        ordered: body.querySelectorAll('ol').length > 0,
        tasks: body.querySelectorAll('input[type="checkbox"]').length === 2,
        inlineCode: [...body.querySelectorAll('code')].some((code) => code.textContent === 'inlineCode()'),
        codeBlock: body.querySelectorAll('pre code').length > 0,
        quote: body.querySelectorAll('blockquote').length > 0,
        table: body.querySelectorAll('table').length > 0,
        strike: body.querySelectorAll('del').length > 0,
        safeHref: safe?.getAttribute('href') ?? null,
        safeTarget: safe?.getAttribute('target') ?? null,
        safeRel: safe?.getAttribute('rel') ?? null,
        safeNoDrag: safe?.classList.contains('nodrag') ?? false,
        unsafeHref: unsafe?.getAttribute('href') ?? null,
        rawScript: body.querySelectorAll('script').length,
        rawClick: body.querySelectorAll('[onclick]').length,
        rawExecuted: globalThis.__t03RawHtmlExecuted === true || globalThis.__t03RawHtmlClicked === true
      };
    })()`);
    for (const key of ['paragraph','unordered','ordered','tasks','inlineCode','codeBlock','quote','table','strike','safeNoDrag']) {
      if (!markdown[key]) throw new Error(`GFM check failed: ${key}`);
    }
    if (markdown.safeHref !== 'https://example.com/docs' || markdown.safeTarget !== '_blank' || markdown.safeRel !== 'noopener noreferrer') throw new Error('Safe link attributes failed.');
    if (markdown.unsafeHref?.toLowerCase().startsWith('javascript:')) throw new Error('Unsafe link protocol was allowed.');
    if (markdown.rawScript || markdown.rawClick || markdown.rawExecuted) throw new Error('Raw HTML became executable.');
    report.markdown = markdown;

    const linkDrag = await cdp.evaluate(`(() => {
      const link = [...document.querySelectorAll('.markdown-card-body a')].find((item) => item.textContent === '安全链接');
      const node = link.closest('.react-flow__node-document');
      const linkRect = link.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      return { point: { x: linkRect.left + linkRect.width / 2, y: linkRect.top + linkRect.height / 2 }, before: { left: nodeRect.left, top: nodeRect.top } };
    })()`);
    await drag(cdp, linkDrag.point, { x: linkDrag.point.x + 22, y: linkDrag.point.y + 4 }, 5);
    const linkAfter = await cdp.evaluate(`(() => { const rect = [...document.querySelectorAll('.markdown-card-body a')].find((item) => item.textContent === '安全链接').closest('.react-flow__node-document').getBoundingClientRect(); return { left: rect.left, top: rect.top }; })()`);
    if (moved(linkDrag.before, linkAfter, 4)) throw new Error('Link interaction dragged the node.');

    const selectable = await cdp.evaluate(`(() => { const rect = document.querySelector('.document-card--heading').getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
    await click(cdp, selectable);
    await waitFor(() => cdp.evaluate(`document.querySelectorAll('.document-card[data-selected="true"]').length === 1`), 'selection');
    const selected = await cdp.evaluate(`(() => { const style = getComputedStyle(document.querySelector('.document-card[data-selected="true"]')); return { width: style.outlineWidth, style: style.outlineStyle }; })()`);
    if (selected.width === '0px' || selected.style === 'none') throw new Error('Selection has no non-color outline.');

    await navigate(cdp, 'gfm-card', 2);
    await cdp.evaluate(`document.body.tabIndex = -1; document.body.focus(); true`);
    let focus = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await pressTab(cdp);
      await delay(100);
      focus = await cdp.evaluate(`(() => {
        const active = document.activeElement;
        const style = active instanceof HTMLElement ? getComputedStyle(active) : null;
        return {
          shell: active?.classList?.contains('document-node-shell') ?? false,
          focusVisible: active?.matches?.(':focus-visible') ?? false,
          outlineWidth: style?.outlineWidth ?? '0px',
          outlineStyle: style?.outlineStyle ?? 'none',
          tag: active?.tagName ?? null,
          className: typeof active?.className === 'string' ? active.className : null
        };
      })()`);
      if (focus.shell) break;
    }
    if (!focus?.shell || !focus.focusVisible || focus.outlineWidth === '0px' || focus.outlineStyle === 'none') throw new Error(`Keyboard focus indication failed: ${JSON.stringify(focus)}`);

    await navigate(cdp, 'long-card', 2);
    const scrollBefore = await cdp.evaluate(`(() => {
      const body = document.querySelector('.markdown-card-body');
      const rect = body.getBoundingClientRect();
      return {
        scrollHeight: body.scrollHeight,
        clientHeight: body.clientHeight,
        scrollTop: body.scrollTop,
        viewport: document.querySelector('.react-flow__viewport').style.transform,
        point: { x: rect.left + rect.width / 2, y: rect.top + Math.min(rect.height / 2, 120) }
      };
    })()`);
    if (scrollBefore.scrollHeight <= scrollBefore.clientHeight) throw new Error('Long Markdown Card is not bounded.');
    await cdp.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: scrollBefore.point.x, y: scrollBefore.point.y, deltaX: 0, deltaY: 420 });
    await waitFor(() => cdp.evaluate(`document.querySelector('.markdown-card-body').scrollTop > ${scrollBefore.scrollTop}`), 'internal scroll');
    const scrollAfter = await cdp.evaluate(`({ scrollTop: document.querySelector('.markdown-card-body').scrollTop, viewport: document.querySelector('.react-flow__viewport').style.transform })`);
    if (scrollAfter.viewport !== scrollBefore.viewport) throw new Error('Markdown body wheel changed Canvas viewport.');
    report.scrolling = {
      scrollHeight: scrollBefore.scrollHeight,
      clientHeight: scrollBefore.clientHeight,
      scrollTopBefore: scrollBefore.scrollTop,
      scrollTopAfter: scrollAfter.scrollTop,
      viewportTransformBefore: scrollBefore.viewport,
      viewportTransformAfter: scrollAfter.viewport
    };

    const headerDrag = await cdp.evaluate(`(() => {
      const header = document.querySelector('.document-card--markdown .document-card-header');
      const node = header.closest('.react-flow__node-document');
      const hr = header.getBoundingClientRect();
      const nr = node.getBoundingClientRect();
      return { point: { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 }, before: { left: nr.left, top: nr.top } };
    })()`);
    await drag(cdp, headerDrag.point, { x: headerDrag.point.x + 86, y: headerDrag.point.y + 54 }, 9);
    await waitFor(async () => {
      const after = await cdp.evaluate(`(() => { const rect = document.querySelector('.document-card--markdown').closest('.react-flow__node-document').getBoundingClientRect(); return { left: rect.left, top: rect.top }; })()`);
      return moved(headerDrag.before, after);
    }, 'node drag');

    const viewport = await cdp.evaluate(`(() => { const pane = document.querySelector('.react-flow__pane').getBoundingClientRect(); return { transform: document.querySelector('.react-flow__viewport').style.transform, point: { x: pane.right - 70, y: pane.bottom - 70 } }; })()`);
    await cdp.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: viewport.point.x, y: viewport.point.y, deltaX: 0, deltaY: -220 });
    await waitFor(() => cdp.evaluate(`document.querySelector('.react-flow__viewport').style.transform !== ${JSON.stringify(viewport.transform)}`), 'canvas zoom');
    const zoomed = await cdp.evaluate(`document.querySelector('.react-flow__viewport').style.transform`);
    await drag(cdp, viewport.point, { x: viewport.point.x - 70, y: viewport.point.y - 40 }, 6);
    await waitFor(() => cdp.evaluate(`document.querySelector('.react-flow__viewport').style.transform !== ${JSON.stringify(zoomed)}`), 'canvas pan');

    report.interactions = {
      selection: 'pass',
      focus: 'pass',
      selectedOutline: 'pass',
      nodeDragFromHeader: 'pass',
      linkDragIsolation: 'pass',
      bodyWheelIsolation: 'pass',
      canvasZoom: 'pass',
      canvasPan: 'pass'
    };

    const keyWarnings = errors.filter((message) => /unique.*key|key prop/i.test(message));
    if (keyWarnings.length) throw new Error(`React key warning detected: ${keyWarnings.join('\n')}`);
    if (errors.length) throw new Error(`Browser errors detected:\n${errors.join('\n')}`);

    writeFileSync(resolve(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
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

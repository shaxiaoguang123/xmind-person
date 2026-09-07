import { useMemo } from 'react';

import basicSource from '../../../../fixtures/markdown/t02-basic.md?raw';
import duplicateMixedSource from '../../../../fixtures/markdown/t02-duplicate-mixed.md?raw';
import nestedSource from '../../../../fixtures/markdown/t02-nested.md?raw';
import { projectSectionTree } from '../core/graph';
import { projectMarkdownDocument } from '../core/markdown';
import { EditorCanvas } from '../features/editor/EditorCanvas';

type DemoName = 'basic' | 'nested' | 'duplicate-mixed';

const demos: Record<DemoName, string> = {
  basic: basicSource,
  nested: nestedSource,
  'duplicate-mixed': duplicateMixedSource
};

function resolveDemoName(): DemoName {
  const requested = new URLSearchParams(window.location.search).get('demo');
  if (requested === 'nested' || requested === 'duplicate-mixed') {
    return requested;
  }

  return 'basic';
}

export function App() {
  const demoName = resolveDemoName();
  const visualGraph = useMemo(() => {
    const markdownProjection = projectMarkdownDocument(demos[demoName]);
    return projectSectionTree(markdownProjection.tree);
  }, [demoName]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">T02 projection debug canvas</p>
          <h1>Section Tree → Visual Graph</h1>
        </div>
        <p className="app-demo-label" aria-label="Current demo">
          {demoName}
        </p>
      </header>
      <section className="canvas-shell" aria-label="Basic React Flow graph">
        <EditorCanvas graph={visualGraph} />
      </section>
    </main>
  );
}

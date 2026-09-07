import { useMemo } from 'react';

import emptyCardSource from '../../../../fixtures/markdown/t03-empty-card.md?raw';
import gfmCardSource from '../../../../fixtures/markdown/t03-gfm-card.md?raw';
import longCardSource from '../../../../fixtures/markdown/t03-long-card.md?raw';
import mixedCardsSource from '../../../../fixtures/markdown/t03-mixed-cards.md?raw';
import {
  projectSectionTree,
  type ViewModeByNodeId
} from '../core/graph';
import {
  projectMarkdownDocument,
  type DocumentSection,
  type SectionTree
} from '../core/markdown';
import { EditorCanvas } from '../features/editor/EditorCanvas';

type DemoName = 'mixed-cards' | 'gfm-card' | 'long-card' | 'empty-card';

interface DemoConfig {
  source: string;
  markdownDocumentOrders: readonly number[];
}

const demos: Record<DemoName, DemoConfig> = {
  'mixed-cards': {
    source: mixedCardsSource,
    markdownDocumentOrders: [1, 3, 4, 5, 8]
  },
  'gfm-card': {
    source: gfmCardSource,
    markdownDocumentOrders: [1]
  },
  'long-card': {
    source: longCardSource,
    markdownDocumentOrders: [1]
  },
  'empty-card': {
    source: emptyCardSource,
    markdownDocumentOrders: [1]
  }
};

function resolveDemoName(): DemoName {
  const requested = new URLSearchParams(window.location.search).get('demo');
  if (
    requested === 'gfm-card' ||
    requested === 'long-card' ||
    requested === 'empty-card'
  ) {
    return requested;
  }

  return 'mixed-cards';
}

function buildViewModeByNodeId(
  tree: SectionTree,
  markdownDocumentOrders: readonly number[]
): ViewModeByNodeId {
  const requestedOrders = new Set(markdownDocumentOrders);
  const viewModeByNodeId: Record<string, 'markdown'> = {};

  function visit(section: DocumentSection): void {
    if (requestedOrders.has(section.documentOrder)) {
      viewModeByNodeId[section.nodeId] = 'markdown';
    }
    section.children.forEach(visit);
  }

  tree.children.forEach(visit);
  return viewModeByNodeId;
}

export function App() {
  const demoName = resolveDemoName();
  const visualGraph = useMemo(() => {
    const demo = demos[demoName];
    const markdownProjection = projectMarkdownDocument(demo.source);
    const viewModeByNodeId = buildViewModeByNodeId(
      markdownProjection.tree,
      demo.markdownDocumentOrders
    );

    return projectSectionTree(markdownProjection.tree, { viewModeByNodeId });
  }, [demoName]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">T03 node presentation debug canvas</p>
          <h1>Section Content → Document Node Presentation</h1>
        </div>
        <p className="app-demo-label" aria-label="Current demo">
          {demoName}
        </p>
      </header>
      <section className="canvas-shell" aria-label="Heading and Markdown card graph">
        <EditorCanvas graph={visualGraph} />
      </section>
    </main>
  );
}

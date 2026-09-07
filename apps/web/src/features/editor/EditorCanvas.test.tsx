/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { VisualGraph } from '../../core/graph';
import { EditorCanvas } from './EditorCanvas';
import { HeadingNodeView } from './nodes/HeadingNode';

class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const originalResizeObserver = globalThis.ResizeObserver;
const originalGetBoundingClientRectDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'getBoundingClientRect'
);

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverStub;
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value() {
      return {
        x: 0,
        y: 0,
        width: 900,
        height: 640,
        top: 0,
        left: 0,
        right: 900,
        bottom: 640,
        toJSON() {
          return {};
        }
      };
    }
  });
});

afterAll(() => {
  if (originalResizeObserver === undefined) {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  } else {
    globalThis.ResizeObserver = originalResizeObserver;
  }

  if (originalGetBoundingClientRectDescriptor === undefined) {
    Reflect.deleteProperty(HTMLElement.prototype, 'getBoundingClientRect');
  } else {
    Object.defineProperty(
      HTMLElement.prototype,
      'getBoundingClientRect',
      originalGetBoundingClientRectDescriptor
    );
  }
});

afterEach(() => {
  cleanup();
});

const graph: VisualGraph = {
  nodes: [
    {
      id: 'section-a',
      sectionId: 'section-a',
      headingDepth: 2,
      title: '上传文件',
      viewMode: 'heading',
      position: { x: 0, y: 0 },
      treeDepth: 0,
      documentOrder: 0
    },
    {
      id: 'section-b',
      sectionId: 'section-b',
      headingDepth: 3,
      title: 'API',
      viewMode: 'heading',
      position: { x: 260, y: 132 },
      treeDepth: 1,
      documentOrder: 1
    },
    {
      id: 'section-c',
      sectionId: 'section-c',
      headingDepth: 3,
      title: 'API',
      viewMode: 'heading',
      position: { x: 260, y: 264 },
      treeDepth: 1,
      documentOrder: 2
    }
  ],
  hierarchyEdges: [
    {
      id: 'hierarchy:section-a->section-b',
      kind: 'hierarchy',
      source: 'section-a',
      target: 'section-b'
    },
    {
      id: 'hierarchy:section-a->section-c',
      kind: 'hierarchy',
      source: 'section-a',
      target: 'section-c'
    }
  ]
};

describe('HeadingNode', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)('renders H%i theme label and title', (headingDepth) => {
    render(
      <HeadingNodeView
        data={{
          sectionId: `section-${headingDepth}`,
          title: `Depth ${headingDepth}`,
          headingDepth,
          viewMode: 'heading'
        }}
        selected={false}
      />
    );

    expect(screen.getByText(`H${headingDepth}`)).toBeInTheDocument();
    expect(screen.getByLabelText(`H${headingDepth} Depth ${headingDepth}`)).toHaveClass(
      `heading-node--h${headingDepth}`
    );
  });

  it('exposes selected state with a non-color-only hook', () => {
    render(
      <HeadingNodeView
        data={{
          sectionId: 'selected',
          title: 'Selected node',
          headingDepth: 2,
          viewMode: 'heading'
        }}
        selected
      />
    );

    expect(screen.getByLabelText('H2 Selected node')).toHaveAttribute(
      'data-selected',
      'true'
    );
  });
});

describe('EditorCanvas', () => {
  it('mounts React Flow and renders duplicate titles independently', () => {
    const { container } = render(
      <div style={{ width: 900, height: 640 }}>
        <EditorCanvas graph={graph} />
      </div>
    );

    expect(screen.getByLabelText('Section hierarchy debug canvas')).toBeInTheDocument();
    expect(screen.getAllByText('API')).toHaveLength(2);
    expect(container.querySelectorAll('.react-flow__node')).toHaveLength(3);
  });

  it('supports basic node selection as ephemeral UI state', async () => {
    const { container } = render(
      <div style={{ width: 900, height: 640 }}>
        <EditorCanvas graph={graph} />
      </div>
    );
    const targetNode = container.querySelector('[data-id="section-b"]');
    const targetCard = targetNode?.querySelector('.heading-node-card');

    expect(targetNode).not.toBeNull();
    expect(targetCard).not.toBeNull();
    if (targetNode === null || targetCard === null) {
      return;
    }

    fireEvent.click(targetNode);

    await waitFor(() => {
      expect(targetCard).toHaveAttribute('data-selected', 'true');
    });
  });
});

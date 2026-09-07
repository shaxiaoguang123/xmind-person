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
      localBody: '支持上传。',
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
      localBody: '正文 A。',
      viewMode: 'heading',
      position: { x: 440, y: 380 },
      treeDepth: 1,
      documentOrder: 1
    },
    {
      id: 'section-c',
      sectionId: 'section-c',
      headingDepth: 3,
      title: 'API',
      localBody: '正文 B。',
      viewMode: 'markdown',
      position: { x: 440, y: 760 },
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

describe('EditorCanvas', () => {
  it('mounts one unified Document Node type and renders duplicate titles independently', () => {
    const { container } = render(
      <div style={{ width: 900, height: 640 }}>
        <EditorCanvas graph={graph} />
      </div>
    );

    expect(
      screen.getByLabelText('Document node presentation debug canvas')
    ).toBeInTheDocument();
    expect(screen.getAllByText('API')).toHaveLength(2);
    expect(container.querySelectorAll('.react-flow__node-document')).toHaveLength(3);
    expect(container.querySelectorAll('.document-card--heading')).toHaveLength(2);
    expect(container.querySelectorAll('.document-card--markdown')).toHaveLength(1);
    expect(screen.getByText('正文 B。')).toBeInTheDocument();
    expect(screen.queryByText('正文 A。')).not.toBeInTheDocument();
  });

  it('preserves Stable React Flow IDs while duplicate titles use different view modes', () => {
    const { container } = render(
      <div style={{ width: 900, height: 640 }}>
        <EditorCanvas graph={graph} />
      </div>
    );

    const firstApi = container.querySelector('[data-id="section-b"]');
    const secondApi = container.querySelector('[data-id="section-c"]');

    expect(firstApi).not.toBeNull();
    expect(secondApi).not.toBeNull();
    expect(firstApi?.querySelector('[data-view-mode="heading"]')).not.toBeNull();
    expect(secondApi?.querySelector('[data-view-mode="markdown"]')).not.toBeNull();
  });

  it('supports basic node selection as ephemeral UI state', async () => {
    const { container } = render(
      <div style={{ width: 900, height: 640 }}>
        <EditorCanvas graph={graph} />
      </div>
    );
    const targetNode = container.querySelector('[data-id="section-b"]');
    const targetCard = targetNode?.querySelector('.document-card');

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

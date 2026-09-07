import { describe, expect, it } from 'vitest';

import type { VisualGraph } from '../../core/graph';
import { toReactFlowEdges } from './toReactFlowEdges';
import { toReactFlowNodes } from './toReactFlowNodes';

const graph: VisualGraph = {
  nodes: [
    {
      id: 'stable-a',
      sectionId: 'stable-a',
      headingDepth: 2,
      title: 'A',
      localBody: 'Body A.',
      viewMode: 'heading',
      position: { x: 0, y: 0 },
      treeDepth: 0,
      documentOrder: 0
    },
    {
      id: 'stable-b',
      sectionId: 'stable-b',
      headingDepth: 4,
      title: 'B',
      localBody: '- one\n- two',
      viewMode: 'markdown',
      position: { x: 440, y: 380 },
      treeDepth: 1,
      documentOrder: 1
    }
  ],
  hierarchyEdges: [
    {
      id: 'hierarchy:stable-a->stable-b',
      kind: 'hierarchy',
      source: 'stable-a',
      target: 'stable-b'
    }
  ]
};

describe('React Flow adapter', () => {
  it('preserves Stable IDs and uses one Document Node type for every view mode', () => {
    const nodes = toReactFlowNodes(graph);

    expect(nodes.map((node) => node.id)).toEqual(['stable-a', 'stable-b']);
    expect(nodes.map((node) => node.data.sectionId)).toEqual([
      'stable-a',
      'stable-b'
    ]);
    expect(nodes.every((node) => node.type === 'document')).toBe(true);
    expect(nodes.every((node) => node.focusable === false)).toBe(true);
  });

  it('passes Local Body and viewMode through without changing React Flow identity', () => {
    const nodes = toReactFlowNodes(graph);

    expect(nodes[0]).toMatchObject({
      id: 'stable-a',
      type: 'document',
      data: {
        sectionId: 'stable-a',
        localBody: 'Body A.',
        viewMode: 'heading'
      }
    });
    expect(nodes[1]).toMatchObject({
      id: 'stable-b',
      type: 'document',
      data: {
        sectionId: 'stable-b',
        localBody: '- one\n- two',
        viewMode: 'markdown'
      }
    });
  });

  it('adapts only projected hierarchy edges without inventing FlowEdge semantics', () => {
    const edges = toReactFlowEdges(graph);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      id: 'hierarchy:stable-a->stable-b',
      source: 'stable-a',
      target: 'stable-b',
      animated: false,
      selectable: false,
      data: { projectionKind: 'hierarchy' }
    });
  });
});

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
      viewMode: 'heading',
      position: { x: 260, y: 132 },
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
  it('preserves Stable Section IDs as React Flow node IDs', () => {
    const nodes = toReactFlowNodes(graph);

    expect(nodes.map((node) => node.id)).toEqual(['stable-a', 'stable-b']);
    expect(nodes.map((node) => node.data.sectionId)).toEqual([
      'stable-a',
      'stable-b'
    ]);
    expect(nodes.every((node) => node.type === 'heading')).toBe(true);
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

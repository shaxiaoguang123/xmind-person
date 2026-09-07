import type { Edge } from '@xyflow/react';

import type { VisualGraph } from '../../core/graph';

export function toReactFlowEdges(graph: VisualGraph): Edge[] {
  return graph.hierarchyEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'default',
    animated: false,
    selectable: false,
    focusable: false,
    data: {
      projectionKind: edge.kind
    }
  }));
}

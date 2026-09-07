import type { VisualGraph } from '../../core/graph';
import type { DocumentFlowNode } from './types';

export function toReactFlowNodes(graph: VisualGraph): DocumentFlowNode[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: 'document',
    position: node.position,
    draggable: true,
    selectable: true,
    focusable: false,
    data: {
      sectionId: node.sectionId,
      title: node.title,
      headingDepth: node.headingDepth,
      localBody: node.localBody,
      viewMode: node.viewMode
    }
  }));
}

import type { VisualGraph } from '../../core/graph';
import type { HeadingFlowNode } from './types';

export function toReactFlowNodes(graph: VisualGraph): HeadingFlowNode[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: 'heading',
    position: node.position,
    draggable: true,
    selectable: true,
    data: {
      sectionId: node.sectionId,
      title: node.title,
      headingDepth: node.headingDepth,
      viewMode: node.viewMode
    }
  }));
}

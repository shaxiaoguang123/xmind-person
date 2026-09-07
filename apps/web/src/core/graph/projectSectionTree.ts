import type { DocumentSection, SectionTree } from '../markdown';
import { createDebugPlacement } from './debugPlacement';
import type {
  VisualGraph,
  VisualGraphProjectionOptions,
  VisualHierarchyEdge,
  VisualNode
} from './types';

function hierarchyEdgeId(source: string, target: string): string {
  return `hierarchy:${source}->${target}`;
}

export function projectSectionTree(
  tree: SectionTree,
  options: VisualGraphProjectionOptions = {}
): VisualGraph {
  const nodes: VisualNode[] = [];
  const hierarchyEdges: VisualHierarchyEdge[] = [];
  let preorderIndex = 0;

  function visit(
    section: DocumentSection,
    treeDepth: number,
    parentSectionId?: string
  ): void {
    const currentPreorderIndex = preorderIndex;
    preorderIndex += 1;

    nodes.push({
      id: section.nodeId,
      sectionId: section.nodeId,
      headingDepth: section.headingDepth,
      title: section.title,
      localBody: section.localBody,
      viewMode: options.viewModeByNodeId?.[section.nodeId] ?? 'heading',
      position: createDebugPlacement(treeDepth, currentPreorderIndex),
      treeDepth,
      documentOrder: section.documentOrder
    });

    if (parentSectionId !== undefined) {
      hierarchyEdges.push({
        id: hierarchyEdgeId(parentSectionId, section.nodeId),
        kind: 'hierarchy',
        source: parentSectionId,
        target: section.nodeId
      });
    }

    section.children.forEach((child) => {
      visit(child, treeDepth + 1, section.nodeId);
    });
  }

  tree.children.forEach((section) => {
    visit(section, 0);
  });

  return { nodes, hierarchyEdges };
}

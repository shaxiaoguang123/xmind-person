import type { HeadingDepth } from '../markdown';

export interface GraphPosition {
  x: number;
  y: number;
}

export type VisualNodeViewMode = 'heading' | 'markdown';

export type ViewModeByNodeId = Readonly<Record<string, VisualNodeViewMode>>;

export interface VisualGraphProjectionOptions {
  viewModeByNodeId?: ViewModeByNodeId;
}

export interface VisualNode {
  id: string;
  sectionId: string;
  headingDepth: HeadingDepth;
  title: string;
  localBody: string;
  viewMode: VisualNodeViewMode;
  position: GraphPosition;
  treeDepth: number;
  documentOrder: number;
}

export interface VisualHierarchyEdge {
  id: string;
  kind: 'hierarchy';
  source: string;
  target: string;
}

export interface VisualGraph {
  nodes: VisualNode[];
  hierarchyEdges: VisualHierarchyEdge[];
}

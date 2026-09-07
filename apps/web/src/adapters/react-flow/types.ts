import type { Node } from '@xyflow/react';

import type { VisualNodeViewMode } from '../../core/graph';
import type { HeadingDepth } from '../../core/markdown';

export interface DocumentNodeData extends Record<string, unknown> {
  sectionId: string;
  title: string;
  headingDepth: HeadingDepth;
  localBody: string;
  viewMode: VisualNodeViewMode;
}

export type DocumentFlowNode = Node<DocumentNodeData, 'document'>;

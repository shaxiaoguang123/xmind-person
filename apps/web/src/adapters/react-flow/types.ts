import type { Node } from '@xyflow/react';

import type { VisualNodeViewMode } from '../../core/graph';
import type { HeadingDepth } from '../../core/markdown';

export interface HeadingNodeData extends Record<string, unknown> {
  sectionId: string;
  title: string;
  headingDepth: HeadingDepth;
  viewMode: VisualNodeViewMode;
}

export type HeadingFlowNode = Node<HeadingNodeData, 'heading'>;

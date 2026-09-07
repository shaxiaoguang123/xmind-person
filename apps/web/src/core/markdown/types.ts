import type { Root } from 'mdast';

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6;

export interface SourcePoint {
  line: number;
  column: number;
  offset?: number;
}

export interface SourcePosition {
  start: SourcePoint;
  end: SourcePoint;
}

export interface SectionDraft {
  headingDepth: HeadingDepth;
  title: string;
  localBody: string;
  headingPosition: SourcePosition;
  sourcePosition: SourcePosition;
  documentOrder: number;
}

export interface SectionExtractionResult {
  preamble: string;
  preamblePosition?: SourcePosition;
  sections: SectionDraft[];
}

export interface SectionTreeDraftNode extends SectionDraft {
  projectionKey: string;
  children: SectionTreeDraftNode[];
}

export interface SectionTreeDraft {
  kind: 'document-root';
  preamble: string;
  preamblePosition?: SourcePosition;
  children: SectionTreeDraftNode[];
}

export interface DocumentSection extends SectionDraft {
  nodeId: string;
  projectionKey: string;
  children: DocumentSection[];
}

export interface SectionTree {
  kind: 'document-root';
  preamble: string;
  preamblePosition?: SourcePosition;
  children: DocumentSection[];
}

export interface StableNodeIdMapping {
  byProjectionKey: Record<string, string>;
}

export type NodeIdFactory = () => string;

export interface StableNodeIdAssignment {
  tree: SectionTree;
  mapping: StableNodeIdMapping;
}

export interface MarkdownProjectionResult extends StableNodeIdAssignment {
  ast: Root;
}

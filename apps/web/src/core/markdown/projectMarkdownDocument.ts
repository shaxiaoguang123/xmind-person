import { assignStableNodeIds, defaultNodeIdFactory } from './stableNodeIds';
import { buildSectionTree } from './buildSectionTree';
import { extractSections } from './extractSections';
import { parseMarkdown } from './parseMarkdown';
import type {
  MarkdownProjectionResult,
  NodeIdFactory,
  StableNodeIdMapping
} from './types';

export interface ProjectMarkdownOptions {
  previousMapping?: StableNodeIdMapping;
  idFactory?: NodeIdFactory;
}

export function projectMarkdownDocument(
  source: string,
  options: ProjectMarkdownOptions = {}
): MarkdownProjectionResult {
  const ast = parseMarkdown(source);
  const extraction = extractSections(ast, source);
  const draftTree = buildSectionTree(extraction);
  const assignment = assignStableNodeIds(
    draftTree,
    options.previousMapping ?? { byProjectionKey: {} },
    options.idFactory ?? defaultNodeIdFactory
  );

  return {
    ast,
    tree: assignment.tree,
    mapping: assignment.mapping
  };
}

import type {
  SectionExtractionResult,
  SectionTreeDraft,
  SectionTreeDraftNode
} from './types';

export function buildSectionTree(
  extraction: SectionExtractionResult
): SectionTreeDraft {
  const root: SectionTreeDraft = {
    kind: 'document-root',
    preamble: extraction.preamble,
    children: []
  };

  if (extraction.preamblePosition !== undefined) {
    root.preamblePosition = extraction.preamblePosition;
  }

  const ancestorStack: SectionTreeDraftNode[] = [];

  for (const section of extraction.sections) {
    while (
      ancestorStack.length > 0 &&
      ancestorStack[ancestorStack.length - 1]!.headingDepth >=
        section.headingDepth
    ) {
      ancestorStack.pop();
    }

    const parent = ancestorStack[ancestorStack.length - 1];
    const siblings = parent?.children ?? root.children;
    const siblingIndex = siblings.length;
    const parentProjectionKey = parent?.projectionKey ?? 'root';

    const node: SectionTreeDraftNode = {
      ...section,
      projectionKey: `${parentProjectionKey}/${siblingIndex}`,
      children: []
    };

    siblings.push(node);
    ancestorStack.push(node);
  }

  return root;
}

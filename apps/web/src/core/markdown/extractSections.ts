import type { Heading, Root, RootContent } from 'mdast';
import { toString } from 'mdast-util-to-string';

import {
  copyPosition,
  requireAstPosition,
  sliceSourceByNodes,
  sourceRangeFromNodes
} from './sourcePositions';
import type { SectionDraft, SectionExtractionResult } from './types';

function isHeading(node: RootContent): node is Heading {
  return node.type === 'heading';
}

export function extractSections(
  ast: Root,
  source: string
): SectionExtractionResult {
  const headingIndexes: number[] = [];

  ast.children.forEach((node, index) => {
    if (isHeading(node)) {
      headingIndexes.push(index);
    }
  });

  const firstHeadingIndex = headingIndexes[0] ?? ast.children.length;
  const preambleNodes = ast.children.slice(0, firstHeadingIndex);
  const preamble = sliceSourceByNodes(source, preambleNodes, 'document preamble');

  const sections: SectionDraft[] = headingIndexes.map(
    (headingIndex, documentOrder) => {
      const heading = ast.children[headingIndex];

      if (heading === undefined || !isHeading(heading)) {
        throw new Error('Heading index no longer refers to an mdast heading node.');
      }

      const nextHeadingIndex =
        headingIndexes[documentOrder + 1] ?? ast.children.length;
      const localBodyNodes = ast.children.slice(
        headingIndex + 1,
        nextHeadingIndex
      );
      const headingPosition = requireAstPosition(
        heading,
        `heading at document order ${documentOrder}`
      );
      const sourcePosition =
        localBodyNodes.length === 0
          ? copyPosition(headingPosition)
          : sourceRangeFromNodes(
              heading,
              localBodyNodes[localBodyNodes.length - 1] as RootContent,
              `section at document order ${documentOrder}`
            );

      return {
        headingDepth: heading.depth,
        title: toString(heading),
        localBody: sliceSourceByNodes(
          source,
          localBodyNodes,
          `local body at document order ${documentOrder}`
        ),
        headingPosition: copyPosition(headingPosition),
        sourcePosition,
        documentOrder
      };
    }
  );

  if (preambleNodes.length === 0) {
    return { preamble, sections };
  }

  const firstPreambleNode = preambleNodes[0];
  const lastPreambleNode = preambleNodes[preambleNodes.length - 1];

  if (firstPreambleNode === undefined || lastPreambleNode === undefined) {
    return { preamble, sections };
  }

  return {
    preamble,
    preamblePosition: sourceRangeFromNodes(
      firstPreambleNode,
      lastPreambleNode,
      'document preamble'
    ),
    sections
  };
}

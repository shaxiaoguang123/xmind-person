import type { RootContent } from 'mdast';
import type { Point, Position } from 'unist';

import { MarkdownCoreError } from './errors';
import type { SourcePoint, SourcePosition } from './types';

type PositionedNode = Pick<RootContent, 'position'>;

function copyPoint(point: Point): SourcePoint {
  if (point.offset === undefined) {
    return { line: point.line, column: point.column };
  }

  return { line: point.line, column: point.column, offset: point.offset };
}

export function requireAstPosition(
  node: PositionedNode,
  label: string
): Position {
  if (node.position === undefined) {
    throw new MarkdownCoreError(
      'INVALID_APPLICATION_STATE',
      `mdast position is required for ${label}.`
    );
  }

  return node.position;
}

export function copyPosition(position: Position): SourcePosition {
  return {
    start: copyPoint(position.start),
    end: copyPoint(position.end)
  };
}

export function sourceRangeFromNodes(
  first: PositionedNode,
  last: PositionedNode,
  label: string
): SourcePosition {
  const firstPosition = requireAstPosition(first, `${label} start`);
  const lastPosition = requireAstPosition(last, `${label} end`);

  return {
    start: copyPoint(firstPosition.start),
    end: copyPoint(lastPosition.end)
  };
}

export function sliceSourceByNodes(
  source: string,
  nodes: PositionedNode[],
  label: string
): string {
  if (nodes.length === 0) {
    return '';
  }

  const first = nodes[0];
  const last = nodes[nodes.length - 1];

  if (first === undefined || last === undefined) {
    throw new MarkdownCoreError(
      'INVALID_APPLICATION_STATE',
      `Cannot resolve source nodes for ${label}.`
    );
  }

  const firstPosition = requireAstPosition(first, `${label} start`);
  const lastPosition = requireAstPosition(last, `${label} end`);
  const startOffset = firstPosition.start.offset;
  const endOffset = lastPosition.end.offset;

  if (startOffset === undefined || endOffset === undefined) {
    throw new MarkdownCoreError(
      'INVALID_APPLICATION_STATE',
      `mdast offsets are required to preserve ${label} source.`
    );
  }

  return source.slice(startOffset, endOffset);
}

import type { GraphPosition } from './types';

const HORIZONTAL_GAP = 260;
const VERTICAL_GAP = 132;

/**
 * TEMPORARY T02 DEBUG PLACEMENT.
 *
 * This is deterministic display scaffolding only. It is not LayoutMetadata,
 * is never persisted, does not mutate the Section Tree, and is intentionally
 * replaced by the later formal layout phase.
 */
export function createDebugPlacement(
  treeDepth: number,
  preorderIndex: number
): GraphPosition {
  return {
    x: treeDepth * HORIZONTAL_GAP,
    y: preorderIndex * VERTICAL_GAP
  };
}

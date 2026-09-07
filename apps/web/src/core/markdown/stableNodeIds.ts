import { MarkdownCoreError } from './errors';
import type {
  DocumentSection,
  NodeIdFactory,
  SectionTree,
  SectionTreeDraft,
  SectionTreeDraftNode,
  StableNodeIdAssignment,
  StableNodeIdMapping
} from './types';

const emptyMapping: StableNodeIdMapping = { byProjectionKey: {} };

export const defaultNodeIdFactory: NodeIdFactory = () => {
  if (typeof globalThis.crypto?.randomUUID !== 'function') {
    throw new MarkdownCoreError(
      'INVALID_APPLICATION_STATE',
      'crypto.randomUUID() is required to generate opaque node IDs.'
    );
  }

  return globalThis.crypto.randomUUID();
};

export function assignStableNodeIds(
  draftTree: SectionTreeDraft,
  previousMapping: StableNodeIdMapping = emptyMapping,
  idFactory: NodeIdFactory = defaultNodeIdFactory
): StableNodeIdAssignment {
  const nextMapping: StableNodeIdMapping = { byProjectionKey: {} };
  const usedNodeIds = new Set<string>();

  const assignNode = (draftNode: SectionTreeDraftNode): DocumentSection => {
    const mappedNodeId =
      previousMapping.byProjectionKey[draftNode.projectionKey];
    const nodeId = mappedNodeId ?? idFactory();

    if (nodeId.trim().length === 0) {
      throw new MarkdownCoreError(
        'INVALID_APPLICATION_STATE',
        `Node ID for ${draftNode.projectionKey} must not be empty.`
      );
    }

    if (usedNodeIds.has(nodeId)) {
      throw new MarkdownCoreError(
        'INVALID_APPLICATION_STATE',
        `Duplicate stable Node ID detected: ${nodeId}`
      );
    }

    usedNodeIds.add(nodeId);
    nextMapping.byProjectionKey[draftNode.projectionKey] = nodeId;

    return {
      ...draftNode,
      nodeId,
      children: draftNode.children.map(assignNode)
    };
  };

  const tree: SectionTree = {
    kind: 'document-root',
    preamble: draftTree.preamble,
    children: draftTree.children.map(assignNode)
  };

  if (draftTree.preamblePosition !== undefined) {
    tree.preamblePosition = draftTree.preamblePosition;
  }

  return { tree, mapping: nextMapping };
}

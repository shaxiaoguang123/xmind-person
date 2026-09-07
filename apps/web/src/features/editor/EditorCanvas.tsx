import {
  Background,
  ReactFlow,
  useNodesState,
  type NodeTypes
} from '@xyflow/react';
import { useEffect, useMemo } from 'react';

import {
  toReactFlowEdges,
  toReactFlowNodes,
  type DocumentFlowNode
} from '../../adapters/react-flow';
import type { VisualGraph } from '../../core/graph';
import { DocumentNode } from './nodes/DocumentNode';

const nodeTypes: NodeTypes = {
  document: DocumentNode
};

interface EditorCanvasProps {
  graph: VisualGraph;
}

export function EditorCanvas({ graph }: EditorCanvasProps) {
  const projectedNodes = useMemo(() => toReactFlowNodes(graph), [graph]);
  const projectedEdges = useMemo(() => toReactFlowEdges(graph), [graph]);
  const [nodes, setNodes, onNodesChange] = useNodesState<DocumentFlowNode>(
    projectedNodes
  );

  useEffect(() => {
    setNodes(projectedNodes);
  }, [projectedNodes, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={projectedEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      nodesConnectable={false}
      nodesDraggable
      nodesFocusable
      elementsSelectable
      panOnDrag
      zoomOnScroll
      zoomOnPinch
      minZoom={0.3}
      maxZoom={1.8}
      fitView
      fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
      aria-label="Document node presentation debug canvas"
    >
      <Background gap={24} size={1} />
    </ReactFlow>
  );
}

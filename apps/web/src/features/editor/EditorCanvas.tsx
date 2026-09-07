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
  type HeadingFlowNode
} from '../../adapters/react-flow';
import type { VisualGraph } from '../../core/graph';
import { HeadingNode } from './nodes/HeadingNode';

const nodeTypes: NodeTypes = {
  heading: HeadingNode
};

interface EditorCanvasProps {
  graph: VisualGraph;
}

export function EditorCanvas({ graph }: EditorCanvasProps) {
  const projectedNodes = useMemo(() => toReactFlowNodes(graph), [graph]);
  const projectedEdges = useMemo(() => toReactFlowEdges(graph), [graph]);
  const [nodes, setNodes, onNodesChange] = useNodesState<HeadingFlowNode>(
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
      elementsSelectable
      panOnDrag
      zoomOnScroll
      zoomOnPinch
      minZoom={0.35}
      maxZoom={1.8}
      fitView
      fitViewOptions={{ padding: 0.2, maxZoom: 1.15 }}
      aria-label="Section hierarchy debug canvas"
    >
      <Background gap={24} size={1} />
    </ReactFlow>
  );
}

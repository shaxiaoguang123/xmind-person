import { Handle, Position, type NodeProps } from '@xyflow/react';

import type { HeadingFlowNode, HeadingNodeData } from '../../../adapters/react-flow';

interface HeadingNodeViewProps {
  data: HeadingNodeData;
  selected: boolean;
}

export function HeadingNodeView({ data, selected }: HeadingNodeViewProps) {
  return (
    <article
      className={`heading-node-card heading-node--h${data.headingDepth}`}
      data-selected={selected ? 'true' : 'false'}
      aria-label={`H${data.headingDepth} ${data.title}`}
    >
      <span className="heading-node-depth">H{data.headingDepth}</span>
      <span className="heading-node-title">{data.title}</span>
    </article>
  );
}

export function HeadingNode({ data, selected }: NodeProps<HeadingFlowNode>) {
  return (
    <div className="heading-node-shell">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="heading-node-handle"
      />
      <HeadingNodeView data={data} selected={selected} />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="heading-node-handle"
      />
    </div>
  );
}

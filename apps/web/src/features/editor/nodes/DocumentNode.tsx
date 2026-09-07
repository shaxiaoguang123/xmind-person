import { Handle, Position, type NodeProps } from '@xyflow/react';

import type { DocumentFlowNode, DocumentNodeData } from '../../../adapters/react-flow';
import { HeadingCard } from './HeadingCard';
import { MarkdownCard } from './MarkdownCard';

interface DocumentNodeViewProps {
  data: DocumentNodeData;
  selected: boolean;
}

export function DocumentNodeView({ data, selected }: DocumentNodeViewProps) {
  if (data.viewMode === 'markdown') {
    return <MarkdownCard data={data} selected={selected} />;
  }

  return <HeadingCard data={data} selected={selected} />;
}

export function DocumentNode({ data, selected }: NodeProps<DocumentFlowNode>) {
  return (
    <div
      className="document-node-shell"
      data-section-id={data.sectionId}
      tabIndex={0}
      role="group"
      aria-label={`Document node H${data.headingDepth} ${data.title}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="document-node-handle"
      />
      <DocumentNodeView data={data} selected={selected} />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="document-node-handle"
      />
    </div>
  );
}

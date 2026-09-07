import type { DocumentNodeData } from '../../../adapters/react-flow';
import { MarkdownBody } from './MarkdownBody';

interface MarkdownCardProps {
  data: DocumentNodeData;
  selected: boolean;
}

export function MarkdownCard({ data, selected }: MarkdownCardProps) {
  return (
    <article
      className={`document-card document-card--markdown document-card--h${data.headingDepth}`}
      data-selected={selected ? 'true' : 'false'}
      data-view-mode="markdown"
      aria-label={`H${data.headingDepth} ${data.title}`}
    >
      <header className="document-card-header">
        <span className="document-card-depth">H{data.headingDepth}</span>
        <span className="document-card-title">{data.title}</span>
      </header>
      {data.localBody.length > 0 ? <MarkdownBody markdown={data.localBody} /> : null}
    </article>
  );
}

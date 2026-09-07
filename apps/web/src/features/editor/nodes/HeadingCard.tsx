import type { DocumentNodeData } from '../../../adapters/react-flow';

interface HeadingCardProps {
  data: DocumentNodeData;
  selected: boolean;
}

export function HeadingCard({ data, selected }: HeadingCardProps) {
  return (
    <article
      className={`document-card document-card--heading document-card--h${data.headingDepth}`}
      data-selected={selected ? 'true' : 'false'}
      data-view-mode="heading"
      aria-label={`H${data.headingDepth} ${data.title}`}
    >
      <span className="document-card-depth">H{data.headingDepth}</span>
      <span className="document-card-title">{data.title}</span>
    </article>
  );
}

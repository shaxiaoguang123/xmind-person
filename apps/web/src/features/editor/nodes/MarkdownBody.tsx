import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownBodyProps {
  markdown: string;
}

export function MarkdownBody({ markdown }: MarkdownBodyProps) {
  return (
    <div className="markdown-card-body nowheel nodrag nopan" data-markdown-body="true">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a({ node, className, ...props }) {
            void node;
            const classes = [className, 'nodrag', 'nopan'].filter(Boolean).join(' ');
            return (
              <a
                {...props}
                className={classes}
                target="_blank"
                rel="noopener noreferrer"
              />
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

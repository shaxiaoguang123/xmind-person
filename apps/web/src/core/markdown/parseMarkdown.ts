import type { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import { MarkdownCoreError } from './errors';

const markdownProcessor = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdown(source: string): Root {
  if (typeof source !== 'string') {
    throw new MarkdownCoreError(
      'INVALID_APPLICATION_STATE',
      'Markdown source must be a string.'
    );
  }

  return markdownProcessor.parse(source) as Root;
}

/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { DocumentNodeData } from '../../../adapters/react-flow';
import { DocumentNodeView } from './DocumentNode';

function nodeData(overrides: Partial<DocumentNodeData> = {}): DocumentNodeData {
  return {
    sectionId: 'stable-node',
    title: 'Word',
    headingDepth: 3,
    localBody: 'Local paragraph.',
    viewMode: 'heading',
    ...overrides
  };
}

afterEach(() => {
  cleanup();
});

describe('DocumentNode presentation', () => {
  it('renders heading mode as a compact heading without Local Body', () => {
    render(
      <DocumentNodeView
        data={nodeData({ localBody: 'This body must stay hidden.' })}
        selected={false}
      />
    );

    expect(screen.getByText('H3')).toBeInTheDocument();
    expect(screen.getByText('Word')).toBeInTheDocument();
    expect(screen.queryByText('This body must stay hidden.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('H3 Word')).toHaveAttribute('data-view-mode', 'heading');
  });

  it('renders markdown mode as Heading plus the supplied Local Body', () => {
    render(
      <DocumentNodeView
        data={nodeData({ viewMode: 'markdown', localBody: 'Readable paragraph.' })}
        selected={false}
      />
    );

    expect(screen.getByText('H3')).toBeInTheDocument();
    expect(screen.getByText('Word')).toBeInTheDocument();
    expect(screen.getByText('Readable paragraph.')).toBeInTheDocument();
    expect(screen.getByLabelText('H3 Word')).toHaveAttribute('data-view-mode', 'markdown');
  });

  it('renders unordered, ordered, task-list, and strikethrough GFM content', () => {
    const { container } = render(
      <DocumentNodeView
        data={nodeData({
          viewMode: 'markdown',
          localBody:
            '- alpha\n- beta\n\n1. first\n2. second\n\n- [x] done\n- [ ] pending\n\n~~deprecated~~'
        })}
        selected={false}
      />
    );

    const body = container.querySelector('[data-markdown-body="true"]');
    expect(body).not.toBeNull();
    if (body === null) {
      return;
    }

    expect(within(body).getAllByRole('list')).toHaveLength(3);
    expect(within(body).getByText('alpha')).toBeInTheDocument();
    expect(within(body).getByText('first')).toBeInTheDocument();
    expect(within(body).getAllByRole('checkbox')).toHaveLength(2);
    expect(body.querySelector('del')).toHaveTextContent('deprecated');
  });

  it('renders inline code and fenced code without adding a syntax highlighter', () => {
    const { container } = render(
      <DocumentNodeView
        data={nodeData({
          viewMode: 'markdown',
          localBody: 'Use `upload(file)` here.\n\n```ts\nconst ready = true;\n```'
        })}
        selected={false}
      />
    );

    expect(screen.getByText('upload(file)')).toBeInTheDocument();
    expect(container.querySelector('pre code')).toHaveTextContent('const ready = true;');
  });

  it('renders blockquotes and tables', () => {
    const { container } = render(
      <DocumentNodeView
        data={nodeData({
          viewMode: 'markdown',
          localBody:
            '> Review before upload.\n\n| Format | Support |\n| --- | --- |\n| docx | yes |'
        })}
        selected={false}
      />
    );

    expect(container.querySelector('blockquote')).toHaveTextContent('Review before upload.');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Format' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'docx' })).toBeInTheDocument();
  });

  it('keeps links isolated from node drag and preserves safe URL handling', () => {
    render(
      <DocumentNodeView
        data={nodeData({
          viewMode: 'markdown',
          localBody:
            '[safe link](https://example.com/docs)\n\n[unsafe link](javascript:alert(1))'
        })}
        selected={false}
      />
    );

    const safeLink = screen.getByRole('link', { name: 'safe link' });
    const unsafeLink = screen.getByRole('link', { name: 'unsafe link' });

    expect(safeLink).toHaveAttribute('href', 'https://example.com/docs');
    expect(safeLink).toHaveAttribute('target', '_blank');
    expect(safeLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(safeLink).toHaveClass('nodrag', 'nopan');
    expect(unsafeLink.getAttribute('href')).not.toBe('javascript:alert(1)');
  });

  it('does not create executable DOM from raw HTML source', () => {
    const { container } = render(
      <DocumentNodeView
        data={nodeData({
          viewMode: 'markdown',
          localBody:
            '<script>globalThis.__t03Executed = true</script>\n\n<div onclick="globalThis.__t03Clicked = true">unsafe html</div>\n\nSafe paragraph.'
        })}
        selected={false}
      />
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('[onclick]')).toBeNull();
    expect(screen.queryByText('unsafe html')).not.toBeInTheDocument();
    expect(screen.getByText('Safe paragraph.')).toBeInTheDocument();
  });

  it('keeps an empty Local Body as a valid markdown presentation', () => {
    const { container } = render(
      <DocumentNodeView
        data={nodeData({ viewMode: 'markdown', localBody: '' })}
        selected={false}
      />
    );

    expect(screen.getByLabelText('H3 Word')).toHaveAttribute('data-view-mode', 'markdown');
    expect(container.querySelector('[data-markdown-body="true"]')).toBeNull();
  });

  it('uses the same heading-depth theme hook across both presentations', () => {
    const { rerender } = render(
      <DocumentNodeView data={nodeData({ headingDepth: 4 })} selected={false} />
    );
    expect(screen.getByLabelText('H4 Word')).toHaveClass('document-card--h4');

    rerender(
      <DocumentNodeView
        data={nodeData({ headingDepth: 4, viewMode: 'markdown' })}
        selected={false}
      />
    );
    expect(screen.getByLabelText('H4 Word')).toHaveClass('document-card--h4');
  });

  it('keeps selected state perceivable through a structural data hook', () => {
    render(<DocumentNodeView data={nodeData()} selected />);

    expect(screen.getByLabelText('H3 Word')).toHaveAttribute('data-selected', 'true');
  });
});

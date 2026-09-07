import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { buildSectionTree } from './buildSectionTree';
import { extractSections } from './extractSections';
import { parseMarkdown } from './parseMarkdown';

function fixture(name: string): string {
  return readFileSync(
    new URL(`../../../../../fixtures/markdown/${name}`, import.meta.url),
    'utf8'
  );
}

function draftTree(name: string) {
  const source = fixture(name);
  return {
    source,
    tree: buildSectionTree(extractSections(parseMarkdown(source), source))
  };
}

describe('Section Tree semantics', () => {
  it('builds ordinary parent-child and sibling relationships', () => {
    const { tree } = draftTree('nested.md');

    expect(tree.children.map((node) => node.title)).toEqual([
      'Root A',
      'Root B'
    ]);
    expect(tree.children[0]?.children.map((node) => node.title)).toEqual([
      'Child A1',
      'Child A2'
    ]);
    expect(tree.children[0]?.children[1]?.children[0]?.title).toBe(
      'Grandchild A2.1'
    );
  });

  it('uses the nearest previous smaller heading depth without synthesizing levels', () => {
    const { tree } = draftTree('skipped-depth.md');
    const a = tree.children[0];

    expect(a?.headingDepth).toBe(2);
    expect(a?.children.map((node) => [node.title, node.headingDepth])).toEqual([
      ['B', 4],
      ['C', 3]
    ]);
    expect(a?.children[0]?.children).toEqual([]);
  });

  it('allows a non-H1 first heading and multiple top-level depths', () => {
    const { tree } = draftTree('mixed-top-level-depth.md');

    expect(tree.kind).toBe('document-root');
    expect(tree.children.map((node) => [node.title, node.headingDepth])).toEqual([
      ['A', 2],
      ['C', 1]
    ]);
    expect(tree.children[0]?.children[0]?.title).toBe('B');
  });

  it('preserves only the current section Local Body', () => {
    const { tree } = draftTree('local-body.md');
    const word = tree.children[0];

    expect(word?.localBody).toBe('这是 Word 的说明。\n\n- doc\n- docx');
    expect(word?.localBody).not.toContain('格式校验');
    expect(word?.localBody).not.toContain('检查格式');
    expect(word?.children.map((node) => node.title)).toEqual([
      '格式校验',
      '分片上传'
    ]);
  });

  it('keeps an empty section instead of dropping or merging it', () => {
    const { tree } = draftTree('empty-section.md');

    expect(tree.children.map((node) => node.title)).toEqual(['A', 'B']);
    expect(tree.children[0]?.localBody).toBe('');
    expect(tree.children[1]?.localBody).toBe('B body.');
  });

  it('preserves Markdown before the first heading as document preamble', () => {
    const { tree } = draftTree('preamble.md');

    expect(tree.preamble).toBe('这是文档介绍。\n\n用于描述整个项目。');
    expect(tree.children[0]?.title).toBe('项目');
  });

  it('preserves GFM body source while excluding child sections', () => {
    const { tree } = draftTree('gfm.md');
    const gfm = tree.children[0];

    expect(gfm?.localBody).toContain('- [x] parsed task');
    expect(gfm?.localBody).toContain('- [ ] remaining task');
    expect(gfm?.localBody).toContain('~~deprecated~~');
    expect(gfm?.localBody).toContain('https://example.com');
    expect(gfm?.localBody).toContain('| Name | Status |');
    expect(gfm?.localBody).not.toContain('### Child');
  });

  it('preserves fenced code as Local Body without promoting inner hashes', () => {
    const { tree } = draftTree('code-fence-heading.md');
    const example = tree.children[0];

    expect(example?.localBody).toContain('```md');
    expect(example?.localBody).toContain('# 这不是 Heading');
    expect(example?.localBody).toContain('## 这也不是 Heading');
    expect(example?.children).toEqual([]);
    expect(tree.children[1]?.title).toBe('Real Heading');
  });

  it('handles a long Local Body without absorbing the child section', () => {
    const { tree } = draftTree('long-markdown.md');
    const parent = tree.children[0];

    expect(parent?.localBody).toContain('Paragraph 15');
    expect(parent?.localBody).not.toContain('Child content must not appear');
    expect(parent?.children[0]?.title).toBe('Child');
  });

  it('uses mdast positions to locate the original section source', () => {
    const { source, tree } = draftTree('local-body.md');
    const word = tree.children[0];

    expect(word).toBeDefined();
    if (word === undefined) {
      throw new Error('Expected Word section.');
    }

    const startOffset = word.sourcePosition.start.offset;
    const endOffset = word.sourcePosition.end.offset;

    expect(word.headingPosition.start.line).toBe(1);
    expect(word.headingPosition.start.column).toBe(1);
    expect(startOffset).toBe(0);
    expect(endOffset).toBeTypeOf('number');

    if (startOffset === undefined || endOffset === undefined) {
      throw new Error('Expected mdast offsets on section source position.');
    }

    const locatedSource = source.slice(startOffset, endOffset);
    expect(locatedSource).toContain('## Word');
    expect(locatedSource).toContain('- docx');
    expect(locatedSource).not.toContain('### 格式校验');
  });
});

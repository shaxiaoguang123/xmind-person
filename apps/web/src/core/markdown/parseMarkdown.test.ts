import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { extractSections } from './extractSections';
import { parseMarkdown } from './parseMarkdown';

function fixture(name: string): string {
  return readFileSync(
    new URL(`../../../../../fixtures/markdown/${name}`, import.meta.url),
    'utf8'
  );
}

function hasNodeType(value: unknown, expectedType: string): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  if (record.type === expectedType) {
    return true;
  }

  return (
    Array.isArray(record.children) &&
    record.children.some((child) => hasNodeType(child, expectedType))
  );
}

describe('parseMarkdown', () => {
  it('parses Markdown into an mdast root', () => {
    const ast = parseMarkdown(fixture('basic.md'));

    expect(ast.type).toBe('root');
    expect(ast.children.length).toBeGreaterThan(0);
  });

  it('parses ATX H1-H6 using mdast heading depth', () => {
    const source = fixture('atx-headings.md');
    const extraction = extractSections(parseMarkdown(source), source);

    expect(extraction.sections.map((section) => section.headingDepth)).toEqual([
      1, 2, 3, 4, 5, 6
    ]);
  });

  it('parses Setext headings as H1 and H2', () => {
    const source = fixture('setext-headings.md');
    const extraction = extractSections(parseMarkdown(source), source);

    expect(
      extraction.sections.map((section) => [section.title, section.headingDepth])
    ).toEqual([
      ['Title', 1],
      ['Subtitle', 2]
    ]);
  });

  it('preserves Chinese heading semantics', () => {
    const source = fixture('chinese-headings.md');
    const extraction = extractSections(parseMarkdown(source), source);

    expect(
      extraction.sections.map((section) => [section.title, section.headingDepth])
    ).toEqual([
      ['文件处理系统', 1],
      ['上传文件', 2],
      ['文本文件', 3]
    ]);
  });

  it('does not treat heading-looking text in a code fence as sections', () => {
    const source = fixture('code-fence-heading.md');
    const extraction = extractSections(parseMarkdown(source), source);

    expect(extraction.sections.map((section) => section.title)).toEqual([
      'Example',
      'Real Heading'
    ]);
  });

  it('enables GFM syntax in the mdast parser', () => {
    const ast = parseMarkdown(fixture('gfm.md'));

    expect(hasNodeType(ast, 'table')).toBe(true);
    expect(hasNodeType(ast, 'delete')).toBe(true);
  });
});

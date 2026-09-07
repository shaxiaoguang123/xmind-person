import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { projectMarkdownDocument } from '../markdown';
import { createDebugPlacement } from './debugPlacement';
import { projectSectionTree } from './projectSectionTree';

function fixture(name: string): string {
  return readFileSync(
    new URL(`../../../../../fixtures/markdown/${name}`, import.meta.url),
    'utf8'
  );
}

function sequentialIds(prefix = 'section') {
  let current = 0;
  return () => `${prefix}-${++current}`;
}

describe('projectSectionTree', () => {
  it('projects exactly one Visual Node per Section and no synthetic root node', () => {
    const markdown = projectMarkdownDocument(fixture('nested.md'), {
      idFactory: sequentialIds()
    });
    const graph = projectSectionTree(markdown.tree);

    expect(graph.nodes).toHaveLength(5);
    expect(graph.nodes.some((node) => node.title === 'Document Root')).toBe(false);
    expect(graph.nodes.map((node) => node.id)).toEqual([
      'section-1',
      'section-2',
      'section-3',
      'section-4',
      'section-5'
    ]);
    expect(graph.nodes.every((node) => node.id === node.sectionId)).toBe(true);
  });

  it('projects hierarchy edges only for real Section parent-child relationships', () => {
    const markdown = projectMarkdownDocument(fixture('nested.md'), {
      idFactory: sequentialIds()
    });
    const graph = projectSectionTree(markdown.tree);

    expect(graph.hierarchyEdges.map(({ source, target, kind }) => [source, target, kind])).toEqual([
      ['section-1', 'section-2', 'hierarchy'],
      ['section-1', 'section-3', 'hierarchy'],
      ['section-3', 'section-4', 'hierarchy']
    ]);
    expect(
      graph.hierarchyEdges.some(
        (edge) => edge.source === 'section-1' && edge.target === 'section-5'
      )
    ).toBe(false);
  });

  it('keeps duplicate headings as independent Visual Nodes', () => {
    const markdown = projectMarkdownDocument(fixture('duplicate-headings.md'), {
      idFactory: sequentialIds('api')
    });
    const graph = projectSectionTree(markdown.tree);

    expect(graph.nodes.map((node) => node.title)).toEqual(['API', 'API']);
    expect(graph.nodes[0]?.id).not.toBe(graph.nodes[1]?.id);
  });

  it('preserves skipped-depth hierarchy without inventing an H3 node', () => {
    const markdown = projectMarkdownDocument(fixture('skipped-depth.md'), {
      idFactory: sequentialIds()
    });
    const graph = projectSectionTree(markdown.tree);

    expect(graph.nodes.map((node) => [node.title, node.headingDepth])).toEqual([
      ['A', 2],
      ['B', 4],
      ['C', 3]
    ]);
    expect(graph.nodes.some((node) => node.title === '')).toBe(false);
    expect(graph.hierarchyEdges).toHaveLength(2);
  });

  it('does not mutate the Section Tree or its Local Body', () => {
    const markdown = projectMarkdownDocument(fixture('local-body.md'), {
      idFactory: sequentialIds()
    });
    const before = structuredClone(markdown.tree);

    projectSectionTree(markdown.tree);

    expect(markdown.tree).toEqual(before);
    expect(markdown.tree.children[0]?.localBody).toContain('- docx');
  });
});

describe('createDebugPlacement', () => {
  it('is deterministic and uses only tree depth plus preorder index', () => {
    expect(createDebugPlacement(2, 3)).toEqual({ x: 520, y: 396 });
    expect(createDebugPlacement(2, 3)).toEqual(createDebugPlacement(2, 3));
  });
});

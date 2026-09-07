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

  it('copies Local Body verbatim and defaults every node to heading view', () => {
    const markdown = projectMarkdownDocument(fixture('local-body.md'), {
      idFactory: sequentialIds()
    });
    const graph = projectSectionTree(markdown.tree);
    const wordSection = markdown.tree.children[0];
    const wordNode = graph.nodes[0];

    expect(wordSection).toBeDefined();
    expect(wordNode).toBeDefined();
    expect(wordNode?.localBody).toBe(wordSection?.localBody);
    expect(wordNode?.localBody).toBe('这是 Word 的说明。\n\n- doc\n- docx');
    expect(wordNode?.localBody).not.toContain('格式校验');
    expect(graph.nodes.every((node) => node.viewMode === 'heading')).toBe(true);
  });

  it('applies a per-node presentation override by Stable Node ID without changing identity', () => {
    const markdown = projectMarkdownDocument(fixture('local-body.md'), {
      idFactory: sequentialIds('stable')
    });
    const targetId = markdown.tree.children[0]?.nodeId;

    expect(targetId).toBeDefined();
    if (targetId === undefined) {
      throw new Error('Expected a stable section ID.');
    }

    const headingGraph = projectSectionTree(markdown.tree);
    const markdownGraph = projectSectionTree(markdown.tree, {
      viewModeByNodeId: { [targetId]: 'markdown' }
    });

    expect(headingGraph.nodes[0]?.id).toBe(targetId);
    expect(markdownGraph.nodes[0]?.id).toBe(targetId);
    expect(headingGraph.nodes[0]?.viewMode).toBe('heading');
    expect(markdownGraph.nodes[0]?.viewMode).toBe('markdown');
    expect(markdownGraph.nodes[0]?.localBody).toBe(
      headingGraph.nodes[0]?.localBody
    );
  });

  it('lets duplicate titles use different view modes because mapping keys are Stable IDs', () => {
    const source = '## API\n\nBody A.\n\n## API\n\nBody B.\n';
    const markdown = projectMarkdownDocument(source, {
      idFactory: sequentialIds('api')
    });
    const [first, second] = markdown.tree.children;

    expect(first?.title).toBe('API');
    expect(second?.title).toBe('API');
    expect(first?.nodeId).not.toBe(second?.nodeId);

    const graph = projectSectionTree(markdown.tree, {
      viewModeByNodeId: second === undefined ? {} : { [second.nodeId]: 'markdown' }
    });

    expect(graph.nodes.map((node) => [node.title, node.viewMode])).toEqual([
      ['API', 'heading'],
      ['API', 'markdown']
    ]);
    expect(graph.nodes.map((node) => node.localBody)).toEqual([
      'Body A.',
      'Body B.'
    ]);
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

  it('does not mutate the Section Tree or its Local Body when presentation changes', () => {
    const markdown = projectMarkdownDocument(fixture('local-body.md'), {
      idFactory: sequentialIds()
    });
    const before = structuredClone(markdown.tree);
    const firstId = markdown.tree.children[0]?.nodeId;

    projectSectionTree(markdown.tree, {
      viewModeByNodeId: firstId === undefined ? {} : { [firstId]: 'markdown' }
    });

    expect(markdown.tree).toEqual(before);
    expect(markdown.tree.children[0]?.localBody).toContain('- docx');
  });
});

describe('createDebugPlacement', () => {
  it('is deterministic and uses only tree depth plus preorder index', () => {
    expect(createDebugPlacement(2, 3)).toEqual({ x: 880, y: 1140 });
    expect(createDebugPlacement(2, 3)).toEqual(createDebugPlacement(2, 3));
  });
});

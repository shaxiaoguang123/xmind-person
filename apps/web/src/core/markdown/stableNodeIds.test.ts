import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { MarkdownCoreError } from './errors';
import { projectMarkdownDocument } from './projectMarkdownDocument';

function fixture(name: string): string {
  return readFileSync(
    new URL(`../../../../../fixtures/markdown/${name}`, import.meta.url),
    'utf8'
  );
}

function sequentialIds(prefix = 'node') {
  let current = 0;
  return () => `${prefix}-${++current}`;
}

describe('Stable Node ID mapping', () => {
  it('assigns different IDs to duplicate headings', () => {
    const result = projectMarkdownDocument(fixture('duplicate-headings.md'), {
      idFactory: sequentialIds()
    });
    const [firstApi, secondApi] = result.tree.children;

    expect(firstApi?.title).toBe('API');
    expect(secondApi?.title).toBe('API');
    expect(firstApi?.nodeId).toBe('node-1');
    expect(secondApi?.nodeId).toBe('node-2');
    expect(firstApi?.nodeId).not.toBe(secondApi?.nodeId);
  });

  it('does not derive Node ID from heading text', () => {
    const result = projectMarkdownDocument(fixture('chinese-headings.md'), {
      idFactory: sequentialIds('opaque')
    });
    const root = result.tree.children[0];

    expect(root?.title).toBe('文件处理系统');
    expect(root?.nodeId).toBe('opaque-1');
    expect(root?.nodeId).not.toBe(root?.title);
  });

  it('reuses IDs from a prior mapping after title and body edits', () => {
    const firstSource = '# Original\n\nBody A.\n\n## Child\n\nBody B.\n';
    const secondSource =
      '# Renamed\n\nBody A changed significantly.\n\n## Child renamed\n\nBody B changed.\n';

    const first = projectMarkdownDocument(firstSource, {
      idFactory: sequentialIds('stable')
    });
    const second = projectMarkdownDocument(secondSource, {
      previousMapping: first.mapping,
      idFactory: () => {
        throw new Error('Existing structural mapping should reuse all IDs.');
      }
    });

    expect(first.tree.children[0]?.projectionKey).toBe('root/0');
    expect(second.tree.children[0]?.projectionKey).toBe('root/0');
    expect(second.tree.children[0]?.nodeId).toBe(
      first.tree.children[0]?.nodeId
    );
    expect(second.tree.children[0]?.children[0]?.nodeId).toBe(
      first.tree.children[0]?.children[0]?.nodeId
    );
  });

  it('treats duplicate mapped Node IDs as invalid application state', () => {
    expect(() =>
      projectMarkdownDocument(fixture('duplicate-headings.md'), {
        previousMapping: {
          byProjectionKey: {
            'root/0': 'duplicate-id',
            'root/1': 'duplicate-id'
          }
        }
      })
    ).toThrow(MarkdownCoreError);
  });
});

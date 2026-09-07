import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const srcRoot = join(repoRoot, 'apps/web/src');

function filesUnder(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function sourceFiles(directory) {
  return filesUnder(directory).filter((path) => /\.(?:ts|tsx)$/.test(path));
}

function assertNoForbiddenImports(directory, forbidden, label) {
  for (const file of sourceFiles(directory)) {
    const source = readFileSync(file, 'utf8');
    for (const token of forbidden) {
      if (source.includes(token)) {
        throw new Error(`${label}: ${relative(repoRoot, file)} contains forbidden dependency ${token}`);
      }
    }
  }
}

assertNoForbiddenImports(
  join(srcRoot, 'core/markdown'),
  ["from 'react'", 'from "react"', "@xyflow/react", 'window.', 'document.'],
  'Markdown Core boundary violation'
);

assertNoForbiddenImports(
  join(srcRoot, 'core/graph'),
  ["from 'react'", 'from "react"', '@xyflow/react', 'window.', 'document.'],
  'Graph Core boundary violation'
);

for (const file of sourceFiles(srcRoot)) {
  const source = readFileSync(file, 'utf8');
  if (/\.(?:skip|only)\s*\(/.test(source)) {
    throw new Error(`Test integrity violation: ${relative(repoRoot, file)} uses .skip/.only`);
  }

  if (/\b(?:elkjs|dagre|childrenPlacement)\b/i.test(source)) {
    throw new Error(`T02 scope violation: ${relative(repoRoot, file)} contains a deferred layout feature`);
  }
}

console.log('Architecture boundary checks passed.');

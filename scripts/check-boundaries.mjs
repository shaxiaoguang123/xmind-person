import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

const repoRoot = resolve(import.meta.dirname, '..');
const srcRoot = join(repoRoot, 'apps/web/src');
const forbiddenCoreModules = new Set([
  'react',
  'react-dom',
  'react-markdown',
  '@xyflow/react'
]);
const forbiddenBrowserGlobals = new Set(['window', 'document']);
const forbiddenSecurityModule = 'rehype-raw';
const forbiddenHtmlInjectionIdentifier = 'dangerouslySetInnerHTML';

function filesUnder(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function sourceFiles(directory) {
  return filesUnder(directory).filter((path) => /\.(?:ts|tsx)$/.test(path));
}

function parseSource(file, source) {
  return ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
}

function moduleSpecifierFor(node) {
  if (
    (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
    node.moduleSpecifier !== undefined &&
    ts.isStringLiteralLike(node.moduleSpecifier)
  ) {
    return node.moduleSpecifier.text;
  }

  if (
    ts.isImportEqualsDeclaration(node) &&
    ts.isExternalModuleReference(node.moduleReference) &&
    node.moduleReference.expression !== undefined &&
    ts.isStringLiteralLike(node.moduleReference.expression)
  ) {
    return node.moduleReference.expression.text;
  }

  if (
    ts.isCallExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ImportKeyword &&
    node.arguments.length === 1 &&
    ts.isStringLiteralLike(node.arguments[0])
  ) {
    return node.arguments[0].text;
  }

  return null;
}

function visitSource(file, visitor) {
  const source = readFileSync(file, 'utf8');
  const sourceFile = parseSource(file, source);

  function visit(node) {
    visitor(node);
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return source;
}

function assertCoreBoundary(directory, label) {
  for (const file of sourceFiles(directory)) {
    visitSource(file, (node) => {
      const moduleSpecifier = moduleSpecifierFor(node);
      if (
        moduleSpecifier !== null &&
        forbiddenCoreModules.has(moduleSpecifier)
      ) {
        throw new Error(
          `${label}: ${relative(repoRoot, file)} imports forbidden dependency ${moduleSpecifier}`
        );
      }

      if (
        ts.isIdentifier(node) &&
        forbiddenBrowserGlobals.has(node.text)
      ) {
        throw new Error(
          `${label}: ${relative(repoRoot, file)} references forbidden browser global ${node.text}`
        );
      }
    });
  }
}

assertCoreBoundary(
  join(srcRoot, 'core/markdown'),
  'Markdown Core boundary violation'
);
assertCoreBoundary(
  join(srcRoot, 'core/graph'),
  'Graph Core boundary violation'
);

for (const file of sourceFiles(srcRoot)) {
  const source = visitSource(file, (node) => {
    const moduleSpecifier = moduleSpecifierFor(node);
    if (moduleSpecifier === forbiddenSecurityModule) {
      throw new Error(
        `Markdown security violation: ${relative(repoRoot, file)} imports ${forbiddenSecurityModule}`
      );
    }

    if (
      ts.isIdentifier(node) &&
      node.text === forbiddenHtmlInjectionIdentifier
    ) {
      throw new Error(
        `Markdown security violation: ${relative(repoRoot, file)} uses an HTML injection escape hatch`
      );
    }
  });

  if (/\.(?:skip|only)\s*\(/.test(source)) {
    throw new Error(
      `Test integrity violation: ${relative(repoRoot, file)} uses .skip/.only`
    );
  }

  if (/\b(?:elkjs|dagre|childrenPlacement)\b/i.test(source)) {
    throw new Error(
      `T03 scope violation: ${relative(repoRoot, file)} contains a deferred layout feature`
    );
  }
}

console.log('Architecture boundary checks passed.');

# Markdown Section Semantics

## Scope

T01 implements only the pure Markdown-domain pipeline:

```text
Markdown Source
  -> unified + remark-parse + remark-gfm
  -> mdast Root
  -> Section Extraction
  -> Section Tree
  -> Stable Node ID Mapping
```

No React Flow, ELK, Canvas, UI component, backend, database, persistence, authentication, animation, or Flow Edge editing belongs to this stage.

## Parser Contract

Production parsing is implemented by `unified().use(remarkParse).use(remarkGfm)` in `apps/web/src/core/markdown/parseMarkdown.ts`.

Heading recognition is based only on mdast nodes whose `type` is `heading`. The application does not scan Markdown source with heading regular expressions.

Consequences:

- ATX H1-H6 are represented by mdast heading depth 1-6.
- Setext headings are recognized by the Markdown parser as H1/H2.
- Heading-looking text inside fenced code remains code content.
- GFM task lists, tables, strikethrough, and autolinks remain part of the parsed/body source.
- Chinese and other Unicode titles do not require special parsing rules.

## Section Extraction

A Section Draft is created for each root-level mdast Heading node in document order. It preserves:

- `headingDepth`
- plain-text `title` derived from the heading AST for display/domain lookup
- `localBody` sliced from the original Markdown source
- `headingPosition`
- `sourcePosition`
- `documentOrder`

The full mdast Root remains available from the composed projection result; section extraction does not replace the document AST with plain text.

## Parent Rule

The parent of the current heading is the nearest previous heading with a smaller depth.

Example:

```md
## A
#### B
### C
```

becomes:

```text
DocumentRoot
└── A (H2)
    ├── B (H4)
    └── C (H3)
```

No missing H3 is synthesized for B. Heading depth is preserved exactly.

The synthetic `DocumentRoot` is an internal structure node, not a Markdown heading and not a future visual graph node. It allows a document to start at any heading depth and allows multiple top-level sections with different depths.

## Local Body Rule

A section owns the root-level mdast content after its heading and before the next root-level heading in document order.

`localBody` is sliced from the original Markdown source using mdast offsets. It therefore preserves Markdown constructs owned by the section while excluding the next heading and all content owned by later sections.

This deliberately means a parent card will not contain child-heading bodies.

An empty section is valid and has `localBody === ""`.

## Preamble Rule

Root-level Markdown content before the first heading is preserved as document `preamble`. It is not silently discarded and does not become a section/node in T01.

When mdast supplies positions, the preamble position is preserved as well.

## Source Position Rule

Source line/column/offset data comes from mdast/unist `Position` objects. T01 does not recalculate Markdown line numbers.

The implementation keeps both heading position and owned section source position so a later editor can locate a visual node in Markdown source without introducing a separate line-counting model.

## Stable Node ID Strategy

Permanent Node ID is opaque and title-independent. The default factory uses `crypto.randomUUID()`.

T01 separates identity lookup from identity value:

- each parsed structural location receives an internal `projectionKey`, such as `root/0` or `root/0/1`;
- the `projectionKey` is not exposed as the permanent Node ID;
- on first projection, a section without prior mapping receives a new opaque Node ID;
- on re-projection, a supplied `StableNodeIdMapping` reuses the Node ID for the same structural projection key;
- title and body changes therefore do not regenerate IDs when structure/order is unchanged;
- duplicate titles remain separate because sibling structural keys differ.

### MVP Boundary

This strategy intentionally does not claim intelligent reconciliation after arbitrary external restructuring. T01 does not fuzzy-match identity across mass reorder/delete, ambiguous duplicate-heading moves/renames, section split, or section merge.

Those cases require a later explicit reconciliation design. T01 must not guess identity from title text, title slug, or title hash.

## Error Boundary

Normal but unusual Markdown (for example H2 -> H5, duplicate headings, empty sections, or first heading != H1) is valid input and must not throw.

`MarkdownCoreError` is reserved for invalid application/runtime assumptions such as missing mdast positions required for loss-minimizing source slicing, duplicate stable IDs in a supplied mapping, an empty generated/mapped ID, or unavailable opaque ID generation.

## Pure-Core Decomposition

The implementation is intentionally composed as separately testable functions:

```text
parseMarkdown(source)
extractSections(ast, source)
buildSectionTree(extraction)
assignStableNodeIds(tree, previousMapping?, idFactory?)
projectMarkdownDocument(source, options?)
```

The first four functions define the core boundaries; the final function composes them without introducing UI or persistence concerns.
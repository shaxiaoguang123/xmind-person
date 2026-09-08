# Domain Model

## Model Separation

Three models are authoritative for different concerns and MUST NOT be collapsed into one structure:

1. **Markdown / Section Tree** — semantic heading hierarchy and Markdown-owned content.
2. **Flow Graph** — explicit user/project graph relationships.
3. **Layout Metadata** — presentation and viewport state.

A Markdown parent-child relation is not a persisted Flow Edge. Layout state does not rewrite Markdown source.

## Project

Logical container for one or more documents and their revisions.

## Document

A Markdown document with a stable document identity.

Conceptual fields include:

- `id`
- `markdownSource`
- `preamble`
- `sectionTree`
- `flowMetadata`
- `revision`

`preamble` preserves Markdown content before the first heading. It is not required to become a graph node.

## Synthetic Document Root

Section Tree has an internal synthetic root used only to organize top-level sections.

The root:

- is not a Markdown heading;
- has no semantic heading depth;
- is not rendered as a future React Flow node;
- may contain multiple top-level sections at different heading depths.

Example:

```md
## A
### B
# C
```

becomes:

```text
DocumentRoot
├── A (H2)
│   └── B (H3)
└── C (H1)
```

A document does not need to begin with H1.

## DocumentSection / DocumentNode

The Markdown-domain section established in T01 preserves at least:

- `nodeId` — stable opaque identity, independent of title text.
- `headingDepth` — integer 1-6 from mdast heading depth.
- `title` — heading inline content represented as the section title without redefining identity.
- `localBody` — Markdown source belonging only to this section, excluding all child/sibling headings and their bodies.
- `children` — semantic child sections.
- `sourcePosition` — mdast-derived source location when available.

T01 also retains `headingPosition`, `documentOrder`, and an internal `projectionKey` used only by the stable-ID mapping boundary.

Later graph/UI stages extend node projection with:

- `viewMode` (`heading` or `markdown`)
- `styleMode`
- `childrenPlacement`
- `collapsed`
- `styleOverride`

These visual fields do not change `headingDepth`.

### T03 Presentation State

T03 implements `viewMode` as a presentation choice with exactly two values:

```text
heading | markdown
```

The mode is projected by Stable Node ID and selects `HeadingCard` or `MarkdownCard` inside the same `DocumentNode`. Changing `viewMode` does not change `nodeId`, `headingDepth`, or Section hierarchy, and it does not create a second domain node identity.

At T03, `viewMode` is UI/projection state only. Persistence of presentation state remains deferred to the later Flow Metadata/persistence stages.

## Section Parent Rule

For every heading, its semantic parent is the nearest previous heading whose depth is smaller than the current heading depth.

Example:

```md
## A
#### B
### C
```

results in:

```text
A (H2)
├── B (H4)
└── C (H3)
```

No synthetic H3 is created before B. User heading depth is never repaired or normalized.

## Local Body Rule

A Section owns Markdown nodes after its heading until the next heading node in document order. That body is sliced from the original source using mdast offsets without including any later heading or its descendants.

Example:

```md
## Word

Word description.

- doc
- docx

### Validation

Check format.
```

The `Word` section Local Body contains only:

```md
Word description.

- doc
- docx
```

It does not contain `### Validation` or `Check format.`.

This rule prevents Markdown Cards from duplicating child-section content. An empty section remains valid with `localBody === ""`.

## Preamble Rule

Content before the first mdast heading is preserved as `document.preamble` (or an equivalent document-level field). It is valid Markdown and is not silently discarded.

## Markdown Parsing Rule

Heading recognition is based on mdast heading nodes produced by `unified` + `remark-parse`, with `remark-gfm` enabled. Production code MUST NOT reimplement heading recognition with regex.

Consequences:

- ATX and Setext headings are supported by parser semantics.
- Heading-looking text in fenced code is code content, not a Section.
- GFM nodes may exist in Local Body without affecting hierarchy extraction.
- Chinese/Unicode title text does not change heading semantics.
- Empty sections remain valid.
- Skipped depths are valid unusual Markdown, not an application error.

## Source Position

When mdast supplies a reliable `position`, T01 preserves source location for the section heading and owned section range. At minimum the model retains:

- `start.line`
- `start.column`
- `end.line`
- `end.column`

Offsets are retained when provided because they enable loss-minimizing source slicing. Line/column values MUST NOT be manually recomputed when AST positions are available.

The implementation uses the actual `unist` `Point` / `Position` types at the parser boundary and copies them into domain source-position values.

## Stable Node ID Strategy

Node ID must not equal heading text, a title slug, or a title hash. Duplicate titles must receive distinct Node IDs.

T01 implements an explicit Stable Node ID mapping boundary:

- On first projection, sections without an existing mapping receive opaque generated IDs using `crypto.randomUUID()` by default.
- Each structural location receives a non-identity `projectionKey` such as `root/0` or `root/0/1`.
- On re-projection when a previous mapping is supplied, the same structural projection key reuses its prior Node ID.
- Title/body edits therefore do not inherently create a new identity while hierarchy/order is unchanged.
- Duplicate titles remain distinct because their structural projection keys differ.

`projectionKey` is a lookup key for T01 mapping; it is not a replacement for permanent Node ID and must not be persisted/treated as title-derived identity.

### T01 MVP Boundary

T01 does **not** solve intelligent remapping after arbitrary external Markdown restructuring, including ambiguous duplicate-title moves/renames, mass deletion/reorder, section split, or section merge. Such reconciliation is a future task and must not be approximated with undocumented fuzzy matching.

See `docs/markdown-section-semantics.md` for the implemented T01 rules.

## FlowEdge

Independent graph relationship with at least:

- `id`
- `source`
- `target`
- `type`
- `metadata`

FlowEdge endpoints reference stable Node IDs. A FlowEdge does not define Markdown hierarchy.

## FlowMetadata

Versioned sidecar metadata with at least:

- `schemaVersion`
- `graphDirection`
- `nodes`
- `edges`
- `manualPositions`
- `viewport`
- `theme`

It is persisted separately from Markdown source.

## ViewportState

At minimum:

- `x`
- `y`
- `zoom`

Reopening a document restores this state when available.

## Revision

Persistence revision/version used for history and optimistic concurrency. Backend stages own conflict validation; T01 has no persistence implementation.

## T01 Implemented Types

The concrete Markdown Core types live in `apps/web/src/core/markdown/types.ts` and keep draft extraction, draft hierarchy, stable-ID mapping, and final Section Tree types separate. The composed `MarkdownProjectionResult` also exposes the mdast Root so the domain projection does not discard the parsed syntax tree.
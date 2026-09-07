# Architecture

## Monorepo Boundary

Target repository shape:

```text
root/
  apps/
    web/
    api/
  packages/
    contracts/
    shared-types/
  docs/
    adr/
  fixtures/
  tests/
```

The monorepo is a management boundary, not a reason to couple frontend and backend runtime responsibilities.

## Core Model Pipeline

```text
Markdown Source
  -> mdast
  -> Section Tree
  -> Visual Graph Projection
  -> Layout Metadata / Viewport
  -> React Flow Rendering
```

The following models are deliberately independent:

1. Markdown hierarchy / Section Tree — semantic document structure.
2. Flow Graph — explicit graph nodes/edges used for visual/process relationships.
3. Layout Metadata — graph direction, detail placement, manual positions, viewport, theme, and presentation state.

See ADR-0001.

## Frontend Ownership

The frontend owns:

- Markdown editing experience.
- Markdown parsing and mdast processing.
- Section extraction and Section Tree projection.
- Visual Graph projection.
- React Flow node/edge rendering.
- ELK-based automatic layout orchestration.
- Multi-pass main/detail layout composition.
- Collision resolution and edge-routing presentation.
- Viewport, zoom, pan, selection, focus, search, keyboard shortcuts.
- Collapse/expand visibility calculation.
- Undo/redo and local editing state.
- Animation and reduced-motion behavior.
- Node visual styling and Markdown rendering.
- OpenAPI-generated API client.

Automatic layout remains browser-side. Backend MUST NOT expose a layout API. See ADR-0002.

## Backend Ownership

The backend owns:

- Project CRUD.
- Document persistence.
- Markdown Source persistence.
- Flow Metadata persistence.
- Revision/version history.
- Optimistic concurrency control.
- Data-integrity validation.
- Recovery-oriented persistence behavior.
- Future user/collaboration extension points without implementing those features in early stages.

Backend validation may reject duplicate node IDs, missing edge endpoints, unsupported schema versions, and revision conflicts. It does not calculate graph coordinates.

## Persistence Boundary

Document prose and graph/presentation metadata are stored as a conceptual sidecar pair:

```text
document.md
document.flow.json
```

Flow Metadata never enters Markdown body content. See ADR-0004.

## API Contract

Backend target: FastAPI + Pydantic + SQLAlchemy + Alembic + PostgreSQL.

Transport: REST described by OpenAPI. Frontend contract types SHOULD be generated from OpenAPI; handwritten duplicate DTOs are discouraged because they drift.

The frontend MUST NOT access the database directly.

## Pure-Core Rule

Transformation logic should be decomposed into small explicit functions and should be deterministic where practical. In particular, Markdown parsing, section extraction, tree construction, visibility, graph projection, layout-input construction, and collision/layout passes should be unit-testable independently of UI components.

## T01 Architecture Slice

T01 is deliberately limited to:

```text
Markdown Source
  -> unified + remark-parse + remark-gfm
  -> mdast Root
  -> Section Draft extraction
  -> Section Tree Draft
  -> Stable Node ID mapping
  -> Section Tree
```

T01 has no React dependency and no React Flow, ELK, Canvas, backend API, persistence, animation, or Flow Edge editing.

### Implemented module boundaries

`apps/web/src/core/markdown/` contains the pure core:

```text
parseMarkdown.ts             parser composition
sourcePositions.ts           mdast/unist source-position copying and source slicing
extractSections.ts           preamble + flat Section Draft extraction
buildSectionTree.ts          nearest-smaller-depth hierarchy construction
stableNodeIds.ts             opaque ID assignment/reuse boundary
projectMarkdownDocument.ts   pipeline composition
errors.ts                    invalid application-state error boundary
types.ts                     explicit core domain types
index.ts                     public core exports
```

The composition remains:

```text
parseMarkdown(source) -> MdastRoot
extractSections(ast, source) -> SectionExtractionResult
buildSectionTree(extraction) -> SectionTreeDraft
assignStableNodeIds(tree, previousMapping?) -> StableNodeIdAssignment
projectMarkdownDocument(source, options?) -> MarkdownProjectionResult
```

The parser AST remains in the final projection result, while Local Body and preamble are sliced from original Markdown using mdast offsets. This preserves Markdown source constructs without introducing a second parser or line-counting model.

### Stable identity boundary

T01 uses a structural `projectionKey` only as the lookup key for a supplied prior `StableNodeIdMapping`. Permanent Node IDs remain opaque and default to UUID generation. A title/body change with unchanged structural position can reuse identity; arbitrary external restructuring is explicitly deferred.

See `docs/markdown-section-semantics.md` and ADR-0003.

## T01 Test/Build Boundary

T01 added only the minimum TypeScript Markdown-core workspace needed for that stage: strict TypeScript, ESLint, Vitest, remark/mdast dependencies, and the corresponding CI gate. It did not add React Flow, Playwright, backend dependencies, or database infrastructure.

## T02 Architecture Slice

T02 extends the frontend only through an explicit one-way projection chain:

```text
apps/web/src/core/markdown/
  Stable Section Tree
        |
        v
apps/web/src/core/graph/
  VisualGraph
  VisualNode
  VisualHierarchyEdge
  createDebugPlacement()
        |
        v
apps/web/src/adapters/react-flow/
  toReactFlowNodes()
  toReactFlowEdges()
        |
        v
apps/web/src/features/editor/ + app/
  HeadingNode
  EditorCanvas
  Vite/React runtime
```

### Visual Graph is renderer-neutral

`core/graph` is pure TypeScript. It does not import React, browser APIs, CSS, or `@xyflow/react`.

The graph core consumes `SectionTree` and produces `VisualGraph`; it does not consume React Flow types. This preserves future freedom for export/layout/test/rendering adapters that should not depend on a UI library.

### Identity is not re-generated

T02 preserves the T01 stable identity across the rendering boundary:

```text
DocumentSection.nodeId
  == VisualNode.sectionId
  == VisualNode.id
  == React Flow node.id
```

No `reactFlowId` exists and no ADR was required for a second identity because no second identity is introduced.

### VisualHierarchyEdge is a projection artifact

Markdown parent-child relations are projected into `VisualHierarchyEdge` only so the Section Tree can be drawn. This type is deliberately distinct from the independent domain `FlowEdge` described in ADR-0001 and `docs/domain-model.md`.

A VisualHierarchyEdge:

- is not persisted;
- is not a future `document.flow.json` Flow Edge;
- does not permit user connection/editing in T02;
- is mapped by the React Flow adapter only to a basic non-animated rendering edge.

Synthetic Document Root siblings therefore have no artificial edge between them.

### Temporary debug placement

T02 nodes require positions for React Flow rendering, but T02 does not own formal automatic layout.

`createDebugPlacement(treeDepth, preorderIndex)` supplies deterministic test/debug coordinates only. It is explicitly temporary, pure, non-persisted, and not LayoutMetadata. It performs no ELK, Dagre, collision resolution, subtree centering, edge routing, or dynamic spacing.

### Ephemeral interaction state

T02 selection, drag position, and viewport transforms remain React/UI-ephemeral. Dragging never writes Flow Metadata. Reloading recreates the Visual Graph and deterministic debug placement.

Initial `fitView` is acceptable for this debug-only stage; the later persisted viewport contract still requires saved viewport restoration to supersede unconditional fitting.

### Enforced dependency checks

`scripts/check-boundaries.mjs` fails CI if Markdown Core or Graph Core imports React/React Flow/browser globals. It also rejects `.skip`/`.only` and T02-deferred layout identifiers such as ELK/Dagre/`childrenPlacement` in the source tree.

See `docs/visual-graph-projection.md` and `docs/qa/t02-review.md`.

## Deferred Architecture Problems

Stable identity after arbitrary external Markdown restructuring remains deferred from T01. Formal layout/ELK, collapse visibility, independent FlowEdge editing, persistence, backend services, and the remaining editor architecture continue to their scheduled stages and must not be pulled into T02.

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
  -> Section Tree
  -> Stable Node ID mapping
```

T01 has no React dependency requirement and no React Flow, ELK, Canvas, backend API, persistence, animation, or Flow Edge editing.

Expected pure-core separation:

```text
parseMarkdown(source) -> MdastRoot
extractSections(ast, source) -> SectionDraft[] + preamble
buildSectionTree(sectionDrafts) -> SectionTreeDraft
assignStableNodeIds(tree, previousMapping?) -> SectionTree
```

Exact function/type names may differ, but parsing, extraction, hierarchy construction, and ID mapping must remain separately testable.

## Deferred Architecture Problems

T01 stable identity only guarantees reuse when an existing mapping is available. Intelligent reconciliation after arbitrary external large-scale Markdown edits, duplicate-section moves/renames, splits, or merges is deferred and must not be solved with undocumented fuzzy matching.
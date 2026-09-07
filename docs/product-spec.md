# Product Specification

## Product Positioning

This product is a Markdown-driven, collapsible hierarchical flow / knowledge-graph editor. It is not a generic flowchart tool and not a conventional mind-map editor.

Canonical workflow:

`Markdown Source -> Markdown AST -> Section Tree -> Visual Graph -> Main Flow / Side Details / Flow Edges -> Layout -> User Edits -> Markdown + Flow Metadata`

The specification and Requirement IDs in this repository are the source of truth. Prompt history and implementation convenience are not.

## Requirement Catalog

### Architecture

- **ARCH-001** Markdown hierarchy, Flow Graph, and Layout Metadata MUST remain separate models.
- **ARCH-002** Frontend owns graph rendering, viewport, interactive layout, animation, and ELK orchestration; backend MUST NOT expose a layout API.
- **ARCH-003** Markdown source and Flow Metadata use the sidecar model `document.md` + `document.flow.json`; metadata MUST NOT be written into Markdown body text.
- **ARCH-004** The system uses a frontend/backend separated architecture in a monorepo: `apps/web`, `apps/api`, and shared contract/type packages.
- **ARCH-005** Backend exposes REST described by OpenAPI; frontend API types SHOULD be generated from OpenAPI rather than maintained as drifting duplicate DTOs.
- **ARCH-006** Layout/domain transformation functions SHOULD be pure and deterministic where practical.

### Markdown and Section Semantics

- **MD-001** Production Markdown parsing MUST use `unified` + `remark-parse`/mdast; regex heading parsers are forbidden.
- **MD-002** H1-H6 semantic depth MUST be preserved exactly and MUST NOT be altered by visual styling.
- **MD-003** A section parent is the nearest previous heading whose depth is smaller than the current heading depth; missing intermediate depths MUST NOT be synthesized.
- **MD-004** A section Local Body contains only content owned by that section and MUST exclude descendant/sibling section content.
- **MD-005** Content before the first heading MUST be preserved as document preamble and is not required to become a graph node.
- **MD-006** Stable Node IDs MUST be opaque and independent of title text, title slug, or title hash; an existing mapping MUST be reusable during re-projection.
- **MD-007** Duplicate headings are legal and MUST produce distinct sections and distinct Node IDs.
- **MD-008** Heading-like text inside code fences MUST NOT become sections.
- **MD-009** Setext headings MUST be supported in addition to ATX headings.
- **MD-010** Unicode/Chinese headings MUST preserve depth, title, hierarchy, and identity semantics.
- **MD-011** Empty sections are valid and MUST remain present with empty Local Body.
- **MD-012** GFM constructs (task lists, tables, strikethrough, autolinks) MUST survive parsing/section extraction without corrupting ownership boundaries.
- **MD-013** Reliable mdast source positions SHOULD be preserved for future Markdown-editor/graph-node navigation; application code MUST NOT recalculate line positions when AST positions exist.
- **MD-014** Valid but unusual Markdown, including skipped heading depths or first heading not being H1, MUST NOT be rejected solely for that shape.

### Graph Domain

- **GRAPH-001** Markdown parent-child relationships MUST NOT be treated as persisted Flow Edges.
- **GRAPH-002** Document nodes carry stable ID, heading depth, title, Local Body, view mode, style mode/override, child placement, and collapse state as applicable by stage.
- **GRAPH-003** Flow Edge is an independent entity with ID, source, target, type, and metadata.
- **GRAPH-004** Collapse changes visibility only; descendants MUST NOT be deleted.
- **GRAPH-005** Same-depth headings inherit a shared Level Theme by default, while an individual Markdown Card may hold an independent visual override without changing heading depth.

### Layout

- **LAYOUT-001** Main Flow supports DOWN, RIGHT, LEFT, and UP.
- **LAYOUT-002** Detail-child placement supports LEFT, RIGHT, UP, and DOWN independently from `graphDirection`.
- **LAYOUT-003** Side Details SHOULD default orthogonally to the Main Flow where practical; for DOWN/UP main flow, LEFT/RIGHT are preferred.
- **LAYOUT-004** Main-flow peers require stable visual-axis alignment and consistent sibling spacing.
- **LAYOUT-005** Automatic layout MUST avoid node overlap and SHOULD avoid routing edges through nodes.
- **LAYOUT-006** Layout SHOULD reduce unnecessary edge crossings.
- **LAYOUT-007** Expand/collapse and local changes MUST prioritize layout stability and minimize unrelated global movement.
- **LAYOUT-008** Automatic layout uses a multi-pass strategy: Main Flow, left details, right details, bounding-box composition, collision resolution, then edge routing.
- **LAYOUT-009** ELK execution belongs to the frontend and MAY move to a Web Worker for large graphs; stale layouts SHOULD be cancellable.
- **LAYOUT-010** Manual positions and viewport are presentation metadata and MUST NOT rewrite Markdown source.

### Frontend and Visual Design

- **UI-001** Desktop editing is primary at >=1280 px; 1024 px remains usable.
- **UI-002** Visual language uses neutral gray/black/white with one primary accent and avoids decorative gradients, glassmorphism, colorful shadows, oversized rounding, and ornamental motion.
- **UI-003** The editor exposes Top Bar, collapsible Left Sidebar, central Infinite Canvas, collapsible Right Inspector, and compact bottom/floating controls.
- **UI-004** Heading Card is compact; Markdown Card displays Heading + Local Body only and MUST NOT duplicate child-section content.
- **UI-005** Markdown Card supports paragraph, list, code, blockquote, table, and link content; Raw HTML is excluded from MVP.
- **UI-006** Long Markdown content MUST use bounded presentation such as expand, internal scroll, or Focus Mode rather than unbounded node growth.
- **UI-007** Canvas supports professional pan/zoom/focus/fit/reset interactions described in `docs/interaction-contract.md`.
- **UI-008** Viewport `{x,y,zoom}` MUST be persisted/restored; project reopen MUST NOT unconditionally call fitView.
- **UI-009** MiniMap and background grid are optional/toggleable.
- **UI-010** MVP mobile scope is read-only/simplified browsing; a full mobile editor MUST NOT compromise desktop editing architecture.

### Interaction and Motion

- **UX-001** Canvas keyboard workflow includes sibling/child/outdent/edit/delete/undo/redo/copy/paste/duplicate/collapse/zoom/fit/search commands defined in `docs/interaction-contract.md`.
- **UX-002** Shortcut dispatch MUST distinguish Canvas Mode, Text Editing Mode, and Modal Mode; canvas shortcuts MUST NOT steal normal textarea/input editing.
- **UX-003** Selection, focus, viewport, and node search MUST be keyboard operable at their implementation stages.
- **UX-004** Undo/redo semantics belong to editor state and MUST preserve stable node identity.
- **MOTION-001** Motion communicates structural change rather than decoration; no perpetual floating, parallax, or background animation.
- **MOTION-002** Interaction motion budgets are approximately hover 100-150 ms, toolbar/inspector 150-200 ms, collapse/expand 180-250 ms, and layout transition 200-300 ms.
- **MOTION-003** `prefers-reduced-motion` MUST disable or replace large positional transitions, and motion transforms MUST NOT conflict with React Flow transforms.

### Accessibility

- **A11Y-001** Directional target is WCAG 2.2 AA.
- **A11Y-002** Core editor interactions MUST be keyboard operable with visible focus indicators and sensible focus order.
- **A11Y-003** Interactive controls require appropriate accessible names/ARIA semantics.
- **A11Y-004** Node selection and important operation state MUST be perceivable without relying on color alone.
- **A11Y-005** Reduced-motion preference MUST be honored.
- **A11Y-006** Visual minimalism MUST NOT remove focus rings.

### Performance

- **PERF-001** Fixtures/benchmarks MUST include approximately 10, 100, 500, and 1000 nodes.
- **PERF-002** Performance coverage includes parse, AST-to-section projection, graph projection, layout, collapse/expand, viewport, selection, and editing.
- **PERF-003** Large-graph state SHOULD use memoization and selector-based subscriptions rather than every component observing the complete nodes array.
- **PERF-004** Large graphs SHOULD use hidden/virtualization strategies where appropriate; 1000 nodes do not require all Markdown Cards expanded simultaneously.
- **PERF-005** Expensive layout SHOULD support worker execution/cancellation at the relevant stage.

### Backend and Persistence

- **API-001** Backend owns Project CRUD and Document persistence.
- **API-002** Backend persists Markdown Source and Flow Metadata as separate but related data.
- **API-003** Revision/versioning and optimistic concurrency conflict detection are required.
- **API-004** Backend validates schemaVersion, unique node IDs, and that Flow Edge source/target IDs exist.
- **API-005** Backend MUST NOT calculate automatic layout or expose a layout API.
- **API-006** Persistence design MUST support project/document recovery and future user/collaboration extension without implementing collaboration in MVP stages.
- **API-007** Backend target stack is FastAPI, Pydantic, SQLAlchemy, Alembic, and PostgreSQL.
- **API-008** Frontend MUST NOT access the database directly.

### Testing and CI

- **TEST-001** Testing is layered: L1 pure unit, L2 component, L3 API, L4 Playwright E2E, L5 visual regression.
- **TEST-002** Markdown parser fixtures/tests MUST cover ATX, Setext, Chinese, duplicate headings, skipped depth, fenced pseudo-headings, empty sections, GFM, and long Markdown at the appropriate stage.
- **TEST-003** E2E vertical slice eventually covers create -> paste -> parse -> graph -> expand/collapse -> side placement -> flow edge -> Markdown edit -> save -> reload -> preserved state.
- **TEST-004** Visual regression baselines cover core graph/detail/collapse/large-node/selection/theme scenarios in stable CI when those UI stages exist.
- **TEST-005** PR CI grows by stage and ultimately includes install, lint, format-check, typecheck, frontend/backend tests, API tests, frontend/backend builds, and Playwright smoke.
- **TEST-006** Tests MUST NOT be deleted, skipped, weakened, or mocked around core logic merely to make CI pass.
- **TEST-007** Visual tasks require real-browser screenshot inspection; DOM/unit tests alone cannot establish visual acceptance.
- **TEST-008** A task is DONE only after its stage-relevant acceptance criteria, tests, lint/typecheck/build, documentation, and Git/PR gates pass.

### Git and Delivery

- **GIT-001** Use GitHub Flow with `main` always intended to remain runnable.
- **GIT-002** Feature work MUST occur on a task-scoped branch rather than direct development on `main`.
- **GIT-003** Branch names follow patterns such as `feat/t01-markdown-parser`, `fix/layout-stability`, `refactor/graph-model`, `test/parser-fixtures`, and `docs/architecture`.
- **GIT-004** Commits use Conventional Commits and describe real changes.
- **GIT-005** Commits SHOULD be atomic, reviewable, reversible, and scoped to the task.
- **GIT-006** Stage PRs document Task ID, problem, implementation, files, acceptance criteria, tests, UI evidence when applicable, known limitations, and regression risk.
- **GIT-007** Required CI checks MUST pass before a task PR is considered complete/mergeable.
- **GIT-008** Squash merge is recommended for stage PR completion.

### Spec-Driven Delivery

- **PROCESS-001** Specification is the source of truth; implementation conflicts MUST be surfaced rather than silently redefining the product.
- **PROCESS-002** Development sequence is T00 through T16 as defined in `plan.md`; stages MUST NOT be skipped.
- **PROCESS-003** Before each task: read `AGENTS.md`, relevant requirements, architecture, related code, acceptance criteria, Git status, then create/use the task branch.
- **PROCESS-004** Out-of-scope architecture problems are recorded as ADR or Tech Debt rather than triggering unrequested broad refactors.
- **PROCESS-005** Each stage passes its test/documentation/QA gate before the next begins.
- **PROCESS-006** Failures require root-cause diagnosis and relevant retesting; tests/architecture MUST NOT be weakened to conceal defects.
- **PROCESS-007** Documentation and `tasks.md` MUST be synchronized with implementation status.
- **PROCESS-008** T00 establishes contracts/structure before business implementation.
- **PROCESS-009** Early stages MUST NOT add authentication, collaboration, AI agents, template marketplaces, plugin systems, real-time collaboration, or full mobile editing.

## Stage Boundary: T00

T00 creates the project constitution, product/architecture/domain/frontend/interaction/API/test/Git contracts, ADR mechanism, traceability, fixtures directory, plan/tasks tracking, and CI skeleton. It does not implement business features.

## Stage Boundary: T01

T01 implements only Markdown Source -> mdast -> Section Extraction -> Section Tree -> Stable Node ID Mapping. It explicitly excludes React Flow, ELK layout, Canvas UI, backend APIs, persistence, authentication, animation, and Flow Edge editing.

## Non-Goals for MVP / Early Stages

No complex authentication, multi-user collaboration, real-time collaboration, AI coding/product agents inside the product, template marketplace, plugin ecosystem, or full mobile editing unless a future specification explicitly introduces them.
# Tasks

## T00 — Project Constitution + Product Contract

**Status: DONE**

Requirements: ARCH-001..006, TEST-001, TEST-005, GIT-001..008, PROCESS-001..009 plus contract definitions for later requirement families.

### Acceptance Criteria

- [x] `AGENTS.md` defines project invariants and spec-driven delivery rules.
- [x] Product requirement catalog exists with stable Requirement IDs.
- [x] Requirement Traceability Matrix maps requirements to contracts/stages/verification.
- [x] Architecture contract defines model and frontend/backend boundaries.
- [x] Domain model contract defines Project, Document, Section Tree, Node, Flow Edge, Flow Metadata, Viewport, Revision semantics.
- [x] Frontend design contract exists.
- [x] Interaction contract exists.
- [x] API contract exists.
- [x] Test strategy exists.
- [x] Git workflow exists.
- [x] ADR directory and template exist.
- [x] ADR-0001 records Markdown Hierarchy != Flow Graph.
- [x] ADR-0002 records frontend-owned layout.
- [x] ADR-0003 records stable Node ID strategy.
- [x] ADR-0004 records `.md` + `.flow.json` sidecar persistence.
- [x] `plan.md` defines T00-T16 stage order.
- [x] `fixtures/markdown/` exists.
- [x] PR/push CI skeleton exists.
- [x] T00 QA confirms no business implementation was introduced.

### T00 QA Result

PASS. Detailed review: `docs/qa/t00-review.md`.

### T00 Gate

**DONE and merged through PR #1.**

---

## T01 — Markdown -> AST -> Section Tree

**Status: DONE**

Branch: `feat/t01-markdown-section-tree`

Primary Requirements: MD-001..014, ARCH-006, TEST-002, TEST-006, TEST-008, PROCESS-003..007.

### Acceptance Criteria

- [x] **AC-T01-01** Production Markdown parser uses remark/mdast.
- [x] **AC-T01-02** ATX headings parse correctly.
- [x] **AC-T01-03** Setext headings parse correctly.
- [x] **AC-T01-04** Chinese headings parse correctly.
- [x] **AC-T01-05** Duplicate headings remain independent and do not overwrite one another.
- [x] **AC-T01-06** Pseudo-headings inside code fences do not enter Section Tree.
- [x] **AC-T01-07** Skipped heading depth does not create synthetic headings.
- [x] **AC-T01-08** Empty sections remain valid.
- [x] **AC-T01-09** Content before first heading is preserved as preamble.
- [x] **AC-T01-10** Section Local Body excludes child/sibling section content.
- [x] **AC-T01-11** Synthetic Document Root supports multiple top-level sections with differing depths.
- [x] **AC-T01-12** Stable Node ID does not depend on heading text/slug/hash.
- [x] **AC-T01-13** Re-projection with an existing mapping can reuse stable Node IDs.
- [x] **AC-T01-14** GFM content does not corrupt section extraction.
- [x] **AC-T01-15** Source Position can locate original Markdown and comes from mdast positions.
- [x] **AC-T01-16** All T01 unit tests pass.
- [x] **AC-T01-17** Typecheck passes.
- [x] **AC-T01-18** Lint passes.
- [x] **AC-T01-19** Build passes.
- [x] **AC-T01-20** No T02 UI/layout/backend implementation is introduced.

### T01 Gate

**DONE and merged through PR #2.** T02 started only from the squash-merged `main` commit.

---

## T02 — Section Tree -> Basic React Flow Graph

**Status: DONE**

Branch: `feat/t02-basic-react-flow-graph`

Primary Requirements: ARCH-001, ARCH-006, GRAPH-001..002, UI-001, UI-003, UI-007, A11Y-003..004, A11Y-006, TEST-005..008, GIT-001..008, PROCESS-003..007, PROCESS-009.

### Acceptance Criteria

- [x] **AC-T02-01** React/Vite Web App can start successfully.
- [x] **AC-T02-02** `@xyflow/react` is integrated correctly.
- [x] **AC-T02-03** T01 Stable Section Tree projects into an independent `VisualGraph`.
- [x] **AC-T02-04** Synthetic Document Root produces zero visible nodes.
- [x] **AC-T02-05** Every real Section produces exactly one Visual Node.
- [x] **AC-T02-06** Visual Node identity preserves the Stable Section Node ID.
- [x] **AC-T02-07** Duplicate headings remain independent Visual Nodes.
- [x] **AC-T02-08** Section parent-child relations project into `VisualHierarchyEdge` objects.
- [x] **AC-T02-09** `VisualHierarchyEdge` is explicitly distinct from domain `FlowEdge` and is not persisted.
- [x] **AC-T02-10** Synthetic Root siblings do not receive a fake hierarchy edge.
- [x] **AC-T02-11** Skipped Markdown depth does not create a fictional Visual Node.
- [x] **AC-T02-12** Graph Core has no React Flow dependency.
- [x] **AC-T02-13** Markdown Core has no React / DOM / React Flow dependency.
- [x] **AC-T02-14** React Flow Adapter is separated from both pure cores.
- [x] **AC-T02-15** Custom `HeadingNode` renders through `nodeTypes`.
- [x] **AC-T02-16** H1-H6 basic theme mapping is implemented and browser evidence covers all six depths.
- [x] **AC-T02-17** Basic Canvas pan and zoom work in real Chrome.
- [x] **AC-T02-18** Basic node selection works in component tests and real Chrome.
- [x] **AC-T02-19** Debug Placement is deterministic and unit-tested.
- [x] **AC-T02-20** Debug Placement is not written to LayoutMetadata.
- [x] **AC-T02-21** Dragged node position is ephemeral and resets after reload.
- [x] **AC-T02-22** Real Markdown fixtures traverse T01 projection -> VisualGraph -> React Flow Canvas.
- [x] **AC-T02-23** Pure projection/adapter tests pass.
- [x] **AC-T02-24** Minimum React component tests pass.
- [x] **AC-T02-25** Lint passes.
- [x] **AC-T02-26** Typecheck passes.
- [x] **AC-T02-27** Vite production build passes.
- [x] **AC-T02-28** No ELK / Dagre / formal auto-layout implementation exists.
- [x] **AC-T02-29** No T03+ product feature is implemented early.
- [x] **AC-T02-30** Independent T02 QA passes.

### T02 Test / Browser Evidence

- GitHub Actions final implementation-head run `34111883942`: `npm ci`, architecture boundaries, lint, typecheck, tests, build, browser QA, and evidence upload PASS.
- Vitest: **6 test files, 37/37 tests PASS**.
- Real Chrome/CDP: 3 fixture demos checked for node/edge counts, duplicate titles, Synthetic Root absence, H1-H6 coverage, CJK rendering, pan, zoom, selection, drag, drag reset after reload, console errors, key warnings, and horizontal overflow.
- Screenshots: `docs/screenshots/t02-basic.png`, `docs/screenshots/t02-nested.png`, `docs/screenshots/t02-duplicate-mixed.png`.
- Architecture boundary CI rejects React/React Flow/browser globals from `core/markdown` and `core/graph`, `.skip`/`.only`, and deferred ELK/Dagre/`childrenPlacement` source leakage.
- QA: `docs/qa/t02-review.md` — PASS.

### T02 Gate

**DONE and merged through PR #3 to `main` at `0559329a39f87d8d60b9a11fc992daa220b7e011`.**

---

## T03 — Heading Card / Markdown Card

**Status: IN_PROGRESS**

Branch: `feat/t03-heading-markdown-cards`

Accepted Base: `main@0559329a39f87d8d60b9a11fc992daa220b7e011` (T02 merged result).

Primary Requirements: MD-002, MD-004, GRAPH-002, GRAPH-005, UI-004..006, TEST-005..008, GIT-001..008, PROCESS-003..007, PROCESS-009.

Inherited / regression-sensitive contracts: ARCH-001, UI-001, UI-007, A11Y-003..004, A11Y-006, ADR-0001, ADR-0003.

Governing stage contracts: `docs/product-spec.md`, `docs/architecture.md`, `docs/domain-model.md`, `docs/frontend-design.md`, `docs/node-presentation.md`, `docs/interaction-contract.md`, `docs/test-strategy.md`, and the accepted ADRs above.

### Scope

In scope for T03:

- preserve one stable projected document-node identity and add `viewMode` presentation selection with exactly `heading | markdown`;
- provide a compact Heading Card presentation without changing semantic heading depth;
- provide a Markdown Card that renders Heading + Section Local Body only;
- render MVP Markdown content required by UI-005, including paragraph, list, code, blockquote, table, and links, with GFM support where already defined by Markdown/domain contracts;
- exclude Raw HTML from the MVP presentation path;
- keep long Markdown content bounded instead of allowing unbounded node growth;
- isolate Markdown-body scrolling and link interaction from Canvas zoom/pan/node-drag behavior;
- preserve the T02 stable-ID, selection/focus, H1-H6 theme, CJK rendering, Canvas interaction, and architecture-boundary behavior affected by the node-presentation replacement;
- provide unit/component, architecture, build, and real-browser evidence appropriate to this UI stage.

### Out of Scope

T03 does not implement:

- ELK/Dagre/formal Main Flow auto-layout (T04);
- LEFT/RIGHT Side Detail placement or `childrenPlacement` behavior (T05);
- collapse/expand behavior (T06);
- independent persisted/user-authored `FlowEdge` editing (T07);
- Markdown editing, undo/redo, or stable-ID reconciliation for arbitrary external restructures (T08);
- backend, persistence, revisions, or viewport persistence (T09-T10);
- final keyboard-first editor workflow, toolbar, Inspector, or complete editor chrome (T11);
- T12 visual-polish/motion work;
- T13+ search/MiniMap/performance/accessibility-release scope;
- authentication, collaboration, AI product features, template marketplace, plugin systems, real-time collaboration, or full mobile editing.

### Contract Definition Recovery / Freeze

T03 product implementation existed on this branch before a formal T03 section with frozen Acceptance Criteria was committed to `tasks.md`. This is a process inconsistency and must not be hidden by retroactively treating prior implementation or QA as proof that unstated criteria were satisfied.

The T03 contract below is derived from the already-committed product specification, architecture/domain contracts, frontend/interaction/test contracts, and accepted ADRs rather than from implementation convenience.

**Acceptance Criteria are frozen from the commit that introduces this T03 task contract onward.** All T03 criteria remain unchecked until the implementation and evidence are re-evaluated against this frozen contract. Any later semantic/scope change requires an explicit `Contract Change` record under this T03 section before dependent implementation proceeds.

Historical T03 CI/QA evidence from older SHAs may be reused only as supporting history; it cannot satisfy the current-head delivery gate without revalidation.

### Acceptance Criteria

- [ ] **AC-T03-01** A projected document node has one stable identity; `viewMode` selects exactly `heading` or `markdown` presentation without creating a second domain/React Flow node identity.
- [ ] **AC-T03-02** Switching presentation mode does not change Stable Node ID, `headingDepth`, Markdown Section hierarchy, or Markdown Source.
- [ ] **AC-T03-03** Heading Card is compact and heading-only; H1-H6 presentation remains visually hierarchical without changing semantic depth.
- [ ] **AC-T03-04** Markdown Card renders the Section Heading + that Section's Local Body only and does not duplicate descendant/sibling section content.
- [ ] **AC-T03-05** An empty Local Body remains a valid Markdown Card and does not remove or merge the Section node.
- [ ] **AC-T03-06** Markdown Card supports paragraph, unordered/ordered list, code, blockquote, table, and link content required by UI-005; existing GFM constructs remain renderable without corrupting Section ownership.
- [ ] **AC-T03-07** Raw HTML is excluded from the MVP Markdown presentation and no raw-HTML escape path is introduced in the T03 renderer.
- [ ] **AC-T03-08** Long Markdown content uses a bounded presentation rather than unbounded node growth, and the bounded content is usable in a real browser.
- [ ] **AC-T03-09** Scrolling inside Markdown content does not cause unintended Canvas zoom/pan, and link/body interaction does not become unintended node dragging.
- [ ] **AC-T03-10** Duplicate-heading Sections remain independent by Stable Node ID and can retain independent presentation state without title-derived identity.
- [ ] **AC-T03-11** The Synthetic Document Root remains non-visible and existing T02 one-Section/one-visible-node projection semantics are not regressed by T03 presentation changes.
- [ ] **AC-T03-12** CJK/Unicode headings remain readable and semantic depth/title data are preserved across both presentation modes.
- [ ] **AC-T03-13** Node selection remains perceivable without color alone and visible keyboard focus treatment is preserved for the T03 node presentation.
- [ ] **AC-T03-14** Markdown Core and Graph Core remain free of React/DOM/React Flow presentation dependencies; React Flow integration remains in the adapter/UI layers.
- [ ] **AC-T03-15** T03 introduces no T04+ product behavior, including formal auto-layout, side-detail placement, collapse, independent FlowEdge editing, persistence/backend state, or Markdown editing.
- [ ] **AC-T03-16** T03 unit/component tests cover the presentation-mode boundary, stable identity, Local Body rendering, empty content, Markdown rendering, and affected T02 regressions without `.skip` / `.only` or weakened core assertions.
- [ ] **AC-T03-17** Stage-relevant architecture check, lint, typecheck, unit/component tests, and Vite production build pass on the current delivery head.
- [ ] **AC-T03-18** Real-browser QA covers mixed Heading/Markdown Cards, representative GFM content, long bounded content, empty content, selection/focus, and the affected Canvas interaction-isolation behaviors.
- [ ] **AC-T03-19** Independent T03 QA reviews the current delivery head against these frozen Acceptance Criteria and returns `PASS` before the Stage can become `MERGE_READY`.

### Required Evidence

Before T03 may become `MERGE_READY`, the current PR head must have:

- a task-scoped PR from `feat/t03-heading-markdown-cards` to the accepted `main` base;
- current-head GitHub Actions evidence for install, architecture boundaries, lint, typecheck, unit/component tests, build, real-browser QA, and browser-evidence artifact upload;
- component/unit evidence for stable ID/view-mode semantics, Local Body ownership, duplicate headings, empty Markdown Cards, Markdown/GFM rendering, and Raw HTML exclusion;
- real Chrome evidence for mixed cards, representative Markdown/GFM content, long bounded/scrollable content, empty content, selection/focus, body-wheel isolation, link/drag isolation, and affected Canvas pan/zoom behavior;
- reviewable screenshots/artifacts tied to the same verified head SHA;
- independent `docs/qa/t03-review.md` evidence explicitly evaluated against AC-T03-01..19 on the current PR head;
- no unresolved blocking review thread or `REQUEST_CHANGES` verdict;
- a mergeable PR with required checks passing.

Historical run `34117231444` at `1cc083d28dae328f78ba9c4817627fbaa72545f2` is supporting historical evidence only. It predates this frozen task contract and is not the final delivery gate for a later head.

### T03 Current Gate

**IN_PROGRESS.** The branch is not `MERGE_READY` merely because older implementation/QA evidence passed. T03 becomes `DONE` only after the accepted T03 PR is merged into `main` and mainline stage documentation is synchronized.

---

## Future Stages

T04-T16 remain governed by the stage sequence in `plan.md`. T04 is `BLOCKED` until T03 is `DONE` after merge.

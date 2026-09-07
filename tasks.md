# Tasks

## T00 — Project Constitution + Product Contract

**Status: PASS**

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

---

## T01 — Markdown -> AST -> Section Tree

**Status: PASS**

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

**PASS and merged through PR #2.** T02 started only from the squash-merged `main` commit.

---

## T02 — Section Tree -> Basic React Flow Graph

**Status: PASS**

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

**PASS**, subject to the normal final documentation/screenshot head and PR CI remaining green. Passing T02 does not authorize automatic T03 implementation in this branch.

---

## Future Stages

T03-T16 remain governed by the stage sequence in `plan.md`. T03 may begin only after normal T02 PR completion/merge and must use its own task branch.

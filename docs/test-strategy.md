# Test Strategy

Testing is layered and grows with the implementation stage. A stage is not DONE when its stage-relevant checks are failing, skipped, or bypassed.

## L1 — Pure Unit Tests

Primary targets:

- Markdown parser / mdast integration.
- Section extraction and Local Body ownership.
- Stable ID mapping.
- Section Tree construction.
- Graph projection.
- Visibility/collapse calculation.
- Layout input/output and deterministic passes.
- Flow Edge validation.

Markdown coverage includes ATX headings, Setext headings, Chinese headings, duplicate headings, skipped heading depth, fenced pseudo-headings, empty sections, GFM, long Markdown, and preamble/Local Body boundaries.

## L2 — Component Tests

At UI stages, test Heading/Markdown Card, Floating Toolbar, Inspector, Outline, collapse controls, and keyboard interaction with Testing Library. Tests should assert user-visible behavior rather than internal React state or CSS class names.

## L3 — API Tests

At backend stages, cover Project CRUD, Document save/load, revision conflicts, invalid/duplicate Node IDs, invalid Flow Edge endpoints, schemaVersion validation, and transactional rollback behavior.

## L4 — Playwright E2E

Primary vertical slice when all prerequisite stages exist:

```text
Create Project
-> paste Markdown
-> parse
-> generate graph
-> expand/collapse
-> change LEFT/RIGHT detail placement
-> create flow edge
-> edit Markdown
-> save
-> reload
-> state preserved
```

E2E tests assert user-visible behavior and stable accessibility selectors rather than implementation details.

## L5 — Visual Regression

Stable CI screenshot baselines eventually cover:

- basic graph;
- left details;
- right details;
- mixed side details;
- collapsed graph;
- large Markdown node;
- selected node;
- light/dark theme when implemented.

Screenshot changes require human confirmation before baseline update.

## Performance Fixtures

Prepare/maintain representative documents around 10, 100, 500, and 1000 nodes. Performance coverage includes initial parse, AST-to-section projection, graph projection, layout, collapse, expand, viewport, selection, and editing.

## T01 Gate

T01 is pure Markdown Core. Required checks before PASS:

- unit tests for parser/heading/tree/body/preamble/source-position/stable-ID semantics;
- real Markdown fixtures under `fixtures/markdown/`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test` (or equivalent non-watch unit command);
- `npm run build`;
- no `.skip` / `.only` in T01 tests;
- no hidden regex-based heading parser;
- no React Flow, ELK, Canvas, backend, or persistence implementation.

T01 does not require Playwright, backend tests, or visual regression because those capabilities do not yet exist.

## Test Integrity Rules

- Never delete a failing test to mark a task complete.
- Never weaken an assertion merely to conform to a defect.
- Never add `.skip`, `.only`, or equivalent bypasses to satisfy the gate.
- Do not mock the core logic under test when an actual parser/domain integration can run.
- Fix root cause, then rerun the relevant checks.

## CI Evolution

T00 initializes a pull-request/push workflow skeleton. T01 expands it only as far as needed for the Markdown Core: install, lint, typecheck, unit test, and build. Backend/Playwright/visual/performance jobs are added when their implementation stages begin.
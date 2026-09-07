# T02 Independent QA Review

## Result

**PASS**

T02 satisfies its implementation, architecture, automated test, real-browser, screenshot, documentation, and scope-control gates. T03 is not started by this review.

## Reviewed Scope

Branch: `feat/t02-basic-react-flow-graph`

Base: T01 squash-merged `main` (`e4fba6a6790974f87edeaf257ae5deccf9ff3e46`).

Reviewed implementation areas:

- React/Vite web runtime;
- pure Visual Graph model/projection;
- deterministic temporary debug placement;
- React Flow adapter;
- custom Heading Node and basic Canvas;
- graph/adapter/component tests;
- architecture-boundary checks;
- reproducible npm lockfile / `npm ci`;
- system-Chrome browser QA and screenshots.

## Architecture Audit

### Section Hierarchy Edge vs FlowEdge

PASS.

The implementation defines `VisualHierarchyEdge` under `core/graph`. It is a Visual Graph projection artifact with `kind: 'hierarchy'`. React Flow adaptation adds only `projectionKind: 'hierarchy'` for rendering.

No T02 code equates Markdown parent-child relationships with the independent domain `FlowEdge`, and no hierarchy edge persistence was introduced.

### Dependency Direction

PASS.

The enforced dependency direction is:

```text
core/markdown
  -> core/graph
  -> adapters/react-flow
  -> features/editor / app
```

`scripts/check-boundaries.mjs` rejects React, DOM, and `@xyflow/react` references from `core/markdown` and `core/graph`.

### Stable Identity

PASS.

`DocumentSection.nodeId` is preserved as both `VisualNode.id` and React Flow `node.id`. No `reactFlowId`, title slug, title hash, or second generated UI identity exists.

Duplicate heading tests and browser evidence confirm that identical titles remain independent nodes.

### Synthetic Document Root

PASS.

The projection begins from `SectionTree.children`; no Synthetic Document Root node is created. Browser evidence explicitly checks that the title `Document Root` is absent.

### Debug Placement

PASS.

`createDebugPlacement()` is pure and deterministic and is explicitly labelled temporary T02 debug placement. It does not modify Section Tree state, write LayoutMetadata, or implement ELK/Dagre/collision/subtree algorithms.

### UI State Persistence

PASS for T02 boundary.

Selection, node dragging, pan, and zoom are UI-ephemeral. Browser QA drags a real node, reloads the page, and verifies the node returns to deterministic debug placement.

## Scope Audit

PASS.

No T02 implementation introduces:

- ELK or Dagre;
- formal automatic layout;
- `childrenPlacement` / side layout;
- collapse/expand;
- Markdown Rich Card;
- user FlowEdge editor;
- Markdown editor;
- undo/redo;
- toolbar/inspector/MiniMap/search/Focus Mode;
- backend/database/authentication;
- Web Worker layout;
- animation framework;
- Playwright or visual-regression framework.

The architecture boundary script also fails if `elkjs`, `dagre`, or `childrenPlacement` appears in the T02 source tree.

## Automated Test Evidence

Final implementation-head GitHub Actions run: `34111883942` on `fe472f2a388958ce8dd09d31e09bd03ced86ded2`.

All stage gates passed:

- `npm ci`: PASS;
- architecture boundaries: PASS;
- lint: PASS;
- typecheck: PASS;
- unit/component tests: PASS;
- Vite production build: PASS;
- real-browser QA: PASS;
- browser artifact upload: PASS.

Vitest result: **6 test files, 37/37 tests PASS**.

T02-specific automated coverage includes:

- one Visual Node per real Section;
- zero visible node for Synthetic Document Root;
- stable Section ID preserved through Visual Graph and React Flow adapter;
- duplicate titles remain separate;
- real parent-child hierarchy edge projection;
- no edge between Synthetic Root siblings;
- skipped depth does not create a fake node;
- Section Tree / Local Body is not mutated;
- deterministic debug placement;
- hierarchy edge adapter carries no FlowEdge semantics;
- H1-H6 Heading Node rendering;
- non-color-only selected-state hook;
- React Flow Canvas mount, duplicate title rendering, and basic selection.

No `.skip` or `.only` is present. Core graph logic is not mocked around.

## Failure / Root-Cause Record

T02 did not obtain PASS by weakening tests.

1. Initial jsdom component test expected React Flow SVG edge geometry. jsdom does not complete React Flow node measurement, so that assertion was moved to the correct layers: hierarchy semantics remain in pure Graph/Adapter tests, while actual SVG edge count is checked in Chrome. Explicit Testing Library cleanup was also added.
2. Initial browser drag used one mouse move and did not cross React Flow's real drag behavior reliably. The browser QA was strengthened to issue multi-step trusted CDP mouse input and verify physical node bounding-box movement.
3. The strengthened browser QA then caught a real `/favicon.ico` 404 as a console/log error. The app added an inline favicon instead of suppressing the error.

Each failure was root-caused and the full relevant gate rerun.

## Real Browser QA

System Chrome is driven through the Chrome DevTools Protocol by `scripts/browser-qa.mjs`; Playwright is not installed.

Final report:

| Demo | Nodes | Hierarchy Edges | Duplicate API | Root Visible | Horizontal Overflow | CJK Font |
| --- | ---: | ---: | ---: | --- | --- | --- |
| basic | 6 | 5 | 0 | no | no | available |
| nested | 9 | 8 | 0 | no | no | available |
| duplicate-mixed | 7 | 5 | 2 | no | no | available |

Interaction checks:

- node selection: PASS;
- node drag: PASS;
- dragged position after reload: **not persisted**, PASS;
- wheel zoom: PASS;
- pane pan: PASS;
- browser exceptions / `console.error` / error log entries: zero;
- React key warnings: zero.

Across the three demos H1 through H6 labels are all exercised.

## Screenshot Review

Reviewed at 1440x1000 Chrome viewport:

- `docs/screenshots/t02-basic.png`
- `docs/screenshots/t02-nested.png`
- `docs/screenshots/t02-duplicate-mixed.png`

Manual review PASS:

- Canvas occupies the main workspace;
- nodes are visibly separated by deterministic placement;
- hierarchy edges connect expected parent-child nodes;
- Synthetic Root is not rendered;
- H1-H6 are distinguishable using restrained typography/border differences;
- Chinese titles render correctly;
- duplicate `API` titles appear simultaneously as independent nodes;
- no obvious page-level horizontal overflow;
- visual style remains neutral and debugging-oriented rather than T12 polish.

## Known Limitations

- Debug placement is intentionally simplistic and not production auto-layout.
- React Flow drag and viewport state are intentionally not persisted.
- `fitView` is used for T02 debug startup; future persisted viewport restoration must supersede unconditional fitting at its stage.
- Hierarchy edges are basic rendering artifacts only; independent FlowEdge UI is deferred.
- No Markdown Card, collapse, side-detail layout, or editor chrome is present.

## Gate

**T02 QA: PASS.**

Normal final-head CI and PR checks must remain green. This review does not authorize T03 implementation in the T02 branch.

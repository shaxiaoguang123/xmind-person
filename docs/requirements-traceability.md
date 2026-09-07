# Requirement Traceability Matrix

This matrix maps product requirements to the contracts, implementation stages, and primary verification gates that own them. The detailed requirement wording lives in `docs/product-spec.md`.

| Requirement | Primary Contract / Decision | Stage(s) | Primary Verification |
| --- | --- | --- | --- |
| ARCH-001 | `architecture.md`, ADR-0001 | T00, T02, T07 | architecture review; graph/domain tests |
| ARCH-002 | `architecture.md`, ADR-0002 | T00, T04-T06 | architecture review; layout tests |
| ARCH-003 | `architecture.md`, ADR-0004 | T00, T09-T10 | persistence/API tests |
| ARCH-004 | `architecture.md` | T00, T09 | repository structure review; builds |
| ARCH-005 | `api-contract.md` | T00, T09-T10 | OpenAPI/schema checks |
| ARCH-006 | `architecture.md` | T01-T02, T04-T06 | deterministic unit tests |
| MD-001 | `domain-model.md`, `architecture.md` | T01 | parser dependency/code review; unit tests |
| MD-002 | `domain-model.md` | T01, T03 | heading-depth unit tests |
| MD-003 | `domain-model.md` | T01 | hierarchy unit tests |
| MD-004 | `domain-model.md` | T01, T03 | Local Body fixture/unit tests |
| MD-005 | `domain-model.md` | T01 | preamble fixture/unit tests |
| MD-006 | ADR-0003, `domain-model.md` | T01, T08 | stable-ID unit tests |
| MD-007 | ADR-0003 | T01 | duplicate-heading unit tests |
| MD-008 | `domain-model.md` | T01 | code-fence fixture/unit tests |
| MD-009 | `domain-model.md` | T01 | Setext fixture/unit tests |
| MD-010 | `domain-model.md` | T01 | Chinese-heading fixture/unit tests |
| MD-011 | `domain-model.md` | T01 | empty-section unit tests |
| MD-012 | `domain-model.md` | T01 | GFM fixture/unit tests |
| MD-013 | `domain-model.md` | T01, T08 | AST position unit tests |
| MD-014 | `domain-model.md` | T01 | skipped-depth/non-H1 unit tests |
| GRAPH-001 | ADR-0001, `domain-model.md`, `visual-graph-projection.md` | T02, T07 | graph projection tests; architecture boundary review |
| GRAPH-002 | `domain-model.md`, `visual-graph-projection.md` | T01-T03, T08 | type/unit tests |
| GRAPH-003 | `domain-model.md` | T07 | edge validation/unit tests |
| GRAPH-004 | `domain-model.md` | T06 | visibility/collapse tests |
| GRAPH-005 | `frontend-design.md` | T03, T12 | component/visual tests |
| LAYOUT-001 | `frontend-design.md`, ADR-0002 | T04 | layout unit tests |
| LAYOUT-002 | `frontend-design.md`, ADR-0002 | T05 | side-layout unit/E2E tests |
| LAYOUT-003 | `frontend-design.md` | T05 | side-layout visual tests |
| LAYOUT-004 | `frontend-design.md` | T04-T06 | visual/layout tests |
| LAYOUT-005 | `frontend-design.md` | T04-T06 | collision/edge-routing tests |
| LAYOUT-006 | `frontend-design.md` | T04-T06 | layout metrics/review |
| LAYOUT-007 | `frontend-design.md` | T06 | stability fixtures/visual tests |
| LAYOUT-008 | ADR-0002, `architecture.md` | T04-T06 | pass-level layout unit tests |
| LAYOUT-009 | ADR-0002 | T14 | worker/cancellation tests |
| LAYOUT-010 | ADR-0001, ADR-0004 | T08-T10 | mutation/persistence tests |
| UI-001 | `frontend-design.md` | T02-T03, T12 | browser viewport review |
| UI-002 | `frontend-design.md` | T12 | visual regression |
| UI-003 | `frontend-design.md` | T02-T03 | component/visual tests |
| UI-004 | `frontend-design.md`, `domain-model.md` | T03 | Markdown Card tests |
| UI-005 | `frontend-design.md` | T03 | Markdown rendering tests |
| UI-006 | `frontend-design.md` | T03, T13 | browser/visual tests |
| UI-007 | `interaction-contract.md`, `frontend-design.md` | T02, T11, T13 | browser interaction tests |
| UI-008 | `interaction-contract.md` | T10, T13 | save/reload E2E tests |
| UI-009 | `frontend-design.md` | T13 | component/E2E tests |
| UI-010 | `frontend-design.md` | T15 | responsive review |
| UX-001 | `interaction-contract.md` | T11 | keyboard E2E tests |
| UX-002 | `interaction-contract.md` | T11 | input-conflict component/E2E tests |
| UX-003 | `interaction-contract.md` | T11, T13 | keyboard/search E2E tests |
| UX-004 | `domain-model.md` | T08 | undo/redo unit/E2E tests |
| MOTION-001 | `frontend-design.md` | T12 | visual/manual review |
| MOTION-002 | `frontend-design.md` | T12 | timing/visual review |
| MOTION-003 | `frontend-design.md` | T12, T15 | reduced-motion E2E/manual review |
| A11Y-001 | `frontend-design.md` | T15 | accessibility audit |
| A11Y-002 | `interaction-contract.md` | T11, T15 | keyboard/focus tests |
| A11Y-003 | `frontend-design.md` | T02, T15 | accessible-name component/browser review; later audit |
| A11Y-004 | `frontend-design.md` | T02, T12, T15 | non-color selection component/visual review; later audit |
| A11Y-005 | `frontend-design.md` | T12, T15 | reduced-motion tests |
| A11Y-006 | `frontend-design.md` | T02, T12, T15 | focus-ring review; later audit |
| PERF-001 | `test-strategy.md` | T14 | benchmark fixtures |
| PERF-002 | `test-strategy.md` | T14 | benchmark suite |
| PERF-003 | `architecture.md` | T14 | profiling/component tests |
| PERF-004 | `architecture.md` | T14 | large-graph E2E/profile |
| PERF-005 | ADR-0002 | T14 | worker/cancellation tests |
| API-001 | `api-contract.md` | T09 | API tests |
| API-002 | ADR-0004, `api-contract.md` | T09-T10 | persistence/API tests |
| API-003 | `api-contract.md` | T09-T10 | revision conflict tests |
| API-004 | `api-contract.md` | T09 | validation/API tests |
| API-005 | ADR-0002, `api-contract.md` | T09 | route/schema review |
| API-006 | `architecture.md` | T09-T10 | recovery tests/design review |
| API-007 | `architecture.md` | T09 | dependency/build checks |
| API-008 | `architecture.md` | all frontend stages | architecture/code review |
| TEST-001 | `test-strategy.md` | T00-T16 | test-plan review |
| TEST-002 | `test-strategy.md` | T01 | fixture/unit-test inventory |
| TEST-003 | `test-strategy.md` | T10+ | Playwright vertical slice |
| TEST-004 | `test-strategy.md` | T12+ | visual-regression CI |
| TEST-005 | `.github/workflows/ci.yml` | T00-T16 | GitHub Actions required checks |
| TEST-006 | `AGENTS.md`, `test-strategy.md` | T01-T16 | QA review/search for skips |
| TEST-007 | `frontend-design.md`, `test-strategy.md` | UI stages | real-browser screenshot review |
| TEST-008 | `tasks.md` | T00-T16 | stage gate checklist |
| GIT-001 | `git-workflow.md` | T00-T16 | branch/PR review |
| GIT-002 | `git-workflow.md` | T00-T16 | branch/PR review |
| GIT-003 | `git-workflow.md` | T00-T16 | branch naming review |
| GIT-004 | `git-workflow.md` | T00-T16 | commit history review |
| GIT-005 | `git-workflow.md` | T00-T16 | commit history review |
| GIT-006 | `git-workflow.md` | T00-T16 | PR template/review |
| GIT-007 | `git-workflow.md` | T00-T16 | CI status |
| GIT-008 | `git-workflow.md` | T00-T16 | merge method review |
| PROCESS-001 | `AGENTS.md` | T00-T16 | QA/spec conflict review |
| PROCESS-002 | `plan.md` | T00-T16 | stage-order review |
| PROCESS-003 | `AGENTS.md`, `tasks.md` | T00-T16 | task-start checklist |
| PROCESS-004 | `AGENTS.md`, ADR process | T00-T16 | scope/ADR review |
| PROCESS-005 | `tasks.md` | T00-T16 | gate status |
| PROCESS-006 | `AGENTS.md`, `test-strategy.md` | T01-T16 | QA review |
| PROCESS-007 | `tasks.md`, `plan.md` | T00-T16 | documentation diff review |
| PROCESS-008 | T00 contracts | T00 | T00 QA |
| PROCESS-009 | `product-spec.md` | T00-T16 | scope review |

## T01 Requirement Evidence

| Requirement / AC | Implementation Evidence | Verification Evidence |
| --- | --- | --- |
| MD-001 / AC-T01-01 | `parseMarkdown.ts` uses unified + remark-parse + remark-gfm; `extractSections.ts` consumes mdast headings | parser code review; `parseMarkdown.test.ts` |
| MD-002 / AC-T01-02 | mdast `heading.depth` is copied unchanged | ATX H1-H6 test |
| MD-009 / AC-T01-03 | Setext is delegated to remark parsing | `setext-headings.md`; H1/H2 test |
| MD-010 / AC-T01-04 | no ASCII/title-specific hierarchy logic | `chinese-headings.md`; Chinese depth/title test |
| MD-007 / AC-T01-05 | every structural section has distinct mapping key and opaque ID | duplicate-heading ID test |
| MD-008 / AC-T01-06 | only mdast Heading nodes are sections | fenced-code fixture and Local Body/parser tests |
| MD-003, MD-014 / AC-T01-07 | stack pops until nearest prior smaller depth | `skipped-depth.md`; hierarchy test |
| MD-011 / AC-T01-08 | no-body interval yields empty string without dropping section | `empty-section.md`; empty-body test |
| MD-005 / AC-T01-09 | AST nodes before first heading are sliced into `preamble` | `preamble.md`; preamble test |
| MD-004 / AC-T01-10 | Local Body stops at next root heading and is source-sliced via offsets | `local-body.md`; exact body/exclusion tests |
| MD-014 / AC-T01-11 | synthetic document root has no required heading depth | `mixed-top-level-depth.md`; root structure test |
| MD-006 / AC-T01-12 | Node ID factory defaults to UUID; title is not identity | title-decoupling test; ADR-0003 |
| MD-006 / AC-T01-13 | `StableNodeIdMapping.byProjectionKey` supports prior-ID reuse | title/body re-projection test whose fallback factory throws |
| MD-012 / AC-T01-14 | remark-gfm enabled; original Local Body source retained | task-list/strikethrough/autolink/table assertions plus GFM AST test |
| MD-013 / AC-T01-15 | unist/mdast positions copied and offsets used for slicing | source-location unit test |
| TEST-002 / AC-T01-16 | 3 Markdown-core test files | GitHub Actions: 20/20 tests PASS |
| TEST-005 / AC-T01-17..19 | strict TypeScript, ESLint, declaration build | GitHub Actions typecheck/lint/build PASS |
| PROCESS-005, PROCESS-009 / AC-T01-20 | branch diff contains Markdown core/config/fixtures/docs only | `docs/qa/t01-review.md` scope review PASS |

## T02 Requirement / Acceptance Evidence

| Requirement / AC | Implementation Evidence | Verification Evidence |
| --- | --- | --- |
| ARCH-001, GRAPH-001 / AC-T02-03,08,09 | `core/graph` defines `VisualGraph` + `VisualHierarchyEdge`; no domain `FlowEdge` reuse | graph/adapter tests; `docs/visual-graph-projection.md`; QA architecture audit |
| ARCH-006 / AC-T02-03,19,20 | pure `projectSectionTree()` and `createDebugPlacement()` | deterministic/purity unit tests; architecture boundary check |
| GRAPH-002 / AC-T02-05,06,07 | Visual Node copies stable Section `nodeId`; one per real Section | projection + adapter identity tests; duplicate fixture/browser QA |
| GRAPH-001 / AC-T02-04,10,11 | projection starts from Synthetic Root children and creates edges only with real parents | root/top-level/skipped-depth unit tests; browser root-absence check |
| ARCH-001 / AC-T02-12..14 | `core/markdown` -> `core/graph` -> `adapters/react-flow` -> UI | `scripts/check-boundaries.mjs`; CI architecture PASS |
| UI-003 / AC-T02-15,16 | custom `HeadingNode` registered through `nodeTypes`; H1-H6 classes/tokens | component tests; Chrome screenshots cover H1-H6 |
| UI-007 / AC-T02-17,18,21 | React Flow basic pan/zoom/select/drag, no persistence writes | real Chrome CDP selection/drag/reload/zoom/pan PASS |
| TEST-007 / AC-T02-17..22,30 | system-Chrome QA plus committed screenshots | `docs/screenshots/t02-*.png`; `docs/qa/t02-review.md` |
| TEST-005 / AC-T02-23..27 | reproducible lockfile and stage CI | `npm ci`, 37/37 tests, lint, typecheck, Vite build PASS |
| TEST-006 / AC-T02-23,24,30 | tests remain active and core projection is not mocked | architecture script rejects `.skip`/`.only`; QA failure/root-cause record |
| PROCESS-005, PROCESS-009 / AC-T02-28,29 | deferred features excluded from source and documented | boundary check rejects ELK/Dagre/`childrenPlacement`; scope diff/QA PASS |

## T02 Gate Evidence

- Projection boundary: `docs/visual-graph-projection.md`.
- Independent review: `docs/qa/t02-review.md`.
- Task acceptance state: `tasks.md`.
- CI: `.github/workflows/ci.yml` executes `npm ci`, architecture boundary checks, lint, typecheck, tests, build, system-Chrome QA, and screenshot artifact upload.
- Final implementation-head run `34111883942`: all checks PASS, Vitest 37/37.
- Browser screenshots are committed under `docs/screenshots/` for PR/manual review.
- The final documentation/screenshot branch head must repeat the complete gate before PR creation.

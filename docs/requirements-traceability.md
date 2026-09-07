# Requirement Traceability Matrix

This matrix maps product requirements to the contracts, implementation stages, and primary verification gates that own them. The detailed requirement wording lives in `docs/product-spec.md`.

| Requirement | Primary Contract / Decision | Stage(s) | Primary Verification |
| --- | --- | --- | --- |
| ARCH-001 | `architecture.md`, ADR-0001 | T00, T02, T07 | architecture review; graph/domain tests |
| ARCH-002 | `architecture.md`, ADR-0002 | T00, T04-T06 | architecture review; layout tests |
| ARCH-003 | `architecture.md`, ADR-0004 | T00, T09-T10 | persistence/API tests |
| ARCH-004 | `architecture.md` | T00, T09 | repository structure review; builds |
| ARCH-005 | `api-contract.md` | T00, T09-T10 | OpenAPI/schema checks |
| ARCH-006 | `architecture.md` | T01, T04-T06 | deterministic unit tests |
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
| GRAPH-001 | ADR-0001, `domain-model.md` | T02, T07 | graph projection tests |
| GRAPH-002 | `domain-model.md` | T01-T03, T08 | type/unit tests |
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
| UI-007 | `interaction-contract.md` | T02, T11, T13 | E2E interaction tests |
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
| A11Y-003 | `frontend-design.md` | T15 | accessibility audit |
| A11Y-004 | `frontend-design.md` | T12, T15 | visual/accessibility audit |
| A11Y-005 | `frontend-design.md` | T12, T15 | reduced-motion tests |
| A11Y-006 | `frontend-design.md` | T12, T15 | focus-ring visual review |
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
| TEST-007 | `frontend-design.md`, `test-strategy.md` | UI stages | screenshot review |
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

## T01 Acceptance Trace

T01 acceptance criteria AC-T01-01 through AC-T01-20 are tracked in `tasks.md`. Their implementation evidence is expected to live under the Markdown core source/tests and `fixtures/markdown/` on `feat/t01-markdown-section-tree`.
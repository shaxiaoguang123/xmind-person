# T00 QA Review

- Task: T00 — Project Constitution + Product Contract
- Branch: `docs/t00-project-constitution`
- PR: #1
- Result: **PASS**

## Review Checklist

### 1. Required artifacts

PASS.

Present in the T00 PR:

- `AGENTS.md`
- `README.md`
- `docs/product-spec.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/frontend-design.md`
- `docs/interaction-contract.md`
- `docs/api-contract.md`
- `docs/test-strategy.md`
- `docs/git-workflow.md`
- `docs/requirements-traceability.md`
- `docs/adr/README.md`
- `docs/adr/TEMPLATE.md`
- ADR-0001 through ADR-0004
- `plan.md`
- `tasks.md`
- `fixtures/markdown/basic.md`
- `.github/workflows/ci.yml`

### 2. Project invariants

PASS.

`AGENTS.md` records the non-negotiable rules for remark/mdast parsing, hierarchy/graph/layout separation, Markdown immutability under layout, semantic heading depth, Level Theme and independent style override, independent detail placement, collapse visibility, stable non-title-derived IDs, Local Body-only Markdown cards, sidecar metadata, pure/deterministic core, frontend layout ownership, no backend layout API, and stage gates.

### 3. Architecture consistency

PASS.

No reviewed contract equates Markdown hierarchy with Flow Edge. Layout remains frontend-owned. Flow Metadata is sidecar state. Frontend/database direct access is prohibited. T01 is explicitly a pure Markdown Core stage.

### 4. Requirement traceability

PASS.

`docs/product-spec.md` contains requirement families for architecture, Markdown, graph, layout, UI/UX/motion, accessibility, performance, API, testing, Git, and process. `docs/requirements-traceability.md` maps each committed Requirement ID to its contract/decision, implementation stage, and primary verification.

### 5. Core ADR coverage

PASS.

- ADR-0001: Markdown Hierarchy != Flow Graph.
- ADR-0002: Frontend owns automatic layout.
- ADR-0003: Stable Node ID is independent of heading text.
- ADR-0004: `.md` + `.flow.json` sidecar persistence.

### 6. Scope leakage

PASS.

The PR changed contracts, documentation, one Markdown fixture, repository ignore rules, and CI skeleton only. No React Flow, ELK, Canvas, component implementation, backend API, database, login, animation, graph editor, or other business feature was introduced.

### 7. CI skeleton

PASS.

`.github/workflows/ci.yml` is configured for pull requests and pushes to `main`. The T00 placeholder job checks out the repository and executes successfully. T01 is responsible for replacing/expanding the placeholder with install/lint/typecheck/unit/build gates needed by Markdown Core.

### 8. Git state / merge readiness

PASS for T00 branch content.

All connector mutations are committed directly to the task branch; there is no uncommitted connector-side working tree. PR #1 is expected to be merged only after the workflow run for the final head succeeds and GitHub reports the PR mergeable/clean. Squash merge is preferred.

## Conflict Review

No unresolved logical conflict was found in the committed T00 contracts. The key ambiguity around stable identity is explicitly bounded: T01 guarantees ID reuse when prior mapping exists, while intelligent reconciliation after arbitrary external large-scale Markdown restructuring is deferred.

## T00 Gate

**PASS**

T01 may begin only after PR #1 completes the normal merge workflow and the resulting `main` becomes the base for `feat/t01-markdown-section-tree`.
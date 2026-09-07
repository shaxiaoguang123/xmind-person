# Git Workflow

## Model

Use GitHub Flow. `main` is intended to remain runnable and should contain only reviewed, gate-passing stage work.

Direct feature development on `main` is forbidden. Each task uses a focused branch and a PR.

## Branch Naming

Examples:

```text
feat/t01-markdown-parser
feat/t04-side-layout
fix/layout-stability
refactor/graph-model
test/parser-fixtures
docs/architecture
```

The current stage may use a more explicit variant such as `feat/t01-markdown-section-tree` when it better describes the task.

One branch should solve one clear task. Unrelated opportunistic refactors belong in another task/branch or an ADR/Tech Debt note.

## Commits

Use Conventional Commits, for example:

```text
feat(parser): support setext headings
feat(layout): add right-side detail layout
fix(graph): preserve stable node ids
test(parser): add duplicate heading fixture
docs(spec): define collapse semantics
refactor(layout): extract collision resolver
```

Commits should be atomic, reviewable, reversible, and truthfully describe the change. Avoid meaningless messages such as `update`, `changes`, `fix stuff`, `final`, or `test123`.

## Task Start Protocol

Before coding:

1. Read `AGENTS.md`.
2. Read relevant Requirement IDs in `docs/product-spec.md`.
3. Read `docs/architecture.md` and relevant ADRs/domain contract.
4. Inspect relevant existing code.
5. Confirm task Acceptance Criteria in `tasks.md`.
6. Confirm current repository/branch state.
7. Create/use the task-scoped branch from the latest accepted `main`.

## Pull Request Contract

Each stage PR includes:

- Task ID.
- Problem.
- Requirement IDs.
- Architecture/decisions used.
- Implementation summary.
- Files changed.
- Acceptance Criteria with status.
- Tests/checks executed.
- Screenshots/GIF for UI changes; `N/A` for non-UI stages.
- Known limitations.
- Deferred work.
- Regression risk.
- Git/CI status.

A task is not complete while required CI is failing. Stage-appropriate checks expand over time; tests must not be weakened to obtain green CI.

## Merge

Squash merge is recommended for stage PR completion. The PR must target `main`, be mergeable, and have required stage checks satisfied. If repository permissions or protection rules prevent merge, leave the PR Ready for Merge and report the blocker rather than bypassing the workflow.

## T00/T01 Boundary

T00 work remains only in the T00 documentation branch/PR until merged. T01 branch creation occurs only after T00 PASS/merge and starts from the resulting current `main`. T01 changes must not be appended to the T00 branch.
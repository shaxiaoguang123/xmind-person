# AGENTS.md

This file is the repository constitution for human and AI contributors. It defines durable repository rules, delivery gates, and automation behavior. Prompt history and implementation convenience are not sources of truth.

## 1. Authority and Sources of Truth

The repository separates **intent authority** from **runtime authority** so that a stale status sentence cannot override the actual GitHub state.

### Intent authority

When deciding what the product or a stage is allowed to do, use this order:

1. this `AGENTS.md` constitution;
2. `docs/product-spec.md`, accepted ADRs, and committed architecture/domain/interaction/API/test/Git contracts;
3. `plan.md` for stage order and dependencies;
4. `tasks.md` for the current stage contract and frozen Acceptance Criteria;
5. prompt/session history only as non-authoritative context.

An explicit maintainer request may initiate a contract change, but if it changes committed product semantics, architecture, scope, or Acceptance Criteria, update the governing repository contract before implementing the changed behavior.

### Runtime authority

When deciding what has actually happened, use current GitHub state:

1. branch/ref and commit SHA;
2. open PR state, review threads, and review verdicts;
3. GitHub Actions/check status for the relevant head SHA;
4. merge state on `main`;
5. `tasks.md`, `plan.md`, and `docs/qa/*` as synchronized summaries/evidence.

Do not create a second mutable runtime source such as `STATE.md`. If documentation disagrees with GitHub, do not guess: reconcile the documentation or mark the task `BLOCKED` before new feature work.

## 2. Project Invariants

1. **Markdown parsing** — Production Markdown parsing MUST use `unified` / `remark-parse` / mdast. Regex-based heading parsing is forbidden.
2. **Model separation** — Markdown hierarchy and Flow Graph are different models. A Markdown parent-child relationship is not automatically a Flow Edge.
3. **Layout isolation** — Layout operations MUST NOT mutate Markdown Source.
4. **Semantic depth** — Heading Depth is semantic. Visual styles/themes MUST NOT alter `headingDepth`.
5. **Level Theme** — Headings at the same semantic depth share a default Level Theme.
6. **Independent visual override** — An individual Markdown Card may hold an independent visual override without changing semantic depth.
7. **Independent detail placement** — Detail-child expansion direction is independent from global `graphDirection`.
8. **Collapse semantics** — Collapse changes visibility only. It MUST NOT delete descendants.
9. **Stable identity** — Node IDs MUST remain stable across title/body/style/position edits when prior identity mapping is available.
10. **No title-derived identity** — `id = heading text`, title slug, title hash, or equivalent title-derived permanent identity is forbidden.
11. **Local Markdown body** — A section Markdown Card displays only Heading + Local Body. It MUST NOT duplicate descendant-heading bodies into the parent card.
12. **Sidecar persistence** — Flow Metadata MUST NOT be written into Markdown body content. Persist as `document.md` + `document.flow.json` (or an equivalent storage representation preserving this separation).
13. **Pure/deterministic core** — Layout and domain transformation functions SHOULD be pure and deterministic where practical.
14. **Frontend ownership** — Frontend owns graph rendering, viewport, interactive layout, and animation.
15. **No backend layout API** — Backend MUST NOT run ELK automatic layout and MUST NOT provide a layout API.
16. **Stage gates** — A stage may advance only after its frozen Acceptance Criteria, stage-relevant tests/checks, documentation, QA gate, PR gate, and merge gate pass.

## 3. Additional Domain Constraints

- Duplicate headings are valid and must remain distinct sections/identities.
- Valid skipped heading depths must not be repaired or normalized.
- Section source positions should come from mdast when available rather than custom line counting.
- Flow Edge endpoints reference stable Node IDs and do not define Markdown hierarchy.
- Frontend must not access the database directly.
- OpenAPI is the transport-contract source; avoid handwritten drifting frontend/backend DTO pairs.

## 4. Stage State Model

Every stage uses exactly one of these states in `tasks.md` and `plan.md`:

- `BLOCKED` — a dependency or required decision is unresolved; no implementation is authorized.
- `READY` — dependencies are `DONE` and the Task Definition Gate is complete; implementation may begin.
- `IN_PROGRESS` — implementation is occurring on the task-scoped branch.
- `REVIEW` — implementation evidence is complete enough for PR/CI/QA review; fixes may still be required.
- `MERGE_READY` — frozen Acceptance Criteria, required checks, QA, and blocking reviews all pass on the current PR head.
- `DONE` — the accepted stage PR is merged into `main` and the mainline state is synchronized.

`PASS` may describe a specific QA/check result, but it is not a stage state. **QA PASS is not DONE.** A stage cannot authorize the next stage until it is `DONE`.

Only one product stage may be active (`READY`, `IN_PROGRESS`, `REVIEW`, or `MERGE_READY`) at a time unless an explicit ADR/maintainer decision authorizes parallel independent work.

## 5. Task Definition Gate and Acceptance-Criteria Freeze

Before product implementation begins, the current stage section in `tasks.md` MUST contain:

- Task/Stage ID and scope;
- primary Requirement IDs/contracts;
- explicit in-scope and out-of-scope boundaries;
- testable Acceptance Criteria;
- required verification/evidence;
- task branch and accepted base;
- initial stage state `READY`.

Acceptance Criteria are frozen when implementation starts. They MUST NOT be silently rewritten, removed, weakened, or marked satisfied merely to fit the implementation.

If a genuine requirement change is needed after the freeze, add a `Contract Change` record to the current task with:

- reason;
- affected Requirement/AC IDs;
- compatibility/scope impact;
- required contract/document changes;
- whether existing implementation or evidence must be invalidated/re-run.

The change must be reviewed before dependent implementation proceeds.

## 6. Task Start Protocol

Before implementing an atomic objective:

1. Read this file.
2. Read `plan.md` and identify the single current stage.
3. Read that stage in `tasks.md` and confirm its state and frozen Acceptance Criteria.
4. Read relevant Requirement IDs in `docs/product-spec.md`.
5. Read `docs/architecture.md`, `docs/domain-model.md`, relevant ADRs, and stage-relevant contracts.
6. Inspect the relevant existing code and tests.
7. Re-read current GitHub branch/head, PR, review, and CI state.
8. Confirm the accepted base and use the task-scoped branch.
9. Select one bounded objective for this run.

Do not implement before these conditions are understood.

## 7. Scheduled Automation Roles

Scheduled automation uses two separated roles. The role boundary is a safety and quality boundary, not merely a naming convention.

### Project Advancer (write role)

The Advancer may modify the current task branch, tests, and synchronized task/contract documentation within the current stage.

For every run, use this priority order:

1. unresolved blocking review findings on the current PR;
2. failing required CI/checks on the current head;
3. one unmet current-stage Acceptance Criterion or one small prerequisite for it;
4. PR preparation/update when implementation evidence is complete.

Rules:

- One scheduled run handles **at most one atomic objective**.
- Never cross a stage boundary in the same run.
- Never start a future stage while the current stage is not `DONE`.
- Never implement directly on `main`.
- Do not self-approve or merge the stage PR.
- Do not perform unrelated refactors opportunistically.
- If no safe, bounded action exists, report `NO_ACTION` or `BLOCKED` rather than inventing work.

### Project Auditor (review role)

The Auditor independently checks the current stage against the constitution, frozen task contract, code/diff, tests, current-head CI, browser evidence where required, and GitHub review state.

The Auditor may write:

- PR review comments/verdicts;
- `docs/qa/tXX-review.md` or an equivalent stage QA artifact;
- narrowly scoped audit documentation.

The Auditor MUST NOT:

- modify production/business implementation to fix its own findings;
- silently change Acceptance Criteria or product contracts;
- start the next stage;
- mark a stage `DONE` before merge.

Allowed audit verdicts are:

- `PASS`;
- `PASS_WITH_FIXES`;
- `CHANGES_REQUESTED`;
- `BLOCKED`;
- `FAIL`.

Only `PASS` with all delivery gates satisfied may support `MERGE_READY`.

## 8. Concurrency and Staleness Control

Before every write, re-read the branch head and relevant PR/check state. Evidence is valid only for the commit SHA it verified.

- If the branch head changed since analysis began, re-evaluate before writing.
- If a newer commit invalidates prior CI/QA evidence, do not reuse the old evidence as final proof.
- Avoid simultaneous writers on the same task branch.
- Do not create a new feature branch while an unresolved current-stage PR exists unless explicitly required for an isolated fix.
- Prefer repairing the existing current-stage branch/PR over opening parallel competing implementations.
- A merge/rebase or contract change requires affected checks/evidence to be re-evaluated.

## 9. Scope Control

- Do not rewrite the whole project for a local task.
- Do not perform broad unrelated refactors as a side effect.
- Record architectural problems as ADR proposals or Tech Debt when they are outside the current task.
- Do not silently change product semantics to fit existing code.
- Early stages must not introduce authentication, multi-user collaboration, AI product features, template marketplaces, plugin systems, real-time collaboration, or a full mobile editor.

## 10. Test and Evidence Integrity

- Do not delete tests to make a gate pass.
- Do not add `.skip`, `.only`, or equivalent bypasses to avoid a failure.
- Do not weaken assertions merely to conform to a defect.
- Do not mock around core parser/graph/layout logic when the real logic can be tested.
- Diagnose root cause, fix it, and rerun relevant checks.
- Visual acceptance must use real browser evidence once UI stages exist; DOM/unit tests alone are insufficient.
- A check result from an older head SHA is historical evidence, not a current-head delivery gate.
- Required evidence must be reproducible or traceable to committed tests/scripts, GitHub Actions, or committed QA artifacts.

## 11. Change Discipline and Handoff

Each implementation stage requires synchronized code, relevant specification/contract updates, `tasks.md` state, tests, and Conventional Commit history. If code and specification conflict, surface the conflict before changing either behavior or requirement.

At the end of an automated run, leave the repository in a resumable state:

- commit only coherent scoped changes;
- record what Acceptance Criterion or review finding was addressed;
- record tests/checks executed and their result;
- leave unresolved blockers explicit;
- do not claim completion beyond the evidence available on the current head.

GitHub branch/PR/check state is the runtime handoff. Do not create a competing mutable handoff/state file.

## 12. Merge and Stage-Advance Gate

A stage may become `MERGE_READY` only when all of the following are true on the current PR head:

- frozen Acceptance Criteria are satisfied;
- required specification/contract documentation is synchronized;
- required lint/typecheck/build/tests pass;
- stage-relevant browser/visual evidence passes when applicable;
- independent QA verdict is `PASS`;
- no unresolved blocking review thread remains;
- PR targets the accepted base and is mergeable.

A stage becomes `DONE` only after the accepted PR is merged into `main` and the mainline `plan.md` / `tasks.md` state is synchronized. Only then may the next stage become `READY`.

## 13. Mandatory Block Conditions

Stop new feature implementation and report `BLOCKED` when any of these applies:

- governing contracts materially conflict;
- the current stage has no frozen Acceptance Criteria;
- required base/branch identity is ambiguous;
- the branch head changed and the planned patch has not been revalidated;
- required CI infrastructure is unavailable and the missing evidence is necessary for the gate;
- a blocking review finding requires a product/architecture decision;
- satisfying the task would require unauthorized future-stage scope.

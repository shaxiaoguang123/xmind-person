# AGENTS.md

This file is the repository constitution for human and AI contributors. Specification and committed contracts are the source of truth; prompt history and implementation convenience are not.

## Project Invariants

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
16. **Stage gates** — A stage may advance only after its acceptance criteria, stage-relevant tests/checks, documentation, and QA gate pass.

## Additional Domain Constraints

- Duplicate headings are valid and must remain distinct sections/identities.
- Valid skipped heading depths must not be repaired or normalized.
- Section source positions should come from mdast when available rather than custom line counting.
- Flow Edge endpoints reference stable Node IDs and do not define Markdown hierarchy.
- Frontend must not access the database directly.
- OpenAPI is the transport-contract source; avoid handwritten drifting frontend/backend DTO pairs.

## Task Start Protocol

Before implementing a task:

1. Read this file.
2. Read relevant Requirement IDs in `docs/product-spec.md`.
3. Read `docs/architecture.md`, `docs/domain-model.md`, and relevant ADRs/contracts.
4. Inspect relevant existing code.
5. Confirm Acceptance Criteria in `tasks.md`.
6. Confirm repository/branch status.
7. Create/use the task-scoped branch from the accepted base.

Do not implement before those conditions are understood.

## Scope Control

- Do not rewrite the whole project for a local task.
- Do not perform broad unrelated refactors as a side effect.
- Record architectural problems as ADR proposals or Tech Debt when they are outside the current task.
- Do not silently change product semantics to fit existing code.
- Early stages must not introduce authentication, multi-user collaboration, AI features, template marketplaces, plugin systems, real-time collaboration, or a full mobile editor.

## Test Integrity

- Do not delete tests to make a gate pass.
- Do not add `.skip`, `.only`, or equivalent bypasses to avoid a failure.
- Do not weaken assertions merely to conform to a defect.
- Do not mock around core parser/graph/layout logic when the real logic can be tested.
- Diagnose root cause, fix it, and rerun relevant checks.
- Visual acceptance must use real browser evidence once UI stages exist; DOM/unit tests alone are insufficient.

## Change Discipline

Each implementation stage requires synchronized code, relevant specification/contract updates, `tasks.md` status, tests, and Conventional Commit history. If code and specification conflict, surface the conflict before changing either behavior or requirement.
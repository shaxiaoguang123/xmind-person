# Delivery Plan

Specification and stage gates are authoritative. A stage begins only after the previous stage is PASS.

| Stage | Scope | Gate |
| --- | --- | --- |
| T00 | Project Constitution + Product Contract | **PASS** |
| T01 | Markdown -> mdast -> Section Tree -> Stable Node ID mapping | Next |
| T02 | Section Tree -> Basic React Flow Graph | Blocked by T01 |
| T03 | Heading Card / Markdown Card | Blocked by T02 |
| T04 | Main Flow Auto Layout | Blocked by T03 |
| T05 | LEFT / RIGHT Side Detail Multi-pass Layout | Blocked by T04 |
| T06 | Collapse / Expand + Layout Stability | Blocked by T05 |
| T07 | Independent Flow DAG Edge | Blocked by T06 |
| T08 | Editing + Stable ID + Undo / Redo | Blocked by T07 |
| T09 | Backend Project / Document Persistence | Blocked by T08 |
| T10 | Save + Reload + Revision | Blocked by T09 |
| T11 | Keyboard-first Editor UX | Blocked by T10 |
| T12 | Visual Polish + Motion | Blocked by T11 |
| T13 | Search / Focus Mode / MiniMap | Blocked by T12 |
| T14 | 100 / 500 / 1000 Node Performance | Blocked by T13 |
| T15 | Accessibility + Browser Compatibility | Blocked by T14 |
| T16 | Release Hardening | Blocked by T15 |

## T00 Closure

T00 owns only project contracts and delivery infrastructure. Its closure requires:

- `AGENTS.md` project invariants.
- Product requirement catalog and traceability matrix.
- Architecture, domain, frontend design, interaction, API, test, and Git contracts.
- ADR directory, ADR template, and accepted core decisions.
- `plan.md` and `tasks.md` stage gates.
- Markdown fixture directory.
- CI skeleton that can execute on pull requests.
- Independent QA review confirming no business implementation was introduced.

T00 is marked PASS after these artifacts are present and internally consistent.

## T01 Scope

T01 implements only the Markdown domain/core pipeline:

```text
Markdown Source
  -> unified / remark-parse / remark-gfm
  -> mdast
  -> Section Extraction
  -> Section Tree
  -> Stable Node ID Mapping
```

T01 explicitly excludes React Flow, ELK, Canvas, node UI, toolbars, inspectors, backend, database, authentication, animation, flow-edge editing, and automatic layout.

T01 stage details and AC-T01-01 through AC-T01-20 are tracked in `tasks.md`.

## Scope Control

Out-of-stage work is recorded as future task, ADR, or Tech Debt. It is not implemented opportunistically.
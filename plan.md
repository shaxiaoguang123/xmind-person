# Delivery Plan

This file defines the delivery roadmap and stage dependency graph.

Detailed implementation evidence belongs in `docs/qa/tXX-review.md`. Runtime state belongs to GitHub branch, PR, review, CI, and merge status. This file must not become a second mutable status database.

## Stage Dependency Roadmap

| Stage | Scope | Depends On | Gate |
| --- | --- | --- | --- |
| T00 | Project Constitution + Product Contract | - | DONE |
| T01 | Markdown AST -> Section Tree -> Stable Node ID | T00 | DONE |
| T02 | Section Tree -> Basic React Flow Graph | T01 | DONE |
| T03 | Heading Card / Markdown Card | T02 | IN_PROGRESS |
| T04 | Main Flow Auto Layout | T03 | BLOCKED |
| T05 | LEFT / RIGHT Side Detail Multi-pass Layout | T04 | BLOCKED |
| T06 | Collapse / Expand + Layout Stability | T05 | BLOCKED |
| T07 | Independent Flow DAG Edge | T06 | BLOCKED |
| T08 | Editing + Stable ID + Undo / Redo | T07 | BLOCKED |
| T09 | Backend Project / Document Persistence | T08 | BLOCKED |
| T10 | Save + Reload + Revision | T09 | BLOCKED |
| T11 | Keyboard-first Editor UX | T10 | BLOCKED |
| T12 | Visual Polish + Motion | T11 | BLOCKED |
| T13 | Search / Focus Mode / MiniMap | T12 | BLOCKED |
| T14 | 100 / 500 / 1000 Node Performance | T13 | BLOCKED |
| T15 | Accessibility + Browser Compatibility | T14 | BLOCKED |
| T16 | Release Hardening | T15 | BLOCKED |

## Stage Transition Rules

A stage transition follows:

```text
BLOCKED
  -> READY
  -> IN_PROGRESS
  -> REVIEW
  -> MERGE_READY
  -> DONE
```

Rules:

- `DONE` means the accepted PR has merged into `main`.
- QA `PASS` alone does not mean `DONE`.
- The next stage cannot become `READY` until the previous stage is `DONE`.
- Only one product stage should be active unless explicitly authorized.

## Evidence Location

Stage evidence is stored separately:

```text
T00 -> docs/qa/t00-review.md
T01 -> docs/qa/t01-review.md
T02 -> docs/qa/t02-review.md
T03 -> docs/qa/t03-review.md
...
```

## Scope Control

Each stage must remain within its task contract. Future-stage ideas are recorded as future tasks, ADRs, or Tech Debt rather than being implemented opportunistically.

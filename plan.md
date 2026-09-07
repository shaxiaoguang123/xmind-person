# Delivery Plan

Specification and stage gates are authoritative. A stage begins only after the previous stage is PASS.

| Stage | Scope | Gate |
| --- | --- | --- |
| T00 | Project Constitution + Product Contract | **PASS** |
| T01 | Markdown -> mdast -> Section Tree -> Stable Node ID mapping | **PASS** |
| T02 | Section Tree -> Basic React Flow Graph | Recommended next; not started |
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

T00 owns only project contracts and delivery infrastructure. It is complete and merged to `main` through PR #1.

## T01 Scope and Closure

T01 implements only the Markdown domain/core pipeline:

```text
Markdown Source
  -> unified / remark-parse / remark-gfm
  -> mdast
  -> Section Extraction
  -> Section Tree
  -> Stable Node ID Mapping
```

Implemented under `apps/web/src/core/markdown/` with real Markdown fixtures, strict TypeScript, Vitest, ESLint, and stage CI.

T01 explicitly excludes React Flow, ELK, Canvas, node UI, toolbars, inspectors, backend, database, authentication, animation, flow-edge editing, and automatic layout.

Gate evidence:

- parser/section/tree/stable-ID implementation complete;
- required fixture coverage complete;
- 20/20 T01 unit tests PASS on the implementation head;
- lint PASS;
- typecheck PASS;
- build PASS;
- independent QA PASS in `docs/qa/t01-review.md`;
- T01 requirements/semantics synchronized to documentation.

A T01 PR is created only after the final documentation-synchronized branch head repeats the CI gate successfully. Passing T01 does not authorize automatic T02 implementation in the same branch.

## Recommended T02 Boundary

The next task may consume the stable Section Tree and project it into a **basic** React Flow graph. T02 should not introduce ELK auto-layout, side-detail multi-pass layout, polished Markdown Cards, backend persistence, or unrelated later-stage features.

## Scope Control

Out-of-stage work is recorded as future task, ADR, or Tech Debt. It is not implemented opportunistically.
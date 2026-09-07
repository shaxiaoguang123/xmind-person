# Delivery Plan

Specification and stage gates are authoritative. A stage begins only after the previous stage is PASS and normally merged through its task PR.

| Stage | Scope | Gate |
| --- | --- | --- |
| T00 | Project Constitution + Product Contract | **PASS** |
| T01 | Markdown -> mdast -> Section Tree -> Stable Node ID mapping | **PASS** |
| T02 | Section Tree -> Basic React Flow Graph | **PASS** |
| T03 | Heading Card / Markdown Card | Next after normal T02 PR completion |
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

## T01 Closure

T01 implemented the pure Markdown domain/core pipeline and is complete and squash-merged to `main` through PR #2.

T02 was created only after that merge from the resulting `main` commit.

## T02 Scope and Closure

T02 implements only:

```text
Stable Section Tree
  -> Visual Graph Projection
  -> React Flow Adapter
  -> Basic React Flow Canvas
```

Implemented boundaries:

- pure `core/graph` Visual Graph projection;
- `VisualHierarchyEdge` rendering artifact kept separate from domain `FlowEdge`;
- stable Node ID preserved through rendering;
- Synthetic Document Root omitted from Canvas;
- deterministic temporary debug placement only;
- React/Vite/`@xyflow/react` runtime;
- custom Heading Node with H1-H6 minimal theme;
- basic pan/zoom/selection/ephemeral drag;
- real Markdown fixture integration;
- Graph/Adapter/Component tests;
- real Chrome/CDP browser QA and screenshots;
- committed npm lockfile and `npm ci` CI.

Gate evidence:

- architecture boundaries PASS;
- lint PASS;
- typecheck PASS;
- Vitest 37/37 PASS;
- Vite build PASS;
- real browser QA PASS;
- screenshot review PASS;
- independent QA PASS in `docs/qa/t02-review.md`;
- T02 requirements/acceptance state synchronized in `tasks.md` and `docs/requirements-traceability.md`.

T02 explicitly does not implement ELK/Dagre/formal auto-layout, side-detail placement, Markdown Rich Card, collapse/expand, independent FlowEdge editing, Markdown editing, toolbar/inspector, persistence/backend/authentication, or animation polish.

## Recommended T03 Boundary

After normal T02 PR completion, T03 may build the specified Heading Card / Markdown Card presentation on top of the stable Visual Graph + React Flow adapter boundary.

T03 must not pull T04 automatic layout or later persistence/edge/editor infrastructure forward.

## Scope Control

Out-of-stage work is recorded as future task, ADR, or Tech Debt. It is not implemented opportunistically.

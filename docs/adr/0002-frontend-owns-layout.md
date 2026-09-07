# ADR-0002: Frontend Owns Automatic Layout

- Status: Accepted
- Date: 2026-09-07
- Requirements: ARCH-002, LAYOUT-001, API-004
- Supersedes: N/A
- Superseded by: N/A

## Context

Automatic layout is tightly coupled to rendered node dimensions, viewport state, animation, local expand/collapse behavior, and interactive layout stability. A backend layout API would introduce round trips and duplicate browser-specific presentation state.

## Decision

The frontend owns automatic graph layout, including ELK orchestration, multi-pass main/detail composition, collision resolution, edge routing, layout cancellation, and layout transitions. The backend persists validated metadata but does not calculate coordinates and does not expose a layout endpoint.

Layout functions should be pure and deterministic where practical. Layout operations must never mutate Markdown source.

## Consequences

### Positive

- Layout reacts immediately to browser-measured geometry and interaction state.
- Backend remains presentation-agnostic.
- Deterministic layout logic is testable as pure core functions.

### Negative / Trade-offs

- Frontend performance work must handle large graphs and cancellation.
- Browser-side layout dependencies increase frontend bundle/worker complexity in later stages.

## Compliance Checks

- No backend route performs ELK or automatic layout.
- Frontend architecture places layout modules outside persistence clients.
- Layout tests verify deterministic output for stable input where applicable.
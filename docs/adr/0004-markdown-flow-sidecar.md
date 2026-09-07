# ADR-0004: Persist Flow Metadata as a Sidecar

- Status: Accepted
- Date: 2026-09-07
- Requirements: ARCH-003, API-002, GRAPH-003
- Supersedes: N/A
- Superseded by: N/A

## Context

Markdown source must remain portable and semantically clean. Viewport, manual positions, visual styles, graph edges, collapse state, and layout preferences are application metadata rather than document prose.

## Decision

Persist document content and application flow metadata separately using a sidecar pair:

- `document.md` — Markdown source.
- `document.flow.json` — versioned Flow Metadata.

Flow metadata is never injected into Markdown body text. The sidecar contains schemaVersion, graphDirection, nodes, edges, manualPositions, viewport, theme, and compatible future metadata.

## Consequences

### Positive

- Markdown remains usable outside the application.
- Presentation/graph state can evolve under an explicit schema version.
- Persistence validation can reason about metadata independently.

### Negative / Trade-offs

- Persistence must keep the pair transactionally consistent.
- File-based import/export must account for an optional/matching sidecar.

## Compliance Checks

- Markdown serializers never append flow metadata to source text.
- Backend validation treats Flow Metadata as a separate payload/model.
- Revision/persistence tests eventually verify source and sidecar consistency.
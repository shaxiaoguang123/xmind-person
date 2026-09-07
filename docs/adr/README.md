# Architecture Decision Records

ADRs capture durable decisions that constrain implementation. Specifications remain the product source of truth; ADRs explain architecture choices used to satisfy those requirements.

## Process

1. Copy `TEMPLATE.md`.
2. Allocate the next four-digit sequence.
3. Link relevant Requirement IDs.
4. Set status to Proposed while under review.
5. Change to Accepted only when the decision is approved for implementation.
6. Never silently rewrite a historical accepted decision; supersede it with a new ADR.

## Accepted ADRs

- ADR-0001 — Separate Markdown Hierarchy and Flow Graph.
- ADR-0002 — Frontend Owns Automatic Layout.
- ADR-0003 — Stable Node ID Is Independent of Heading Text.
- ADR-0004 — Persist Flow Metadata as a Sidecar.
# ADR-0001: Separate Markdown Hierarchy and Flow Graph

- Status: Accepted
- Date: 2026-09-07
- Requirements: ARCH-001, GRAPH-001, MD-002
- Supersedes: N/A
- Superseded by: N/A

## Context

Markdown headings encode document semantics. Visual flow edges encode user-authored process or knowledge relationships. Treating a Markdown parent-child relation as a Flow Edge would make layout and visual graph editing mutate document semantics implicitly and would prevent independent DAG relationships.

## Decision

Markdown hierarchy, Flow Graph, and Layout Metadata are three independent models. Section parent-child relationships are derived only from Markdown heading semantics. Flow edges are explicit graph entities. Layout metadata controls presentation only.

A projection may use Section Tree information to create initial visual nodes, but no projection may infer that every section parent-child relation is a persisted Flow Edge.

## Consequences

### Positive

- Markdown semantics remain authoritative and stable.
- Flow relationships can evolve independently.
- Layout operations cannot accidentally rewrite document structure.

### Negative / Trade-offs

- Projection logic must maintain explicit boundaries among three models.
- Tests must detect accidental coupling.

## Compliance Checks

- Domain types for Section Tree and Flow Edge are distinct.
- Tests never assert Markdown hierarchy by reading Flow Edge collections.
- Layout functions accept graph/layout inputs without mutating Markdown source.
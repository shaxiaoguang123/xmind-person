# ADR-0003: Stable Node ID Is Independent of Heading Text

- Status: Accepted
- Date: 2026-09-07
- Requirements: MD-005, GRAPH-002
- Supersedes: N/A
- Superseded by: N/A

## Context

Heading text is editable, duplicate headings are legal Markdown, and future style/layout changes must not alter node identity. IDs derived from title, slug, or title hash would break references and metadata whenever a title changes and would collide for duplicate headings.

## Decision

Every projected document section receives a stable opaque Node ID that is not derived from heading text. Initial IDs may be generated as UUIDs. Re-parsing with an existing mapping must reuse prior IDs for sections whose identity is already known.

T01 explicitly does not implement fuzzy remapping for arbitrary external Markdown edits such as large reorders, split/merge operations, or ambiguous duplicate-heading rewrites. That problem is deferred.

## Consequences

### Positive

- Title/body/style/layout edits do not inherently invalidate graph identity.
- Duplicate headings remain distinct.
- Flow metadata can safely reference Node IDs.

### Negative / Trade-offs

- A mapping layer is required between transient parse results and persistent Node IDs.
- External destructive edits need a future reconciliation strategy.

## Compliance Checks

- Production code never assigns `id = title`, a title slug, or title hash.
- Duplicate-heading tests assert distinct Node IDs.
- Re-projection tests with prior mapping assert ID reuse.
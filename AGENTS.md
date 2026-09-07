# AGENTS.md

## Project Invariants

- Markdown parsing MUST use remark/mdast. Regex heading parsing is forbidden.
- Markdown hierarchy, Flow Graph, and Layout Metadata are separate models.
- Layout changes MUST NOT mutate Markdown source.
- Heading depth is semantic and independent from visual theme.
- Same heading depth shares default Level Theme; nodes may override visuals independently.
- Detail child placement is independent from graphDirection.
- Collapse changes visibility only and never deletes descendants.
- Stable node IDs MUST NOT depend on heading text.
- Markdown cards display heading plus local body only.
- Flow metadata is stored in document.flow.json, not Markdown.
- Layout functions should be pure and deterministic where possible.
- Frontend owns rendering and layout. Backend does not provide layout APIs.
- Changes require tests and documentation updates.

## Development Protocol

Specification is the source of truth. Prompt history is not.
Tasks advance only after acceptance criteria and CI checks pass.

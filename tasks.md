# Tasks

## T00 — Project Constitution + Product Contract

**Status: PASS**

Requirements: ARCH-001..006, TEST-001, TEST-005, GIT-001..008, PROCESS-001..009 plus contract definitions for later requirement families.

### Acceptance Criteria

- [x] `AGENTS.md` defines project invariants and spec-driven delivery rules.
- [x] Product requirement catalog exists with stable Requirement IDs.
- [x] Requirement Traceability Matrix maps requirements to contracts/stages/verification.
- [x] Architecture contract defines model and frontend/backend boundaries.
- [x] Domain model contract defines Project, Document, Section Tree, Node, Flow Edge, Flow Metadata, Viewport, Revision semantics.
- [x] Frontend design contract exists.
- [x] Interaction contract exists.
- [x] API contract exists.
- [x] Test strategy exists.
- [x] Git workflow exists.
- [x] ADR directory and template exist.
- [x] ADR-0001 records Markdown Hierarchy != Flow Graph.
- [x] ADR-0002 records frontend-owned layout.
- [x] ADR-0003 records stable Node ID strategy.
- [x] ADR-0004 records `.md` + `.flow.json` sidecar persistence.
- [x] `plan.md` defines T00-T16 stage order.
- [x] `fixtures/markdown/` exists.
- [x] PR/push CI skeleton exists.
- [x] T00 QA confirms no business implementation was introduced.

### T00 QA Result

PASS. Detailed review: `docs/qa/t00-review.md`.

---

## T01 — Markdown -> AST -> Section Tree

**Status: NOT STARTED**

Branch after T00 merge: `feat/t01-markdown-section-tree`

Primary Requirements: MD-001..014, ARCH-006, TEST-002, TEST-006, TEST-008, PROCESS-003..007.

### Acceptance Criteria

- [ ] **AC-T01-01** Production Markdown parser uses remark/mdast.
- [ ] **AC-T01-02** ATX headings parse correctly.
- [ ] **AC-T01-03** Setext headings parse correctly.
- [ ] **AC-T01-04** Chinese headings parse correctly.
- [ ] **AC-T01-05** Duplicate headings remain independent and do not overwrite one another.
- [ ] **AC-T01-06** Pseudo-headings inside code fences do not enter Section Tree.
- [ ] **AC-T01-07** Skipped heading depth does not create synthetic headings.
- [ ] **AC-T01-08** Empty sections remain valid.
- [ ] **AC-T01-09** Content before first heading is preserved as preamble.
- [ ] **AC-T01-10** Section Local Body excludes child/sibling section content.
- [ ] **AC-T01-11** Synthetic Document Root supports multiple top-level sections with differing depths.
- [ ] **AC-T01-12** Stable Node ID does not depend on heading text/slug/hash.
- [ ] **AC-T01-13** Re-projection with an existing mapping can reuse stable Node IDs.
- [ ] **AC-T01-14** GFM content does not corrupt section extraction.
- [ ] **AC-T01-15** Source Position can locate original Markdown and comes from mdast positions.
- [ ] **AC-T01-16** All T01 unit tests pass.
- [ ] **AC-T01-17** Typecheck passes.
- [ ] **AC-T01-18** Lint passes.
- [ ] **AC-T01-19** Build passes.
- [ ] **AC-T01-20** No T02 UI/layout/backend implementation is introduced.

### Required Fixtures

`basic.md`, `atx-headings.md`, `setext-headings.md`, `chinese-headings.md`, `duplicate-headings.md`, `skipped-depth.md`, `code-fence-heading.md`, `empty-section.md`, `preamble.md`, `local-body.md`, `gfm.md`, `nested.md`.

### T01 Gate

Do not mark PASS until implementation QA independently verifies parser technology, hierarchy semantics, Local Body ownership, stable identity, source positions, fixture coverage, no `.skip`/`.only`, and no T02 scope leakage.

---

## Future Stages

T02-T16 remain blocked by the stage sequence in `plan.md`. Each task must map to Requirement IDs and pass stage-relevant CI/QA before the next begins.
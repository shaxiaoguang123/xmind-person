# T03 QA Review

## Architecture

T03 keeps one projected document-node architecture:

```text
DocumentNode
├── HeadingCard
└── MarkdownCard
```

`viewMode` selects the presentation. T03 does not create separate Heading and Markdown domain identities.

## Identity

The stable identity remains the same through the projection/rendering chain:

```text
DocumentSection.nodeId
= VisualNode.id
= React Flow node.id
```

Graph and adapter tests verify that changing `viewMode` does not replace the node identity. Duplicate headings can independently use different presentation modes because the mapping key is the stable Node ID rather than title text.

## Local Body

`VisualNode.localBody` is copied from the Section projection. Markdown Card renders Heading + Local Body only; descendant Section bodies are excluded. Empty Local Body remains a valid Markdown presentation.

## Markdown Rendering

Component and real-browser coverage confirms rendering for:

- paragraph;
- unordered and ordered lists;
- GFM task list;
- inline code and fenced code block;
- blockquote;
- table;
- strikethrough;
- links.

## Security

T03 uses `react-markdown` + `remark-gfm` with `skipHtml`.

Architecture/QA review confirms:

- no `rehype-raw` dependency in the presentation path;
- no `dangerouslySetInnerHTML` escape hatch;
- Raw HTML does not create executable DOM;
- an unsafe `javascript:` URL is not preserved as a dangerous `href`;
- safe external links use `target="_blank"` and `rel="noopener noreferrer"`.

## Long Content

Real Chrome Browser QA for the long-card fixture recorded:

```text
scrollHeight = 916
clientHeight = 264
scrollTopBefore = 0
scrollTopAfter = 420
```

The Canvas viewport transform was identical before and after body scrolling, demonstrating that Markdown-body scrolling is isolated from Canvas zoom/pan.

## Interaction

Implementation-head Browser QA recorded:

```text
selection PASS
focus PASS
selected outline PASS
header drag PASS
link isolation PASS
wheel isolation PASS
canvas zoom PASS
canvas pan PASS
```

Selection remains non-color-only through the structural outline; the Document Node shell remains keyboard focusable with a visible focus indicator.

## Browser Evidence

Verified implementation-head GitHub Actions run: `34117231444`, head `1cc083d28dae328f78ba9c4817627fbaa72545f2`.

That run passed `npm ci`, architecture boundaries, lint, typecheck, 7 Vitest files / 45 tests, Vite build, real Chrome Browser QA, and evidence upload.

Repository screenshot evidence:

- `docs/screenshots/t03-mixed-cards.png`
- `docs/screenshots/t03-gfm-card.png`
- `docs/screenshots/t03-long-card.png`
- `docs/screenshots/t03-empty-card.png`

The implementation artifact remains the authoritative original evidence source; repository screenshots are review copies of those verified captures.

## Scope Review

No T04+ product scope is accepted as part of T03. In particular T03 does not implement ELK/formal auto-layout, Side Detail placement, collapse/expand, independent FlowEdge editing, persistence/backend state, Markdown editing, final toolbar/inspector UI, or T12 visual polish/motion.

The architecture boundary check rejects deferred layout identifiers such as ELK/Dagre/`childrenPlacement` in the T03 source tree and rejects `.skip`/`.only`, `rehype-raw`, and `dangerouslySetInnerHTML` escape hatches.

## Result

**T03 QA: PASS.**

This QA result closes the implementation/evidence acceptance criteria. The final delivery gate still requires the latest PR-head CI to pass and the PR to be mergeable without unresolved blocking review threads before squash merge.

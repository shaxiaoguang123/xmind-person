# Node Presentation

T03 adds two presentation modes for the same document node. It does not introduce a second domain node type.

## Unified Document Node

```text
DocumentSection
      |
      v
VisualNode
      |
      v
DocumentFlowNode
      |
      v
DocumentNode
      |
      +-- viewMode = heading  -> HeadingCard
      +-- viewMode = markdown -> MarkdownCard
```

`HeadingCard` and `MarkdownCard` are presentation components selected by `DocumentNode`. They share the same projected node identity and semantic heading data.

## Stable Identity

The rendering boundary preserves the stable section identity:

```text
DocumentSection.nodeId
        == VisualNode.id
        == React Flow node.id
```

Changing `viewMode` between `heading` and `markdown` does not create a new node or change the stable ID, heading depth, or Section hierarchy.

## Local Body

Markdown presentation renders only:

```text
Heading + Local Body
```

`localBody` is copied from the Section projection and excludes descendant/sibling Section bodies. An empty Local Body remains valid.

## Markdown Rendering

Markdown Card rendering uses `react-markdown` with `remark-gfm`. T03 covers paragraph, unordered/ordered lists, task lists, inline and fenced code, blockquote, table, strikethrough, and links.

Raw HTML is excluded from the MVP presentation: `skipHtml` is enabled, `rehype-raw` is not used, and no `dangerouslySetInnerHTML` escape hatch is used.

## Long Content and Canvas Isolation

Markdown Card uses a bounded body height with internal scrolling rather than unbounded node growth. The body uses React Flow interaction-isolation classes so wheel scrolling inside Markdown content does not zoom/pan the Canvas; links are also isolated from node dragging.

## Current Boundary

T03 intentionally does not implement:

- ELK/formal automatic layout;
- LEFT/RIGHT Side Detail placement;
- collapse/expand;
- independent FlowEdge editing;
- persistence/backend state;
- Markdown editing;
- final toolbar/inspector UI;
- final T12 visual polish or motion.

Those capabilities remain assigned to later stages.

# T02 Visual Graph Projection

## Purpose

T02 proves that the stable Markdown-domain Section Tree from T01 can be projected into a rendering-neutral Visual Graph and then adapted to React Flow without changing domain identity or inventing persisted graph semantics.

The implemented dependency direction is:

```text
Markdown Source
  -> T01 Markdown Projection
  -> Stable Section Tree
  -> T02 Visual Graph Projection
  -> React Flow Adapter
  -> Editor Canvas UI
```

The reverse dependency is forbidden. `core/markdown` and `core/graph` do not depend on React, the DOM, CSS, or `@xyflow/react`.

## Visual Graph Model

The pure graph core lives under `apps/web/src/core/graph/`.

```text
VisualGraph
  nodes: VisualNode[]
  hierarchyEdges: VisualHierarchyEdge[]
```

A `VisualNode` contains only the information required by this stage to render a heading node:

- `id`
- `sectionId`
- `headingDepth`
- `title`
- `viewMode`
- temporary debug `position`
- tree/debug ordering metadata

The Synthetic Document Root is not a Visual Node.

## Stable Identity Chain

T02 does not create a second rendering identity.

```text
DocumentSection.nodeId
  == VisualNode.sectionId
  == VisualNode.id
  == React Flow node.id
```

Duplicate titles therefore remain independent because identity comes from the stable T01 Node ID rather than title text.

## VisualHierarchyEdge Is Not FlowEdge

`VisualHierarchyEdge` is a **projection artifact**. It represents the visible parent-child relation already present in the Markdown Section Tree.

```text
parent DocumentSection
  -> child DocumentSection
  -> VisualHierarchyEdge
```

It is explicitly not the domain `FlowEdge` defined by `docs/domain-model.md` and ADR-0001.

Consequences:

- hierarchy edges are not persisted to future `document.flow.json -> edges`;
- hierarchy edges do not add or redefine Markdown relationships;
- Synthetic Root siblings do not receive an edge between one another;
- future user-created DAG/process FlowEdges remain independent entities;
- the React Flow adapter records `projectionKind: hierarchy` and uses a basic non-animated edge only for rendering.

## Synthetic Document Root

The T01 Synthetic Document Root remains an organization-only domain object. `projectSectionTree()` begins at `tree.children` and never produces a root node.

For:

```text
DocumentRoot
├── A
└── B
```

T02 produces two Visual Nodes and zero hierarchy edges between A and B.

## Projection Rule

`projectSectionTree()` walks real sections in deterministic preorder.

For every Section:

1. create exactly one Visual Node;
2. copy its stable `nodeId` into Visual Node identity;
3. preserve heading depth and title;
4. create a `VisualHierarchyEdge` only if the section has a real Section parent;
5. recurse into children without mutating the Section Tree.

Skipped Markdown heading depth is preserved. The graph projection never creates synthetic missing-depth nodes.

## Temporary Debug Placement

`createDebugPlacement(treeDepth, preorderIndex)` exists only to make the T02 graph visible before the formal layout stages.

The implementation is deliberately simple and deterministic:

```text
x = treeDepth * horizontalGap
y = preorderIndex * verticalGap
```

This placement:

- is pure and unit-tested;
- does not mutate the Section Tree;
- is not LayoutMetadata;
- is not persisted;
- does not implement collision resolution, subtree centering, routing, ELK, Dagre, or any automatic-layout contract;
- is explicitly temporary and will be replaced by the later layout phase.

## React Flow Adapter Boundary

`apps/web/src/adapters/react-flow/` is the only layer that imports React Flow types for graph adaptation.

```text
toReactFlowNodes(VisualGraph)
toReactFlowEdges(VisualGraph)
```

The adapter preserves Visual Node IDs exactly and maps only `VisualHierarchyEdge` objects to React Flow edges. It does not leak React Flow types back into either pure core.

## T02 Editor Canvas

The T02 Canvas is intentionally minimal:

- custom `HeadingNode` via `nodeTypes`;
- top target Handle and bottom source Handle;
- handles are not user-connectable;
- non-animated basic hierarchy edges;
- pan and zoom;
- basic node selection;
- node drag for interaction validation;
- initial `fitView` for the debug-only stage;
- neutral background and minimal heading-depth theme tokens.

Selection, drag position, and viewport are ephemeral UI state in T02. A reload recreates debug placement. Nothing is written to Flow Metadata.

## Heading Depth Theme

The `HeadingNode` preserves semantic `headingDepth` and applies a minimal `heading-node--h1` through `heading-node--h6` class mapping. Differences use restrained typography/border treatment rather than changing Markdown depth or adding decorative color systems.

## Real Markdown Demo Pipeline

Production demo data is never authored as hard-coded React Flow node arrays. The app loads Markdown fixtures and executes the real pipeline:

```text
fixture Markdown
  -> projectMarkdownDocument()
  -> Stable Section Tree
  -> projectSectionTree()
  -> React Flow adapter
  -> EditorCanvas
```

T02 browser evidence uses:

- `fixtures/markdown/t02-basic.md`
- `fixtures/markdown/t02-nested.md`
- `fixtures/markdown/t02-duplicate-mixed.md`

## Deferred Work

T02 deliberately does not implement:

- ELK, Dagre, formal auto-layout, collision resolution, or edge routing;
- LEFT/RIGHT `childrenPlacement` or side-detail composition;
- Markdown Rich Card;
- collapse/expand;
- user-created FlowEdge or Node editing;
- Markdown editor;
- undo/redo;
- toolbar, inspector, MiniMap, search, or Focus Mode;
- persistence, backend, authentication, or viewport/manual-position persistence;
- animation polish, Playwright, or visual-regression infrastructure.

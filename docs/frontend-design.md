# Frontend Design Contract

## Purpose

The web application is a desktop-first Markdown-driven knowledge/flow editor. The infinite canvas is the visual center; chrome must remain quiet, compact, and subordinate to the document graph.

## Scope and Ownership

The frontend owns Markdown editing, Markdown AST projection, Section Tree projection, Visual Graph projection, React Flow rendering, ELK-based layout orchestration, viewport state, selection, keyboard interaction, undo/redo, local editing state, motion, search, focus mode, node styling, and the generated OpenAPI client.

The frontend never accesses the database directly. Automatic graph layout is never delegated to the backend.

## Information Architecture

- Top Bar: project/document identity and high-level actions.
- Left Sidebar: Document, Outline, Search.
- Center: infinite Graph Canvas.
- Right Inspector: Node, Layout, Style properties.
- Bottom/Floating Controls: viewport controls and contextual actions.
- Panels are collapsible.
- A selected node may expose a lightweight floating toolbar that must not obscure important edges.

## Desktop Boundary

- Primary editing target: widths >= 1280 px.
- 1024 px must remain usable.
- MVP does not provide a full mobile editor; mobile may use read-only or simplified browsing.

## Visual Language

Use neutral gray/black/white surfaces with exactly one primary accent color. Avoid decorative gradients, glassmorphism, colorful shadows, oversized rounding, ornamental backgrounds, and non-informational animation.

Design tokens must cover spacing, radius, border, surface, text, accent, shadow, motion, and z-index. Typography must communicate H1-H6 hierarchy without changing semantic heading depth.

## Node Contracts

### Heading Card

Compact, visually hierarchical, and consistent by heading depth. Nodes at the same semantic depth inherit the same Level Theme unless an independent visual override is present.

### Markdown Card

Displays only the section heading plus its Local Body. It may be wider than Heading Card and supports paragraph, list, code, blockquote, table, and link Markdown. Raw HTML is excluded from MVP. Long content uses bounded height with expand, internal scrolling, or Focus Mode rather than unbounded growth.

## Viewport Contract

Support pan, Space+Drag, middle-mouse drag, trackpad pan, pinch zoom, Ctrl/Cmd+wheel zoom, Zoom In/Out, 100%, Fit View, focus selected node, optional MiniMap, and optional background grid.

Viewport state `{x, y, zoom}` is persisted. Reopening a project restores the saved viewport and must not unconditionally call fitView.

## Layout Presentation Contract

Main-flow peers align to a stable visual axis. Sibling spacing is consistent. Side Details are visually orthogonal to the Main Flow where possible; for DOWN/UP main flow, LEFT/RIGHT are preferred detail directions. Nodes may not overlap and edges may not pass through nodes. Collapse/expand must prioritize layout stability over global reflow.

## Motion Contract

Motion communicates structural change only. Typical budgets: hover 100-150 ms, toolbar/inspector 150-200 ms, collapse/expand 180-250 ms, layout transition 200-300 ms. `prefers-reduced-motion` must disable large positional motion or replace it with a low-motion alternative. Motion transforms must not fight React Flow transforms.

## Accessibility Contract

Target WCAG 2.2 AA directionally: keyboard operability, visible focus indicators, ARIA labels, sensible focus order, keyboard-selectable nodes, perceivable state changes, reduced motion, and non-color-only state communication.

## Explicit T00/T01 Non-Implementation

This document is a contract only. T00 and T01 do not implement React Flow, ELK, Canvas UI, panels, animation, or styling.
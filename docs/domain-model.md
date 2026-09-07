# Domain Model

Core entities:

Project
Document
DocumentNode
SectionTree
FlowEdge
FlowMetadata
ViewportState
Revision

DocumentNode has stable id, headingDepth, title, localBody, viewMode, styleOverride, placement, collapsed.

FlowEdge connects visual nodes and is not Markdown parent-child.

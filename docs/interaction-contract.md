# Interaction Contract

## Interaction Modes

Shortcut dispatch MUST explicitly distinguish:

- **Canvas Mode** — graph navigation/editing commands are active.
- **Text Editing Mode** — textarea/input/content editing owns normal typing/editing shortcuts.
- **Modal Mode** — the active modal owns focus and relevant commands; canvas commands are suspended unless explicitly safe.

Canvas shortcuts MUST NOT steal normal input when the user is editing Markdown or any text field.

## Canvas Keyboard Contract

| Shortcut | Action |
| --- | --- |
| `Enter` | Create sibling node |
| `Tab` | Create child node |
| `Shift+Tab` | Promote/outdent current node |
| `Space` or `F2` | Edit current node |
| `Esc` | Exit editing / cancel active operation / clear transient state |
| `Delete` / `Backspace` | Delete selected node/selection according to editor semantics |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Shift+Z` | Redo |
| `Ctrl/Cmd+C` | Copy |
| `Ctrl/Cmd+V` | Paste |
| `Ctrl/Cmd+D` | Duplicate |
| `Ctrl/Cmd+/` | Collapse / Expand |
| `Ctrl/Cmd++` | Zoom In |
| `Ctrl/Cmd+-` | Zoom Out |
| `Ctrl/Cmd+0` | Reset to 100% |
| `F` | Fit View |
| `/` | Search Nodes |

Exact node-creation/editing behavior is implemented only in its assigned stage; T00 records the contract.

## Canvas Pointer / Trackpad Contract

The editor must support:

- mouse drag canvas pan;
- `Space + Drag` pan;
- middle mouse drag pan;
- trackpad pan;
- pinch zoom;
- `Ctrl/Cmd + Wheel` zoom;
- explicit Zoom In / Zoom Out / 100% / Fit View controls;
- Focus Selected Node;
- optional MiniMap;
- optional background grid.

## Viewport Persistence

Persist and restore:

```text
x
y
zoom
```

Reopening a project/document must restore a saved viewport when available. The application must not unconditionally run Fit View on every open.

## Focus and Accessibility

- Keyboard focus remains visible.
- Nodes must become keyboard-selectable at the relevant stage.
- Focus order follows visible/editor hierarchy rather than arbitrary DOM order where possible.
- Context/floating controls must be reachable without trapping focus.
- Color is not the only signal for selected/error/collapsed state.

## Text Editing Conflict Rules

While focus is inside Markdown textarea/input/content editing:

- ordinary text entry is never interpreted as Canvas shortcuts;
- Backspace/Delete edits text unless the editing surface explicitly delegates deletion;
- copy/paste/undo/redo belong to text editing unless editor-level semantics intentionally and visibly intercept them;
- `/`, `Space`, `Enter`, and `Tab` preserve editing behavior unless the active editor mode defines and documents another behavior.

## Modal Conflict Rules

An open blocking modal owns `Esc`, `Enter`, focus traversal, and other modal commands. Canvas create/delete/search commands remain disabled until the modal closes.

## Reduced Motion Interaction

When `prefers-reduced-motion` is active, focus/selection must remain understandable without relying on large positional transitions.
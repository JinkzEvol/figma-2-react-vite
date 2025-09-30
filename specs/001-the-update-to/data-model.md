# Data Model: Rendering Pipeline Fidelity Update (Lean V1)

## Entities

### DesignNode
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Unique node id from Figma | required, non-empty |
| type | string | Normalized node type (FRAME, TEXT, RECTANGLE, UNKNOWN) | required |
| name | string | Node name | optional |
| width | number | Rounded layout width (px) | >= 0, optional (unset if missing) |
| height | number | Rounded layout height (px) | >= 0, optional (unset if missing) |
| opacity | number | Layer opacity (only present if < 1) | 0 < opacity <= 1, precision 0.001 |
| layout | object | direction(row/column), gap, padding tuple | derived, optional |
| visual | object | background (solid/gradient), border, radius | optional |
| effects | object | shadows[], blur | optional |
| text | object | characters, fontFamily, fontSize, fontWeight | only for TEXT |
| placeholder | object | role, ariaLabel for image fills placeholder | optional |
| meta | object | (reserved for future ordering/index metadata) | deferred |
| children | DesignNode[] | Ordered children (pre-order) | empty array if leaf |

#### T051 Rationale: Flattened `box` removal
Original draft introduced a `box` aggregate (width/height/opacity/overflow). Implementation (T028) emitted `width`, `height`, `opacity` at the root for:
1. Lean object shape: avoids an extra nested allocation per node (memory + GC churn across up to 5k nodes — aligns with Principle #3 Lean & #4 Performance).
2. Diff ergonomics: shallow comparisons in snapshot / deterministic tests (T017, future T039) can ignore nested object identity changes.
3. Optional sparsity: fields simply omitted when absent rather than carrying an empty `box` object.

Overflow was not implemented in V1; it remains deferred until a concrete fidelity requirement arises. This document now reflects the canonical implemented shape instead of refactoring stable, tested code for a non-essential abstraction.

`placeholder` field added to table for alignment with implemented accessibility placeholder semantics (T035). Meta remains reserved; not currently emitted, preventing premature abstraction.

### SessionLog
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| timestamp | number | Epoch ms when generation ran | required |
| nodeCount | number | Count of processed nodes | <= 5000 |
| durationMs | number | Total generation time | >=0 |
| skippedCount | number | Hidden/unsupported skipped | >=0 |
| unsupportedCount | number | Features not implemented | >=0 |
| warnings | string[] | User-visible warning messages | optional |
| version | string | Schema/version tag | semantic version string |

## Relationships
- Tree structure only (parent→children). No cross-links in V1.

## Derived / Computed Fields
- layout.gap from itemSpacing
- visual.border (solid) derived from first stroke
- visual.background gradient string computed from Figma gradient handles & stops
- effects.shadows normalized from DROP_SHADOW / INNER_SHADOW
- effects.blur from LAYER_BLUR

## Validation Rules
- Reject/skip nodes missing id or absoluteBoundingBox width/height < 0
- Hidden nodes filtered prior to IR assembly
- Clamp opacity to [0,1]; omit opacity when >= 1 for compactness

## Deferred
- Tokens (styles) representation
- Variant/component references
- Constraint scaling metadata
 - Overflow handling & meta ordering fields

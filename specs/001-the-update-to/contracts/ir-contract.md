# Contract: buildIR

## Purpose
Normalize a raw Figma node (subset) into a DesignNode structure used by downstream code generation.

## Signature (Conceptual)
```
function buildIR(raw: FigmaNode): DesignNode
```

## Inputs
- raw: FigmaNode (extended type) including layoutMode, fills, strokes, effects, style.

## Processing Rules
- Exclude if raw.visible === false.
- Copy id, type, name.
- Extract width/height from absoluteBoundingBox.
- Derive layout from auto-layout props (layoutMode, itemSpacing, padding, alignment fields).
- Derive visual: first visible fill, gradient metadata, stroke, border radii.
- Derive effects: collect shadows (drop/inner) preserving order; collect blurs.
- Derive text block if type === TEXT.
- Recurse children.
- Traversal ordering (T054): Children are processed in the original Figma `children` array order (left-to-right / top-to-bottom as provided) using a pre-order traversal (parent emitted before its descendants). No re-sorting or filtering beyond hidden node exclusion.

## Outputs
- DesignNode object with required fields.

## Errors
- Should not throw; returns null-like sentinel (not appended) for invalid/hidden nodes.

## Edge Cases
- Empty fills array → no background.
- Multiple shadows → array order preserved.
- Gradient without stops → ignore gradient fill.

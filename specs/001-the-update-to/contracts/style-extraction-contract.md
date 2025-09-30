# Contract: extractAllStyles

## Purpose
Produce a minimal CSS properties object representing the visual + layout style of a Figma node.

## Signature
```
function extractAllStyles(node: FigmaNode): CSSSubset
```

## Required Output Fields (when applicable)
- display, flexDirection, justifyContent, alignItems, gap
- padding, width, height, overflow
- background, border, borderRadius
- boxShadow
- fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, textAlign, textTransform, textDecoration, whiteSpace
- filter, backdropFilter, opacity, color (for text nodes)

## Rules
- Hidden nodes: not processed (caller responsibility)
- Color formatting (T052 decision):
	- For any color with alpha === 1, emit `rgb(r, g, b)` for readability and smaller output.
	- For colors with alpha < 1, emit `rgba(r, g, b, a)` with alpha precision 3 decimals (strip trailing zeros & dot when not needed in implementation tests).
	- Gradient stops may include translucency; each stop follows the same rule. (Current implementation keeps consistent `rgba` for stops with transparency and uses `rgba` even if fully opaque inside gradients for simplicity — acceptable for V1; revisit if size optimization becomes priority.)
- Combine multiple shadows into single boxShadow string
- Append blur effects into filter/backdropFilter (space separated)

## Exclusions (Lean V1)
- Stroke alignment outside/inside differences
- Non-linear gradients (radial, angular)
- Responsive constraint scaling

## Notes (T052)
Previous draft mandated always `rgba()`. Implementation + tests were already using `rgb()` for opaque colors (e.g., border, solid text color) and `rgba()` only when alpha < 1. This contract now reflects the implemented & tested approach to reduce noise while preserving precision where required. This harmonizes with determinism principle (#2) and lean output principle (#3). No code changes required for T052; documentation updated.

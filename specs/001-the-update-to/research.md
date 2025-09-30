# Research: Rendering Pipeline Fidelity Update (Lean V1)

## Decisions

### Test Framework
- Decision: Vitest
- Rationale: Native Vite integration, faster startup, TypeScript friendly.
- Alternatives: Jest (heavier config), uvu (minimal but less ecosystem support).

### IR Shape Minimal Fields
- Decision: { id, type, name, layout, box, visual, effects, text, meta, children }
- Rationale: Covers all FRs; defers tokens, constraints, componentization.
- Alternatives: Direct Figma node pass-through (too noisy), token-first design (premature for V1).

### Gradient Angle Approximation
- Decision: Use handle vector h0->h1; cssAngle = (450 - deg(atan2(dy, dx))) % 360
- Rationale: Produces visually consistent linear gradients for most Figma exports.
- Alternatives: Hard-coded 0deg (loses orientation), complex affine transform reconstruction (overkill).

### Performance Measurement Strategy
- Decision: use performance.now() around IR build + generation on synthetic 5k tree.
- Rationale: Simple, browser-native, no external dependency.
- Alternatives: external profiler (heavy), node benchmarking (less relevant to browser).

### Local Storage Log Size
- Decision: Only store last session JSON (<25KB typical) keyed by 'figmaGenSession'.
- Rationale: Minimizes quota usage, avoids multi-session retention complexity.
- Alternatives: Append history (risk unbounded growth), no storage (lost diagnostics).

## Open for Future Iteration
- Component variant synthesis
- Token extraction (colors, text styles, shadows)
- Constraints-based responsive adaptation

## References
- Figma API Docs: nodes, effects, fills, layout.
- CSS Specs: Flexbox, Box Shadow, Filter/Backdrop Filter.

# Research: Footer Fidelity & Extraction Improvements

## Decisions & Findings

### Grouping Heuristics
- Decision: Use top alignment tolerance ≤2px; horizontal gap variance ±4px.
- Rationale: Matches typical minor nudge noise while preventing false group merges.
- Alternatives: Exact equality (too strict), percentage-based tolerance (complex w/ mixed widths).

### Token Naming Strategy
- Decision: Deterministic slug = `txt-{fontFamily}-{fontSize}-{weight}-{lineHeight}-{letterSpacing}-{colorHex}` normalized + hashed (8 chars) when >40 chars.
- Rationale: Readable when short, stable & collision-resistant when long.
- Alternatives: Pure hash (opaque), incremental IDs (non-deterministic across sessions).

### Color ΔE Computation
- Decision: Implement lightweight CIEDE2000 util (no heavy dependency) for non-brand comparisons.
- Rationale: Keeps bundle lean; brand colors exact match avoids ΔE check.
- Alternatives: ΔE76 (less perceptual accuracy), external lib (adds weight).

### Performance Measurement
- Decision: Add perf harness sample building 12, 20 column scenarios; record per-column added ms.
- Rationale: Ensures scaling linearity and adherence to <10ms/column goal.
- Alternatives: Only total pipeline time (less diagnostic).

### Accessibility Labels for Placeholder Icons
- Decision: Derive from normalized layer name (kebab -> sentence case) with fallback `Icon`.
- Rationale: Preserves designer intent; fallback ensures non-empty label.
- Alternatives: Generic 'Social icon' (less specific), raw layer name (often cryptic).

## Remaining Assumptions
- Minimum grouping threshold still TBD? (Spec retains open marker). Will finalize during implementation if required for false-positive mitigation.

## No Outstanding Clarifications
All spec-level clarifications captured; this document resolves research unknowns.

# Feature Specification: Rendering Pipeline Fidelity Update (Lean V1)

**Feature Branch**: `001-the-update-to`  
**Created**: 2025-09-30  
**Status**: Draft  
**Input**: User description: "the update to the pipeline to improve rendering fidelity - lean v1"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a user pasting a Figma file (or node) URL and token, I want the system to render a React preview that closely matches spacing, sizing, text, colors, and shadows from the original design so I can trust the generated result as a starting point for implementation.

### Acceptance Scenarios
1. **Given** a Figma design with auto‑layout frames containing spacing and padding, **When** the user generates the preview, **Then** the preview displays correct flex direction, gap, and padding values matching Figma pixel measurements.
2. **Given** a design containing text nodes with font family, size, weight, letter spacing, and line height, **When** generated, **Then** the text styling matches (visually same metrics) in the preview.
3. **Given** nodes with solid fills, gradients (linear), and rounded corners, **When** generated, **Then** each node shows matching background color/gradient and border radius values.
4. **Given** nodes with drop shadows and inner shadows, **When** generated, **Then** visible box shadows reflect correct offset, blur, and color alpha (inner shadows appear inset).
5. **Given** a mix of auto‑layout and absolutely positioned groups, **When** generated, **Then** auto‑layout containers use flex layout while non‑layout siblings retain static (no overlapping) placement without layout collapse.
6. **Given** a design with nodes that have opacity < 1, **When** rendered, **Then** those nodes show reduced opacity consistent with Figma's visual stacking.
7. **Given** a design containing nodes with independent corner radii, **When** rendered, **Then** each corner matches its individual pixel radius.

### Edge Cases
- Extremely nested auto‑layout frames: System still applies correct nesting without dropping spacing.
- Nodes with missing or hidden fills: Backgrounds are omitted rather than defaulted to white.
- Text nodes with very long content: Layout does not overflow horizontally (wraps where Figma wraps if width is fixed).
- Multiple shadows on a single layer: All visible shadows are concatenated into a single CSS box-shadow declaration.
- Unsupported gradient types (radial, angular): Fallback to solid first stop with clear note in internal logs [NEEDS CLARIFICATION: Should user-facing warning be shown?].
- Image fills encountered: Placeholder background color used [NEEDS CLARIFICATION: Should a fetch/export be triggered in Lean V1?].

## Requirements *(mandatory)*

## Clarifications

### Session 2025-09-30
- Q: What is the target maximum design size and generation time threshold for Lean V1 (to finalize FR-020)? → A: Up to 5,000 nodes in ≤ 5.0s (baseline hardware: Apple M1 Pro 8 perf cores / 16GB RAM or equivalent x86 8-core 3.0GHz)
- Q: How should Lean V1 handle blur effects (LAYER_BLUR, BACKGROUND_BLUR)? → A: Always include best-effort blur (CSS filter/backdrop-filter)
- Q: Should the system persist generation session metadata (e.g., counts, timing, feature usage) after a user generates a preview? → A: Lightweight local log stored locally; allow export via UI click (Implemented in FR-021 & FR-022)

### Functional Requirements
- **FR-001**: System MUST translate Figma auto‑layout frames (layoutMode = HORIZONTAL | VERTICAL) into CSS flex containers with correct flex-direction.
- **FR-002**: System MUST map Figma itemSpacing to CSS gap for auto‑layout containers.
- **FR-003**: System MUST map paddingTop/Right/Bottom/Left to CSS padding shorthand on auto‑layout frames.
- **FR-004**: System MUST extract and apply width and height from absoluteBoundingBox for nodes lacking auto‑layout intrinsic sizing.
- **FR-005**: System MUST apply fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textAlign for TEXT nodes when present.
- **FR-006**: System MUST derive text color from the first visible SOLID fill of the text node's fills array.
- **FR-007**: System MUST convert cornerRadius or rectangleCornerRadii to CSS border-radius (individual corners preserved when provided).
- **FR-008**: System MUST convert SOLID fills to CSS background (rgba form accounting for alpha).
- **FR-009**: System MUST convert linear gradients (GRADIENT_LINEAR) to CSS linear-gradient with correct stop colors and ordered positions (angle approximation allowed in Lean V1).
- **FR-010**: System MUST convert DROP_SHADOW and INNER_SHADOW effects to CSS box-shadow entries (using 'inset' for inner shadows) and MUST serialize one or more shadow effects in original order as a single comma-separated box-shadow value.
- **FR-012**: System MUST apply node opacity < 1 as CSS opacity.
- **FR-013**: System MUST include blur effects: map LAYER_BLUR to `filter: blur(<radius>px)` and BACKGROUND_BLUR to `backdrop-filter: blur(<radius>px)` when radius provided; if multiple blurs on a node, concatenate; if browser support absent, output is still emitted without polyfill.
- **FR-014**: System MUST skip image fills (type = IMAGE) without error and render a solid mid-gray (#ccc) background with centered “IMG” text (accessibility aid) as the placeholder in Lean V1.
- **FR-015**: System MUST not crash or throw for unknown node types; it MUST safely fallback to a generic container.
- **FR-016**: System MUST maintain DOM child ordering identical to Figma node ordering.
- **FR-017**: System MUST treat hidden (visible=false) nodes by excluding them from output.
- **FR-018**: System MUST ensure text wrapping respects width constraints when width is fixed.
- **FR-019**: System MUST produce deterministic output given identical Figma input JSON.
- **FR-020**: System MUST complete generation for designs up to 5,000 nodes within ≤ 5.0 seconds on baseline hardware (Apple M1 Pro 8-core / 16GB RAM or comparable 8-core 3.0GHz x86, warm build). CI allowance: ≤ +30% over baseline.
- **FR-021**: System MUST maintain a lightweight in-browser log of the most recent generation session including: timestamp, node count processed, time elapsed, counts of skipped/unsupported features, and warnings issued.
- **FR-022**: System MUST provide a user-triggered export (single click) that downloads the log data as a JSON file; no automatic remote transmission.

*Ambiguity Markers (remaining):* (none)

### Key Entities *(include if feature involves data)*
- **Design Node**: Represents a single Figma node's normalized visual & layout properties (layout, box, text, effects, children reference). Attributes: id, type, name, layoutProps, visualProps, textProps, effects, childrenIds.
- **Style Token (Implicit)**: Conceptual grouping of reusable color, text, and shadow values derivable later (Lean V1 acknowledges but does not persist tokens formally).
 - **Generation Session**: The process instance linking input (fileId, optional nodeId) to produced React structure and extracted metrics (counts: processed, skipped, unsupported features, duration, warnings). Persisted transiently in local storage (latest session only) and exportable via user action.

### Key Entities *(include if feature involves data)*
*Note: Placeholder Entity 1/2 entries removed—no additional entities required for Lean V1.*

### Out-of-Scope (Deferred for Future Iterations)
- Design token extraction (color, typography, effect tokens)
- Component & variant synthesis (props, variant matrix)
- Constraint-based responsive scaling (constraint horizontal/vertical SCALE logic)
- Image asset export / optimization (fetching image fills)
- Semantic HTML element inference (auto mapping to <button>, <header>, etc.)
- Advanced stroke alignment emulation (inside/outside via wrappers)
- Radial / angular / diamond gradients

---

## Scope Addendum (Phase 3.7 Extension: React Component Generation)
*Added: 2025-09-30 (Remediation Task T050)*

Lean V1 now formally includes generation of a reusable, deterministic React component source string (TSX) from the normalized IR in addition to the existing runtime createElement tree.

### Rationale
- Improves developer ergonomics by providing copy‑pasteable component code.
- Aligns with Constitution Principles:
   - P1 Test-First Fidelity: Backed by contract & determinism tests (T046, T048, upcoming T039 baseline).
   - P2 Deterministic Output: Byte-identical TSX for identical IR and input (ordering rules retained).
   - P3 Lean Architecture: Implemented as a pure code generation function without new runtime dependencies.
   - P6 Explicit Scope & Deferral: Only static functional component output; defers prop synthesis (variants, tokens) & semantic element inference.

### New Functional Requirements
- **FR-023**: System MUST expose a pure function `generateReactComponentSource(ir, options)` returning a deterministic TSX module exporting `FigmaComponent` (React.FC) that renders the IR with fidelity styles (layout, gradients, text, opacity, placeholders) in stable key order.
- **FR-024**: Generated component MUST accept an optional `className` prop merged onto the root container and MAY expose a memoized variant when requested via options; absence of options MUST NOT alter style output.

### Acceptance Criteria (Supplemental)
1. Repeated calls with identical IR produce byte-identical TSX (excluding trailing whitespace).
2. Style object key ordering remains alphabetical; numeric values (e.g., opacity) emitted without quotes.
3. Text nodes rendered as `<span>`; non-text nodes as `<div>` (Lean simplification) — future semantic mapping deferred.
4. Placeholders for IMAGE fills include aria-label pattern: `{originalName} placeholder {WIDTHxHEIGHT}` (to be enforced in placeholder semantics remediation task T059).
5. No dynamic runtime global/date/random usage inside emitted component body.

### Deferred (Component Generation Specific)
- Prop extraction for tokens (color, typography)
- Automatic semantic element inference
- Code splitting / lazy assets
- Variant / state props scaffolding

### Risks / Mitigations
- Risk: Divergence between runtime generator and TSX generator → Mitigated by shared IR + style ordering tests.
- Risk: Output instability from unsorted object iteration → Mitigated by explicit alphabetical key sorting.

### Traceability
- Tasks: T046 (contract test), T047 (implementation), T048 (determinism snapshot), T049 (documentation), FR-023/FR-024 added.
- Related Principles: P1, P2, P3, P6.

---

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)  
   *Note: High-level CSS concepts retained; no code specifics.*
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable (performance + fidelity metrics defined)
- [ ] Scope is clearly bounded (Lean V1 excludes: image export, constraint scaling, component/variant synthesis, design tokens)
- [ ] Dependencies and assumptions identified (Requires: Figma API responses; Assumes: stable JSON shape; Out-of-scope: asset export, semantic tag mapping)

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (blocked by outstanding clarifications)

---

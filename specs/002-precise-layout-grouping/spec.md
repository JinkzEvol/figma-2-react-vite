# Feature Specification: Footer Fidelity & Extraction Improvements

**Feature Branch**: `002-precise-layout-grouping`  
**Created**: 2025-10-01  
**Status**: Draft  
**Input**: User description: "Precise layout & grouping; text style fidelity tokens; real text vs placeholders; padding & spacing; constraints to responsive CSS; icon vector export; semantic footer structure & a11y; color & opacity fidelity; style dedupe reuse; performance & determinism improvements"

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
 - 🎯 Align with Constitution principles: Test-First Fidelity, Deterministic Output, Lean Architecture, Performance Budget, Transparent Observability, Explicit Scope, Clarity.

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
As a user viewing a generated page from a Figma design, I want the footer (and similar multi-column structured sections) to reflect accurate layout, spacing, text content, icons, and hierarchy so I can visually validate design fidelity without manual code edits.

### Acceptance Scenarios
1. **Given** a Figma frame containing horizontally aligned groups forming a footer with consistent top alignment and even spacing, **When** the system extracts and renders it, **Then** the preview shows a multi-column footer with correct column count, preserved order, and reduced vertical whitespace (no large placeholder blocks).
2. **Given** text nodes in the footer with actual characters, **When** the preview renders, **Then** the real text appears with proper font size, weight, color, and line height instead of generic black bar placeholders.
3. **Given** social media vector/icon nodes in the design, **When** rendered, **Then** recognizable icons (inline SVG or equivalent) appear with accessible labels and not empty rectangles.
4. **Given** a footer frame with internal padding and gaps, **When** rendered, **Then** horizontal and vertical spacing matches Figma within defined tolerance (see Requirements) and total footer height is not inflated by placeholder stacking.
5. **Given** the viewport width becomes narrower than the total column width, **When** the user views the footer, **Then** all columns remain in a single horizontal row and a horizontal scrollbar allows full inspection without any column wrapping.

### Edge Cases
- Extremely narrow viewport: user horizontally scrolls; no column wrapping occurs.
- Missing or empty text nodes: skeleton placeholders display only for those nodes, not replacing populated siblings.
- Icon export failure: system displays a generic monochrome placeholder SVG sized to original node with accessible label (from layer name) and logs the failure event.
- Mixed alignment where only some siblings align: system does not incorrectly group them into a column set if fewer than 2 aligned siblings meet grouping heuristics.
- Very large number of columns still forms a single horizontal group (no hard maximum) and relies on horizontal scrolling for visibility.

## Clarifications
### Session 2025-10-01
- Q: What breakpoint should trigger footer columns to wrap/stack? → A: No breakpoint; never wrap. Horizontal scroll allowed.
- Q: How should we define column grouping limits? → A: No max; group any ≥2.
- Q: For failed icon/vector exports, what fallback should appear? → A: Generic monochrome placeholder SVG with accessible label.
- Q: What is the reference performance environment for timing targets? → A: Mid laptop 4-core/8-thread ~2.4GHz, 16GB RAM.
- Q: What is the color fidelity tolerance policy? → A: Brand colors exact; others ΔE ≤3.
- Q: What is the minimum grouping threshold? → A: 2 aligned sibling groups (≥2) required; otherwise skip grouping.

## Requirements *(mandatory)*

### Functional Requirements
NOTE: FR-001 & FR-002 merged (ordering now part of FR-001). FR-002 retained for traceability (no new scope).
NOTE: FR-003 & FR-010 merged (dedupe + deterministic naming). FR-010 retained for traceability.

- **FR-001**: Grouping Detection & Ordering — System MUST detect candidate column groupings when ≥2 sibling frames share: (a) top Y within ≤2px tolerance, (b) horizontal gap variance ≤±4px, (c) vertical structure similarity defined as: same number of child nodes OR difference ≤1. Result MUST be ordered left→right deterministically.
- **FR-002** (merged into FR-001, no additional acceptance): (Trace) Multi-column container semantic representation preserved.
- **FR-003**: Text Style Tokenization & Dedupe — System MUST extract text style properties (fontFamily, weight, size, lineHeight, letterSpacing, colorHex, paragraphSpacing) into deterministic tokens; identical signatures collapse into one token with usageCount. Deterministic naming: slug of normalized properties; if slug length > 40 chars, append stable 8-char FNV-1a hash (lowercase hex). Collisions (rare) MUST fall back to appending an incrementing numeric suffix while retaining deterministic ordering.
- **FR-004**: Placeholder Suppression — Render actual text for non-empty nodes; skeleton placeholder bars MUST appear only for nodes with empty/whitespace content or explicit defer flag. Verification: no placeholder element for a node whose characters.length > 0.
- **FR-005**: Spacing Fidelity — Extract frame padding (TRBL) and inter-column gap; apply within ±1px (measured on IR numeric values, not post-layout computed CSS). Gap tolerance is absolute pixel difference.
- **FR-006**: Non-Wrapping Layout — Columns never wrap; horizontal scrollbar appears if total width > viewport; no column order reflow.
- **FR-007**: Icon Export & Fallback — Inline SVG export for vector/icon nodes; fallback placeholder (monochrome rectangle or generic icon) when: vectorData missing, parse failure, or empty path list. Accessible label derived: kebab/dash/underscore name → space-separated, sentence case (first letter capitalized) with fallback "Icon". Failure event logged.
- **FR-008**: Semantic & A11y Structure — Footer rendered as <footer>; primary title heading level determined by first available level not already used above (default h2). Link groups: <ul><li>. Icons: aria-label attribute with normalized label. Logical tab order left→right preserved. Deterministic label normalization spec: split on [-_], lower-case, capitalize first token.
- **FR-009**: Color & Opacity Resolution Chain — For text/icon fill: use node fill color if present; else inherit nearest ancestor text color; else use brand primary if mapping by style name; else fallback to neutral token (e.g., #444). Opacity multiplies ancestor chain (cascading). Only when all fail, use high-contrast placeholder (#000 at 20% opacity). Provide deltaE ≤3 for non-brand comparisons (CIEDE2000) and exact hex for brand matches.
- **FR-010** (merged in FR-003, trace): Deterministic naming & dedupe handled in FR-003.
- **FR-011**: Performance Budget — Median added processing time (<10ms/column) over 3 warm runs (discard first cold run). Early smoke test: small 4-column footer must run <5ms/column median. Full stress: 5,000 nodes total IR within existing global 5s budget.
- **FR-012**: Determinism — Two consecutive generations with identical input produce byte-identical outputs for IR → code (excluding timestamp/log ts fields). Early smoke test after grouping + token registry; full test after icon & logging integration.
- **FR-013**: Observability Events — Emit events: grouping_detected {columns, items, durationMs}; grouping_skipped {reason}; token_dedup_applied {tokens, collapsed}; icon_export_failed {iconId, reason}; performance_sample {section, columns, msPerColumn}. Absence rule: Do NOT emit grouping_skipped if grouping_detected emitted.
- **FR-014**: Unlimited Columns — Support arbitrary column count (≥2) with horizontal scroll; performance scaling linear (validated at 12, 20 columns, and large-column functional test ≥20).
- **FR-015**: Visual Fidelity Tolerances — Spacing & font sizes ±1px (IR measured), brand colors exact (# case-insensitive), other colors CIEDE2000 ΔE ≤3. Opacity inheritance validated; report delta numeric for non-brand.

### Key Entities *(include if feature involves data)*
- **FooterSection**: Represents an extracted multi-column grouping of related footer content. Attributes: columns[], padding, gap, breakpoint policy, semantic role.
- **FooterColumn**: Represents a vertical collection of related nodes (text items, icons). Attributes: order index, items[], deduped style references.
- **TextStyleToken**: Logical style descriptor created from one or more Figma text nodes sharing identical style properties.
- **IconAsset**: Exported representation of a vector/icon with name, accessible label, svg content reference.
- **InstrumentationEvent**: Logging entity capturing decisions (grouping_detected, grouping_skipped, token_dedup_applied, icon_export_failed, performance_sample).

<!-- Placeholder Key Entities section removed after clarifications to avoid confusion -->

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---

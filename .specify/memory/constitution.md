<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles: (template placeholders replaced with concrete names)
Added sections: Constraints & Quality Gates, Development Workflow
Removed sections: None
Templates requiring updates: 
	- .specify/templates/plan-template.md (✅ references generic Constitution v1.x wording) 
	- .specify/templates/spec-template.md (✅ aligns with mandatory clarity & testability)
	- .specify/templates/tasks-template.md (⚠ ensure test-first checklist once tasks file generated)
Follow-up TODOs: None (all placeholders resolved). Ratification date assumed; adjust if historical date known.
-->

# Figma-to-React Project Constitution

## Core Principles

### 1. Test-First Fidelity
All new feature logic (IR building, style extraction, logging) MUST have failing tests created before implementation. Each functional requirement in a spec maps to at least one test. Visual fidelity features require scenario coverage (layout, text, effects, performance). Rationale: Prevent regressions and ensure measurable fidelity claims.

### 2. Deterministic & Reproducible Output
Given identical Figma JSON input, generated React output MUST be byte-identical (excluding timestamps). No hidden randomness, date-based IDs, or environment-dependent ordering. Rationale: Determinism enables snapshot testing and reliable diff review.

### 3. Lean Incremental Architecture
Introduce only the minimal abstractions (IR layer, logging module) necessary to meet current requirements. Defer tokens, variant synthesis, and semantic tagging until explicitly prioritized. Rationale: Avoid premature complexity and maintenance overhead.

### 4. Performance Budget Enforcement
Generation pipeline MUST process up to 5,000 nodes in ≤ 5.0s on a typical modern laptop (8+ logical cores) using a warm build. Performance tests MUST fail fast if budget exceeded. Rationale: Keeps tool responsive and prevents unnoticed slow creep.

### 5. Transparent Local Observability
Session metadata (counts, duration, warnings) MUST be captured locally and exportable on demand. No silent suppression of errors; warnings exposed in structured form. Rationale: Facilitates debugging without external telemetry overhead.

### 6. Explicit Scope & Deferral
Out-of-scope items (e.g., image export, complex constraint scaling, variant props) MUST be listed in specs and not partially implemented. Any deviation requires documented amendment. Rationale: Prevents hidden partial features that raise maintenance cost.

### 7. Clarity Over Ambiguity
Specs MUST contain no unresolved `[NEEDS CLARIFICATION]` markers before planning. Vague adjectives ("robust", "fast") replaced with explicit metrics or removed. Rationale: Ensures alignment and testability.

## Constraints & Quality Gates
1. No global mutable singletons aside from controlled localStorage key for session log.
2. Style extraction functions MUST be pure (no side effects, no DOM access).
3. All new modules require: unit tests + (if applicable) integration/performance scenario.
4. Lint and type checks MUST pass before merge.
5. Performance test MUST assert time budget for synthetic worst-case 5,000 node IR.
6. Accessibility placeholders (e.g., "IMG" text) MUST remain configurable for future i18n.

## Development Workflow
1. Clarify → Plan → Tasks → Implement → Validate sequence MUST be followed; skipping clarification requires explicit rationale logged in spec.
2. Each task references originating requirement ID (FR-xxx) or principle #.
3. Commit messages SHOULD include scope tag (e.g., `feat:`, `test:`) and reference requirement/principle when relevant.
4. Snapshot tests allowed only for deterministic outputs; update requires reviewer approval.

## Governance
This Constitution governs quality expectations and overrides ad-hoc shortcuts. Amendments:
1. Propose change in PR with rationale & impact summary.
2. Determine semantic version bump (MAJOR = incompatible principle removal/change, MINOR = added/expanded principle, PATCH = clarification).
3. Update Constitution and sync impact comment.
4. Ensure templates (.specify/templates/*) reflect new or removed rules.
5. Upon merge, tag commit with constitution version.

Non-compliance Handling:
- Block merge until violation resolved or justified in "Complexity Tracking" of plan.
- Repeated unjustified deviations escalate to principle refactor discussion.

**Version**: 1.0.0 | **Ratified**: 2025-09-30 | **Last Amended**: 2025-09-30
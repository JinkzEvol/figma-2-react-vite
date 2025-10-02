# Tasks: Footer Fidelity & Extraction Improvements

Branch: `002-precise-layout-grouping`
Spec: `specs/002-precise-layout-grouping/spec.md`
Plan: `specs/002-precise-layout-grouping/plan.md`

Legend: [P] = Eligible for parallel execution (isolated files / low coupling)
Each task references Functional Requirement IDs (FR-xxx) or principles.

## Parallel Execution Guidance
Groupings suggested (can run in same wave):
- Wave A (Contract Tests): T004–T008
- Wave B (Core Implementations after tests): T011, T013, T015, T017
- Wave C (Aux Perf & A11y & Color): T020–T022
Adjust if local resource constraints differ.

---
## Task List

T001 [X] Setup: Confirm environment & install deps (npm ci). Ensure Vitest, lint, typecheck baseline pass.
- Output: Clean baseline run log (lint currently reports existing any/escape issues to be resolved in T027 cleanup)
- Depends: none

T002 [X] Add placeholder directories & index exports for new modules (`src/grouping/`, `src/styles/`, `src/icons/`).
- Output: empty TS files with TODO headers and placeholder implementations
- Depends: T001

T003 [X] Test Harness Prep: Add new integration test file skeleton `src/tests/integration/renderingImprovements.integration.test.ts` referencing upcoming modules.
- Output: failing test scaffold (skipped sections initially) – placeholders added
- Depends: T001

T004 [X] Contract Test: Grouping (`tests/contract/grouping.contract.test.ts`)
- Tests for detection success, misalignment exclusion, gap variance exclusion (FR-001, FR-002) passing
- Depends: T002

T005 [X] Contract Test: Style Token Registry (`tests/contract/styleTokens.contract.test.ts`)
- Tests for dedupe, deterministic naming, usageCount (FR-003, FR-010) passing
- Depends: T002

T006 [X] Contract Test: Icon Export (`tests/contract/iconExport.contract.test.ts`)
- Tests: success export stub, failure fallback placeholder, accessible label derivation (FR-007) passing
- Depends: T002

T007 [X] Contract Test: Color Fidelity (`tests/contract/colorFidelity.contract.test.ts`)
- Tests ΔE path vs brand exact match (FR-015) passing
- Depends: T002

T008 [X] Contract Test: Logging Events (`tests/contract/loggingEvents.contract.test.ts`)
- Tests schema shape & required fields for each event type (FR-013) passing
- Depends: T002

T008a [X] Contract Test: Placeholder Suppression (`tests/contract/textPlaceholderSuppression.contract.test.ts`)
- Ensures non-empty text nodes never render placeholder skeletons (FR-004) passing
- Depends: T005

T008b [X] Contract Test: Semantic Structure (`tests/contract/semanticStructure.contract.test.ts`)
- Validates (heuristic phase) column text grouping; future update will enforce footer landmark & list semantics (FR-008) – current heuristic passing
- Depends: T006

T008c [X] Contract Test: Opacity & Color Fallback Chain (`tests/contract/colorOpacityFallback.contract.test.ts`)
- Asserts resolution order: node → ancestor → brand → neutral → placeholder; opacity multiplication (FR-009) passing
- Depends: T007

T008d [P] Performance Smoke Test (Early) (`tests/performance/perfSmoke.contract.test.ts`)
- 4-column synthetic footer median <5ms/column (FR-011 early)
- Depends: T011

T008e [P] Determinism Smoke Test (Early) (`tests/contract/determinismSmoke.contract.test.ts`)
- Two consecutive generations identical after grouping + tokens (FR-012 early)
- Depends: T011,T013

T008f [X] Token Collision & Long Name Test (`tests/contract/tokenCollision.contract.test.ts`)
- Verifies hash fallback (>40 chars) + uniqueness (FR-003/FR-010) passing
- Depends: T005

T008g [X] Spacing & Padding Contract (`tests/contract/spacingPadding.contract.test.ts`)
- Validates ±1px tolerance numeric IR values for padding & gap (FR-005) passing
- Depends: T011

T008h [X] Large IR Performance Budget (`tests/performance/largeIR.performance.test.ts`)
- 5,000 node IR <5s & logs performance_sample (FR-011, Constitution Performance) passing
- Depends: T011,T013

T009 [X] Integration Story Test: Column grouping visual structure baseline (Acceptance Scenario #1) passing.
- Depends: T004

T010 [X] Integration Story Test: Real text vs placeholders (Acceptance Scenario #2) verifying absence of skeleton bars for non-empty text passing.
- Depends: T005

T011 [X] Implement Grouping Module `src/grouping/columnGrouping.ts` with pure function + types; tests passing (FR-001, FR-002).
- Depends: T004

T012 [X] Integration Story Test: Icon rendering + fallback (Scenario #3) verifying inline SVG or placeholder per failure path passing.
- Depends: T006

T013 [X] Implement Style Token Registry `src/styles/styleTokenRegistry.ts` (dedupe, deterministic naming, hash fallback) (FR-003, FR-010) complete.
- Depends: T005

T014 [X] Integration Story Test: Padding & gap fidelity (Scenario #4) asserting ±1px tolerance and no height inflation (FR-005) passing.
- Depends: T011

T015 [X] Implement Icon Export `src/icons/exportIcon.ts` with fallback placeholder logic + label normalization (FR-007) complete.
- Depends: T006

T016 [X] Integration Story Test: Non-wrapping horizontal overflow & scrollbar presence (Scenario #5) verifying layout does not wrap (FR-006 clarified) & scroll available (heuristic) passing.
- Depends: T011

T017 [X] Extend Logging Events `src/logging/events.ts` + integrate calls in grouping, token, icon code (FR-013) complete.
- Depends: T011,T013,T015

T018 [X] Integrate Style Tokens into Code Generation (`src/codeGenerator.ts`), replacing placeholder bars with real text + color/opacity fallback chain implemented (FR-003, FR-004, FR-009).
- Depends: T013

T019 [X] Integrate Icon Export & Fallback in Code Generation + add ARIA labels (FR-007, FR-008) complete.
- Depends: T015

T020 [X] Performance Harness Update: Column scaling test (12 & 20 columns) median ms/column <10 implemented & passing.
- Depends: T011,T013

T021 [X] Color Fidelity Utility & Tests: Implement CIEDE2000 and brand exactness enforcement; verify brand palette exact hex & opacity inheritance fallback (FR-015, FR-009) complete.
- Depends: T007

T022 [X] Accessibility Assertions: Assert icons have accessible labels (normalization kebab→sentence case), heading hierarchy, list semantics (<ul>/<li>), and logical focus order (tab sequence left→right) (FR-008) passing.
- Depends: T012,T019

T023 Deterministic Ordering Enforcement: Run 3 consecutive generation cycles with identical input; assert snapshots identical (FR-012, Determinism Principle #2).
- Depends: T011,T013,T015

T024 Integrate Non-Wrapping Overflow Behavior in Preview component with horizontal scroll styling (FR-006) and update integration snapshots.
- Depends: T016

T025 Final Integration: Combine style token + icon + logging updates, run full test suite, resolve any snapshot updates (no new logic) (FR-003, FR-004, FR-007, FR-008, FR-009, FR-013).
- Depends: T018,T019,T017

T026 [X] Observability Validation: Assert logging events emitted with expected payload counts including performance_sample (msPerColumn), timestamp (ts), and absence of grouping_skipped when grouping succeeds (FR-013) passing.
- Depends: T017

T027 Cleanup & Refactor Pass: Remove TODOs, ensure purity of functions, run lint & type checks (Clarity & Lean Architecture Principles).
- Depends: T025,T026

T028 Documentation Update: Expand `quickstart.md` with any adjustments & add README section summarizing new footer fidelity capabilities.
- Depends: T027

T029 Performance Re-Verification: Re-run harness capturing metrics artifact; update docs if budget close to threshold.
- Depends: T020,T027

T030 Final Gate Review: Ensure all FRs mapped to tests, update plan progress (Phase 2 & Post-Design Constitution Check PASS), prepare PR description referencing FR IDs.
- Depends: T028,T029

T031 [X] Large Column Functional Test: Create scenario with ≥20 columns verifying semantic container, scroll behavior, absence of wrapping, and consistent ordering (FR-014, FR-006, FR-012 linkage) passing.
- Depends: T011,T020

---
## Mapping Summary
- Contracts → T004–T008
- Entities (FooterSection, FooterColumn, TextStyleToken, IconAsset, InstrumentationEvent) represented via implementation tasks T011, T013, T015, T017
- User Stories (5 acceptance scenarios) covered by T009, T010, T012, T014, T016
- Padding & Gap (FR-005) → T014
- Color & Opacity (FR-009) → T018, T021
- Unlimited Columns (FR-014) → T031 (functional) & T020 (performance)
- Non-functional: Performance (T020,T029), Determinism (T023), Accessibility (T022), Observability (T026), Color fidelity (T021)

## Completion Criteria
All tasks T001–T031 complete; every FR explicitly referenced by ≥1 task; 3-run determinism test green; median perf <10ms/column; accessibility semantics (labels, lists, focus) validated; large-column scenario passes; color & opacity fidelity rules enforced; logging events (including performance_sample with ts) verified; docs updated; PR ready.

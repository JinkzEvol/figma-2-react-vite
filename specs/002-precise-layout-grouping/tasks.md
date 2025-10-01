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

T001 Setup: Confirm environment & install deps (npm ci). Ensure Vitest, lint, typecheck baseline pass.
- Output: Clean baseline run log
- Depends: none

T002 Add placeholder directories & index exports for new modules (`src/grouping/`, `src/styles/`, `src/icons/`).
- Output: empty TS files with TODO headers
- Depends: T001

T003 Test Harness Prep: Add new integration test file skeleton `src/tests/integration/renderingImprovements.integration.test.ts` referencing upcoming modules.
- Output: failing test scaffold (skipped sections initially)
- Depends: T001

T004 [P] Contract Test: Grouping (`tests/contract/grouping.contract.test.ts`)
- Create failing tests for detection success, misalignment exclusion, gap variance exclusion (FR-001, FR-002)
- Depends: T002

T005 [P] Contract Test: Style Token Registry (`tests/contract/styleTokens.contract.test.ts`)
- Tests for dedupe, deterministic naming, usageCount (FR-003, FR-010)
- Depends: T002

T006 [P] Contract Test: Icon Export (`tests/contract/iconExport.contract.test.ts`)
- Tests: success export stub, failure fallback placeholder, accessible label derivation (FR-007)
- Depends: T002

T007 [P] Contract Test: Color Fidelity (`tests/contract/colorFidelity.contract.test.ts`)
- Tests ΔE path vs brand exact match (FR-015)
- Depends: T002

T008 [P] Contract Test: Logging Events (`tests/contract/loggingEvents.contract.test.ts`)
- Tests schema shape & required fields for each event type (FR-013)
- Depends: T002

T009 Integration Story Test: Column grouping visual structure baseline (Acceptance Scenario #1) in `tests/integration/renderingImprovements.integration.test.ts` (unskip relevant block) expecting multi-column container semantics.
- Depends: T004

T010 Integration Story Test: Real text vs placeholders (Acceptance Scenario #2) verifying absence of skeleton bars for non-empty text.
- Depends: T005

T011 [P] Implement Grouping Module `src/grouping/columnGrouping.ts` with pure function + types; ensure tests pass (FR-001, FR-002).
- Depends: T004

T012 Integration Story Test: Icon rendering + fallback (Scenario #3) verifying inline SVG or placeholder per failure path.
- Depends: T006

T013 [P] Implement Style Token Registry `src/styles/styleTokenRegistry.ts` (dedupe, deterministic naming, hash fallback) (FR-003, FR-010).
- Depends: T005

T014 Integration Story Test: Padding & gap fidelity (Scenario #4) asserting ±1px tolerance and no height inflation (FR-005).
- Depends: T011

T015 [P] Implement Icon Export `src/icons/exportIcon.ts` with fallback placeholder logic + label normalization (FR-007).
- Depends: T006

T016 Integration Story Test: Non-wrapping horizontal overflow & scrollbar presence (Scenario #5) verifying layout does not wrap (FR-006 clarified) & scroll available.
- Depends: T011

T017 [P] Extend Logging Events `src/logging/events.ts` + integrate calls in grouping, token, icon code (FR-013).
- Depends: T011,T013,T015

T018 Integrate Style Tokens into Code Generation (`src/codeGenerator.ts`), replacing placeholder bars with real text (FR-003, FR-004, FR-009 color/opacity fallback).
- Depends: T013

T019 Integrate Icon Export & Fallback in Code Generation + add ARIA labels (FR-007, FR-008).
- Depends: T015

T020 [P] Performance Harness Update: Add column scaling test (12 & 20 columns) run 3 warm runs; assert median ms/column <10; record distribution & log performance_sample event (FR-011, Performance Principle #4).
- Depends: T011,T013

T021 [P] Color Fidelity Utility & Tests: Implement CIEDE2000 and brand exactness enforcement; verify brand palette exact hex & opacity inheritance fallback (FR-015, FR-009).
- Depends: T007

T022 [P] Accessibility Assertions: Assert icons have accessible labels (normalization kebab→sentence case), heading hierarchy, list semantics (<ul>/<li>), and logical focus order (tab sequence left→right) (FR-008).
- Depends: T012,T019

T023 Deterministic Ordering Enforcement: Run 3 consecutive generation cycles with identical input; assert snapshots identical (FR-012, Determinism Principle #2).
- Depends: T011,T013,T015

T024 Integrate Non-Wrapping Overflow Behavior in Preview component with horizontal scroll styling (FR-006) and update integration snapshots.
- Depends: T016

T025 Final Integration: Combine style token + icon + logging updates, run full test suite, resolve any snapshot updates (no new logic) (FR-003, FR-004, FR-007, FR-008, FR-009, FR-013).
- Depends: T018,T019,T017

T026 Observability Validation: Assert logging events emitted with expected payload counts including performance_sample (msPerColumn), timestamp (ts), and absence of grouping_skipped when grouping succeeds (FR-013).
- Depends: T017

T027 Cleanup & Refactor Pass: Remove TODOs, ensure purity of functions, run lint & type checks (Clarity & Lean Architecture Principles).
- Depends: T025,T026

T028 Documentation Update: Expand `quickstart.md` with any adjustments & add README section summarizing new footer fidelity capabilities.
- Depends: T027

T029 Performance Re-Verification: Re-run harness capturing metrics artifact; update docs if budget close to threshold.
- Depends: T020,T027

T030 Final Gate Review: Ensure all FRs mapped to tests, update plan progress (Phase 2 & Post-Design Constitution Check PASS), prepare PR description referencing FR IDs.
- Depends: T028,T029

T031 Large Column Functional Test: Create scenario with ≥20 columns verifying semantic container, scroll behavior, absence of wrapping, and consistent ordering (FR-014, FR-006, FR-012 linkage).
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

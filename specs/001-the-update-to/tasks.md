# Tasks: Rendering Pipeline Fidelity Update (Lean V1)

**Input**: Design documents in `specs/001-the-update-to/`
**Prerequisites**: plan.md (complete), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (summary)
Follows constitution principles: Test-First Fidelity, Deterministic Output, Lean Architecture, Performance Budget.
Order: Setup → Contract & Unit Tests → Integration Tests → Core Implementation → Logging & Export → Performance Harness → Polish & Docs.

Legend: [P] = Parallel eligible (different files, no dependency ordering conflict)

---
## Phase 3.1: Setup
- [X] T001 Initialize test framework (Vitest) config in `vitest.config.ts`; add npm script `test` (Enables Principle #1 Test-First, supports all FR tests).
- [X] T002 Add performance test harness utility scaffold in `src/tests/performance/harness.ts` (no implementation yet) (depends T001) (FR-020, Principle #4).
- [X] T003 [P] Add `src/ir/` and `src/logging/` directories with placeholder index files (Principle #3 Lean Architecture, FR-021/FR-022 infra).
- [X] T004 Configure ESLint/TypeScript updates if needed for new folders (update `tsconfig.json` includes) (Principle #7 Clarity & Quality Gate #4).

## Phase 3.2: Contract & Unit Tests (Must fail initially)
- [X] T005 [P] Purity test for style extractors (no DOM/global access) in `src/tests/style/purity.test.ts` (Principle #2, FR-008/FR-010/FR-013 support).
- [X] T006 [P] Create contract test for IR builder in `src/tests/ir/buildIR.contract.test.ts` referencing `contracts/ir-contract.md` (FR-001, FR-004, FR-016, FR-017).
- [X] T007 [P] Create contract test for style extraction in `src/tests/style/extractAllStyles.contract.test.ts` referencing `contracts/style-extraction-contract.md` (FR-005–FR-014 subset).
- [X] T008 [P] Create contract test for session logging in `src/tests/logging/sessionLog.contract.test.ts` referencing `contracts/logging-contract.md` (FR-021).
- [X] T009 Author gradient angle unit test in `src/tests/style/gradientAngle.test.ts` (FR-009 depends T007).
- [X] T010 Shadow + blur combination unit test in `src/tests/style/effectsCombination.test.ts` (FR-010, FR-013 depends T007).
- [X] T011 Image placeholder unit test in `src/tests/style/imagePlaceholder.test.ts` (FR-014 depends T007).
- [X] T012 Text styling fidelity unit test in `src/tests/style/textStyles.test.ts` (FR-005, FR-006 depends T007).
- [X] T013 Auto-layout layout + padding + gap mapping unit test in `src/tests/style/autoLayoutMapping.test.ts` (FR-001, FR-002, FR-003 depends T007).
- [X] T014 Unknown node fallback unit test in `src/tests/ir/unknownNodeFallback.test.ts` (FR-015 depends T006).
- [X] T015 Hidden node exclusion unit test in `src/tests/ir/hiddenNodeExclusion.test.ts` (FR-017 depends T006).
- [X] T016 Text wrapping under fixed width unit test in `src/tests/style/textWrapping.test.ts` (FR-018 depends T012).
- [X] T017 Style serialization ordering + deterministic output unit test in `src/tests/style/serializationOrder.test.ts` (FR-019 depends T007).
 - [X] T018 Opacity precision & alpha application unit test in `src/tests/style/opacityPrecision.test.ts` (FR-012 depends T007).
 - [X] T019 No-fill negative case unit test (no background style when fills empty) in `src/tests/style/noFillBackground.test.ts` (FR-008 depends T007).
 - [X] T020 Accessibility placeholder semantics test (role/aria-label for IMG proxy) in `src/tests/style/imagePlaceholderA11y.test.ts` (FR-014 depends T011).
 - [X] T021 Logging warnings funnel unit test ensuring recorded warnings appear in export in `src/tests/logging/warningFunnel.test.ts` (FR-021, FR-022 depends T008).

## Phase 3.3: Integration Scenario Tests (from User Stories) (Must fail initially)
- [X] T022 [P] Integration test: auto-layout fidelity (nested frames) in `src/tests/integration/autoLayout.integration.test.ts` (depends T013) (FR-001, FR-002, FR-003).
- [X] T023 [P] Integration test: text styling + wrapping + opacity interplay in `src/tests/integration/textFidelity.integration.test.ts` (depends T012, T016, T018) (FR-005, FR-006, FR-012, FR-018).
- [X] T024 [P] Integration test: effects (shadow + blur) in `src/tests/integration/effects.integration.test.ts` (depends T010) (FR-010, FR-013).
- [X] T025 [P] Integration test: image placeholder in `src/tests/integration/imagePlaceholder.integration.test.ts` (depends T011, T020) (FR-014).
- [X] T026 [P] Integration test: performance 5k nodes baseline in `src/tests/integration/performance.integration.test.ts` (depends T002) (FR-020, Principle #4).
- [X] T027 [P] Integration test: session log export JSON schema correctness in `src/tests/integration/logExport.integration.test.ts` (FR-022 depends T008, T021).

## Phase 3.4: Core Implementation
- [X] T028 Implement IR builder `src/ir/buildIR.ts` per contract (depends T006, T013, T022 failing tests remain).
- [X] T029 Implement normalization helpers `src/ir/normalize.ts` (depends T028).
- [X] T030 Extend style extraction to include blur + placeholder logic in `src/styleExtractors.ts` (depends T007, T009, T010, T011, T019).
- [X] T031 Add gradient angle calculation integration in `src/styleExtractors.ts` (depends T009; may merge into T030 if desired).
- [X] T032 Update `src/codeGenerator.ts` to optionally operate from IR root (depends T028, T030).
- [X] T033 Implement session logging module `src/logging/sessionLog.ts` (depends T008, T021).
- [X] T034 Wire logging export trigger in preview component `src/preview/FigmaPreview.tsx` (depends T033).
- [X] T035 Implement image placeholder rendering logic (mid-gray + IMG) in generator or style extraction (depends T011, T030, T020).
- [X] T036 Add opacity + deterministic ordering safeguards (node ordering, stable style serialization) (depends T028, T030, T017, T018).

## Phase 3.5: Performance & Determinism
- [ ] T037 Implement performance harness measurement utilities in `src/tests/performance/harness.ts` (depends T002, core implementations T028-T032) (FR-020, Principle #4).
- [ ] T038 Add performance test assertions (< 5000ms) in `src/tests/integration/performance.integration.test.ts` (depends T037, T026) (FR-020).
- [ ] T039 Add snapshot baseline test for deterministic output in `src/tests/integration/determinism.snapshot.test.ts` (depends T032, T036) (FR-019, Principle #2).

## Phase 3.6: Polish & Documentation
- [ ] T040 Refine error/warning messages; ensure all warnings funnel through session log (depends T033, T034) (FR-021, FR-022, Principle #5).
- [ ] T041 Add quickstart verification script/instructions update in `quickstart.md` (depends prior implementation tasks) (Principle #7 clarity reinforcement).
- [ ] T042 Add README section summarizing fidelity guarantees and limitations (depends T030-T036) (Principles #3, #6).
- [ ] T043 Add accessibility note on placeholder "IMG" text and potential i18n (depends T035, T042) (FR-014 future i18n note, Principle #5).
- [ ] T044 Remove unused scaffolds / dead code (post convergence) (depends full implementation) (Principle #3 Lean).
- [ ] T045 Final lint/type pass and ensure all tests green (Quality Gate #4, all FRs).

## Phase 3.7: React Component Generation Enhancement (New)
Purpose: Expand code generator beyond nested createElement string to produce an actual reusable React component source file (aligns with Principles #1 Test-First, #2 Deterministic Output, #3 Lean Architecture, #6 Composability, #7 Clarity).

- [X] T046 Add failing contract test for React component generation in `src/tests/codegen/reactComponentGeneration.contract.test.ts` verifying:
	- Exports `FigmaComponent` (React.FC)
	- Accepts optional `className` prop merged onto root
	- Preserves fidelity styles (opacity, white-space, gradients) inline or via stable style object
	- Deterministic order of style keys & child structure
	- No global/window access (purity of generator function)
	(Depends: T028, T029, T030, T031, T036)
- [X] T047 Implement `generateReactComponentSource(ir, options)` in `src/codeGenerator.ts` (or new `src/codegen/reactComponentGenerator.ts`):
	- Returns TSX string containing `import * as React from 'react'` and `export const FigmaComponent: React.FC<{className?: string}> = (props) => { ... }`
	- Internalizes IR-to-React tree mapping (div / span for text) with deterministic ordering
	- Injects passed `className` if provided (merged via template literal)
	- Optionally exposes a memoized variant if `options.memo` true
	- Ensures style emission uses kebab-case keys for legibility & matches existing tests
	- Reuses existing extraction logic; does NOT duplicate style algorithms
	(Depends: T046)
- [X] T048 Add snapshot determinism test `src/tests/integration/reactComponentDeterminism.snapshot.test.ts` that:
	- Generates component twice (same IR) and asserts identical output
	- (Later) diff after IR mutation to ensure change reflects only expected nodes
	(Depends: T047, integrates with future T039 determinism scope)
- [X] T049 Update docs: augment `quickstart.md` & README with section "Generating a React Component" including usage example, options table, and determinism note (Depends: T047, T048, relates T041, T042). (Completed: sections added to quickstart & README.)

## Phase 3.8: PAT Persistence & Navigation UX Enhancement (New)
Purpose: Improve usability by persisting the entered Figma Personal Access Token (PAT) across the session and adding explicit navigation affordances between the generator (URL entry) and PAT entry views.

- [ ] T073 Add failing integration test for PAT persistence in `src/tests/integration/patPersistence.integration.test.ts` verifying:
	- Enter PAT on PAT page, navigate to URL/generator page, refresh simulated (re-mount App) → PAT is pre-populated or step skips directly to URL entry (no re-entry required within same browser session).
	- Persistence mechanism: `localStorage` key (e.g., `figmaPat`) read on startup; security note: token stays in browser only.
	- Clearing PAT (future) not in scope; test only asserts persistence when set.
	(Depends: existing App step navigation & PAT input component.)
- [ ] T074 Implement PAT persistence (read/write localStorage) and auto-skip behavior if PAT already stored. Update any security disclaimer text in quickstart if needed.
- [ ] T075 Add "Add PAT" button on generator (URL entry) page that routes back to PAT entry step (does not clear stored PAT unless user overwrites). Include accessibility label.
- [ ] T076 Add "Back to generator" button on PAT entry page that routes to URL entry (generator) step. (Update existing navigation if present.) Add integration test in `patPersistence.integration.test.ts` (or separate `patNavigation.integration.test.ts`) asserting both buttons change steps correctly without losing PAT state.

### Phase 3.8 Implementation Notes
Rationale: Reduces friction by eliminating repeated PAT entry during iterative design fetch cycles. Uses `localStorage` (vs `sessionStorage`) so that a browser tab refresh or re-open within the same device context keeps the token available until explicit user overwrite (future clear task can be added in Phase 3.R). Security trade-off documented in quickstart (token stored in plaintext in local browser storage; user advised to revoke if concerned).

Acceptance Criteria Summary:
1. With a stored PAT, initial App render immediately shows URL entry step (skips PAT form) OR pre-populates password field with placeholder masking and focuses URL input.
2. PAT value persisted after navigation to preview page and back, and after full React remount (simulated by test re-importing `App`).
3. Navigation buttons have accessible names: "Add PAT" (role=button, aria-label includes PAT), "Back to generator" (existing semantics acceptable if text content present).
4. No console errors during persistence flow; tests assert absence of thrown errors.
5. PAT never appears in generated code output or logs (non-regression check could be added to integration test by searching exported session log once logging integrated with PAT handling—out of current scope but noted for T040 review).

Implementation Sketch:
- Hook: small `usePersistentPat()` custom hook encapsulating read/write to `localStorage` key `figmaPat` and providing `{ pat, setPat, hasStored }`.
- App changes: on mount, attempt load; if present and non-empty, call `setStep('url')` directly.
- Write path: on successful PAT submit, persist to `localStorage`.
- Buttons: In URL step, add secondary button "Add PAT" to return to PAT step without clearing value. In PAT step add secondary outline button "Back to generator" when PAT already persisted (skip if not yet stored to avoid premature navigation).

Testing Strategy (T073/T076):
- Render App, enter PAT, advance to URL step, unmount & remount component → assert step state is 'url'.
- Confirm `localStorage.getItem('figmaPat')` equals entered value.
- Click "Add PAT" from URL step → expect PAT form visible and input masked but underlying value loaded.
- Modify PAT and submit → localStorage updated; return to URL step.
- From PAT step (with stored PAT), click "Back to generator" → step 'url' with unchanged stored PAT.

Edge Cases & Safeguards:
- Empty PAT submission still blocked (existing validation unchanged).
- If localStorage throws (rare private mode scenario), fallback gracefully to in-memory (wrap calls in try/catch and no crash). (Optional micro enhancement; can be deferred if environment stable.)
- If stored PAT is blank string, treat as not stored.

Documentation (T074 follow-up): quickstart obtains new subsection "Persisting Your PAT" with directions to revoke/regenerate at any time.

Future Deferred (not in this phase):
- TBD Clear PAT / Sign out button
- Encryption or secure enclave storage (likely overkill; document deferral)
- Multi-PAT management for org/team contexts


## Updates / Notes
- New tasks T046–T049 extend original scope without renumbering prior phases; dependencies reference existing implementation tasks.

## Dependencies Summary
- Tests (T005-T027) must exist and fail prior to implementation tasks (T028+).
- IR tasks (T028-T029) precede generator update (T032) and performance harness (T037).
- Style extraction enhancements (T030-T031) precede deterministic + snapshot tasks (T039) and serialization safeguards (T036).
- Logging (T033-T034) precedes polish logging refinement (T040).
- Accessibility & negative cases validated before final placeholder implementation (T020, T035) and docs (T043).

## Parallel Execution Examples
```
# Example parallel batch after setup:
T005 T006 T007 (contract tests in separate files)

# Integration tests parallel batch:
T013 T014 T015 T016 T017

# Core implementation parallel opportunities (after prerequisites):
T018 (IR) and T020 (style) can begin once their respective tests exist.
```

## Validation Checklist
- All contracts have initial failing tests: T006, T007, T008
- Purity enforced: T005
- Opacity unit test: T018
- No-fill negative test: T019
- Accessibility placeholder test: T020
- Logging funnel test: T021
- Each entity (DesignNode, SessionLog) has corresponding IR/logging tasks: T028, T029, T033
- User stories mapped to integration tests: T022-T027
- Performance requirement enforced: T037, T038
- Determinism enforced: T017, T036, T039
- Logging & export: T033, T034, T040, T027 export test, T021 warnings funnel
- Image placeholder: T011, T025, T035, T043
- Blur and gradient: T009, T010, T024, T030, T031
- Unknown node fallback: T014
- Hidden node exclusion: T015
- Text wrapping + opacity interplay: T016, T023

---
Generated: 2025-09-30

---
## Phase 3.R: Remediation & Alignment Tasks (Post-Analysis)
Added after analysis to address specification, determinism, performance, and documentation gaps. All begin as failing / incomplete until executed. Reference IDs (in parentheses) map to analysis issue codes.

- [ ] T050 Spec & plan addendum for React component generator (I1) — Update `spec.md` & `plan.md` to formally include Phase 3.7 scope, rationale, and constitution alignment.
- [X] T051 Data model vs IR alignment (C3) — Reconcile `DesignNode` shape (decide between `box` object or flat width/height/opacity) and update either code or `data-model.md` with rationale. (Chose flattened fields; documented rationale in data-model.md under T051 Rationale.)
- [X] T052 Style color format decision (D1) — Standardize opaque color output (choose `rgb()` or `rgba()`), update `style-extraction-contract.md`, tests, and implementation. (Chose: rgb for alpha=1, rgba otherwise; contract updated, tests already aligned, no code change needed.)
- [ ] T053 Determinism baseline snapshot (D2) — Author earlier snapshot baseline test (or adjust T039) to enforce determinism before performance tuning.
- [X] T054 Node ordering rule definition (A1) — Document explicit traversal ordering (pre-order preserving original child index) and add dedicated test. (Implemented test `nodeOrdering.test.ts`; contract updated with traversal rule.)
- [ ] T055 Quickstart credential clarity (A2) — Expand `quickstart.md` with variable names, example PAT format, and fallback behavior.
- [ ] T056 Performance assertion integration (C2) — Implement T038 threshold assertion (<5000ms) plus doc note describing measurement method.
- [ ] T057 Logging truncation policy clarification (U1) — Specify minimum retained warnings & ordering (FIFO) in `logging-contract.md`; adjust code if needed.
- [ ] T058 Gradient angle formula reconciliation (U2) — Align `research.md` formula with implementation; include worked example and chosen convention.
- [ ] T059 Placeholder semantics specification (U3) — Document explicit placeholder color `#CCCCCC` and aria-label template `{name} placeholder {WxH}`.
- [ ] T060 Performance hardware profile documentation (U4) — Add reference hardware/environment profile to `plan.md` and performance test comments.
- [ ] T061 Text wrapping rule specification (U5) — Add rule (white-space: pre-wrap; word-break: break-word) to `style-extraction-contract.md`.
- [ ] T062 Consolidate gradient angle tasks (Dup1) — Annotate that T031 merged into T030 to remove redundancy.
- [ ] T063 Reduce execution flow duplication (Dup2) — Replace repeated execution flow narrative in this file with a pointer to `plan.md` (single source).
- [ ] T064 Box shadow location clarification (T1) — Clarify in `data-model.md` whether `boxShadow` resides under `visual` or is a derived style only; update contract/spec.
- [ ] T065 SessionLog timestamp alignment (T2) — Add `timestamp` to logging contract or remove from data model; document choice.
- [ ] T066 i18n placeholder configurability (NC1) — Externalize placeholder aria-label pattern into a helper allowing future localization.
- [ ] T067 Session log empty warnings test (E1) — Add test ensuring empty warnings array serializes explicitly (not omitted).
- [ ] T068 Gradient missing stops test (E2) — Add test verifying gradients without valid stops are ignored.
- [ ] T069 Constitution governance note (CG1) — Add README section referencing Constitution version & amendment process.
- [ ] T070 Quickstart export helper clarity (A3) — Show example `window.exportSessionLog()` (or documented path) usage in console.
- [ ] T071 Historical task annotation (L1) — Append “(initially failing)” notes to tasks whose purpose was to start red (e.g., T046).
- [ ] T072 Remove stale clarification reference (L2) — Update `plan.md` to explicitly state no outstanding NEEDS CLARIFICATION markers.


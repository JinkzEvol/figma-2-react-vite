
# Implementation Plan: Footer Fidelity & Extraction Improvements

**Branch**: `002-precise-layout-grouping` | **Date**: 2025-10-01 | **Spec**: `specs/002-precise-layout-grouping/spec.md`
**Input**: Feature specification from that path

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Improve fidelity of generated footers (and similar multi-column sections) by: precise horizontal column grouping; elimination of placeholder bars when real text exists; extraction of text style tokens; accurate padding & gap application; deterministic, non-wrapping horizontal layout with scrollbar overflow; accessible semantic structure; icon inline SVG export with fallback; color & opacity fidelity; style de-duplication; performance + determinism instrumentation.

Primary success: Preview output visually matches Figma footer within ±1px spacing/font tolerance; brand colors exact; other colors ΔE≤3; columns never wrap; unlimited columns scroll horizontally; deterministic snapshot stable across runs.

## Technical Context
**Language/Version**: TypeScript (ESNext)  
**Primary Dependencies**: Vite + React, internal IR & style extraction modules  
**Storage**: N/A (in-memory processing)  
**Testing**: Vitest + existing snapshot / integration harness  
**Target Platform**: Browser preview + Node-based test runner  
**Project Type**: Single web frontend code generator  
**Performance Goals**: <10ms added processing per footer column on reference laptop (4c/8t ~2.4GHz) ; overall pipeline remains within existing performance tests (≤5s for large documents)  
**Constraints**: Deterministic output ordering; no layout wrapping; unlimited columns must not degrade determinism; style extraction functions remain pure  
**Scale/Scope**: Columns potentially dozens (practically ≤20 typical); node graph up to 5,000 existing budget.

## Constitution Check
Principle alignment:
- Test-First Fidelity: Will add contract & integration tests BEFORE implementation (grouping detection, icon fallback, color tolerance, deterministic ordering, performance budget per column). PASS
- Deterministic Output: Introduce stable sorting + token naming hashing (pure). PASS (Design ensures no randomness)
- Lean Architecture: Reuse existing IR; add minimal utilities (groupingAnalyzer, styleTokenCache). PASS
- Performance Budget: Add micro-benchmark/perf test for footer with 12+ columns; enforce <10ms/column. PASS (budget defined)
- Transparent Observability: Extend logging instrumentation events. PASS
- Explicit Scope: Out-of-scope: responsive wrapping, theming, localization, column collapsing. Documented. PASS
- Clarity: No remaining NEEDS CLARIFICATION markers. PASS

No violations requiring Complexity Tracking at this stage.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── ir/                    # Existing IR build utilities
├── styleExtractors.ts     # Existing style extraction utilities
├── codeGenerator.ts       # Code generation entry
├── logging/               # Session & instrumentation logging
└── preview/               # FigmaPreview component

tests/
└── integration/           # Existing integration tests
      ├── performance.integration.test.ts
      └── renderingImprovements.integration.test.ts (to be added)
```

New/updated modules (planned):
- `src/grouping/columnGrouping.ts` (pure grouping detection)
- `src/styles/styleTokenRegistry.ts` (dedupe + token naming)
- `src/icons/exportIcon.ts` (inline SVG + fallback)
- `src/logging/events.ts` (extend instrumentation enums)

Contracts alignment note: Logging events contract (grouping_detected, grouping_skipped, token_dedup_applied, icon_export_failed, performance_sample) informs assertions in tasks T008 & T026.

**Structure Decision**: Extend single project; add small focused modules under new directories (`grouping/`, potential `icons/`) to keep architecture lean.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

Research Focus Items:
1. Heuristics: Validate tolerance values (≤2px top alignment, ±4px gap) across sample Figma files (ensure low false positives).
2. Token naming: Deterministic hash vs normalized style signature (choose collision-resistant, stable ordering).
3. Color ΔE computation: Lightweight CIEDE2000 implementation or small dependency impact.
4. Performance measurement harness improvement: Add micro-benchmark for N column scenario.
5. Accessibility labels for placeholder icons—derive from layer name normalization.

Decisions captured in `research.md` with rationale + alternatives.

**Output**: research.md with all items resolved (no open questions).

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate internal contracts** (no external HTTP API):
   - Grouping contract: Input = array of node metadata (id, x, y, width, height, children summary); Output = grouping result (ordered column arrays + reasons for exclusion)
   - Style token contract: Input = list of text style descriptors; Output = token map {tokenName -> styleProps}
   - Icon export contract: Input = vector node descriptor; Output = {svg:string|undefined, fallback:boolean, label:string}
   - Logging contract: Event schema for grouping_detected, grouping_skipped, token_dedup_applied, icon_export_failed, performance_sample.
   - Color fidelity evaluation contract: Input = expected color, actual color; Output = {match:boolean, delta:number, rule:brand|general}
   - These will be expressed as TypeScript interface definitions plus contract tests.

3. **Generate contract tests**:
   - One test per contract module verifying schema + negative cases (e.g., grouping rejects misaligned items).
   - Tests initially failing (unimplemented modules) to drive TDD.

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file** using script to include new modules & principles (kept concise).

**Output**: data-model.md, /contracts/* (TS interfaces), failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 22-28 numbered tasks (contract tests, grouping logic, token registry, icon export, performance harness, integration + snapshot updates).

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning approach documented (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*

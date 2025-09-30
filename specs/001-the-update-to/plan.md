
# Implementation Plan: Rendering Pipeline Fidelity Update (Lean V1)

**Branch**: `001-the-update-to` | **Date**: 2025-09-30 | **Spec**: `specs/001-the-update-to/spec.md`
**Input**: Feature specification for Lean V1 fidelity improvements

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
Deliver Lean V1 improvements to the Figma → React generation pipeline to achieve high visual fidelity for auto‑layout, spacing, text styling, fills (solid + linear gradients), shadows, blur effects, corner radii, image placeholders, and performance target (≤5.0s for 5,000 nodes). Adds local session logging + export while deferring advanced features (component variants, image fetching, semantic tags, constraint scaling). Core approach: introduce richer style extraction (already scaffolded), add blur & placeholder logic, implement layout + effect fidelity, and persist lightweight session metrics locally. Phase 3.7 extension (added post-initial planning) introduces deterministic TSX component generation (see spec addendum FR-023 / FR-024) without expanding runtime scope.

## Technical Context
**Language/Version**: TypeScript (TS 4.9.x) with React 18  
**Primary Dependencies**: react, react-dom, vite (build), internal style extraction utilities  
**Storage**: LocalStorage (single latest Generation Session JSON)  
**Testing**: Vitest or Jest (to be selected in Phase 0 research)  
**Target Platform**: Browser (modern evergreen)  
**Project Type**: Single-page web frontend (client-only)  
**Performance Goals**: Generate 5,000-node design ≤ 5.0s; style extraction O(n)  
**Constraints**: Memory overhead minimal (avoid large deep copies); no network image export in V1  
**Scale/Scope**: Designs ≤ 5,000 nodes; single user session; no backend persistence

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v1.0.0 defines active principles (Test-First Fidelity, Deterministic Output, Lean Architecture, Performance Budget, Observability, Scope & Deferral, Clarity). Current plan introduces no multi-repo complexity and stays within existing React Vite structure.

Initial Evaluation:
- Simplicity: Maintained (augment existing generator; add IR and logging modules only if justified).  
- Observability: Minimal (local log only) – acceptable for client-only scope.  
- Test-First Principle (implied best practice): Will create tests before implementation of new style translation and logging modules.  

Result: PASS (no violations detected; no complexity tracking entries needed yet).

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
├── codeGenerator.ts            # Updated generator assembling React createElement tree
├── styleExtractors.ts          # Style extraction utilities (fills, layout, shadows, text, blur)
├── figmaApi.ts                 # Fetch logic
├── types.ts                    # Extended FigmaNode types
├── ir/                         # (NEW) Intermediate representation builders (Phase 1)
│   ├── buildIR.ts              # Node → Normalized structure
│   └── normalize.ts            # Helpers (corner cases, defaults)
├── logging/                    # (NEW) Session logging utilities
│   ├── sessionLog.ts           # Record + export logic
├── preview/                    # (NEW) Components for preview UI wrappers
│   ├── FigmaPreview.tsx        # Container showing generated component + metrics
└── tests/                      # (NEW) Test root
      ├── style/                  # Unit tests for style extraction
      ├── ir/                     # IR builder tests
      ├── performance/            # Performance budget test harness
      └── logging/                # Log persistence tests
```

**Structure Decision**: Extend existing single frontend project; add focused subfolders (`ir`, `logging`, `preview`, `tests`) to isolate concerns and enable incremental future expansion (tokens, components) without restructuring.

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

Unknowns & Research Targets:
1. Select test framework (Vitest vs Jest) – prefer Vitest (native Vite integration).  
2. Determine minimal IR shape (fields required for V1 without overfitting).  
3. Gradient angle approximation formula validation (handle positions).  
4. Performance measurement strategy (timing API + synthetic large tree).  
5. LocalStorage quota considerations (size of single session log).  

Research Output Format (in `research.md`): Each decision with rationale + 1–2 rejected alternatives.

**Output**: `research.md` with unknowns resolved, decisions captured.

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities** → `data-model.md`:
   - DesignNode (normalized) fields: id, type, name, layout (flex props, sizing), box (width/height, opacity), visual (fills[], strokes[], borderRadius), effects (shadows[], blurs[]), text (font, lineHeight, letterSpacing, case, decoration, content), meta (hidden flag), children[].
   - SessionLog fields: timestamp, nodeCount, durationMs, skippedCount, unsupportedCount, warnings[], version.
   - Relationships: parent/children tree; no cross-component reuse yet.
   - Validation rules: id non-empty, width/height >=0, nodeCount ≤ 5,000.

2. **API Contracts (Internal Module Contracts)**:
   - `buildIR(node: FigmaNode): DesignNode` contract (input → output structure).
   - `extractAllStyles(node: FigmaNode): CSSPropertiesSubset` (already exists, confirm shape).
   - `generateReactCode(designData): string` (enhanced to optionally accept IR root later).
   - `recordSessionLog(metrics): void` and `exportSessionLog(): Blob|string`.
   - Documented in `/contracts/` as Markdown interface descriptions (no HTTP layer for V1).

3. **Generate contract tests**:
   - styleExtractors: verify fills, gradients, shadows, blur mapping.
   - IR builder: preserves ordering, excludes hidden, flattens no nodes incorrectly.
   - Logging: persists last session only; export produces valid JSON schema.
   - Performance harness: creates synthetic 5,000 node tree; asserts < 5,000ms.

4. **Integration scenarios** (from user stories):
   - Auto-layout fidelity scenario.
   - Text styling fidelity scenario.
   - Effects (shadow + blur) scenario.
   - Image placeholder scenario.
   - Performance large-tree scenario.

5. **Update agent context file** (if present once design stabilized): run update script to include new modules (`ir`, `logging`, performance test harness) after Phase 1 completion.

**Output**: `data-model.md`, `/contracts/` markdown files, preliminary failing test stubs, `quickstart.md`, updated agent context file (if required).

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

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
No complexity deviations identified; single-project scope retained.


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
 - [x] Post-Addendum Constitution Check (Component Generation): PASS (addendum aligns with Principles P1, P2, P3, P6)
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*

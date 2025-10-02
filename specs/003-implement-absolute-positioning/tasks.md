# Tasks: Implement Absolute Positioning

**Input**: Design documents from `specs/003-implement-absolute-positioning/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript 5.x, React 18.x, Vite 5.x, Vitest
   → Structure: Single project (src/, tests/)
2. Load optional design documents ✅
   → data-model.md: 4 entities (PositionInfo, DesignNode, FigmaNode, CSS)
   → contracts/: 2 files (position-ir-building, position-css-generation)
   → research.md: 7 decisions resolved
3. Generate tasks by category ✅
   → Setup: Type definitions
   → Tests: Contract tests (2), unit tests (1)
   → Core: buildPosition function, buildIR updates, styleFor updates
   → Integration: Call site updates, logging
   → Polish: Visual validation, performance tests
4. Apply task rules ✅
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001-T020) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `src/tests/` at repository root
- All paths relative to: `C:\VS_Code_Misc\figma-2-code-vite\figma-2-react-vite\`

---

## Phase 3.1: Setup & Type Definitions

### T001 [P] Create PositionInfo type definition
**File**: `src/ir/buildIR.ts`
**Description**: Add PositionInfo interface at top of file
```typescript
export interface PositionInfo {
  type: 'absolute' | 'flex-item' | 'root'
  x?: number  // px, relative to parent
  y?: number  // px, relative to parent
}
```
**Acceptance**: TypeScript compiles without errors
**Time**: 2 minutes

### T002 [P] Extend DesignNode interface with position field
**File**: `src/ir/buildIR.ts`
**Description**: Add optional `position?: PositionInfo` field to DesignNode interface
**Acceptance**: TypeScript compiles, position field is optional
**Time**: 2 minutes

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### T003 [P] Contract test for position IR building
**File**: `src/tests/contract/positioning.contract.test.ts` (NEW)
**Description**: Create contract tests verifying buildPosition() behavior per contract
- Test 1: Returns 'root' for nodes without parent
- Test 2: Returns 'absolute' with correct x,y for layoutMode: NONE
- Test 3: Returns 'flex-item' for children of auto-layout parents
- Test 4: Returns undefined for nodes without absoluteBoundingBox
- Test 5: Calculates relative coordinates correctly (positive and negative)
- Test 6: Handles edge case: parent and child at same position (x=0, y=0)
- Test 7: Does not mutate input parameters
- Test 8: Is deterministic (multiple calls with same input → same output)

**Reference**: `contracts/position-ir-building.md`
**Acceptance**: 8 tests written, all fail with "buildPosition is not defined"
**Time**: 15 minutes

### T004 [P] Contract test for position CSS generation
**File**: `src/tests/contract/positionCSS.contract.test.ts` (NEW)
**Description**: Create contract tests verifying styleFor() position CSS generation
- Test 1: Generates position: 'absolute' for nodes with position.type === 'absolute'
- Test 2: Generates left and top with 'px' suffix for absolute nodes
- Test 3: Generates position: 'relative' for parents with absolute children
- Test 4: Does NOT generate position properties for flex-item nodes
- Test 5: Does NOT generate position properties for root nodes
- Test 6: Handles position at origin (0, 0) correctly
- Test 7: Handles negative coordinates correctly
- Test 8: Does not override position: 'absolute' with position: 'relative'
- Test 9: Generates both position: relative and display: flex when needed
- Test 10: Output is deterministic (same input → same output)

**Reference**: `contracts/position-css-generation.md`
**Acceptance**: 10 tests written, all fail (position properties not generated)
**Time**: 20 minutes

### T005 [P] Unit tests for buildPosition function
**File**: `src/tests/ir/positioning.test.ts` (NEW)
**Description**: Create unit tests for buildPosition edge cases
- Missing absoluteBoundingBox
- No parent context
- Negative canvas coordinates
- Deeply nested absolute positioning
- Parent without absoluteBoundingBox

**Acceptance**: 5+ tests written, all fail
**Time**: 10 minutes

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T006 Implement buildPosition function
**File**: `src/ir/buildIR.ts`
**Description**: Create buildPosition(node: FigmaNode, parent?: FigmaNode) function
- Check if node has absoluteBoundingBox, return undefined if not
- If no parent, return { type: 'root' }
- If node.layoutMode === 'NONE', calculate relative position and return { type: 'absolute', x, y }
- If parent has auto-layout (HORIZONTAL/VERTICAL), return { type: 'flex-item' }
- Default: return { type: 'absolute', x, y }

**Reference**: `positioning-experiment.mjs` lines 64-104, `contracts/position-ir-building.md`
**Acceptance**: T003 and T005 tests pass
**Dependencies**: T001, T002, T003, T005
**Time**: 15 minutes

### T007 Update buildIR signature to accept parent parameter
**File**: `src/ir/buildIR.ts`
**Description**: Change function signature from:
```typescript
function buildIR(raw: FigmaNode): DesignNode | null
```
to:
```typescript
function buildIR(raw: FigmaNode, parent?: FigmaNode): DesignNode | null
```
**Acceptance**: TypeScript compiles, parent parameter is optional
**Dependencies**: T002
**Time**: 2 minutes

### T008 Call buildPosition in buildIR and add to result
**File**: `src/ir/buildIR.ts`
**Description**: Inside buildIR function, after building other properties:
1. Call `const position = buildPosition(raw, parent)`
2. Add position to returned DesignNode object: `position`
3. When recursing to children, pass `raw` as parent: `children: raw.children?.map(child => buildIR(child, raw))`

**Acceptance**: Position field populated in IR, T003 tests pass
**Dependencies**: T006, T007
**Time**: 10 minutes

### T009 [P] Update styleFor in generateCodeFromIR to generate position CSS
**File**: `src/codeGenerator.ts`
**Description**: In the `styleFor` function inside `generateCodeFromIR`:
1. Check if `node.position?.type === 'absolute'`
2. If yes, add to styles object: `position: 'absolute'`, `left: '${node.position.x}px'`, `top: '${node.position.y}px'`
3. Check if node has any child with `child.position?.type === 'absolute'`
4. If yes and node doesn't already have position: 'absolute', add: `position: 'relative'`

**Reference**: `contracts/position-css-generation.md`
**Acceptance**: T004 tests for generateCodeFromIR pass
**Dependencies**: T002, T004
**Time**: 10 minutes

### T010 [P] Update styleFor in generateReactComponentSource to generate position CSS
**File**: `src/codeGenerator.ts`
**Description**: In the `styleFor` function inside `generateReactComponentSource`:
1. Check if `node.position?.type === 'absolute'`
2. If yes, add to styles object: `position: 'absolute'`, `left: '${node.position.x}px'`, `top: '${node.position.y}px'`
3. Check if node has any child with `child.position?.type === 'absolute'`
4. If yes and node doesn't already have position: 'absolute', add: `position: 'relative'`

**Reference**: `contracts/position-css-generation.md`
**Acceptance**: T004 tests for generateReactComponentSource pass
**Dependencies**: T002, T004
**Time**: 10 minutes

---

## Phase 3.4: Integration

### T011 Update buildIR call sites to pass parent parameter
**File**: `src/codeGenerator.ts`, `src/figmaApi.ts` (if applicable)
**Description**: Find all places where buildIR is called and ensure proper parent handling:
1. Root-level calls: `buildIR(node)` or `buildIR(node, undefined)` (no change needed)
2. Recursive calls within buildIR: Already handled in T008
3. Any other call sites: Verify parent context is correct

**Acceptance**: All buildIR calls have correct parent context, TypeScript compiles
**Dependencies**: T007, T008
**Time**: 5 minutes

### T012 Add logging for missing positioning data
**File**: `src/ir/buildIR.ts`
**Description**: In buildPosition function, add logging when data is missing:
- When node lacks absoluteBoundingBox: `logger.warn('Node missing absoluteBoundingBox', { nodeId, nodeName })`
- When parent lacks absoluteBoundingBox for absolute child: `logger.warn('Parent missing absoluteBoundingBox', { nodeId, parentId })`

**Reference**: Existing logging patterns in codebase
**Acceptance**: Console shows warnings for missing data (test with incomplete fixture)
**Dependencies**: T006
**Time**: 5 minutes

---

## Phase 3.5: Polish & Validation

### T013 [P] Integration test: end-to-end positioning
**File**: `src/tests/integration/positioning.integration.test.ts` (NEW)
**Description**: Create integration test that:
1. Takes Figma JSON with layoutMode: NONE nodes
2. Runs through buildIR → generateCodeFromIR
3. Verifies generated CSS includes position properties
4. Verifies parent containers have position: relative

**Acceptance**: Test passes, demonstrates end-to-end flow
**Dependencies**: T006, T008, T009, T010
**Time**: 10 minutes

### T014 Run positioning-experiment.mjs and validate output
**File**: Root directory (validation task)
**Description**: 
1. Run `node positioning-experiment.mjs`
2. Open `positioning-experiment.html` in browser
3. Compare with Figma screenshot (reference in FINDINGS.md)
4. Verify elements are positioned correctly (not stacking vertically)

**Acceptance**: Visual comparison shows correct positioning matching Figma
**Dependencies**: T006, T008, T009, T010
**Time**: 5 minutes

### T015 Visual comparison: generated vs Figma
**File**: Manual validation
**Description**: 
1. Use test Figma file from analysis
2. Generate React code with new implementation
3. Render in browser
4. Compare side-by-side with Figma
5. Check: header at top, navigation overlapping, card list in middle, footer at bottom

**Acceptance**: Visual fidelity matches Figma design
**Dependencies**: T009, T010, T011
**Time**: 10 minutes

### T016 Performance test: 5,000 nodes with positioning
**File**: `src/tests/performance/positioning.perf.test.ts` (NEW or existing)
**Description**: 
1. Generate fixture with 5,000 nodes (mix of absolute and flex)
2. Run buildIR on entire tree
3. Measure total processing time
4. Assert time < 5.0 seconds (Constitution Principle #4)

**Acceptance**: Test passes, performance within budget
**Dependencies**: T006, T008
**Time**: 15 minutes

### T017 [P] Update README.md with positioning feature
**File**: `README.md`
**Description**: Add section describing absolute positioning support:
- What: Supports layoutMode: NONE from Figma
- Why: 44% of designs use absolute positioning
- How: Generates CSS with position: absolute, left, top

**Acceptance**: Documentation clear and accurate
**Time**: 5 minutes

### T018 [P] Update TypeScript types documentation
**File**: `src/ir/buildIR.ts` (JSDoc comments)
**Description**: Add JSDoc comments to:
- PositionInfo interface
- buildPosition function
- position field in DesignNode

**Acceptance**: Types have clear documentation
**Time**: 5 minutes

### T019 Remove duplicate positioning logic (if any)
**File**: `src/codeGenerator.ts`
**Description**: Check for any code duplication between the two styleFor implementations (in generateCodeFromIR and generateReactComponentSource):
- If logic is identical, consider extracting to helper function
- If different, ensure both implementations are correct

**Acceptance**: No unnecessary duplication, code is DRY
**Dependencies**: T009, T010
**Time**: 10 minutes

### T020 Run full test suite and validate
**File**: All tests
**Description**: 
1. Run `npm test` to execute all tests
2. Verify all existing tests still pass (no regression)
3. Verify all new positioning tests pass
4. Check test coverage for new code (buildPosition, position CSS generation)

**Acceptance**: All tests pass, coverage ≥ 80% for new code
**Dependencies**: T003-T016
**Time**: 5 minutes

---

## Dependencies Graph

```
Setup Phase:
  T001 [P] PositionInfo type ─┐
  T002 [P] Extend DesignNode  ─┼─> Phase 3.2
                                │
Tests Phase (all parallel):    │
  T003 [P] IR contract tests ──┤
  T004 [P] CSS contract tests ─┤
  T005 [P] IR unit tests ──────┘
           │  │  │
           ↓  ↓  ↓
Implementation Phase:
  T006 buildPosition impl ────┬───> T008 Call buildPosition ──┐
  T007 buildIR signature ─────┘                                │
                                                               │
  T009 [P] styleFor (generateCodeFromIR) ─────────────────────┤
  T010 [P] styleFor (generateReactComponentSource) ───────────┤
                                                               │
Integration Phase:                                             │
  T011 Update call sites ─────────────────────────────────────┤
  T012 Add logging ───────────────────────────────────────────┤
                                                               │
Polish Phase:                                                  │
  T013 [P] Integration test ──────────────────────────────────┤
  T014 Experiment validation ─────────────────────────────────┤
  T015 Visual comparison ─────────────────────────────────────┤
  T016 Performance test ──────────────────────────────────────┤
  T017 [P] Update README ─────────────────────────────────────┤
  T018 [P] Update docs ───────────────────────────────────────┤
  T019 Remove duplication ────────────────────────────────────┤
  T020 Full test suite ───────────────────────────────────────┘
```

---

## Parallel Execution Examples

### Phase 3.1: Setup (parallel)
```
Task: "Create PositionInfo type definition in src/ir/buildIR.ts"
Task: "Extend DesignNode interface with position field in src/ir/buildIR.ts"
```

### Phase 3.2: Tests (parallel)
```
Task: "Contract test for position IR building in src/tests/contract/positioning.contract.test.ts"
Task: "Contract test for position CSS generation in src/tests/contract/positionCSS.contract.test.ts"
Task: "Unit tests for buildPosition function in src/tests/ir/positioning.test.ts"
```

### Phase 3.3: styleFor implementations (parallel after T006-T008)
```
Task: "Update styleFor in generateCodeFromIR to generate position CSS"
Task: "Update styleFor in generateReactComponentSource to generate position CSS"
```

### Phase 3.5: Polish (some parallel)
```
Task: "Integration test: end-to-end positioning"
Task: "Update README.md with positioning feature"
Task: "Update TypeScript types documentation"
```

---

## Time Estimates

| Phase | Tasks | Time |
|-------|-------|------|
| Setup | T001-T002 | 4 min |
| Tests | T003-T005 | 45 min |
| Implementation | T006-T010 | 47 min |
| Integration | T011-T012 | 10 min |
| Polish | T013-T020 | 65 min |
| **Total** | **20 tasks** | **~171 min (~2.9 hours)** |

**Critical Path** (sequential): T001 → T002 → T003 → T006 → T007 → T008 → T009 → T011 → T013 → T020 ≈ 95 minutes

**With parallelization**: ~110 minutes (saving ~60 minutes)

---

## Validation Checklist
*GATE: Check before marking tasks.md complete*

- [x] All contracts have corresponding tests (T003, T004)
- [x] All entities have implementation tasks (PositionInfo: T001, DesignNode extension: T002)
- [x] All tests come before implementation (T003-T005 before T006-T010)
- [x] Parallel tasks truly independent (different files or no conflicts)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task in same phase
- [x] TDD ordering enforced (Phase 3.2 before 3.3)
- [x] Dependencies clearly documented
- [x] Integration and validation tasks included (T013-T016)

---

## Notes

- **[P] tasks** can run in parallel (different files, no dependencies)
- **TDD critical**: All tests in Phase 3.2 MUST fail before starting Phase 3.3
- **Commit after each task** to enable easy rollback
- **Run tests frequently** during implementation to catch issues early
- **Reference files**: positioning-experiment.mjs (prototype), contracts/ (behavior specs)
- **Performance goal**: < 5.0s for 5,000 nodes (Constitution Principle #4)
- **Visual validation**: positioning-experiment.html should match Figma screenshot

---

## Quick Start

To begin implementation:

1. **Setup environment**:
   ```bash
   npm install
   npm test  # Verify existing tests pass
   ```

2. **Start with tests** (TDD):
   ```bash
   # Create test files first
   # T003: src/tests/contract/positioning.contract.test.ts
   # T004: src/tests/contract/positionCSS.contract.test.ts
   # T005: src/tests/ir/positioning.test.ts
   
   npm test  # Should see 23+ tests FAILING
   ```

3. **Implement features**:
   - Follow tasks T006-T010 in order
   - Watch tests turn green

4. **Validate**:
   ```bash
   node positioning-experiment.mjs
   # Open positioning-experiment.html and compare with Figma
   
   npm test  # All tests should pass
   ```

---

## References

- **Spec**: `specs/003-implement-absolute-positioning/spec.md`
- **Plan**: `specs/003-implement-absolute-positioning/plan.md`
- **Research**: `specs/003-implement-absolute-positioning/research.md`
- **Data Model**: `specs/003-implement-absolute-positioning/data-model.md`
- **Contracts**: `specs/003-implement-absolute-positioning/contracts/`
- **Quickstart**: `specs/003-implement-absolute-positioning/quickstart.md`
- **Prototype**: `positioning-experiment.mjs` (working reference implementation)
- **Analysis**: `FINDINGS.md`, `FIDELITY-ANALYSIS.md`, `figma-analysis-detailed.json`

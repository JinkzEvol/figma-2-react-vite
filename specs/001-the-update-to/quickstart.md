# Quickstart: Rendering Pipeline Fidelity Update (Lean V1)

## Prerequisites
- Node.js LTS
- Figma Personal Access Token
- Yarn or npm

## Steps
1. Install deps: `npm install`
2. Set PAT + Figma URL in UI fields.
3. Click Generate to build IR + styles and preview component.
4. Open DevTools console to view session log export helper usage.
5. Run tests (after implementation): `npm test` (framework TBD in codebase setup).

## Expected Outputs
- Preview renders with correct layout, spacing, shadows, blur, gradients, placeholders.
- Performance test passes for synthetic 5,000 node tree.
- Exported session log JSON file downloadable via UI action.
- React component source export available via generator API (see below).

## Troubleshooting
- If gradients look flat: verify gradient handles in API output.
- If blur not visible: check browser support (backdrop-filter requires browser compatibility flag sometimes).
- If performance > 5s: run nodeCount reduction test or profile IR build recursion.

## Persisting Your PAT (Phase 3.8)
When you enter your Figma Personal Access Token the app stores it in `localStorage` as `figmaPat` so you don't have to re‑type it after a refresh. On load, if a stored token exists the UI skips directly to the Figma URL step.

Security Notes:
- Stored only in your browser; never transmitted except in requests you initiate to Figma.
- It is plain text storage. Revoke it in Figma settings if you suspect exposure.
- A clear / sign‑out control is deferred (see tasks T073–T076).

To manually clear now open DevTools Console and run:
```
localStorage.removeItem('figmaPat'); location.reload();
```

## Generating a Reusable React Component (T049)

After an IR is built you can obtain a standalone, deterministic React component source string.

### Programmatic Usage
```
import { buildIR } from '../src/ir';
import { generateReactComponentSource } from '../src/codeGenerator';

// Assume `rootFigmaNode` was fetched from the Figma API
const ir = buildIR(rootFigmaNode);
if (ir) {
	const tsx = generateReactComponentSource(ir, { memo: true });
	console.log(tsx); // Contains `export const FigmaComponent` (or memoized variant)
}
```

### Component Characteristics
- Deterministic output: same IR → identical TSX (snapshot tested).
- Optional `className` prop mixed into root element.
- Inline styles emitted in stable, alphabetically sorted key order.
- Text nodes rendered as `<span>` preserving whitespace via `white-space: pre-wrap`.
- Optional memo wrapper when `options.memo === true` for referential stability.

### When to Use
- You want to persist the generated component into your project repository.
- You need a reviewable artifact (PR) rather than runtime string assembly.

### Determinism Note
Output stability enables code review diffs to surface only intentional design changes. Run the determinism snapshot test (`reactComponentDeterminism.snapshot.test.ts`) if you suspect drift.

### Next Steps (Future)
Potential options may include: named component export override, CSS module extraction, and tree-shaken style blocks.

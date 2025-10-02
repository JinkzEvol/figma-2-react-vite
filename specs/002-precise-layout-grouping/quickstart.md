# Quickstart: Footer Fidelity Feature

1. Run tests (expect new failing grouping & style token tests): `npm test`.
2. Implement `columnGrouping.ts` until grouping contract tests pass.
3. Implement `styleTokenRegistry.ts` and update code generator to emit tokens.
4. Implement `exportIcon.ts` with fallback placeholder logic.
5. Wire new logging events; confirm logs in `sessionLog` export.
6. Add performance harness scenario (12 & 20 column footer) and ensure <10ms/column.
7. Update integration snapshot for footer after all unit tests green.
8. Run accessibility check script (if present) to verify aria-labels on icons.
9. Confirm color fidelity tests (ΔE and brand exactness) pass.
10. Commit with message referencing FR IDs (e.g., `feat(grouping): implement FR-001/002`).

---

## Verification (Post-Implementation)

Run these steps before merge (T025/T029/T030):

```powershell
pnpm install
pnpm build

# Full test suite
pnpm test

# Performance focus
pnpm test --filter=performance -- --run
pnpm test src/tests/integration/performance.integration.test.ts

# Determinism
pnpm test src/tests/contract/determinismSmoke.contract.test.ts
pnpm test src/tests/contract/determinismExtended.contract.test.ts
```

Expectations:
- Median ms/column < 10 for 12–20 column footers
- 5k node IR end-to-end < 5000 ms
- `performance_sample` events present; no `grouping_skipped` when grouping expected
- No snapshot churn except intentional layout grouping additions

React component generation sample:
```ts
import { buildIR } from '../../src/ir';
import { generateReactComponentSource } from '../../src/codeGenerator';
const ir = buildIR(rootNode);
const source = generateReactComponentSource(ir, { componentName: 'FooterComponent', memo: true });
console.log(source);
```

If performance near threshold (>=80% budget), rerun after clearing other system load; investigate hotspots in grouping or token registry.

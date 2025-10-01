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

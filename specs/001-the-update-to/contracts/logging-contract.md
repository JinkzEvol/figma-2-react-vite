# Contract: Session Logging

## Purpose
Record metadata of the most recent generation session for diagnostics and user export.

## Functions
```
recordSessionLog(metrics: SessionLogInput): void
exportSessionLog(): string // JSON string representation
clearSessionLog(): void // optional helper
```

## SessionLogInput Fields
- nodeCount (number)
- durationMs (number)
- skippedCount (number)
- unsupportedCount (number)
- warnings (string[])
- version (string) e.g. "1.0.0"

## Behavior
- Stored in localStorage key: `figmaGenSession`
- Overwrites previous entry.
- Export returns serialized JSON matching data-model schema.

## Edge Cases
- localStorage unavailable → silently no-op (do not throw).
- Oversized log (>50KB) → truncate warnings array.

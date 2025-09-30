import { describe, it, expect } from 'vitest'

// T021 Logging warnings funnel unit test (FR-021, FR-022)
// Future API pushWarning + exportSessionLog

declare function pushWarning(msg: string): void
declare function exportSessionLog(): string
declare function recordSessionLog(metrics: any): void

describe('logging warning funnel', () => {
  it('captures pushed warnings and includes in export JSON', () => {
    pushWarning('gradient-unsupported')
    recordSessionLog({ nodeCount:0, durationMs:0, skippedCount:0, unsupportedCount:1, warnings:[], version:'1.0.0' })
    const json = exportSessionLog()
    let obj: any; try { obj = JSON.parse(json) } catch { obj = {} }
    expect(obj.warnings).toContain('gradient-unsupported')
  })
})


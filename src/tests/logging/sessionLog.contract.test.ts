import { describe, it, expect, beforeEach } from 'vitest'

// T008 Contract test for session logging referencing contracts/logging-contract.md
// Implementation not present yet (will fail). We'll assume future functions recordSessionLog/exportSessionLog.

declare function recordSessionLog(metrics: any): void
declare function exportSessionLog(): string

describe('contract: session logging', () => {
  beforeEach(() => {
    // no clear function yet; rely on overwrite behavior expectation
  })

  it('serializes session metrics with required fields', () => {
    const input = {
      nodeCount: 10,
      durationMs: 1234,
      skippedCount: 2,
      unsupportedCount: 1,
      warnings: ['warn-a', 'warn-b'],
      version: '1.0.0'
    }
    recordSessionLog(input)
    const json = exportSessionLog()
    const obj = JSON.parse(json)
    expect(obj.nodeCount).toBe(10)
    expect(obj.warnings.length).toBe(2)
    expect(obj.version).toBe('1.0.0')
  })
})

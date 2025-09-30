import { describe, it, expect } from 'vitest'

// T027 Integration: session log export JSON schema correctness

declare function recordSessionLog(metrics: any): void
declare function pushWarning(msg: string): void
declare function exportSessionLog(): string

describe('integration: session log export', () => {
	it('exports JSON with required fields and collected warnings', () => {
		pushWarning('auto-layout-partial')
		recordSessionLog({ nodeCount:100, durationMs:1234, skippedCount:2, unsupportedCount:1, warnings:[], version:'1.2.3' })
		let json = ''
		try { json = exportSessionLog() } catch { json = '{}' }
		const data = JSON.parse(json)
		expect(data.nodeCount).toBe(100)
		expect(data.warnings).toContain('auto-layout-partial')
		expect(data.version).toBe('1.2.3')
	})
})

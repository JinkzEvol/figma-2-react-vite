// Performance Test Harness Scaffold (T002)
// FR-020 Principle #4 Performance Budget
// Implementation to be filled in T037.

export interface PerformanceResult {
  label: string
  durationMs: number
  meta?: Record<string, unknown>
}

export interface PerformanceHarnessOptions {
  warmupRuns?: number
  measurementRuns?: number
}

export async function measure(label: string, fn: () => Promise<void> | void, _options: PerformanceHarnessOptions = {}): Promise<PerformanceResult> {
  // Placeholder implementation - returns zero duration for now
  const start = Date.now()
  await fn()
  const end = Date.now()
  return { label, durationMs: end - start }
}

// Performance logging events
export interface PerformanceSample {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const performanceSamples: PerformanceSample[] = [];

export function logPerformanceSample(operation: string, duration: number, metadata?: Record<string, unknown>): void {
  performanceSamples.push({
    operation,
    duration,
    timestamp: Date.now(),
    metadata,
  });
}

export function getPerformanceSamples(): PerformanceSample[] {
  return [...performanceSamples];
}

export function clearPerformanceSamples(): void {
  performanceSamples.length = 0;
}

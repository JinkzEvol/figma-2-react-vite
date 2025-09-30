// Session logging implementation (T033)
// Provides recordSessionLog, exportSessionLog, clearSessionLog, pushWarning per logging-contract.md

export interface SessionLogInput {
  nodeCount: number;
  durationMs: number;
  skippedCount: number;
  unsupportedCount: number;
  warnings: string[]; // base warnings list provided at record time
  version: string;
}

export interface SessionLogStored extends SessionLogInput {
  warnings: string[]; // merged warnings (provided + funnel)
  _ts: number; // timestamp of recording
}

const STORAGE_KEY = 'figmaGenSession';

// In-memory cache to avoid repeated JSON work and support warning funnel before recordSessionLog
let cached: SessionLogStored | null = null;
// Funnel warnings pushed before/after record. We'll merge on export or record.
let funnelWarnings: string[] = [];

function safeLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch { /* ignore */ }
  return null;
}

export function pushWarning(msg: string): void {
  if (!msg) return;
  funnelWarnings.push(msg);
  // Keep funnel bounded to prevent unbounded growth (arbitrary 500 entries)
  if (funnelWarnings.length > 500) funnelWarnings = funnelWarnings.slice(-500);
  // If we already recorded a session, reflect the new warning immediately
  if (cached) {
    if (!cached.warnings.includes(msg)) {
      cached.warnings.push(msg);
      persist();
    }
  }
}

export function recordSessionLog(input: SessionLogInput): void {
  // Merge funnel warnings with provided warnings (avoid duplicates preserve insertion order)
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const w of [...input.warnings, ...funnelWarnings]) {
    if (!seen.has(w)) { seen.add(w); merged.push(w); }
  }
  cached = { ...input, warnings: merged, _ts: Date.now() };
  persist();
}

export function exportSessionLog(): string {
  const store = safeLocalStorage();
  if (!cached && store) {
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (raw) cached = JSON.parse(raw) as SessionLogStored;
    } catch { /* ignore */ }
  }
  const obj = cached || { nodeCount:0, durationMs:0, skippedCount:0, unsupportedCount:0, warnings:[...funnelWarnings], version:'0.0.0', _ts: Date.now() } as SessionLogStored;
  // If cached existed but funnel added new warnings post-record, merge for export view only (do not mutate cached permanently to avoid drift) but that's acceptable; still we can mutate and persist.
  if (cached) {
    let changed = false;
    for (const w of funnelWarnings) {
      if (!cached.warnings.includes(w)) { cached.warnings.push(w); changed = true; }
    }
    if (changed) persist();
  }
  let json = JSON.stringify(obj);
  // Truncation rule: if size > 50KB, progressively trim warnings
  if (json.length > 50*1024 && obj.warnings.length) {
    let pruned = [...obj.warnings];
    while (json.length > 50*1024 && pruned.length) {
      pruned.pop();
      const clone = { ...obj, warnings: pruned };
      json = JSON.stringify(clone);
    }
    if (cached) { cached.warnings = pruned; persist(); }
    else { obj.warnings = pruned; }
  }
  return json;
}

export function clearSessionLog(): void {
  cached = null;
  funnelWarnings = [];
  const store = safeLocalStorage();
  try { store?.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

function persist() {
  const store = safeLocalStorage();
  if (!store || !cached) return;
  try { store.setItem(STORAGE_KEY, JSON.stringify(cached)); } catch { /* ignore */ }
}

// Logging barrel exports (T033)
import { recordSessionLog, exportSessionLog, clearSessionLog, pushWarning } from './sessionLog';
export { recordSessionLog, exportSessionLog, clearSessionLog, pushWarning };
export type { SessionLogInput } from './sessionLog';

// Provide global shims for tests that declare functions without importing (contract tests pattern)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const g:any = typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : {});
if (!g.recordSessionLog) g.recordSessionLog = recordSessionLog;
if (!g.exportSessionLog) g.exportSessionLog = exportSessionLog;
if (!g.pushWarning) g.pushWarning = pushWarning;
if (!g.clearSessionLog) g.clearSessionLog = clearSessionLog;

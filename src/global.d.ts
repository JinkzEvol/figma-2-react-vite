// Ambient global declarations for test harness exposure without ts-ignore usage.
// These are assigned conditionally in codeGenerator.ts for vitest runtime convenience.

import type { DesignNode } from './ir/buildIR';
import type { ReactComponentGenOptions } from './codeGenerator';
import type { TokenRegistryResult } from './styles/styleTokenRegistry';

declare global {
  // Code generation from IR (createElement chain string)
  // eslint-disable-next-line no-var
  var generateCodeFromIR: (ir: DesignNode | null | undefined) => string;
  // Style token registry builder (map + tokens)
  // eslint-disable-next-line no-var
  var buildStyleTokenRegistry: (styles: any[]) => TokenRegistryResult;
  // React component TS/TSX source generator
  // eslint-disable-next-line no-var
  var generateReactComponentSource: (ir: DesignNode | null | undefined, options?: ReactComponentGenOptions) => string;
}

export {};
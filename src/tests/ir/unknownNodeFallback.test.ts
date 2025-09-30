import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

describe('unknown node fallback', () => {
  it('returns fallback structure for unsupported type', () => {
    const node: FigmaNode = { id:'u1', name:'Mystery', type:'SOMETHING_ODD' } as any
  const ir: any = buildIR(node as any)
    expect(ir.type).toBe('UNKNOWN')
  })
})

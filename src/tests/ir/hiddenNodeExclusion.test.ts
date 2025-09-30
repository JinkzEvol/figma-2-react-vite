import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

describe('hidden node exclusion', () => {
  it('omits hidden nodes (returns null-like)', () => {
    const node: FigmaNode = { id:'h1', name:'Hidden', type:'RECTANGLE', visible:false } as any
  const ir: any = buildIR(node as any)
    expect(ir).toBeFalsy()
  })
})

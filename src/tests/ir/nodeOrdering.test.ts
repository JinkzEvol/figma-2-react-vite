import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

// T054: Explicit test documenting traversal ordering rule: pre-order, preserving original child index order
// Pre-order means: visit parent, then children left-to-right (as provided by Figma API array order), recursively.

describe('T054: node ordering rule (pre-order child order preserved)', () => {
  function tree(): FigmaNode {
    return {
      id: 'root', name: 'root', type: 'FRAME', layoutMode: 'VERTICAL',
      children: [
        {
          id: 'a', name: 'A', type: 'RECTANGLE', absoluteBoundingBox: {x:0,y:0,width:10,height:10},
          children: [
            { id: 'a1', name: 'A1', type: 'RECTANGLE', absoluteBoundingBox: {x:0,y:0,width:5,height:5} },
            { id: 'a2', name: 'A2', type: 'RECTANGLE', absoluteBoundingBox: {x:0,y:0,width:6,height:6} }
          ]
        },
        {
          id: 'b', name: 'B', type: 'FRAME', layoutMode: 'HORIZONTAL',
          children: [
            { id: 'b1', name: 'B1', type: 'TEXT', characters: 'hi', style: { fontFamily: 'Inter', fontSize: 12 }, absoluteBoundingBox: {x:0,y:0,width:12,height:12} },
            { id: 'b2', name: 'B2', type: 'RECTANGLE', absoluteBoundingBox: {x:0,y:0,width:7,height:7} }
          ]
        },
        {
          id: 'c', name: 'C', type: 'RECTANGLE', absoluteBoundingBox: {x:0,y:0,width:8,height:8}
        }
      ]
    } as FigmaNode
  }

  it('preserves child array order at each depth and uses pre-order traversal for nested children', () => {
    const ir = buildIR(tree())
    expect(ir).toBeTruthy()
    if (!ir) return
    // Root children order should be: a, b, c
    const rootIds = (ir.children || []).map(c => c.id)
    expect(rootIds).toEqual(['a','b','c'])

    const a = ir.children?.[0]
    const b = ir.children?.[1]
    expect(a && a.children?.map(c => c.id)).toEqual(['a1','a2'])
    expect(b && b.children?.map(c => c.id)).toEqual(['b1','b2'])
  })
})

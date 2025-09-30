import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T017 Style serialization ordering + deterministic output

function objectKeysInOrder(obj: Record<string, any>): string[] { return Object.keys(obj) }

describe('style serialization order', () => {
  it('emits stable ordering (future sorted or canonical)', () => {
    const node: FigmaNode = {
      id:'ord1', name:'Order', type:'RECTANGLE',
      absoluteBoundingBox:{ x:0,y:0,width:10,height:10 },
      fills:[{ type:'SOLID', color:{ r:0.1,g:0.2,b:0.3,a:1 } }],
      strokes:[{ type:'SOLID', color:{ r:1,g:0,b:0,a:1 } }], strokeWeight:1
    }
    const css = extractAllStyles(node)
    const keys = objectKeysInOrder(css)
    // Force failing expectation: we expect background before width after future canonicalization
    expect(keys.indexOf('background')).toBeLessThan(keys.indexOf('width'))
  })
})
